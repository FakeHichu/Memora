# Circle Photo Sharing Implementation Guide

## Overview
This implementation adds **Circles** - private photo-sharing groups where users can upload photos that are visible only to circle members. When users log in, they see a popup notification indicating which circle they're in, and the home page displays their active circle status.

## What Was Implemented

### 1. Database Schema (Migration 007)
- **circles** table: Stores circle information (name, description, class association)
- **circle_members** table: Tracks which users belong to which circles
- **circle_posts** table: Photos shared within specific circles
- **circle_post_reactions** table: Reactions on circle posts
- **circle_post_comments** table: Comments on circle posts
- **user_active_circle** table: Tracks which circle a user is currently viewing

**File**: `database/migrations/007_circles_implementation.sql`

### 2. Backend Implementation

#### Types (`backend/src/types/index.ts`)
Added TypeScript interfaces for:
- CircleEntity
- CircleMemberEntity
- CirclePostEntity
- CirclePostReactionEntity
- UserActiveCircleEntity

#### Repository Layer (`backend/src/repositories/circle.repository.ts`)
Handles all database operations:
- Create/read circles
- Manage circle membership
- CRUD operations for circle posts
- Reaction management
- Active circle tracking

#### Service Layer (`backend/src/services/circle.service.ts`)
Business logic for:
- Circle creation and management
- Photo uploads to circles
- Feed generation with reactions
- Membership verification
- Active circle management

#### Controller Layer (`backend/src/controllers/circle.controller.ts`)
API endpoints for:
- `POST /api/circles` - Create circle
- `GET /api/circles` - Get user's circles
- `GET /api/circles/class/:classId` - Get circles in a class
- `POST /api/circles/:circleId/join` - Join a circle
- `POST /api/circles/upload` - Upload photo to circle
- `GET /api/circles/:circleId/feed` - Get circle feed
- `POST /api/circles/active` - Set active circle
- `GET /api/circles/active` - Get active circle
- `PATCH /api/circles/posts/:postId/caption` - Update caption
- `DELETE /api/circles/posts/:postId` - Delete post
- `POST /api/circles/posts/:postId/reactions` - Toggle reaction

#### Routes (`backend/src/routes/circle.routes.ts`)
All routes require authentication via `authMiddleware`.

### 3. Frontend Implementation

#### Hook (`frontend/hooks/useCircle.ts`)
React hook for circle management:
- Load and cache circles
- Track active circle
- Create new circles
- Join existing circles
- Sync with backend

#### Components

**CircleStatusModal** (`frontend/components/ui/CircleStatusModal.tsx`)
- Full-screen modal that appears on first login
- Shows active circle name and description
- Displays privacy information
- Actions: "Got it" (dismiss) or "View Circle"

**CircleStatusBanner** (`frontend/components/ui/CircleStatusBanner.tsx`)
- Compact banner for home page
- Shows active circle indicator with pulsing dot
- Displays circle name and privacy badge
- Tappable to navigate to circle page

#### Updated Home Screen (`frontend/app/(tabs)/home.tsx`)
- Imports circle hooks and components
- Shows CircleStatusModal on first login (tracked with AsyncStorage)
- Displays CircleStatusBanner below search bar
- Refreshes circles on screen focus

## How to Apply

### Step 1: Apply Database Migration

Connect to your Supabase database and run the migration:

```bash
# If using psql:
psql -h <your-supabase-host> -U postgres -d postgres -f database/migrations/007_circles_implementation.sql

# Or apply via Supabase SQL Editor:
# Copy contents of 007_circles_implementation.sql and run in SQL Editor
```

### Step 2: Rebuild Backend

```powershell
cd backend
npm run build
```

### Step 3: Restart Backend Server

```powershell
cd backend
npm start
```

### Step 4: Test Frontend

```powershell
cd frontend
npx expo start
```

## Testing the Feature

### 1. Create a Circle

**Via API (curl or Postman)**:
```bash
curl -X POST http://localhost:4000/api/circles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": "your-class-id",
    "name": "My First Circle",
    "description": "A private photo group"
  }'
```

**Via Frontend** (implement a create circle UI):
```typescript
const { createCircle } = useCircle();
await createCircle(classId, "Circle Name", "Description");
```

### 2. Set Active Circle

```bash
curl -X POST http://localhost:4000/api/circles/active \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "circleId": "circle-id-from-step-1"
  }'
```

