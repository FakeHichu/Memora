# Memora Circle v2 Testing Script

## Test Environment Setup

**Required:**
- 2-5 test devices (mix of iOS and Android)
- 2-5 test accounts
- Stable internet connection
- Backend running (local or production)
- Supabase Realtime enabled

**Test Accounts:**
```
user1@test.com / password123
user2@test.com / password123
user3@test.com / password123
```

---

## Test Suite 1: Single User Flow

### Device: Any
### Account: user1@test.com

#### Test 1.1: First Launch
- [ ] Open app
- [ ] Login with user1@test.com
- [ ] Home screen loads
- [ ] See "No Circle Joined Yet" if no circles
- [ ] **OR** See Circle section if has circles

**Expected:** Home loads within 2 seconds

#### Test 1.2: Create Circle
- [ ] Tap "Create a Circle" (or navigate to onboarding)
- [ ] Enter name: "Test Class 2024"
- [ ] Enter school: "Test University"
- [ ] Tap "Create"
- [ ] See success message
- [ ] Home screen shows Circle section
- [ ] Circle section shows: "Test Class 2024"
- [ ] Member count: 1

**Expected:** Circle created and appears on Home

#### Test 1.3: Circle Section Visibility
- [ ] Scroll Home screen
- [ ] Circle section is prominently displayed
- [ ] Shows: Circle name, school, member count
- [ ] Shows: "Share Photo" button
- [ ] Active indicator (green dot) visible

**Expected:** Circle section always visible on Home

#### Test 1.4: Upload from Home
- [ ] On Home screen
- [ ] Tap "Share Photo" in Circle section
- [ ] Navigate to Circle screen
- [ ] See Circle header with photo buttons

**Expected:** Navigation works

#### Test 1.5: Upload Photo (Take)
- [ ] On Circle screen
- [ ] Tap "Take Photo"
- [ ] Camera opens
- [ ] Capture test photo
- [ ] Upload modal opens
- [ ] Photo preview shown
- [ ] Enter caption: "Test upload from camera"
- [ ] Tap "Share to Circle"
- [ ] Progress modal appears
- [ ] See stages: Processing → Uploading → Creating Post
- [ ] Progress bar animates 0-100%
- [ ] Success message: "Photo shared successfully!"
- [ ] Modal dismisses
- [ ] Success toast appears
- [ ] Photo appears in Circle feed

**Expected:** 
- Upload completes within 10 seconds
- All progress stages visible
- Photo appears in feed

#### Test 1.6: Upload Photo (Gallery)
- [ ] Tap "From Gallery"
- [ ] Select photo
- [ ] Upload modal opens
- [ ] Enter caption: "Test upload from gallery"
- [ ] Tap "Share to Circle"
- [ ] Progress modal shows
- [ ] Upload completes
- [ ] Photo appears in feed

**Expected:** Gallery uploads work

#### Test 1.7: View Feed
- [ ] Scroll Circle feed
- [ ] See both uploaded photos
- [ ] Photos show captions
- [ ] Photos show author name
- [ ] Photos have reaction buttons
- [ ] Pull to refresh works

**Expected:** Feed shows all posts

#### Test 1.8: React to Photo
- [ ] Tap reaction button on first photo
- [ ] Choose ❤️
- [ ] Heart appears on photo
- [ ] Reaction count: 1

**Expected:** Reactions work

---

## Test Suite 2: Multi-User Real-Time

### Device A: iPhone
### Device B: Android
### Accounts: user1@test.com, user2@test.com

#### Test 2.1: User 2 Joins Circle
**Device B:**
- [ ] Login as user2@test.com
- [ ] Tap "Enter Invite Code"
- [ ] Enter join code from Device A's circle
- [ ] Tap "Join"
- [ ] Success message appears
- [ ] Circle section appears on Home
- [ ] Shows same circle name as Device A

**Expected:** User 2 joins successfully

