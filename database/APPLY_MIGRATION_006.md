# Apply Migration 006: Fix Class Creation Function

## Problem
The `create_class_with_owner()` function uses `gen_random_bytes(8)` which is unavailable, causing the error:
```
function gen_random_bytes(integer) does not exist
```

## Solution
Replace `gen_random_bytes(8)` with `gen_random_uuid()` which is built into PostgreSQL and doesn't require extensions.

## How to Apply This Migration

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `migrations/006_fix_class_creation_function.sql`
5. Click **Run** to execute the migration
6. Verify success by checking that no errors appear

### Option 2: Using psql (if you have direct database access)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f database/migrations/006_fix_class_creation_function.sql
```

## Verification

After applying the migration, test class creation:

### Backend Test
```bash
curl -X POST http://localhost:4000/api/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Class",
    "schoolName": "Test School",
    "academicYear": 2024
  }'
```

### Expected Response
```json
{
  "ok": true,
  "class": {
    "id": "...",
    "name": "Test Class",
    "school_name": "Test School",
    "academic_year": 2024,
    "join_code": "A1B2C3D4",
    "created_by": "...",
    "status": "active",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

## What Changed

### Before (002_class_creation_rpc.sql)
```sql
upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8))
```

### After (006_fix_class_creation_function.sql)
```sql
upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
```

## Technical Details

- **Join Code Format**: 8 uppercase hexadecimal characters (e.g., `A3F7B21E`)
- **Collision Handling**: Automatic retry loop on unique constraint violation
- **Atomicity**: Class and owner membership created in a single transaction
- **Security**: Function uses `security definer` with restricted permissions
- **Permissions**: Only accessible to `service_role` (backend)

## Files Modified
- ✅ Created: `database/migrations/006_fix_class_creation_function.sql`
- ✅ Created: `database/APPLY_MIGRATION_006.md` (this file)
- ℹ️ No backend code changes required (already uses the RPC correctly)
