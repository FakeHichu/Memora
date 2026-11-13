# Verification Checklist: Migration 006

Use this checklist to verify the class creation fix is complete and working.

---

## ✅ Pre-Migration Checks (Completed)

- [x] Backend type checking passes (`npm run typecheck`)
- [x] Migration file created: `database/migrations/006_fix_class_creation_function.sql`
- [x] Documentation created: `MIGRATION_006_SUMMARY.md`
- [x] Quick reference created: `QUICK_FIX.md`
- [x] Test script created: `test-class-creation.ps1`
- [x] Environment config fixed: `backend/src/config/env.ts`
- [x] Environment example updated: `backend/.env.example`

---

## 🔲 Migration Application (Action Required)

### Step 1: Apply Migration to Supabase
- [ ] Opened Supabase SQL Editor
- [ ] Created new query
- [ ] Pasted contents of `006_fix_class_creation_function.sql`
- [ ] Executed query successfully (no errors)

### Step 2: Verify Function Updated
Run this in Supabase SQL Editor:
```sql
SELECT 
  routine_name,
  routine_definition LIKE '%gen_random_uuid%' as uses_uuid,
  routine_definition LIKE '%gen_random_bytes%' as uses_bytes
FROM information_schema.routines
WHERE routine_name = 'create_class_with_owner';
```

Expected result:
- [ ] `uses_uuid` = true
- [ ] `uses_bytes` = false

---

## 🔲 Backend Testing

### Step 1: Backend Running
```powershell
cd backend
npm run dev
```
- [ ] Backend starts without errors
- [ ] Listening on port 4000
- [ ] Supabase connection successful

### Step 2: Environment Variables
```powershell
cd backend
Get-Content .env | Select-String "SUPABASE"
```
- [ ] `SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_URL` is set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set
- [ ] URL format: `https://[project-ref].supabase.co`

---

## 🔲 Functionality Testing

### Test 1: Create Class
```powershell
.\test-class-creation.ps1
```

**Or manually:**
```powershell
$token = "YOUR_AUTH_TOKEN"
$body = @{
    name = "Test Class"
    schoolName = "Test School"
    academicYear = 2024
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/classes" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} `
    -Body $body
```

**Verify:**
- [ ] Request succeeds (HTTP 201)
- [ ] Response contains `ok: true`
- [ ] Class has valid UUID `id`
- [ ] `join_code` is exactly 8 characters
- [ ] `join_code` is uppercase
- [ ] `join_code` contains only A-F and 0-9 (hex characters)
- [ ] `status` is "active"
- [ ] `created_by` matches user ID

**Example valid join codes:**
- ✅ `A1B2C3D4`
- ✅ `FF00EE11`
- ✅ `12345678`
- ❌ `a1b2c3d4` (lowercase - should be uppercase)
- ❌ `ABC123` (too short)
- ❌ `ABCDEFGHIJ` (too long)

### Test 2: Verify Database Entry
Run in Supabase SQL Editor:
```sql
-- Check the most recent class
SELECT 
  id,
  name,
  join_code,
  LENGTH(join_code) as code_length,
  created_by,
  status
FROM classes
ORDER BY created_at DESC
LIMIT 1;
```

**Verify:**
- [ ] Class exists in table
- [ ] `code_length` = 8
- [ ] `join_code` is uppercase hex

### Test 3: Verify Owner Membership
Run in Supabase SQL Editor:
```sql
-- Check owner was added to class_members
SELECT 
  cm.class_id,
  cm.user_id,
  cm.role,
  c.name as class_name,
  c.join_code
