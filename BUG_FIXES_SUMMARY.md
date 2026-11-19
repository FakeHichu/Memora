# Bug Fixes Summary

All 8 critical bugs identified in the security and UX audit have been fixed.

## Critical Security Fixes

### Bug 4 - Unauthorized Post Deletion ✅ FIXED
**File:** `backend/src/services/post.service.ts`

**Problem:** Any class member could delete another member's post due to incorrect authorization logic.

**Fix:** Removed the fallback that allowed class members to delete posts. Now only the post author can delete their own post.

```typescript
// OLD: Allowed any class member to delete
if (post.user_id !== userId) {
  const isMember = await ClassRepository.isMember(post.class_id, userId);
  if (!isMember) throw error;
}

// NEW: Only post author can delete
if (post.user_id !== userId) {
  throw new Error("Only the post author can delete this post.");
}
```

---

### Bug 5 - Circle Upload Bypasses Membership Check ✅ FIXED
**Files:** 
- `backend/src/controllers/circle.controller.ts`
- `backend/src/services/circle.service.ts`
- `backend/src/repositories/circle.repository.ts`

**Problem:** Photos were uploaded to storage before verifying circle membership, allowing unauthorized uploads via service-role bypass.

**Fix:** Reordered operations to verify membership BEFORE accepting any uploaded image. Create post record first (which validates membership), then upload image, then update post with path.

```typescript
// OLD: Upload first, then check membership
const uploadedPath = await StorageService.uploadPhoto(...);
const post = await CircleService.createCirclePost(...); // Checks membership here (too late)

// NEW: Check membership first, then upload
const post = await CircleService.createCirclePost(circleId, userId, "", caption); // Checks membership immediately
const uploadedPath = await StorageService.uploadPhoto(...);
const updatedPost = await CircleService.updatePostPhotoPath(post.id, uploadedPath);
```

Added new method `CircleService.updatePostPhotoPath()` and `CircleRepository.updatePostPhotoPath()` to support this flow.

---

### Bug 6 - Comment Creation Lacks Membership Validation ✅ FIXED
**File:** `backend/src/services/post.service.ts`

**Problem:** Comments could be created without verifying the user belongs to the post's class, enabling cross-class spam.

**Fix:** Added membership validation before creating comments.

```typescript
// OLD: No validation
static async createComment(...) {
  return PostRepository.createComment(...);
}

// NEW: Validate membership first
static async createComment(...) {
  const post = await PostRepository.findById(postId);
  if (!post) throw error;
  const isMember = await ClassRepository.isMember(post.class_id, userId);
  if (!isMember) throw new Error("You must be a member of this class to comment.");
  return PostRepository.createComment(...);
}
```

---

### Bug 1 - Failed Photo Uploads Still Create Posts ✅ FIXED
**File:** `frontend/lib/photo-upload.ts`

**Problem:** `uploadCirclePhoto()` returned a local device path if both Supabase and backend uploads failed, allowing `postMemoryToCircle()` to create a post with an invalid photo path that only appears on the uploader's device.

**Fix:** 
1. Modified `uploadCirclePhoto()` to return `null` instead of local path when upload fails
2. Modified `postMemoryToCircle()` to check for null result and abort post creation with clear error message

```typescript
// OLD: Fallback to local path (bad)
if (both uploads failed) {
  return { photoPath: manipulated.uri || localUri };
}

// NEW: Return null and let caller handle
if (both uploads failed) {
  return null;
}

// In postMemoryToCircle():
const uploadResult = await uploadCirclePhoto(...);
if (!uploadResult || !uploadResult.photoPath) {
  return { ok: false, message: 'Failed to upload photo. Please check your connection and try again.' };
}
```

---

## Critical UX Fixes

### Bug 2 - Home Screen Does Not Load Shared Posts ✅ FIXED
**File:** `frontend/app/(tabs)/home.tsx`

**Problem:** Home screen only loaded local posts (`getLocalPhotoPosts()` and `getFavoritePosts()`), never fetching shared Circle feed, so photos from classmates never appeared.

**Fix:** Modified `loadPosts()` to fetch both local posts AND shared circle posts, then merge them by ID.

