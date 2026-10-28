# Memora — Mobile Phase 1 Audit

**Date:** 2026-10-27
**Branch:** `main`
**Working tree:** Clean

---

## 1. Current Navigation Structure

### Root Layout (`app/_layout.tsx`)
- Uses `QueryClientProvider`, `ThemeProvider`, `ToastProvider`, `CommandPaletteProvider`
- `Stack` navigator with `headerShown: false` and `slide_from_right` animation
- `StatusBar` configured based on theme mode
- **Issue:** Missing `SafeAreaProvider` wrapper — required by `react-native-safe-area-context`

### Tab Navigation (`app/(tabs)/_layout.tsx`)
- 5 visible tabs: Home, Memories, Create, Circle, Profile
- 5 hidden tabs (`href: null`): class, today, search, discover, yearbook
- Create tab has a visually prominent circular accent button
- Tab bar height hardcoded to `78px` — does not account for device safe area bottom inset
- Tab icons use `44×44` containers (good touch target)
- **Issue:** Tab bar `paddingBottom: spacing.xs (4px)` is insufficient for iPhone home indicator
- **Issue:** Web-only CSS properties (`backdropFilter`, `WebkitBackdropFilter`) correctly guarded with `Platform.OS === 'web'`

### Route Groups
- `(auth)` — login, register, forgot-password (Stack layout, `headerShown: false`)
- `(onboarding)` — welcome, create-class, join-class (Stack layout)
- `camera/` — index (live camera), preview
- `post/[postId]` — memory detail
- `class/[classId]` — class detail
- Top-level: settings, collections, favorites

---

## 2. Current Storage Architecture

### Local Storage (`lib/photo-draft.ts`)
- **AsyncStorage** for all persistent data:
  - `memora.posts.v1` — array of `LocalPhotoPost` objects
  - `memora.collections.v1` — array of `LocalCollection` objects
  - `memora.profile.v1` — user profile
  - `memora.recent-searches.v1` — search history
  - `memora.recently-viewed.v1` — recently viewed post IDs
  - `memora.appearance.v1` — theme mode (dark/light)
  - `memora.classes.v1` — class records
  - `memora.active_class_id.v1` — active class ID
- Legacy key migration: `camera-app.posts.v1` → `memora.posts.v1`
- In-memory draft state for photo and prompt (module-level variables)
- **Good:** Defensive JSON parsing with `try/catch`; corrupted data cleared
- **Good:** Migration of old posts to include new fields
- **Issue:** `recordRecentlyViewed` and `getRecentSearches` use `JSON.parse` without `try/catch`
- **Issue:** No validation that parsed data is actually an array

### File Storage
- Photos stored in `expo-file-system` `Paths.document/memora-photos/`
- On web: photos stored as base64 data URIs in AsyncStorage
- Image processing: `expo-image-manipulator` resizes to 1280px width, JPEG 0.8 quality
- **Good:** Platform-specific handling for web vs native

---

## 3. Current Camera/Gallery Architecture

### Create Screen (`app/(tabs)/create.tsx`)
- Two-step flow: `landing` → `details`
- Landing offers "Take a photo" (camera) and "Choose from gallery" (image picker)
- Uses `expo-image-picker` for both camera and gallery
- Details step includes: title, caption, category, location, tags
- **Good:** `KeyboardAvoidingView` wrapping the details step
- **Good:** Permission errors handled gracefully
- **Issue:** No explicit permission request before launching camera/gallery
- **Issue:** No loading indicator during image processing
- **Issue:** `autoFocus` on title input may cause keyboard issues on Android

### Camera Screen (`app/camera/index.tsx`)
- Uses `expo-camera` `CameraView` with permission handling
- Shutter button with proper disabled state
- Flip camera toggle
- Gallery fallback option
- **Good:** Proper permission request UI
- **Good:** `isTakingPhoto` flag prevents double-tap
- **Issue:** `BackgroundPattern` rendered on top of camera feed (unnecessary)

### Camera Preview (`app/camera/preview.tsx`)
- Shows captured photo with caption input
- Retake and Post buttons
- **Good:** `keyboardShouldPersistTaps="handled"`

---

## 4. Current Authentication Architecture

### Auth Flow
- `app/index.tsx` checks `hasSupabaseConfig` and session state
- If no Supabase config → redirects to `/(tabs)/home` (local mode)
- If Supabase configured and logged in → `/(tabs)/home`
- If Supabase configured but not logged in → `/(auth)/login`
- **Good:** Graceful fallback to local-only mode
- **Good:** `useAuth` hook handles session loading and state changes

### Supabase Client (`lib/supabase/client.ts`)
- Client created only if both URL and anon key are present
- `hasSupabaseConfig` boolean exported for conditional logic
- **Good:** No crash if Supabase is not configured

---

## 5. Current Supabase Integration

- Client conditionally created in `lib/supabase/client.ts`
- Auth functions (`signInWithEmail`, `signUpWithEmail`, `signOut`, `resetPasswordForEmail`) all check for client existence
- Class management in `useClass` hook fetches from Supabase when available, falls back to local storage
- **Good:** All Supabase operations guarded with null checks

---

## 6. Existing Responsive/Mobile Behavior