#### Test 2.2: Real-Time Upload Notification
**Device A:**
- [ ] Navigate to Circle screen
- [ ] Stay on screen (don't switch tabs)

**Device B:**
- [ ] Navigate to Circle screen
- [ ] Tap "Take Photo"
- [ ] Capture photo
- [ ] Caption: "Real-time test from Device B"
- [ ] Tap "Share to Circle"
- [ ] Upload completes

**Device A:**
- [ ] Wait 2-5 seconds
- [ ] Banner appears: "1 new photo from classmates"
- [ ] Banner has accent color background
- [ ] Tap banner
- [ ] Device B's photo appears at top of feed

**Expected:**
- Banner appears within 5 seconds
- Photo loads after banner tap
- No duplicate posts

#### Test 2.3: Real-Time Reactions
**Device A:**
- [ ] Already viewing Device B's photo in feed
- [ ] Tap reaction button
- [ ] Choose 👍

**Device B:**
- [ ] Still on Circle screen
- [ ] See own photo in feed
- [ ] Wait 2-5 seconds
- [ ] 👍 reaction appears on photo
- [ ] Reaction count updates

**Expected:** Reactions sync in <5 seconds

#### Test 2.4: Simultaneous Uploads
**Both Devices:**
- [ ] At same time, both tap "Take Photo"
- [ ] Both capture photos
- [ ] Both enter captions
- [ ] Both tap "Share to Circle"
- [ ] Both see progress modals
- [ ] Both uploads complete

**Device A:**
- [ ] See banner for Device B's photo
- [ ] Tap banner
- [ ] Both photos appear in feed

**Device B:**
- [ ] See banner for Device A's photo
- [ ] Tap banner
- [ ] Both photos appear in feed

**Expected:** Both uploads succeed, no conflicts

---

## Test Suite 3: Circle Switching

### Device: Any
### Account: user1@test.com

#### Test 3.1: Create Second Circle
- [ ] On Home screen
- [ ] Navigate to onboarding
- [ ] Create second circle: "Friends Circle"
- [ ] Circle created successfully
- [ ] Home updates to show new circle

**Expected:** Can create multiple circles

#### Test 3.2: Circle Switcher Appears
- [ ] Scroll Home screen
- [ ] See Circle section for active circle
- [ ] Below it, see "Your Circles" section
- [ ] Lists both circles
- [ ] Active circle highlighted
- [ ] Non-active shows "Switch" button

**Expected:** Switcher shows when multiple circles exist

#### Test 3.3: Switch Circle
- [ ] Tap "Switch" on "Friends Circle"
- [ ] Home Circle section updates
- [ ] Shows "Friends Circle" name
- [ ] Member count shows 1
- [ ] Navigate to Circle tab
- [ ] Circle header shows "Friends Circle"
- [ ] Feed is empty (no posts yet)

**Expected:** Switching updates entire app

#### Test 3.4: Upload to Different Circle
- [ ] Still on "Friends Circle"
- [ ] Upload test photo
- [ ] Caption: "Photo in Friends Circle"
- [ ] Upload completes
- [ ] Photo appears in feed

**Expected:** Upload destination follows active circle

#### Test 3.5: Switch Back
- [ ] Tap "Switch" on "Test Class 2024"
- [ ] Circle section updates
- [ ] Navigate to Circle tab
- [ ] Feed shows original photos (not Friends Circle photos)

**Expected:** Feeds are separate per circle

---

## Test Suite 4: Error Handling

### Device: Any
### Account: user1@test.com

#### Test 4.1: No Internet Upload
- [ ] Enable airplane mode
- [ ] Navigate to Circle
- [ ] Tap "Take Photo"
- [ ] Capture photo
- [ ] Tap "Share to Circle"
- [ ] Progress modal shows
- [ ] See "Upload failed, retrying (1/2)..."
- [ ] Retry 1 fails
- [ ] See "Upload failed, retrying (2/2)..."
- [ ] Retry 2 fails
- [ ] Error modal shows
- [ ] Message: "Upload failed after multiple attempts..."

**Expected:** Clear error after retries exhausted

#### Test 4.2: Upload Retry Success
- [ ] Airplane mode still on
- [ ] Start upload (will fail)
- [ ] See "Uploading..." stage
- [ ] Disable airplane mode (go online)
- [ ] See "Upload failed, retrying..."
- [ ] Retry succeeds
- [ ] Progress continues: Creating Post → Complete

**Expected:** Auto-retry succeeds when connection returns

#### Test 4.3: Large Photo Upload
- [ ] Select photo >5MB from gallery
- [ ] Upload with caption
- [ ] Progress shows longer upload stage
- [ ] Upload completes
- [ ] Photo appears in feed

**Expected:** Large photos still succeed

#### Test 4.4: Backend Down
- [ ] Stop backend server
- [ ] Try to upload photo
- [ ] See error message
- [ ] Start backend server
- [ ] Try again
- [ ] Upload succeeds

**Expected:** Graceful degradation, clear errors

#### Test 4.5: Offline Feed View
- [ ] Enable airplane mode
- [ ] Navigate to Circle tab
- [ ] Pull to refresh
- [ ] See "Failed to load feed" or cached feed
- [ ] Disable airplane mode
- [ ] Pull to refresh
- [ ] Feed loads successfully

**Expected:** Cached feed available offline

---

## Test Suite 5: State Persistence

### Device: Any
### Account: user1@test.com

#### Test 5.1: Kill and Reopen
- [ ] Open app
- [ ] Note active circle name
- [ ] Kill app (force close)
- [ ] Reopen app
- [ ] Same circle is active
- [ ] Feed loads correctly

**Expected:** State persists across sessions

#### Test 5.2: Logout and Login
- [ ] Logout from app
- [ ] Login as user2@test.com
- [ ] Different circles shown
- [ ] No user1 data visible
- [ ] Logout
- [ ] Login as user1@test.com
- [ ] Original circles shown

**Expected:** User-specific data separation

#### Test 5.3: Clear Cache
- [ ] Go to app settings
- [ ] Clear cache (if available)
- [ ] **OR** Reinstall app
- [ ] Login again
- [ ] Circles reload from backend
- [ ] Active circle restored

**Expected:** Backend is source of truth

---

## Test Suite 6: Edge Cases

#### Test 6.1: Empty Circle
- [ ] Create new circle
- [ ] No other members
- [ ] No posts yet
- [ ] Navigate to Circle tab
- [ ] See empty state: "No photos yet"
- [ ] See "Share First Photo" button
- [ ] Tap button
- [ ] Upload flow works

**Expected:** Helpful empty states

#### Test 6.2: Single Photo in Circle
- [ ] Upload one photo to empty circle
- [ ] Photo appears
- [ ] No errors
- [ ] Pull to refresh works

**Expected:** Single photo displays correctly

#### Test 6.3: Many Photos (50+)
- [ ] Upload 50+ photos rapidly (script or manual)
- [ ] All appear in feed
- [ ] Scroll performance smooth
- [ ] No duplicates
- [ ] Real-time still works

**Expected:** Handles large feeds

#### Test 6.4: Long Caption
- [ ] Upload photo with 280 character caption
- [ ] Caption displays fully in modal
- [ ] Caption displays truncated in feed
- [ ] Tap photo → Full caption in detail view

**Expected:** Long text handled gracefully

#### Test 6.5: Special Characters in Caption
- [ ] Caption with emoji: "🎉🎊🎈"
- [ ] Caption with Unicode: "こんにちは"
- [ ] Caption with symbols: "@#$%^&*()"
- [ ] All display correctly

**Expected:** Unicode support

#### Test 6.6: Rapid Circle Switching
- [ ] Switch between circles 10 times rapidly
- [ ] No crashes
- [ ] Correct feed shown each time
- [ ] No cross-contamination

**Expected:** Stable under stress

---

## Test Suite 7: Performance

### Device: Mid-range Android
### Account: user1@test.com

#### Test 7.1: Cold Start Time
- [ ] Kill app completely
- [ ] Start timer
- [ ] Open app
- [ ] Login
- [ ] Home screen fully loaded
- [ ] Stop timer

**Expected:** <3 seconds

#### Test 7.2: Feed Load Time
- [ ] Navigate to Circle tab
- [ ] Start timer
- [ ] Pull to refresh
- [ ] Feed fully loaded
- [ ] Stop timer

**Expected:** <1 second (cached), <2 seconds (network)

#### Test 7.3: Upload Time
- [ ] Start timer
- [ ] Take photo → Share
- [ ] Progress: Complete
- [ ] Stop timer

**Expected:** <10 seconds on good connection

#### Test 7.4: Real-Time Latency
**Device A:**
- [ ] On Circle screen
- [ ] Start timer

**Device B:**
- [ ] Upload photo
- [ ] Note completion time

**Device A:**
- [ ] Banner appears
- [ ] Stop timer

**Expected:** <5 seconds

#### Test 7.5: Memory Usage
- [ ] Open app
- [ ] Check memory usage (developer tools)
- [ ] Upload 10 photos
- [ ] Scroll feed extensively
- [ ] Check memory again
- [ ] No significant increase

**Expected:** <200MB total

---

## Test Suite 8: Security

### Devices: A and B
### Accounts: user1@test.com, user2@test.com (different circles)

#### Test 8.1: Cannot View Other Circle Photos
**Device A (user1):**
- [ ] In "Test Class 2024" circle
- [ ] Note photo IDs in feed

**Device B (user2):**
- [ ] In different circle "Friends Circle"
- [ ] Try to navigate to user1's photo (via deep link if possible)
- [ ] Get "Access denied" or 403 error

**Expected:** RLS prevents cross-circle access

#### Test 8.2: Cannot Delete Other's Posts
**Device A (user1):**
- [ ] Upload photo in shared circle

**Device B (user2):**
- [ ] Same circle as user1
- [ ] See user1's photo
- [ ] Try to delete (if delete button shows)
- [ ] Get "Not authorized" error

**Expected:** Only author can delete

#### Test 8.3: Cannot Upload to Circle Not Member Of
**Device A (user1):**
- [ ] Note circle ID of "Test Class 2024"

**Device B (user2):**
- [ ] Not a member of "Test Class 2024"
- [ ] Try to upload via API call (manual test)
- [ ] Get 403 error

**Expected:** Membership validated before upload

---

## Test Results Template

```
Date: ____________________
Tester: __________________
Devices: _________________

Test Suite 1: Single User Flow
✓ 1.1 First Launch
✓ 1.2 Create Circle
✓ 1.3 Circle Section Visibility
✓ 1.4 Upload from Home
✓ 1.5 Upload Photo (Take)
✓ 1.6 Upload Photo (Gallery)
✓ 1.7 View Feed
✓ 1.8 React to Photo

Test Suite 2: Multi-User Real-Time
✓ 2.1 User 2 Joins Circle
✓ 2.2 Real-Time Upload Notification
✓ 2.3 Real-Time Reactions
✓ 2.4 Simultaneous Uploads

Test Suite 3: Circle Switching
✓ 3.1 Create Second Circle
✓ 3.2 Circle Switcher Appears
✓ 3.3 Switch Circle
✓ 3.4 Upload to Different Circle
✓ 3.5 Switch Back

Test Suite 4: Error Handling
✓ 4.1 No Internet Upload
✓ 4.2 Upload Retry Success
✓ 4.3 Large Photo Upload
✓ 4.4 Backend Down
✓ 4.5 Offline Feed View

Test Suite 5: State Persistence
✓ 5.1 Kill and Reopen
✓ 5.2 Logout and Login
✓ 5.3 Clear Cache

Test Suite 6: Edge Cases
✓ 6.1 Empty Circle
✓ 6.2 Single Photo in Circle
✓ 6.3 Many Photos (50+)
✓ 6.4 Long Caption
✓ 6.5 Special Characters
✓ 6.6 Rapid Circle Switching

Test Suite 7: Performance
✓ 7.1 Cold Start Time: ___ seconds
✓ 7.2 Feed Load Time: ___ seconds
✓ 7.3 Upload Time: ___ seconds
✓ 7.4 Real-Time Latency: ___ seconds
✓ 7.5 Memory Usage: ___ MB

Test Suite 8: Security
✓ 8.1 Cannot View Other Circle Photos
✓ 8.2 Cannot Delete Other's Posts
✓ 8.3 Cannot Upload to Non-Member Circle

CRITICAL BUGS FOUND: ________________
MINOR ISSUES: ______________________
READY FOR PRODUCTION: YES / NO
```

---

## Automated Testing (Future)

Consider adding:
- E2E tests with Detox or Maestro
- Unit tests for upload service
- Integration tests for Circle hooks
- Performance regression tests

---

## Sign-Off

**Development Team:** _______________
**QA Team:** _______________________
**Product Manager:** ________________

**Production Release Approved:** YES / NO

**Date:** __________________________
