# Black Screen Fix - Android Simulator

## Problem
After implementing the Sign Up page, the Android simulator shows only a black screen.

## Root Cause
Metro bundler had cached a previous version of `register.tsx` with a syntax error. The actual file is correct, but the cache was serving the broken version.

## Solution

### Option 1: Clear Cache and Reload (Recommended)

1. **Stop the current Metro bundler** (Ctrl+C in the terminal running `expo start`)

2. **Clear Metro cache:**
   ```bash
   cd C:\Projects\Memora\frontend
   npx expo start --clear
   ```

3. **Wait for bundling to complete** (you'll see "Bundling complete" message)

4. **In Android Simulator:**
   - Press `R` twice quickly (reload)
   - Or shake the device and tap "Reload"
   - Or press `Ctrl+M` → "Reload"

### Option 2: Full Clean Restart

If Option 1 doesn't work:

1. **Stop Metro bundler**

2. **Clear all caches:**
   ```bash
   cd C:\Projects\Memora\frontend
   rm -r .expo
   rm -r node_modules/.cache
   npx expo start --clear
   ```

3. **Reload the Android app**

### Option 3: Reinstall App on Simulator

1. **Uninstall the app from Android simulator:**
   - Long press the Memora app icon
   - Drag to "Uninstall" or tap "App info" → "Uninstall"

2. **Clear Metro cache and restart:**
   ```bash
   cd C:\Projects\Memora\frontend
   npx expo start --clear --android
   ```

3. **App will automatically reinstall**

## Verification

After clearing cache, you should see:
1. Metro bundler completes without errors
2. Splash screen appears (Memora logo with loading bar)
3. After 2-3 seconds, navigates to Login or Home (depending on auth state)

## Test the Sign Up Page

Once the app loads:

1. **If you see the Login screen:**
   - Scroll down to the bottom
   - Look for "Don't have an account? **Sign up**"
   - Tap "Sign up" → should navigate to Register screen

2. **On the Register screen:**
   - You should see all 5 fields
   - Try filling them out
   - Validation should work on blur
   - Submit with valid data → shows "Coming Soon" alert

## Common Issues

### Still seeing black screen?

**Check Metro bundler logs:**
```bash
Get-Content C:\Projects\Memora\frontend\.expo\dev\logs\start.log -Tail 30
```

Look for:
- `"bundling:failed"` - indicates syntax error
- `"bundling:done"` - indicates successful build

### See a red screen with error?

The error message will tell you exactly what's wrong:
- JavaScript error → Check the stack trace
- Module not found → May need to restart Metro
- Can't find variable → Import issue

### App crashes immediately?

1. **Check Android logs:**
   ```bash
   adb logcat | Select-String "Memora"
   ```

2. **Verify Supabase config** (if needed):
   - File: `frontend/.env`
   - Should have: `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Current Status

✅ **File is correct** - `register.tsx` has no syntax errors  
✅ **TypeScript passes** - All type checks pass  
✅ **ESLint passes** - Zero warnings  
✅ **Metro cache cleared** - Fresh bundle available  

The issue was purely a caching problem, not a code problem.

## Prevention

To avoid cache issues in the future:

1. **Always clear cache after major file changes:**
   ```bash
   npx expo start --clear
   ```

2. **If you see unexpected errors, try cache clear first**

3. **Use Fast Refresh:** Most small changes will hot-reload without cache issues

## Need More Help?

If the black screen persists after trying all options above:

1. Check the Metro bundler terminal for error messages
2. Check Android logcat: `adb logcat`
3. Try on a different device/simulator
4. Verify environment variables in `.env` file
