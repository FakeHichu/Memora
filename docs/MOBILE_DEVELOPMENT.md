# Memora — Mobile Development Guide

This guide details how to develop, run, test, and maintain the Memora mobile application for Android, iOS, and Web.

---

## Prerequisites

- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Expo Go App**: Installed on your physical Android device (via Google Play) or iOS device (via App Store), OR configured Android Studio / Xcode emulators.

---

## 1. Setup & Installation

Navigate to the `frontend` directory and install project dependencies:

```bash
cd frontend
npm install
```

---

## 2. Running the Application

### Start Expo Dev Server

Starts the interactive Expo CLI bundler and prints a QR code in your terminal:

```bash
npm start
```

### Run on Android

Starts the Expo dev server and attempts to launch on an active Android emulator or connected device via ADB:

```bash
npm run android
```

### Run on iOS

Starts the Expo dev server and attempts to launch in the macOS iOS Simulator:

```bash
npm run ios
```

### Run on Web

Starts the Expo dev server and opens the web application in your default browser:

```bash
npm run web
```

---

## 3. Testing with Expo Go

1. Start the development server: `npm start`
2. **Android**:
   - Open the **Expo Go** app on your device.
   - Scan the QR code displayed in the terminal or Expo Dev Tools.
3. **iOS**:
   - Open the default iOS **Camera** app.
   - Scan the terminal QR code and tap the "Open in Expo Go" banner.
4. **Network Requirement**: Your mobile device and development workstation must be connected to the same local Wi-Fi network (or use `--tunnel` if on separate subnets).

---

## 4. Environment Variables & Configuration

Create a `.env` file in the `frontend/` directory (or supply via shell environment):

```env
# Optional: Supabase backend integration
# If left blank, Memora automatically runs in full offline local storage mode!
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# App Configuration
EXPO_PUBLIC_APP_SCHEME=memora
EXPO_PUBLIC_APP_NAME=Memora
EXPO_PUBLIC_BACKEND_URL=http://localhost:4000
```

### Offline & Supabase Behavior

- **Zero-Config Offline Mode**: When `EXPO_PUBLIC_SUPABASE_URL` is unset or empty, Memora seamlessly falls back to local-first offline storage via `@react-native-async-storage/async-storage` and `expo-file-system`.
- **Hybrid Cloud Sync**: When valid Supabase credentials are provided, user sessions and class circles sync with Supabase while keeping photo drafts cached locally.

---

## 5. Camera & Photo Permissions

Memora uses permissions configured in `app.json` and `app.config.ts`:

- **Android**:
  - `android.permission.CAMERA`: Allows live viewfinder capture and photo snapping.
  - `android.permission.READ_MEDIA_IMAGES`: Allows importing memories from Google Photos or gallery.
- **iOS**:
  - `NSCameraUsageDescription`: *"Allow Memora to use the camera for capturing daily memories."*
  - `NSPhotoLibraryUsageDescription`: *"Allow Memora to access your photo library to select memories."*

Permissions are checked explicitly before launching the camera or photo library in `app/(tabs)/create.tsx` and `app/camera/index.tsx`.

---

## 6. Code Quality & Validation

Run these commands before committing any code:

### Typecheck (TypeScript)

Strict compile-time verification without emitting JS:

```bash
npm run typecheck
```

### Linting (ESLint)

Checks for syntax issues, React hooks rules, and zero-warning compliance:

```bash
npm run lint
```

### Prettier Formatting

Formats all frontend source files according to project formatting guidelines:

```bash
npm run format
```

---

## 7. Resetting Local App Data During Development

To reset local memories, drafts, and preferences:

### Method A: Via In-App Settings UI
1. Navigate to the **Profile** tab in the app.
2. Tap **Preferences** → **Settings**.
3. Under **Data & Safety**, tap **Delete all memories**.
4. Confirm deletion. All AsyncStorage keys and local photos will be wiped.

### Method B: Via In-App Profile Screen
1. Open the **Profile** tab.
2. In the **Photo Storage** section, tap **Delete all photos**.

### Method C: Clearing Expo Go Storage
- **Android**: Long-press Expo Go app icon → App Info → Storage & cache → Clear storage.
- **iOS**: Delete and reinstall the Expo Go app.
- **Web Browser**: Open DevTools → Application / Storage → Clear site data.

---

## 8. Known Limitations in Phase 1

1. **Expo Go Camera Restrictions on Web**: In web browsers, live camera capture delegates to the browser file picker with camera capture attributes rather than native hardware camera sensors.
2. **Push Notifications**: Expo Notifications are configured for local reminders; remote APNs / FCM push notification credentials will be configured in production builds (Phase 2).
3. **Background Sync**: Memory sync occurs while the app is active; background task synchronization is planned for Phase 2.
