# MEMORA V2 — FEATURE AUDIT

## Repository Status
**Location**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora`
**Current State**: Expo/React Native + TypeScript frontend, Express + TypeScript backend, Supabase PostgreSQL
**Technology Stack Verified**: 
- ✅ Expo 57, React Native 0.86, TypeScript 6.x
- ✅ Expo Router for navigation
- ✅ @supabase/supabase-js for auth and PostgreSQL
- ✅ Express backend with TypeScript
- ❓ Not: SolidJS (README claims but actual code is React Native)

---

## EXISTING SCREENS & FEATURES

### Auth Screens
| Screen | Status | Notes |
|--------|--------|-------|
| `(auth)/login.tsx` | UI only | Minimal form, no actual auth integration beyond Supabase call |
| `(auth)/register.tsx` | UI only | Minimal form, no `signUpWithEmail` fully connected |
| `(auth)/forgot-password.tsx` | UI only | Placeholder, no password reset flow |
| `(onboarding)/welcome.tsx` | UI only | Onboarding screen |
| `(onboarding)/create-class.tsx` | UI only | Local class creation only |
| `(onboarding)/join-class.tsx` | UI only | Local join code entry, has backend API call but incomplete |

### Tab Navigation (bottom tab bar)
| Tab | Screen | Status |
|-----|--------|--------|
| `home` | `home.tsx` | Active - local photos only |
| `memories` | `memories.tsx` | Active - local photos only |
| `create` | `create.tsx` | Active - local camera/gallery + local save |
| `circle` | `circle.tsx` | Active - local photos + invite code copy |
| `profile` | `profile.tsx` | Active - local profile + sign out |
| `search` | `search.tsx` | Active - local search only |
| `discover` | `discover.tsx` | UI only - preview/sample data only |
| `today` | `today.tsx` | Active - local moments + sample stories |

### Other Screens
| Screen | Status |
|--------|--------|
| `settings.tsx` | Active - export, import, appearance, delete |
| `collections.tsx` | Active - local collections only |
| `class/[classId].tsx` | Broken - shows "Shared class unavailable" |
| `(tabs)/_layout.tsx` | Working tab layout |
| `(auth)/_layout.tsx` | Working auth layout |
| `(onboarding)/_layout.tsx` | Working onboarding layout |

### Key UI Components (all functional)
- MemoryCard — with editorial/compact/timeline densities
- ReactionBar — local reaction toggling
- TagBadge / TagList — tag management
- Toast — animated toast notifications
- ConfirmDialog — modal confirmations
- EmptyState — themed empty states
- SectionHeader — section headers with actions
- FilterChips — filter chips with scroll
- Skeleton — loading skeletons (memory, profile, post detail, auth form)
- Button — themed button variants
- Avatar — user avatar with fallback
- PhotoViewer — image viewer component

---

## DATABASE SCHEMA AUDIT (Supabase PostgreSQL)

### Tables ✅ Exist (via migrations)
| Table | Key Columns | Status |
|-------|-------------|--------|
| `profiles` | id, username, display_name, avatar_path | ✅ |
| `classes` | id, name, school_name, academic_year, join_code, created_by | ✅ |
| `class_members` | id, class_id, user_id, role, joined_at | ✅ |
| `daily_prompts` | id, prompt_text, prompt_date | ✅ |
| `daily_posts` | id, class_id, user_id, photo_path, prompt_id, post_date, caption, deleted_at | ✅ |
| `reactions` | id, post_id, user_id, reaction_type | ✅ |
| `reports` | id, post_id, reporter_id, reason, status | ✅ |
| `notifications` | id, user_id, type, title, body, data, read_at | ✅ |
| `device_tokens` | id, user_id, expo_push_token, platform | ✅ |
| `admin_actions` | id, class_id, admin_id, action_type, metadata | ✅ |

### RLS Policies ✅ (in migration 003)
- Class members can read own class memberships
- Class members can read daily posts (via class_members check)
- Class members can create their own daily posts (via class_members check)
- Class members can read class photos (via bucket + class_members check)
- Members can upload their own class photos (via bucket + class_members check)
- Members can remove their own class photos (via bucket + class_members check)

### Key Schema Issues ⚠️
1. **Daily posting restriction is ONLY frontend** (`hasPostedToday()` checks local AsyncStorage) — NO server-side or database-level enforcement of the one-photo-per-day rule
2. **Reactions are local-only** — `toggleLocalPhotoReaction` only updates AsyncStorage, never persists to `reactions` table
3. **No comments table or functionality** — not in schema or frontend
4. **`classes` table uses "class" terminology instead of "groups"** — inconsistent with product vision
5. **No storage bucket policy for original vs edited images** — all photos go to `class-photos` bucket
6. **No timezone handling** — `hasPostedToday()` uses `new Date().toISOString().slice(0, 10)` client-side
7. **No RLS on `daily_posts` for insert/update beyond class membership** — no ownership check beyond membership

---

## FRONTEND ARCHITECTURE AUDIT

### Data Flow
- **Local-first**: Most data stored in AsyncStorage (`memora.posts.v1`, `memora.profile.v1`, etc.)
- **Supabase used for**: Auth only (getSession, signIn, signOut)
- **Backend used for**: Class creation, joining, today feed, post creation, reactions, captions, deletion

### State Management
- React useState for screen-level state
- AsyncStorage for local persistence
- No React Query or TanStack Query used (despite being in package.json dependencies not being actively used)

### Critical Issues ⚠️
1. **Daily posting restriction is locally validated only** — `hasPostedToday()` uses `new Date().toISOString().slice(0, 10)` which is timezone-naive and client-trustable
2. **Reactions never reach the server** — `toggleLocalPhotoReaction` only updates local AsyncStorage
3. **No user ID from Supabase propagated to local photo posts** — local posts have no `user_id` field
4. **Discover screen shows only preview/sample data** — `previewPosts`, `previewStories`, `previewTopics` are hardcoded mock data
5. **No group isolation in feeds** — home feed shows ALL local posts regardless of class
6. **Photo upload goes local-first** — `publishLocalPhoto` compresses and stores locally, no automatic Supabase upload
7. **No authentication state → class membership flow** — joining a class is local-only unless backend is configured

### Component Connectivity
| Component | Connected to Backend | Notes |
|-----------|---------------------|-------|
| `create.tsx` | Partial | Calls `publishLocalPhoto`, then `router.replace('/(tabs)/home')` — never uploads to Supabase |
| `home.tsx` | Partial | Loads local posts, shows "Today's Prompt", checks `hasPostedToday()` locally |
| `circle.tsx` | Local only | Copy invite code, local photo posts |
| `profile.tsx` | Partial | Has `hasSupabaseConfig` check, signOut calls Supabase if configured |
| `search.tsx` | Local only | Searches local AsyncStorage posts |
| `discover.tsx` | Mock only | Hardcoded preview data with "NOT CONNECTED TO A LIVE FEED" notice |

---

## SOCIAL FEATURES STATUS

| Feature | Status | Implementation |
|---------|--------|----------------|
| Daily photo posting | ⚠️ Local only | `publishLocalPhoto` saves to AsyncStorage; no server enforcement |
| Reactions (likes) | ⚠️ Local only | `toggleLocalPhotoReaction` updates AsyncStorage only |
| Comments | ❌ Not implemented | No comments table, no comment UI |
| Comments replies | ❌ Not implemented | N/A |
| Comment editing | ❌ Not implemented | N/A |
| Comment deletion | ❌ Not implemented | N/A |
| Group/membership system | ⚠️ Partial | `classes` + `class_members` tables; join code flow local-only |
| Private groups | ❌ Not implemented | No RLS beyond existing class membership |
| Invite codes | ✅ Partial | Generated on class creation, can be copied |
| Photo upload from camera | ✅ Works | Camera capture + gallery selection + local save |
| Photo compression | ✅ Works | `expo-image-manipulator` resize to 1280px, compress 0.8 |
| Captions | ✅ Works | Editable caption on create screen |
| Search | ⚠️ Local only | Searches local AsyncStorage posts only |
| Notifications | ❌ Not implemented | `useNotifications` returns `{enabled: true, unread: 0}` stub |
| Timezone handling | ❌ Not implemented | `hasPostedToday()` uses client date |
| Event albums | ❌ Not implemented | Not in schema or frontend |
| Yearbooks | ❌ Not implemented | Not in schema or frontend |
| AI features | ❌ Not implemented | Not in codebase |
| Push notifications | ❌ Not implemented | `expo-notifications` imported but not configured |

---

## SECURITY & PRIVACY AUDIT

### ✅ Existing Protections
- Supabase RLS on `class_members`, `daily_posts`, `storage.objects` (bucket `class-photos`)
- Auth token verification in backend middleware (`requireAuth`)
- Unique constraint on `(class_id, user_id, post_date)` in daily_posts schema
- Password reset flow structure via Supabase

### ❌ Critical Security Gaps
1. **Daily upload bypassable** — Client can disable internet, modify device clock, or clear local storage to bypass the daily limit
2. **No RLS on `reactions` table** — reactions are inserted without verifying class membership per-request
3. **No ownership verification on post edits** — `updateCaption` checks `post.user_id !== userId` but only after finding post by ID
4. **No deleted-at cleanup** — soft delete sets `deleted_at` but old posts may still be accessible
5. **No upload MIME validation** at backend — `storage.service.ts` doesn't validate file types
6. **No file size validation** at backend — Supabase bucket has `file_size_limit: 10485760` (10MB) but no enforcement layer
7. **Supabase anon key in Expo config** — `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are exposed in client bundle
8. **No rate limiting** on any API endpoint
9. **No input sanitization** beyond Zod validation on a few endpoints
10. **No audit trail** for administrative actions beyond `admin_actions` table (not used by any admin UI)

