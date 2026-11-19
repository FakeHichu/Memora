# Migration Guide: Activating Circle v2

## Overview

This guide walks you through activating the new Circle experience in production.

---

## Step 1: Activate Circle v2 Screen

Replace the old Circle screen with the new one:

```bash
cd frontend/app/(tabs)

# Backup old Circle screen
mv circle.tsx circle-v1-backup.tsx

# Activate Circle v2
mv circle-v2.tsx circle.tsx

# Commit
git add .
git commit -m "Activate Circle v2 with real-time feed"
```

---

## Step 2: Enable Supabase Realtime

### In Supabase Dashboard:

1. **Navigate to:** Database → Replication
2. **Enable replication for tables:**
   - `circle_posts` ✓
   - `daily_posts` ✓
   - `reactions` ✓
   - `comments` ✓

3. **Navigate to:** Database → Extensions
4. **Ensure enabled:**
   - `supabase_realtime` ✓

### Test Realtime:

```sql
-- In Supabase SQL Editor
INSERT INTO circle_posts (circle_id, user_id, photo_path, caption)
VALUES (
  'your-test-circle-id',
  'your-test-user-id',
  'test/path.jpg',
  'Test realtime post'
);

-- Check if frontend receives the event
```

---

## Step 3: Database Indexes (Performance)

Run these in Supabase SQL Editor:

```sql
-- Circle posts indexes
CREATE INDEX IF NOT EXISTS idx_circle_posts_circle_id 
ON circle_posts(circle_id);

CREATE INDEX IF NOT EXISTS idx_circle_posts_created_at 
ON circle_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_circle_posts_user_id 
ON circle_posts(user_id);

-- Daily posts indexes
CREATE INDEX IF NOT EXISTS idx_daily_posts_class_id 
ON daily_posts(class_id);

CREATE INDEX IF NOT EXISTS idx_daily_posts_created_at 
ON daily_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_posts_user_id 
ON daily_posts(user_id);

-- Reactions indexes
CREATE INDEX IF NOT EXISTS idx_reactions_post_id 
ON reactions(post_id);

CREATE INDEX IF NOT EXISTS idx_reactions_user_id 
ON reactions(user_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id 
ON comments(post_id);

CREATE INDEX IF NOT EXISTS idx_comments_user_id 
ON comments(user_id);

-- Class members index
CREATE INDEX IF NOT EXISTS idx_class_members_user_id 
ON class_members(user_id);

CREATE INDEX IF NOT EXISTS idx_class_members_class_id 
ON class_members(class_id);

-- User active circle index
CREATE INDEX IF NOT EXISTS idx_user_active_circle_user_id 
ON user_active_circle(user_id);
```

---

## Step 4: Clear Old Cache (Users)

Users must clear app cache to migrate to v2 storage keys:

**Option A: Force cache clear in code**

Add to `CircleContext.tsx` initialization:

```typescript
useEffect(() => {
  // One-time migration to v2
  const migrateCache = async () => {
    const migrated = await AsyncStorage.getItem('memora.migrated_to_v2');
    if (!migrated) {
      // Clear old cache
      await AsyncStorage.multiRemove([
        'memora.active_circle.v1',
        'memora.circles_cache.v1',
        'memora.active_class_id.v1',
        'memora.classes.v1',
      ]);
      await AsyncStorage.setItem('memora.migrated_to_v2', 'true');
    }
  };
  migrateCache();
}, []);
```

**Option B: Bump app version**

In `app.json`:
```json
{
  "version": "2.0.0",
  "android": {
    "versionCode": 2
  },
  "ios": {
    "buildNumber": "2"
  }
}
```

Users will reinstall → Fresh cache.

---

## Step 5: Test Multi-Device

### Required: 2-5 test devices

**Test Script:**

```
Device A (iPhone):
1. Login as user1@test.com
2. Open app → Verify Circle section on Home
3. Navigate to Circle tab
4. Tap "Take Photo" → Capture test image
5. Enter caption: "Test from iPhone"
6. Tap "Share to Circle"
7. Verify progress modal shows stages
8. Wait for success

Device B (Android):
1. Login as user2@test.com
2. Open Circle tab
3. Wait 2-5 seconds
4. Verify "New posts available" banner appears
5. Tap banner
6. Verify iPhone photo appears in feed
7. Tap photo → View details
8. Add reaction ❤️

Device A (iPhone):
1. Still on Circle tab
2. Verify reaction appears on photo (real-time)
3. Pull to refresh
4. Verify feed shows latest state

Device B (Android):
1. Tap "Take Photo"
2. Upload different photo
3. Verify upload succeeds

Device A (iPhone):
1. Wait 2 seconds
2. Verify banner appears
3. Tap banner → Android photo appears

Both Devices:
1. Navigate to Home tab
2. Verify Circle section shows same active Circle
3. Verify upload button works from Home
4. Switch to different Circle (if multiple)
5. Verify both devices see different feed
6. Verify upload destination changes
```