FROM class_members cm
JOIN classes c ON c.id = cm.class_id
WHERE cm.role = 'owner'
ORDER BY cm.joined_at DESC
LIMIT 1;
```

**Verify:**
- [ ] Owner entry exists
- [ ] `role` = 'owner'
- [ ] `user_id` matches the creator
- [ ] `class_id` matches the created class

### Test 4: Join Class with Code
Use a DIFFERENT user account:

```powershell
$token2 = "DIFFERENT_USER_TOKEN"
$body = @{
    joinCode = "A1B2C3D4"  # Use actual join code from Test 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/classes/join" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token2"} `
    -Body $body
```

**Verify:**
- [ ] Request succeeds (HTTP 200)
- [ ] Response contains `ok: true`
- [ ] `alreadyJoined: false` (first time)
- [ ] Member added with role 'member'

### Test 5: Join Again (Idempotency)
Repeat Test 4 with same user and code:

**Verify:**
- [ ] Request succeeds (HTTP 200)
- [ ] `alreadyJoined: true`
- [ ] No duplicate entry created

### Test 6: Invalid Join Code
```powershell
$body = @{
    joinCode = "INVALID1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/classes/join" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $token"} `
    -Body $body
```

**Verify:**
- [ ] Request fails appropriately
- [ ] Error message: "Class not found"

---

## 🔲 Mobile App Testing

### Test 1: Create Class Flow
1. Open mobile app
2. Navigate to create class screen
3. Fill in:
   - Class name
   - School name
   - Academic year
4. Submit

**Verify:**
- [ ] Class created successfully
- [ ] Join code displayed (8 characters, uppercase)
- [ ] Can copy join code
- [ ] Redirected to class view

### Test 2: Join Class Flow
1. Use a different device/account
2. Navigate to join class screen
3. Enter the 8-character join code
4. Submit

**Verify:**
- [ ] Successfully joined
- [ ] Can see class details
- [ ] Appears in "My Classes" list

---

## 🔲 Edge Cases

### Test 1: Collision Retry (Optional)
This is handled by the retry loop but is extremely rare. The function will:
- Generate a code
- Try to insert
- If unique violation, loop and try again
- Success after collision resolves

**Manual verification not required** unless you encounter issues.

### Test 2: Archived Class Join Prevention
```sql
-- Create an archived class manually
UPDATE classes
SET status = 'archived'
WHERE join_code = 'TESTCODE';
```

Then try to join with that code:

**Verify:**
- [ ] Join rejected
- [ ] Error: "This class has been archived"

---

## 🔲 Security Verification

### Test 1: Service Role Key Location
```powershell
# Check frontend .env doesn't have service role key
Get-Content frontend\.env | Select-String "SERVICE_ROLE"

# Check backend .env DOES have it
Get-Content backend\.env | Select-String "SERVICE_ROLE"
```

**Verify:**
- [ ] Service role key ONLY in backend/.env
- [ ] NOT in frontend/.env
- [ ] NOT in any committed files
- [ ] NOT exposed to client-side code

### Test 2: RLS Policies Still Active
Run in Supabase SQL Editor:
```sql
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('classes', 'class_members');
```

**Verify:**
- [ ] RLS policies exist
- [ ] Not bypassed by migration

---

## 📊 Summary

### Critical Tests (Must Pass)
- [ ] Migration applied without errors
- [ ] Function uses `gen_random_uuid()` not `gen_random_bytes()`
- [ ] Class creation succeeds
- [ ] Join code is 8 uppercase hex characters
- [ ] Owner added to class_members
- [ ] Other users can join with code

### Optional Tests (Recommended)
- [ ] Mobile app integration works
- [ ] Archived classes reject joins
- [ ] Service role key properly secured
- [ ] RLS policies intact

### Performance (Optional)
- [ ] Class creation < 1 second
- [ ] Join class < 1 second
- [ ] No N+1 query issues

---

## ❌ Rollback (If Needed)

If something goes wrong, you can rollback to the original function:

```sql
-- Restore original (broken) version
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
begin
  loop
    begin
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
        upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8)),
        owner_user_id
      )
      returning * into created_class;

      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  insert into public.class_members (class_id, user_id, role)
  values (created_class.id, owner_user_id, 'owner');

  return created_class;
end;
$$;
```

**Note**: This will restore the broken version, so only use for debugging.

---

## ✅ Sign-Off

Once all critical tests pass:

- [ ] Migration applied successfully
- [ ] All critical tests passed
- [ ] Backend operational
- [ ] Mobile app tested
- [ ] Documentation reviewed
- [ ] Team notified (if applicable)

**Verified By**: ___________________________

**Date**: ___________________________

**Issues Found**: ___________________________

---

**Next Steps After Verification**:
1. Monitor production logs for any errors
2. Track class creation success rate
3. Monitor join code collision rate (should be ~0%)
4. Document any edge cases encountered