### ✅ Design Strengths
- No glassmorphism overuse (mostly card-based surfaces)
- Consistent typography scale using Georgia + system fonts
- Thoughtful spacing system (xs through xxxl)
- Rounded corners and visual hierarchy
- Light/dark color themes with Catppuccin-inspired palette
- Smooth skeleton animations
- Accessible pressable components with proper accessibilityRole

---

## PERFORMANCE AUDIT

### ✅ Strengths
- Skeletons for all loading states
- Image caching not implemented (images re-fetch each visit)
- Efficient `SELECT *` with specific columns in some queries
- AsyncStorage local reads are fast

### ⚠️ Issues
- No image caching — `MemoryCard` always loads from URI
- No pagination in feeds — `getLocalPhotoPosts()` loads ALL posts from AsyncStorage
- `hasPostedToday()` iterates all posts — O(n) but n is small locally
- `computeCurrentStreak()` iterates 365 days — O(365) constant
- No caching of backend API responses
- Backend has no query pagination on `getClassPostsForDate`

### 🐛 Bugs & Inconsistencies
1. **`home.tsx` line 105**: `getOnThisDayMemories(posts)` uses `posts` (local) not considering class isolation
2. **`today.tsx` line 64-66**: `age` computed as `toLocaleDateString` without year — makes "On This Day" impossible to distinguish years
3. **`create.tsx`**: Photo compresses to 1280px width, 0.8 quality — original not preserved
4. **`photo-draft.ts` `publishLocalPhoto`**: Uses `manipulateAsync` which may lose EXIF data
5. **`daily_posts` unique constraint**: `(class_id, user_id, post_date)` but no enforcement if client bypasses
6. **`CircleScreen`**: `isBlurred={!userPostedToday}` means non-posters see blurred photos — but this is local-only logic
7. **`useClass` hook**: Mock class creation when no backend (`mockClass` object with hardcoded values)

