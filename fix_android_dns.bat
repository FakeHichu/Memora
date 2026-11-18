#!/bin/bash
# Fix Android Emulator DNS - Memora App
# Run this in PowerShell or bash on Windows

# Method 1: Restart emulator with Google DNS
echo "=== Method 1: Restart Emulator with Google DNS ==="
echo "1. Find your emulator name:"
emulator -list-avds
echo ""
echo "2. Start emulator with DNS:"
echo "   emulator -avd <emulator_name> -dns-server 8.8.8.8,8.8.4.4"
echo ""

# Method 2: Change emulator WiFi DNS settings
echo "=== Method 2: Change Emulator WiFi DNS ==="
echo "1. Open the running emulator"
echo "2. Click the three dots (⋮) or Settings gear"
echo "3. Select 'Settings' → 'Network & Internet' → 'WiFi'"
echo "4. Tap your WiFi network name"
echo "5. Click the 'Settings' (gear) icon → 'Advanced'"
echo "6. Set 'IP Settings' to 'Static'"
echo "7. Set DNS 1: 8.8.8.8"
echo "8. Set DNS 2: 8.8.4.4"
echo "9. Save and restart the emulator"
echo ""

# Method 3: Use Web mode (fastest)
echo "=== Method 3: Use Web Mode (Recommended for Testing) ==="
echo "1. Start Expo: npx expo start"
echo "2. Press 'w' for web browser"
echo "3. All UI features work in web mode"
echo "4. Fix Android DNS later for native testing"
echo ""