**Expected Results:**
- ✅ Real-time latency: <5 seconds
- ✅ Upload success rate: 100%
- ✅ Progress modal shows all stages
- ✅ Banner appears for other users
- ✅ Feed updates after banner tap
- ✅ Reactions sync in real-time
- ✅ Circle switching updates both devices

**Failure Cases to Test:**
- ❌ No internet → Upload retry → Success when online
- ❌ Backend down → Clear error message
- ❌ Large photo (10MB+) → Still succeeds
- ❌ Kill app mid-upload → Resume on reopen
- ❌ Rapid successive uploads → All succeed

---

## Step 6: Monitor Production

### Setup Logging

**Backend (add to `index.ts`):**

```typescript
// Log upload attempts
app.post('/api/posts/upload', async (req, res, next) => {
  console.log('[UPLOAD] Attempt:', {
    userId: req.userId,
    classId: req.body.classId,
    timestamp: new Date().toISOString(),
  });
  
  try {
    // ... existing upload logic
    console.log('[UPLOAD] Success:', { photoPath: uploadedPath });
  } catch (err) {
    console.error('[UPLOAD] Failed:', err);
    throw err;
  }
});

// Log real-time events
app.post('/api/circles/:circleId/feed', async (req, res, next) => {
  console.log('[FEED] Request:', {
    circleId: req.params.circleId,
    userId: req.userId,
  });
});
```

### Metrics to Track

1. **Upload Success Rate**
   - Target: >98%
   - Alert if: <90% for 5 minutes

2. **Real-time Latency**
   - Target: <2 seconds
   - Alert if: >10 seconds

3. **Feed Load Time**
   - Target: <500ms
   - Alert if: >2 seconds

4. **Error Rate**
   - Target: <1%
   - Alert if: >5%

### Supabase Dashboard Monitoring

- **Database → Logs:** Watch for RLS policy violations
- **Storage → Logs:** Watch for unauthorized access
- **Realtime → Logs:** Watch for connection failures
- **API → Logs:** Watch for 500 errors

---

## Step 7: Rollback Plan

If critical issues arise in production:

### Immediate Rollback (< 5 minutes):

```bash
cd frontend/app/(tabs)

# Restore old Circle screen
mv circle.tsx circle-v2.tsx
mv circle-v1-backup.tsx circle.tsx

# Emergency deploy
git add .
git commit -m "ROLLBACK: Revert to Circle v1"
git push
eas build --platform android --profile production
```

### Disable Realtime (Keep v2 UI):

```typescript
// In useCircleFeed.ts
const REALTIME_ENABLED = false; // Toggle off

if (REALTIME_ENABLED) {
  // Realtime subscription code
}
```

### Known Issues & Fixes

**Issue: Real-time not working**
- Fix: Verify Supabase Realtime is enabled
- Workaround: Users can pull-to-refresh

**Issue: Upload always fails**
- Fix: Check backend service-role key
- Workaround: Rollback to v1

**Issue: Feed shows duplicates**
- Fix: Check `loadNewPosts()` logic
- Workaround: Kill and reopen app

**Issue: Circle not switching**
- Fix: Clear AsyncStorage cache
- Workaround: Re-login

---

## Step 8: User Communication

### In-App Announcement (Optional)

Show modal on first open after update:

```typescript
// In Home screen
const [showV2Announcement, setShowV2Announcement] = useState(false);

useEffect(() => {
  AsyncStorage.getItem('memora.v2_announced').then((announced) => {
    if (!announced) {
      setShowV2Announcement(true);
      AsyncStorage.setItem('memora.v2_announced', 'true');
    }
  });
}, []);

// Modal content:
"🎉 Memora 2.0 is here!

• See photos from classmates instantly
• Upload progress tracking
• Improved Circle experience

Tap anywhere to continue"
```

### Email/Push Notification

Subject: **Memora 2.0: Real-time Circle Photos**

