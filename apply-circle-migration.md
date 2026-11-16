# Quick Start: Apply Circle Migration

## Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy Migration SQL**
   - Open `database/migrations/007_circles_implementation.sql`
   - Copy all contents (Ctrl+A, Ctrl+C)

4. **Run Migration**
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for "Success" message

5. **Verify Tables Created**
   - Go to "Table Editor"
   - Look for new tables:
     - `circles`
     - `circle_members`
     - `circle_posts`
     - `circle_post_reactions`
     - `circle_post_comments`
     - `user_active_circle`

## Option 2: Using psql Command Line

```powershell
# Set your Supabase connection details
$DB_HOST = "your-project.supabase.co"
$DB_USER = "postgres"
$DB_NAME = "postgres"

# Run migration
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/migrations/007_circles_implementation.sql
```

## Option 3: Using Supabase CLI

```powershell
# If you have Supabase CLI installed
cd c:\Projects\Memora
supabase db reset  # This will apply all migrations

# Or apply specific migration
supabase migration up
```

## After Migration

### 1. Verify Installation

Run this query in SQL Editor to verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'circle%'
ORDER BY table_name;
```

Expected output:
```
table_name
--------------------------
circle_members
circle_post_comments
circle_post_reactions
circle_posts
circles
user_active_circle
```

### 2. Check RLS Policies

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename LIKE 'circle%'
ORDER BY tablename, policyname;
```

You should see multiple policies for each circle table.

### 3. Rebuild Backend

```powershell
cd backend
npm install  # If needed
npm run build
npm start
```

### 4. Start Frontend

```powershell
cd frontend
npm install  # If needed
npx expo start
```

## Create Your First Circle

### Using Backend API

```powershell
# Get your access token first (login through the app or get from Supabase)
$TOKEN = "your-access-token-here"

# Create a circle
Invoke-RestMethod -Method POST -Uri "http://localhost:4000/api/circles" `
  -Headers @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body (@{
    classId = "your-class-id"
    name = "My First Circle"
    description = "Private photo group"
  } | ConvertTo-Json)
```

### Using SQL (Quick Test)

```sql
-- Insert a test circle
INSERT INTO circles (class_id, name, description, created_by)
VALUES (
  'your-class-id',
  'Test Circle',
  'Testing circle feature',
  'your-user-id'
) RETURNING *;

-- Add yourself as member
INSERT INTO circle_members (circle_id, user_id, role)
VALUES (
  'circle-id-from-above',
  'your-user-id',
  'owner'
);

-- Set as active circle
INSERT INTO user_active_circle (user_id, circle_id)
VALUES ('your-user-id', 'circle-id-from-above')
ON CONFLICT (user_id) DO UPDATE 
SET circle_id = EXCLUDED.circle_id,
    updated_at = NOW();
```

## Test the Feature

1. **Login to App**
   - You should see the CircleStatusModal popup
   - Shows "You're in a Circle!"

2. **Check Home Screen**
   - Should see CircleStatusBanner below search
   - Shows active circle name with green dot

3. **Navigate to Circle**
   - Tap banner or go to Circle tab
   - Should see upload options

4. **Upload Photo**
   - Take photo or choose from library
   - Upload to circle
   - Verify it appears in feed

5. **Verify Privacy**
   - Login as different user (not in circle)
   - They should NOT see the photo

## Troubleshooting

### Migration Fails

**Error: "relation already exists"**
- Some tables might already exist
- Drop them first or skip those CREATE statements

**Error: "permission denied"**
- Ensure you're using database owner role
- Check Supabase dashboard permissions

### Backend Errors

**"Cannot find module"**
```powershell
cd backend
npm install
npm run build
```

**"Port already in use"**
```powershell
# Kill process on port 4000
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process -Force
```

### Frontend Errors

**"Module not found"**
```powershell
cd frontend
npm install
```

**"Expo cache issues"**
```powershell
npx expo start --clear
```

### No Circle Shows Up

**Check active circle is set:**
```sql
SELECT * FROM user_active_circle WHERE user_id = 'your-user-id';
```

**Check circles exist:**
```sql
SELECT c.*, cm.role 
FROM circles c
JOIN circle_members cm ON cm.circle_id = c.id
WHERE cm.user_id = 'your-user-id';
```

**Reset popup flag:**
```powershell
# In React Native app, clear AsyncStorage
# Or run in app console:
# AsyncStorage.removeItem('memora.circle_popup_shown.v1')
```

## Success Checklist

- [x] Migration applied without errors
- [x] All 6 circle tables exist
- [x] RLS policies are active
- [x] Backend compiles and starts
- [x] Frontend runs without errors
- [x] Test circle created
- [x] User is circle member
- [x] Active circle is set
- [x] Login shows popup
- [x] Home shows banner
- [x] Can upload to circle
- [x] Photos appear in feed

## Next Steps

Once everything works:
1. Read `CIRCLE_IMPLEMENTATION_GUIDE.md` for full API docs
2. Add UI to create/join circles in the app
3. Customize CircleStatusModal styling
4. Add circle management features
5. Implement push notifications for new posts

---

**Need Help?**
- Check backend logs: `backend/backend.log`
- Check browser console for frontend errors
- Review `CIRCLE_FEATURE_SUMMARY.md`
- Verify database migration was successful
