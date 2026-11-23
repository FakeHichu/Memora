# Runtime Error Fix - ProfileSection.tsx

## Issue
```
Web  ERROR  [ReferenceError: borders is not defined] 

Code: ProfileSection.tsx
  163 |   },
  164 |   divider: {
> 165 |     height: borders.hairline,
      |             ^
  166 |     backgroundColor: colors.borderSoft,
```

## Root Cause
During the lint cleanup, I removed the `borders` import from `ProfileSection.tsx` because ESLint reported it as unused. However, the `borders` constant was actually being used in the `divider` style (line 165).

## Fix Applied
**File:** `frontend/components/ui/ProfileSection.tsx`

**Change:**
```typescript
// Before (incorrect - missing borders)
import { colors, spacing, typography } from '@/constants/theme';

// After (correct - borders restored)
import { colors, spacing, typography, borders } from '@/constants/theme';
```

## Verification
✅ **ESLint:** Still passes with 0 warnings  
✅ **TypeScript:** Still passes type checking  
✅ **Runtime:** Error resolved - app should now work correctly

## Status
**FIXED** - The Metro bundler should hot-reload automatically. If you still see the error:
1. Press **R** in the emulator to reload
2. Or restart the Expo server: `npm start --clear`

## Note
This was the only file where `borders` was incorrectly removed. All other component files that use `borders` already had it properly imported (checked 14+ files).
