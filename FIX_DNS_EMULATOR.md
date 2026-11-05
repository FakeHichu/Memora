# Fix DNS Resolution on Android Emulator

## Problem
The emulator cannot resolve the hostname `rynpdrprbesctvwcrjii.supabase.co`

## Quick Fixes (Try in Order)

### Fix 1: Restart Emulator with Cold Boot
1. Close the Pixel_7 emulator completely
2. Open Android Studio → Tools → Device Manager (or AVD Manager)
3. Click the dropdown arrow next to Pixel_7
4. Select **"Cold Boot Now"** (NOT "Quick Boot")
5. Wait for emulator to fully start
6. Run `npx expo start` again and test

### Fix 2: Configure Emulator DNS Settings

#### Step 1: Find ADB
ADB is usually located at:
- `C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools\adb.exe`
- Or check: `%LOCALAPPDATA%\Android\Sdk\platform-tools\`

#### Step 2: Open PowerShell as Administrator and run:
```powershell
cd "C:\Users\Devavardhan MI\AppData\Local\Android\Sdk\platform-tools"

# Check if emulator is connected
.\adb devices

# Configure DNS settings
.\adb shell "settings put global captive_portal_http_url http://www.google.com/generate_204"
.\adb shell "settings put global captive_portal_https_url https://www.google.com/generate_204"

# Set DNS to Google's DNS
.\adb shell "setprop net.dns1 8.8.8.8"
.\adb shell "setprop net.dns2 8.8.4.4"

# Restart network
.\adb shell "svc wifi disable"
.\adb shell "svc wifi enable"
```

### Fix 3: Edit Emulator Config to Use Google DNS

1. Close the emulator
2. Find your emulator config file at:
   `C:\Users\Devavardhan MI\.android\avd\Pixel_7.avd\config.ini`
3. Add these lines to the file:
   ```
   hw.useWifiRouter=yes
   ```
4. Start the emulator with DNS override:
   ```powershell
   # Find emulator executable (usually at)
   cd "C:\Users\Devavardhan MI\AppData\Local\Android\Sdk\emulator"
   
   # Start with DNS
   .\emulator -avd Pixel_7 -dns-server 8.8.8.8,8.8.4.4
   ```

### Fix 4: Test Internet in Emulator
1. Open Chrome browser in the emulator
2. Try to visit: `https://www.google.com`
3. If it doesn't work, the emulator has no internet connection

### Fix 5: Check Windows Firewall
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Find "Android Emulator" and make sure both Private and Public are checked
4. Also check "qemu-system-x86_64.exe" if present

### Fix 6: Use Physical Device Instead
If emulator issues persist, use a physical Android device:

1. Enable Developer Options on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect phone via USB
4. Run: `npx expo start`
5. Press `a` to open on Android device

### Fix 7: Restart Your Computer's Network
Sometimes the host machine's network affects the emulator:

```powershell
# Flush DNS cache on Windows
ipconfig /flushdns

# Reset network adapter
netsh winsock reset
netsh int ip reset

# Restart computer
```

## Verify the Fix

After applying any fix, test in the emulator:

1. Open Chrome in emulator
2. Visit: `https://rynpdrprbesctvwcrjii.supabase.co`
3. You should see: "No API key found in request" (this is correct!)
4. Run your app and try login again

## Alternative: Use Expo Go on Real Device

The fastest solution might be to use your physical phone:

1. Install "Expo Go" from Play Store
2. Connect to same WiFi as your computer
3. Run `npx expo start` on computer
4. Scan QR code with Expo Go app

## Why This Happens

Common causes:
- Emulator network initialization issues
- Windows firewall blocking emulator
- VPN or proxy interfering
- Corrupted emulator network settings
- DNS resolution not configured in emulator

## If Nothing Works

Try creating a fresh emulator:
1. Open Android Studio → Device Manager
2. Create new device (Pixel 7, API 33 or 34)
3. Start fresh emulator
4. Test app on new emulator
