# Memora — Phase 1 Mobile Test Checklist

Comprehensive QA and smoke test verification checklist for Memora Phase 1 Mobile Foundation across Android, iOS, and Web.

---

## 1. Android Test Suite

Tested against Android 13+ / API 33+ devices and emulators.

### Launch & Shell
- [ ] **Cold Launch**
  - Verify app boots cleanly with no white screen flash.
  - Verify `SafeAreaProvider` initial layout without clipping status bar or gesture bar.
  - Verify background color matches `#09090C` theme immediately.
- [ ] **Warm Launch**
  - Minimize app to background and resume; verify state persists without re-rendering flickers.
  - Check memory preservation when returning from background after image capture.

### Navigation & Safe Area
- [ ] **Tab Navigation**
  - Verify all 5 primary bottom tabs: Home, Memories, Create, Circle, Profile.
  - Verify tab bar height respects Android navigation bar and system gesture inset (`useSafeAreaInsets().bottom`).
  - Verify touch targets are at least 48×48dp.
  - Verify `tabBarHideOnKeyboard` correctly hides the tab bar when virtual keyboard opens.
- [ ] **Android Back Navigation (Hardware / Gesture)**
  - From `post/[postId]` detail: Back gesture returns to feed smoothly.
  - From `favorites`: Back gesture returns to previous screen.
  - From `settings`: Back gesture returns to Profile.
  - From `create` (details step with unsaved changes): Back gesture triggers "Discard changes?" confirmation dialog.
  - From `create` (details step without changes): Back gesture returns directly to landing step.
  - From `create` (landing step): Back gesture navigates back or exits app gracefully.
  - In `camera`: Close button / back gesture navigates back cleanly.

### Content & Feed Performance
- [ ] **Home Scrolling**
  - Smooth 60fps scrolling with header, stats row, quick actions, prompt hero, and recent memories.
  - Favorites horizontal carousel scrolling without scroll conflicts.
- [ ] **Memories Feed Virtualization**
  - Grouped month sections render with virtualized `SectionList`.
  - Filter chips ('All', 'People', 'Places', 'Events') filter accurately.
  - Search bar filters memories by title, caption, location, and tags without lag.
  - Loading skeleton cards display during data fetching.
- [ ] **Favorites Virtualization**
  - `SectionList` virtualized rendering with month grouping.
  - Long press triggers toggle favorite with toast confirmation.

### Memory Creation & Camera Flow
- [ ] **Camera Permission Request**
  - First-time launch prompts explicit system camera permission.
  - Denial displays user-friendly explanation ("Camera permission is required").
- [ ] **Camera Cancellation**
  - Cancelling camera returns to Create landing without errors or hanging states.
- [ ] **Gallery Selection & Permission**
  - Photo library permission requested and granted.
  - Picking an image displays preview immediately with thumbnail.
- [ ] **Gallery Cancellation**
  - Dismissing photo picker returns cleanly to landing.
- [ ] **Image Preview & Processing**
  - Selected photo is compressed/resized (1280px width, 0.8 JPEG quality) without UI freezing.
  - `isProcessing` shows visual loading indicator on option cards.
- [ ] **Caption & Metadata Entry**
  - Title, caption, category pills, optional location, and tag badges entry.
  - Inputs have visible `placeholderTextColor` in dark mode.
  - `KeyboardAvoidingView` prevents keyboard from obscuring active inputs.
  - Tapping outside inputs dismisses keyboard (`keyboardShouldPersistTaps="handled"`).
- [ ] **Save Memory & Offline Mode**
  - Saving persists memory to local storage (`photo-draft.ts`) and updates feeds.
  - Works 100% offline with zero network connectivity or missing Supabase credentials.

### Error & Edge States
- [ ] **Empty States**
  - No memories: EmptyState illustration with "Create a memory" CTA.
  - Search no results: EmptyState with clear search prompt.
  - No circle joined: EmptyState with "Enter Invite Code" and "Create a Class" CTAs.
  - No favorites: EmptyState with "Browse memories" CTA.
- [ ] **Error States**
  - Malformed storage recovery: Corrupted JSON is safely ignored without crashing app.

---

## 2. iOS Test Suite

Tested on iPhone with Notch / Dynamic Island and Home Indicator bar.

### Shell & Safe Area
- [ ] **Cold Launch**
  - Status bar style matches theme (`light` text on dark background).
  - Background matches `#09090C`.
- [ ] **Warm Launch**
  - App state resumes without layout jumping.
- [ ] **Safe-Area Insets (Dynamic Island / Notch / Home Bar)**
  - Tab bar accounts for bottom inset (`Math.max(insets.bottom, 4) + MIN_TAB_BAR_HEIGHT`).
  - Floating back button in `post/[postId]` positions dynamically below Dynamic Island / status bar: `Math.max(insets.top + spacing.xs, spacing.md)`.
  - Content bottom padding prevents bottom tab overlap.

### Navigation & Interaction
- [ ] **Tab Navigation**
  - Smooth tab switching with active accent tint (`#B84F7D`) and subtle background highlight.
  - Icon containers meet 48×48 touch targets.
- [ ] **Back Navigation**
  - Stack slide animation works smoothly.
  - Detail screen back button dismisses cleanly.
- [ ] **iOS Keyboard Avoidance**
  - `KeyboardAvoidingView` with `behavior="padding"` shifts form fields above keyboard.
  - Scrolling allowed while keyboard is active; tap outside dismisses.

### Media & Storage
- [ ] **Camera & Photo Library Permissions**
  - InfoPlist strings displayed properly in permission alerts:
    - `NSCameraUsageDescription`: "Allow Memora to use the camera for capturing daily memories."
    - `NSPhotoLibraryUsageDescription`: "Allow Memora to access your photo library to select memories."
- [ ] **Gallery Selection & Camera Capture**
  - Photo selected, resized, and saved in `Paths.document/memora-photos/`.
- [ ] **Offline-First Persistence**
  - Photos and metadata preserved across restarts without internet connectivity.

---

## 3. Web Regression Test Suite

Tested on modern desktop and mobile browsers (Chrome, Safari, Firefox).

- [ ] **Home Page**
  - Responsive container layout (`maxWidth: 720px`, centered).
  - Web shadows and glassmorphic styling display smoothly.
  - Stats row, prompt hero, and quick actions clickable.
- [ ] **Navigation**
  - Tab bar displays correctly on web without breaking CSS filters.
  - Web keyboard shortcuts (⌘K command palette) continue to function.
- [ ] **Create Flow**
  - Image file picker opens browser upload dialog.
  - Base64 fallback used for web photo persistence.
  - Form submission saves memory to browser AsyncStorage.
- [ ] **Memories Feed**
  - Month sections and timeline cards render properly.
  - Category filter chips and search bar work responsively.
- [ ] **Profile & Settings**
  - Web-safe confirmation (`window.confirm`) used for destructive actions (Delete photos / memories).
  - Export data downloads `.json` file via browser Blob download.
  - Clipboard copy uses `navigator.clipboard.writeText` with graceful fallback.
