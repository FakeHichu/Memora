# Migration 006: Fix Class Creation Function - Summary

## Problem Diagnosed
The `create_class_with_owner()` PostgreSQL function in `002_class_creation_rpc.sql` uses:
```sql
upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8))
```

This function call fails with:
```
function gen_random_bytes(integer) does not exist
```

**Root Cause**: While `pgcrypto` extension was created in migration 001, the `gen_random_bytes()` function may not be available in the current schema context or the extension didn't load properly.

## Solution Implemented
Replaced the problematic code with a UUID-based approach that requires no extensions:
```sql
upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
```

This generates 8-character uppercase hexadecimal codes from PostgreSQL's built-in UUID generator.

---

## Files Changed

### 1. **database/migrations/006_fix_class_creation_function.sql** ✅ CREATED
- New migration file with fixed `create_class_with_owner()` function
- Uses `gen_random_uuid()` instead of `gen_random_bytes()`
- Maintains exact same function signature and behavior
- Includes collision retry loop for unique constraint violations
- Atomic class + owner membership creation

### 2. **database/APPLY_MIGRATION_006.md** ✅ CREATED
- Step-by-step instructions for applying the migration
- Two methods: Supabase SQL Editor (recommended) or psql
- Verification steps and expected responses
- Technical details about the change

### 3. **backend/src/config/env.ts** ✅ UPDATED
- Fixed environment variable fallback logic
- Now checks both `SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_URL`
- Ensures backend can read config from either naming convention

### 4. **backend/.env.example** ✅ UPDATED
- Added clear comments about backend vs frontend variables
- Organized into logical sections
- Added security warning about service role key

### 5. **test-class-creation.ps1** ✅ CREATED
- PowerShell test script for Windows
- Verifies backend connectivity
- Tests class creation endpoint
- Validates join code format (8 uppercase hex characters)
- User-friendly colored output

### 6. **MIGRATION_006_SUMMARY.md** ✅ CREATED (this file)
- Complete documentation of all changes
- Verification checklist

---

## Migration NOT Applied Yet ⚠️

**IMPORTANT**: The migration SQL file has been created but **NOT** executed against your Supabase database.

You must manually apply it using one of these methods:

### Method 1: Supabase SQL Editor (Recommended)
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a **New Query**
4. Copy entire contents of `database/migrations/006_fix_class_creation_function.sql`
5. Click **Run**
6. Verify no errors appear

### Method 2: Using psql (if you have credentials)
```powershell
# Replace placeholders with your actual values
psql "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" `
  -f database/migrations/006_fix_class_creation_function.sql
```

---

## Verification Checklist

After applying the migration, verify the fix:

### ✅ Backend Type Checking
```powershell
cd backend
npm run typecheck
```
**Status**: ✓ PASSED (no TypeScript errors)

### 🔲 Migration Applied
- [ ] Executed migration 006 in Supabase SQL Editor
- [ ] No errors reported
- [ ] Function `create_class_with_owner` shows in database

### 🔲 Class Creation Test
```powershell
# Start backend if not running
cd backend
npm run dev

# In another terminal
.\test-class-creation.ps1
```

Expected results:
- [ ] Class created successfully
- [ ] Join code is 8 uppercase hex characters (e.g., `A3F7B21E`)
- [ ] Class appears in database `classes` table
- [ ] Creator appears in `class_members` table with role='owner'

### 🔲 Join Class Test
- [ ] Another user can join using the 8-character code
- [ ] Joining twice returns `alreadyJoined: true`
- [ ] Member added to `class_members` table

---

## Technical Details

### Join Code Generation

**Before** (broken):
```sql
upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8))
```
- Required `pgcrypto` extension
- Failed when extension not properly loaded

**After** (fixed):
```sql
upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
```
- Uses built-in `gen_random_uuid()` (no extension needed)
- Generates UUID like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- Removes hyphens: `a1b2c3d4e5f67890abcdef1234567890`
- Takes first 8 characters: `a1b2c3d4`
- Converts to uppercase: `A1B2C3D4`

### Function Behavior

1. **Atomic Transaction**: Class and owner membership created together
2. **Collision Handling**: Retry loop on unique constraint violation (extremely rare)
3. **Security**: `SECURITY DEFINER` with `service_role` permission only
4. **Return Value**: Complete `classes` row with generated join code

### Backend Integration

The backend correctly uses the RPC function via `ClassRepository.createClassWithOwner()`:

```typescript
const { data: newClass, error } = await supabaseAdmin
  .rpc("create_class_with_owner", {
    class_name: name,
    class_school_name: schoolName || null,
    class_academic_year: academicYear,
    owner_user_id: userId,
  });
```

No backend code changes were needed - only the database function.

---

## What Was NOT Changed

- ✅ No changes to RLS policies
- ✅ No changes to storage security
- ✅ No changes to authentication flow
- ✅ No changes to UI components
- ✅ No changes to bottom navigation
- ✅ No mock data introduced
- ✅ Service role key remains server-side only

---

## Next Steps

1. **Apply the migration** using Supabase SQL Editor (see Method 1 above)
2. **Restart the backend** (if running): `Ctrl+C` then `npm run dev`
3. **Run the test script**: `.\test-class-creation.ps1`
4. **Test in the mobile app**:
   - Create a class through the UI
   - Verify you receive a join code
   - Have another user join using that code
5. **Verify database**:
   - Check `classes` table for new entry
   - Check `class_members` table for owner and joiner

---

## Troubleshooting

### If class creation still fails:

1. **Check migration was applied**:
   ```sql
   -- Run in Supabase SQL Editor
   SELECT routine_name, routine_definition
   FROM information_schema.routines
   WHERE routine_name = 'create_class_with_owner';
   ```
   - Should show the function with `gen_random_uuid()` in definition

2. **Check backend environment**:
   ```powershell
   cd backend
   Get-Content .env | Select-String "SUPABASE"
   ```
   - Verify `SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_URL` is set
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is set

3. **Check backend logs**:
   - Look for detailed error messages in terminal where `npm run dev` is running

4. **Test function directly in Supabase**:
   ```sql
   -- Run in Supabase SQL Editor (replace UUID with your auth.users ID)
   SELECT * FROM create_class_with_owner(
     'Direct Test Class',
     'Test School',
     2024,
     '00000000-0000-0000-0000-000000000000'::uuid
   );
   ```
   - Should return a class row with valid join_code

---

## Contact & Support

If issues persist after following this guide:
1. Check Supabase logs in dashboard under **Logs** > **Postgres Logs**
2. Check backend terminal output for detailed error messages
3. Verify service role key has proper permissions
4. Ensure RLS policies allow the operation

---

**Migration Created**: $(Get-Date)
**Status**: Awaiting manual application to Supabase database
