# Login Fetch Error - Troubleshooting Guide

## Issue
Getting "fetch failed: java.net.UnknownHostException" error when trying to log in.

## What We Fixed

### 1. ✅ Environment Variables
- Removed leading space from `EXPO_PUBLIC_SUPABASE_URL` in `frontend/.env`
- Verified all environment variables are correctly formatted

### 2. ✅ Android Permissions
- Added `android.permission.INTERNET` permission
- Added `android.permission.ACCESS_NETWORK_STATE` permission

### 3. ✅ Connection Test
- Verified Supabase URL is reachable from your machine
- URL: `https://rynpdrprbesctvwcrjii.supabase.co` is working correctly

### 4. ✅ Debug Logging
- Added console logging to Supabase client initialization
- Added detailed error logging in login flow

## Next Steps to Fix

### Step 1: Clean and Restart
```bash
cd frontend

# Clear Expo cache
npx expo start --clear

# Or if that doesn't work, clear all caches
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

### Step 2: Check Your Device/Emulator

#### For Android Emulator:
1. Make sure the emulator has internet access
2. Open Chrome browser in the emulator and try accessing: `https://google.com`
3. If no internet, restart the emulator

#### For Physical Android Device:
1. Ensure WiFi is enabled and working
2. Try opening a browser and accessing `https://google.com`
3. Check if any VPN or firewall is blocking connections

### Step 3: Check Console Logs
When you restart the app, look for these debug logs:
```
Supabase Config: { url: ..., hasKey: true, keyPrefix: ... }
```

When you try to login, look for:
```
Attempting login with email: ...
Login response: { hasData: ..., hasError: ..., error: ... }
```

### Step 4: Alternative Solutions

#### Option A: Use Expo Go App
If you're using a custom development build, try using Expo Go:
```bash
npx expo start
# Then scan QR code with Expo Go app
```

#### Option B: Rebuild the App
If using a development build:
```bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

## Common Causes

1. **No Internet Connection**: Device/emulator isn't connected to internet
2. **Cached Data**: Old environment variables cached in build
3. **DNS Issues**: Device can't resolve the hostname
4. **Firewall/VPN**: Corporate firewall or VPN blocking Supabase
5. **Development Build**: Using old build that needs to be rebuilt

## Verify Environment Variables are Loaded

Add this temporary test in your login screen to verify the config:
```typescript
console.log('Has Supabase Config:', hasSupabaseConfig);
console.log('Supabase client exists:', !!supabase);
```

## If Nothing Works

Try this test account creation directly in Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Open your project
3. Go to Authentication → Users
4. Create a test user manually
5. Try logging in with that user

## Contact Points

- Check Expo logs: Look in terminal where you ran `expo start`
- Check device logs: Use `adb logcat` for Android or Xcode console for iOS
- Verify Supabase status: https://status.supabase.com/