Body:
```
Hi {name},

We've upgraded Memora with exciting new features:

✨ Real-time updates
   See classmates' photos within seconds

📸 Better photo uploads
   Track progress and never lose a memory

🎯 Improved Circle experience
   Easier navigation and sharing

Update now: [App Store Link] [Play Store Link]

Happy memory sharing!
– The Memora Team
```

---

## Step 9: Post-Launch Checklist

**Day 1:**
- [ ] Monitor error rates (target: <1%)
- [ ] Check upload success rates (target: >98%)
- [ ] Verify real-time latency (target: <2s)
- [ ] Read user feedback
- [ ] Fix critical bugs immediately

**Week 1:**
- [ ] Analyze upload patterns
- [ ] Optimize slow queries
- [ ] Add missing indexes
- [ ] Address user-reported issues
- [ ] Plan v2.1 improvements

**Month 1:**
- [ ] Measure engagement (DAU, uploads per user)
- [ ] Survey user satisfaction
- [ ] Plan feature roadmap
- [ ] Optimize costs (storage, bandwidth)

---

## Step 10: Success Criteria

**Launch is successful if:**

✅ **Uptime:** >99.5%
✅ **Upload success rate:** >98%
✅ **Real-time latency:** <5 seconds
✅ **Zero data loss:** No orphaned uploads
✅ **Positive feedback:** >80% users happy
✅ **No rollback:** Stable for 7 days

**Launch requires more work if:**

❌ **Uptime:** <95%
❌ **Upload failures:** >10%
❌ **Real-time broken:** >30s latency
❌ **Data loss:** Orphaned uploads
❌ **Negative feedback:** >30% complaints
❌ **Frequent rollbacks:** >1 in 48 hours

---

## Troubleshooting

### Upload Stuck at "Uploading..."

**Check:**
1. Backend logs for errors
2. Supabase storage permissions
3. Network connectivity
4. File size (max 10MB)

**Fix:**
```typescript
// Increase timeout in photo-upload-v2.ts
const UPLOAD_TIMEOUT = 60000; // 60 seconds
```

### Real-time Notifications Not Appearing

**Check:**
1. Supabase Realtime enabled
2. Table replication enabled
3. Channel subscription logs
4. Frontend console for errors

**Debug:**
```typescript
// In useCircleFeed.ts
channel.subscribe((status) => {
  console.log('Realtime status:', status);
  if (status === 'SUBSCRIBED') {
    console.log('✅ Realtime connected');
  } else {
    console.error('❌ Realtime failed:', status);
  }
});
```

### Feed Shows Old Data

**Check:**
1. Cache not cleared
2. Pull-to-refresh broken
3. Backend returning cached response

**Fix:**
```bash
# Clear user cache
# In app, add:
await AsyncStorage.clear();
```

### Circle Won't Switch

**Check:**
1. AsyncStorage writes failing
2. Backend /api/circles/active endpoint
3. CircleContext state updates

**Debug:**
```typescript
// In CircleContext
const selectCircle = async (circleId: string) => {
  console.log('Switching to:', circleId);
  await AsyncStorage.setItem(ACTIVE_CIRCLE_KEY, circleId);
  const saved = await AsyncStorage.getItem(ACTIVE_CIRCLE_KEY);
  console.log('Saved:', saved);
};
```

---

## Support Contacts

**Backend Issues:**
- Check: Railway/Render logs
- Email: backend-team@memora.app

**Frontend Issues:**
- Check: Expo logs
- Email: frontend-team@memora.app

**Supabase Issues:**
- Check: Supabase dashboard
- Support: supabase.com/support

**General Issues:**
- Slack: #memora-support
- Email: help@memora.app

---

## Next Feature: Comments

After Circle v2 is stable, add comments:

1. Update `circle_posts` table schema
2. Add comment input to post detail screen
3. Subscribe to comment changes via Realtime
4. Show comment count on MemoryCard
5. Add comment notifications

See: `FEATURES_ROADMAP.md` (coming soon)

---

## Conclusion

You're ready to ship Circle v2! 🚀

**Pre-launch checklist:**
- [x] Circle v2 screen created
- [x] Upload service with retries
- [x] Real-time feed hook
- [x] Progress modal
- [x] New posts banner
- [x] TypeScript compiles
- [x] Backend compiles
- [ ] Database indexes added
- [ ] Supabase Realtime enabled
- [ ] Old cache cleared
- [ ] Multi-device tested
- [ ] Monitoring setup
- [ ] Rollback plan ready

**Launch when all boxes checked.**
