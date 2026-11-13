# 🚀 Quick Fix: Apply Migration 006

## The Fix in 3 Steps

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project: https://app.supabase.com
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy & Paste This SQL
Copy the ENTIRE contents of `database/migrations/006_fix_class_creation_function.sql` or paste this:

```sql
-- Fix class creation function to use gen_random_uuid() instead of gen_random_bytes()
create or replace function public.create_class_with_owner(
  class_name text,
  class_school_name text,
  class_academic_year integer,
  owner_user_id uuid
)
returns public.classes
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  created_class public.classes;
  generated_code text;
begin
  loop
    begin
      -- Generate 8-character uppercase hex code from UUID (no extension required)
      generated_code := upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      
      insert into public.classes (
        name,
        school_name,
        academic_year,
        join_code,
        created_by
      )
      values (
        class_name,
        class_school_name,
        class_academic_year,
        generated_code,
        owner_user_id
      )
      returning * into created_class;

      exit;
    exception when unique_violation then
      -- Retry if the generated join code collides with an existing class.
      null;
    end;
  end loop;

  -- Add owner as class member atomically
  insert into public.class_members (class_id, user_id, role)
  values (created_class.id, owner_user_id, 'owner');

  return created_class;
end;
$$;

-- Ensure proper permissions
revoke all on function public.create_class_with_owner(text, text, integer, uuid) from public, anon, authenticated;
grant execute on function public.create_class_with_owner(text, text, integer, uuid) to service_role;
```

### Step 3: Run It
Click the **RUN** button (or press `Ctrl+Enter`)

✅ **Success**: You should see "Success. No rows returned"

---

## Test It Works

### Option A: Using the Test Script
```powershell
.\test-class-creation.ps1
```

### Option B: Using curl (if backend is running on http://localhost:4000)
```powershell
# Get a token first (login through the app)
$token = "YOUR_TOKEN_HERE"

curl -X POST http://localhost:4000/api/classes `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{"name":"Test Class","schoolName":"Test School","academicYear":2024}'
```

### Expected Response
```json
{
  "ok": true,
  "class": {
    "id": "...",
    "name": "Test Class",
    "join_code": "A1B2C3D4",  ← 8 uppercase hex characters
    "school_name": "Test School",
    "academic_year": 2024,
    "status": "active"
  }
}
```

---

## What This Fixes
- ❌ **Before**: `function gen_random_bytes(integer) does not exist`
- ✅ **After**: Classes create successfully with 8-character join codes

## Files Changed
- ✅ `database/migrations/006_fix_class_creation_function.sql` - New migration
- ✅ `backend/src/config/env.ts` - Fixed environment variable fallback
- ✅ `backend/.env.example` - Added documentation
- ✅ `test-class-creation.ps1` - Test script

## No Backend Code Changes Required
The backend already correctly calls the RPC function. Only the database function needed updating.

---

## Need Help?
See `MIGRATION_006_SUMMARY.md` for complete details and troubleshooting.