### What's Working
- `SafeAreaView` from `react-native-safe-area-context` used on all major screens
- `maxWidth: layout.maxContentWidth (720px)` with `alignSelf: 'center'` constrains content
- `ScrollView` used on all content screens
- Flex-based layouts throughout
- `spacing` and `radius` tokens used consistently
- `Platform.OS` checks for web-specific styles (boxShadow, backdropFilter, cursor)
- Tab icons have 44×44 touch targets

### What's Missing/Problematic
- **No `SafeAreaProvider`** in root layout — all `SafeAreaView`/`useSafeAreaInsets` usage is broken on native
- Tab bar height (78px) doesn't account for bottom safe area inset
- Content `paddingBottom` uses `spacing.xxxl + layout.tabBarHeight` (32 + 92 = 124px) — hardcoded
- Memories screen uses `ScrollView` with no virtualization for potentially large lists
- Home screen renders all posts in a `ScrollView` — no virtualization
- Favorites strip thumbnails are fixed 100px width
- `monthGrid` in memories uses `flexWrap: 'wrap'` with `justifyContent: 'space-between'` — may cause layout issues on narrow screens
- Some text styles may clip on small screens (serif title at 28px)
- `Clipboard` import from `react-native` is deprecated — should use `@react-native-clipboard/clipboard` or `expo-clipboard`
- Post detail floating back button position uses hardcoded `top: spacing.lg + 50` — may overlap notch/Dynamic Island

---

## 7. Existing Problems

### Critical
1. **Missing `SafeAreaProvider`** — root layout must wrap entire app
2. **Tab bar bottom padding** — doesn't adapt to device safe area
3. **No FlatList for memory feeds** — will cause performance problems with many memories
4. **Deprecated `Clipboard` API** — `Clipboard` from `react-native` is removed in newer versions

### High Priority
5. **Login/auth inputs** missing `placeholderTextColor` prop
6. **No keyboard dismissal** on tapping outside inputs
7. **Memories filter logic bug** — `selectedFilter !== 'All'` returns `true` always when filter isn't 'All', ignoring search
8. **Post detail metadata hardcoded** — "People: You · Alex · Sam" and "Location: Marina Beach" are fake data
9. **Android back button** — no custom handling for create flow (user could lose unsaved work)
10. **StatusBar** in auth/onboarding layouts renders as child of `Stack` (incorrect placement)

### Medium Priority
11. **`alert()` in profile** — `Alert.alert()` doesn't work well on web, no web-compatible alternative
12. **Missing loading skeletons** on several screens (circle, search, profile)
13. **`useWindowDimensions`** not used anywhere — no runtime responsive adjustments
14. **Photo viewer** lacks gesture-based dismissal on mobile
15. **No haptic feedback** on interactive elements

### Low Priority
16. **Theme provider** doesn't set navigation bar color on Android
17. **CommandPalette** is web-centric (keyboard shortcuts) — may not be useful on mobile
18. **BackgroundPattern** renders on camera screen unnecessarily

---

## 8. Files That Need Modification

| File | Changes Needed |
|------|---------------|
| `app/_layout.tsx` | Add `SafeAreaProvider`, background color |
| `app/(tabs)/_layout.tsx` | Safe area-aware tab bar, accessibility |
| `app/(tabs)/home.tsx` | FlatList for feeds, responsive adjustments |
| `app/(tabs)/memories.tsx` | FlatList, fix filter bug, loading state |
| `app/(tabs)/create.tsx` | Permission handling, loading states, back handler |
| `app/(tabs)/circle.tsx` | Fix deprecated Clipboard, loading state |
| `app/(tabs)/profile.tsx` | Loading state |
| `app/camera/index.tsx` | Remove BackgroundPattern from camera |
| `app/camera/preview.tsx` | Keyboard handling |
| `app/post/[postId].tsx` | Safe area for floating button, real metadata |
| `app/settings.tsx` | Keyboard handling |
| `app/favorites.tsx` | FlatList |
| `app/(auth)/login.tsx` | placeholderTextColor, keyboard handling |
| `app/(auth)/register.tsx` | Same as login |
| `app/(auth)/forgot-password.tsx` | Same as login |
| `app/(auth)/_layout.tsx` | Fix StatusBar placement |
| `app/(onboarding)/_layout.tsx` | Fix StatusBar placement |
| `constants/theme.ts` | Add mobile-specific tokens |
| `lib/photo-draft.ts` | Defensive JSON parsing in all paths |
| `components/ui/MemoryCard.tsx` | Performance memoization |
| `components/ui/Button.tsx` | hitSlop |
| `components/ui/EmptyState.tsx` | Already good |
| `app.json` | Add missing permissions |

---

## 9. Files That Should Remain Untouched

| File | Reason |
|------|--------|
| `lib/supabase/client.ts` | Clean, correct implementation |
| `lib/supabase/auth.ts` | Clean, correct implementation |
| `hooks/useAuth.ts` | Clean, correct implementation |
| `types/database.ts` | Data types, no changes needed |
| `constants/prompts.ts` | Content data |
| `components/ui/Toast.tsx` | Working correctly |
| `components/ui/CommandPalette.tsx` | Web feature, preserve as-is |
| `components/ui/Skeleton.tsx` | Working correctly |
| `components/ui/BackgroundPattern.tsx` | Working correctly |
| `providers/ThemeProvider.tsx` | Clean implementation |
| `app.config.ts` | Config, minor updates only |
| `metro.config.js` | Build config |
| `tsconfig.json` | Compiler config |