### 3. Upload Photo to Circle

```bash
curl -X POST http://localhost:4000/api/circles/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "circleId": "your-circle-id",
    "base64": "data:image/jpeg;base64,/9j/4AAQ...",
    "caption": "My first circle photo!"
  }'
```

### 4. Test in App

1. **Login** - You should see the CircleStatusModal popup
2. **Home Screen** - You should see the CircleStatusBanner
3. **Tap Banner** - Navigate to circle screen
4. **Upload Photo** - Photos uploaded are only visible to circle members

## Features

### ✅ Implemented

1. **Circle Creation**: Users can create circles within a class
2. **Circle Membership**: Track who belongs to which circles
3. **Private Photo Upload**: Upload photos exclusively to a circle
4. **Circle Feed**: View all photos shared in a circle
5. **Reactions & Comments**: React and comment on circle posts
6. **Active Circle Tracking**: System remembers which circle user is viewing
7. **Login Popup**: Shows active circle notification on first login
8. **Home Page Indicator**: Persistent banner showing active circle

### 🔄 Privacy & Security

- Photos are stored in `circles/{circleId}/{userId}/{timestamp}.jpg`
- Row Level Security (RLS) policies ensure only circle members can:
  - View circles they belong to
  - See posts in their circles
  - Upload photos to their circles
  - React and comment on circle posts
- All API endpoints require authentication
- Membership verification on every circle operation

### 📱 User Experience Flow

1. **User logs in** → CircleStatusModal appears (once per session)
2. **Home screen** → CircleStatusBanner shows active circle
3. **Tap banner** → Navigate to circle screen
4. **Upload photo** → Photo is visible only to circle members
5. **View feed** → See all circle posts with reactions
6. **Switch circles** → Change active circle, updates everywhere

## Future Enhancements

- Circle invitation codes (like class join codes)
- Multiple circles per class
- Circle admin controls
- Photo deletion by admins
- Circle settings (name, description, cover photo)
- Push notifications for new circle posts
- Circle analytics (member activity, post count)

## Troubleshooting

### Backend Errors

**"Circle not found"**
- Ensure circle ID is correct
- Check user is a member of the circle

**"You must be a member of this circle"**
- User needs to join circle first
- Check circle_members table

### Frontend Issues

**Modal doesn't show on login**
- Clear AsyncStorage: `await AsyncStorage.removeItem('memora.circle_popup_shown.v1')`
- Ensure active circle is set

**Banner not appearing**
- Check useCircle hook is loading circles
- Verify active circle is set in backend
- Check console for errors

## Database Queries

### Check Circle Membership
```sql
SELECT c.name, cm.role, cm.joined_at
FROM circles c
JOIN circle_members cm ON cm.circle_id = c.id
WHERE cm.user_id = 'user-id';
```

### View Circle Posts
```sql
SELECT cp.*, c.name as circle_name
FROM circle_posts cp
JOIN circles c ON c.id = cp.circle_id
WHERE cp.circle_id = 'circle-id'
AND cp.deleted_at IS NULL
ORDER BY cp.created_at DESC;
```

### Get Active Circle for User
```sql
SELECT c.*
FROM user_active_circle uac
JOIN circles c ON c.id = uac.circle_id
WHERE uac.user_id = 'user-id';
```

## API Examples

### Create Circle
```typescript
POST /api/circles
{
  "classId": "uuid",
  "name": "Friend Circle",
  "description": "Close friends only"
}
```

### Upload to Circle
```typescript
POST /api/circles/upload
{
  "circleId": "uuid",
  "base64": "data:image/jpeg;base64,...",
  "caption": "Beach day! 🏖️",
  "contentType": "image/jpeg"
}
```

### Get Circle Feed
```typescript
GET /api/circles/{circleId}/feed

Response:
{
  "ok": true,
  "posts": [...],
  "circle": {...},
  "memberCount": 5
}
```

### Toggle Reaction
```typescript
POST /api/circles/posts/{postId}/reactions
{
  "reactionType": "heart" // or "laugh", "cry", "fire", "dead", "respect"
}
```

## Notes

- Photos in circles are separate from daily class posts
- Each user can be in multiple circles
- Only one active circle at a time (for UI simplicity)
- Circle posts don't have daily limits like class posts
- Storage organized by circle for easy management and cleanup

---

**Implementation Date**: 2024
**Version**: 1.0
**Status**: ✅ Ready for Testing