```typescript
// OLD: Only local posts
Promise.all([getLocalPhotoPosts(), getFavoritePosts()])

// NEW: Local + shared circle posts
Promise.all([
  getLocalPhotoPosts(),
  getFavoritePosts(),
  // NEW: Load shared circle feed
  (async () => {
    if (activeCircle?.id && supabase) {
      const response = await fetch(`${backendUrl}/api/circles/${activeCircle.id}/feed`, ...);
      return response.ok ? feedData.posts : [];
    }
    return [];
  })(),
])
.then(([savedPosts, favPosts, circlePosts]) => {
  // Merge and deduplicate by id
  const allPostsMap = new Map<string, LocalPhotoPost>();
  savedPosts.forEach(p => allPostsMap.set(p.id, p));
  circlePosts.forEach(p => allPostsMap.set(p.id, p));
  setPosts(Array.from(allPostsMap.values()));
})
```

Also added `authorName?: string` to `LocalPhotoPost` type to support displaying shared post authors.

---

### Bug 3 - Incorrect Reaction API on Home ✅ FIXED
**File:** `frontend/app/(tabs)/home.tsx`

**Problem:** Home screen called `POST /api/reactions` with `{ postId, reactionType }` body, but backend expects `POST /api/posts/:postId/reactions` with `{ reactionType }` body only.

**Fix:** Updated `handleReact()` to use correct endpoint and request body format.

```typescript
// OLD: Wrong endpoint and body
const response = await fetch(`${backendUrl}/api/reactions`, {
  body: JSON.stringify({ postId, reactionType: emoji }),
});

// NEW: Correct endpoint and body
const response = await fetch(`${backendUrl}/api/posts/${postId}/reactions`, {
  body: JSON.stringify({ reactionType: emoji }),
});
```

---

## State Management Fixes

### Bug 7 - Stale Class Data Can Remain ✅ FIXED
**File:** `frontend/hooks/useClass.ts`

**Problem:** Backend class cache only replaced when API returned non-empty array. If backend returned zero classes, old cached classes remained visible.

**Fix:** Modified `loadClasses()` to replace cache even when empty, and clear stale active class ID.

```typescript
// OLD: Only update cache if non-empty
if (Array.isArray(apiData.classes) && apiData.classes.length > 0) {
  localClasses = apiData.classes;
  await AsyncStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(localClasses));
}

// NEW: Always update cache, even if empty
if (Array.isArray(apiData.classes)) {
  localClasses = apiData.classes;
  await AsyncStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(localClasses));
}

// Also clear stale active class
if (!matched && savedActiveId) {
  await AsyncStorage.removeItem(ACTIVE_CLASS_KEY);
}
```

---

### Bug 8 - Circle and Class State Can Disagree ✅ FIXED
**File:** `frontend/hooks/useCircle.ts`

**Problem:** Similar to Bug 7, circle cache could contain stale data when user left all circles or switched accounts.

**Fix:** Applied same pattern as Bug 7 - always replace cache even when empty, and clear stale active circle ID.

```typescript
// Always update cache
if (Array.isArray(apiData.circles)) {
  localCircles = apiData.circles;
  await AsyncStorage.setItem(CIRCLES_CACHE_KEY, JSON.stringify(localCircles));
}

// Clear stale active circle
if (!matched && savedActiveId) {
  await AsyncStorage.removeItem(ACTIVE_CIRCLE_KEY);
}
```

---

## Verification

All changes have been verified:

1. ✅ Backend compiles without errors (`npm run build`)
2. ✅ Frontend type-checks successfully (`npx tsc --noEmit`)

## Real-time Enhancement Note

**Outstanding:** Your Circle screen refreshes posts on focus or pull-to-refresh, but does not use Supabase Realtime subscriptions. This means members won't see new photos immediately - they must manually refresh. Consider adding Realtime subscriptions to `circle_posts` table for instant feed updates.

Example implementation:
```typescript
useEffect(() => {
  if (!activeCircle?.id || !supabase) return;
  
  const channel = supabase
    .channel(`circle:${activeCircle.id}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'circle_posts', filter: `circle_id=eq.${activeCircle.id}` },
      (payload) => {
        // Add new post to feed immediately
        loadPosts();
      }
    )
    .subscribe();
    
  return () => { supabase.removeChannel(channel); };
}, [activeCircle?.id]);
```

This is a feature enhancement, not a bug, so it's not included in this fix set.