---

## DUplicated CODE & DEPENDENCIES

### Duplicate Logic
- **Daily posting check**: `hasPostedToday()` in `photo-draft.ts` (client) + `PostService.createDailyPost()` (server) + unique constraint in DB
- **Reaction toggling**: `toggleLocalPhotoReaction()` (client) + `PostService.toggleReaction()` + `PostRepository.toggleReaction()` — three separate implementations, none fully connected

### Unnecessary Dependencies (in frontend)
- `@tanstack/react-query` — listed in devDependencies but NOT used
- `expo-clipboard` — used only in `circle.tsx` copy code
- `experiments` not used

### Missing Dependencies (for V2)
- No QR code generation library (for QR invitations)
- No `expo-image-manipulator` alternatives for advanced editing
- No `react-native-gesture-handler` beyond basic Pressable usage
- No `@react-native-firebase` or similar for push notifications

---

## OVERALL GRADE: D+

### Summary
The project has a **functional foundation** (Expo app with Supabase backend, basic camera flow, local storage) but is **far from production-ready**. Key problems:

1. **Daily posting restriction is client-side only** — can be trivially bypassed
2. **Reactions and social interactions are local-only** — not persisted to database
3. **No real authentication flow** — auth screens exist but aren't connected to real usage
4. **Discover shows mock data** with "NOT CONNECTED TO A LIVE FEED" banner
5. **No comments, no moderation, no reporting**
6. **Security gaps** — daily limit bypassable, no upload validation
7. **Schema uses "classes" terminology** instead of "groups" per product vision
8. **Backend is minimal** — no rate limiting, no security headers, limited validation

### Priority Fixes
1. ✅ Server-side daily posting enforcement
2. ✅ Persist reactions, comments to Supabase
3. ✅ Proper RLS policies
4. ✅ Authentication flows (email/password, verification)
5. ✅ Replace mock data with real database queries
6. ✅ Upload validation and signed URLs
7. ✅ Timezone-aware daily posting
8. ✅ Group/class membership isolation