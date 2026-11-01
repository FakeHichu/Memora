# MEMORA DEVELOPMENT TODO

## Project Overview

**Memora** — A private digital memory archive React Native application with Supabase backend, aiming for approximately 90 initial users within a 2-week launch window.

**Current Status**: Codebase inspected thoroughly. Multiple broken and partially implemented features identified. This document catalogs all findings and provides a prioritized development roadmap.

---

## Current Architecture

| Layer | Technology |
|---|---|
| **Frontend** | Expo React Native 0.86.3, Expo Router 57, React 19 |
| **Backend** | Express, Supabase JavaScript SDK, PostgreSQL |
| **Database** | Supabase PostgreSQL (migrations: 001, 002, 003) |
| **Storage** | Supabase Storage (class-photos bucket, non-public) |
| **State Management** | TanStack React Query (configured), AsyncStorage (local fallback) |
| **Navigation** | expo-router (file-based routing with parentheses) |
| **Auth** | Supabase Auth with `persistSession: true` |
| **UI** | Custom component library, themed via `frontend/constants/theme.ts` |

---

## Existing Implementation Audit

### Completed Functionality
- ✅ Project structure and configuration (package.json, tsconfig, expo config)
- ✅ Initial database schema (profiles, classes, class_members, daily_prompts, daily_posts, reactions, reports, notifications, device_tokens, admin_actions)
- ✅ SQL migrations (001_initial_schema.sql, 002_class_creation_rpc.sql, 003_daily_photo_storage_policies.sql)
- ✅ RPC function `create_class_with_owner()` with unique join code generation
- ✅ RLS policies for class_members, daily_posts, and storage.objects
- ✅ Supabase client configuration with `persistSession: true`
- ✅ Auth screens: login, register, forgot password
- ✅ Onboarding flow: welcome → create-class/join-class → home
- ✅ Theme system with dark/light mode and AsyncStorage persistence
- ✅ Reusable UI component library (Button, Card, SearchBar, MemoryCard, PhotoViewer, BottomNavigation, Skeleton, Toast, EmptyState, Avatar, Icon)
- ✅ Home screen with daily prompts, recent memories, pinned, featured sections
- ✅ Create memory flow: take photo / choose from library → details (title, category, tags, location) → save locally
- ✅ Settings screen: appearance, import/export, data management
- ✅ Bottom floating navigation with 5 tabs (Home, Memories, Create, Circle, Profile)
- ✅ MemoryCard component with editorial/compact/timeline/immersive densities
- ✅ PhotoViewer with animated transition
- ✅ Remember Me checkbox in login screen
- ✅ Password visibility toggle
- ✅ Form validation (ZOD schemas on backend, manual on frontend)

### Partially Implemented Functionality
- ⚠️ **Create Class**: SQL function and backend service exist, but frontend `create-class.tsx` sends POST to `/api/classes` — need to verify the full end-to-end flow works with authenticated user sessions
- ⚠️ **Join Class**: Backend `ClassService.joinClassByCode()` is fully implemented, but frontend `join-class.tsx` `handleJoin()` simply does `router.replace('/(tabs)/home')` without verifying the join code — this is a **broken** feature
- ⚠️ **Class data**: `ClassScreen` shows placeholder "Class sharing is not connected yet"
- ⚠️ **Image upload**: Photos are saved locally via AsyncStorage; no Supabase Storage integration for cloud sync
- ⚠️ **Profile creation**: On registers, `display_name` is set but profile data (avatar_path, username) not fully persisted to Supabase profiles table

### Broken Functionality
- ❌ **Join Class code verification**: The join-class screen does not verify codes; it just navigates home
- ❌ **Create Class backend integration**: Need to verify the `/api/classes` endpoint properly creates classes via the RPC function with authenticated user context
- ⚠️ (See partially implemented above)

---

## Critical Bugs Identified

| # | Feature | Issue | Severity |
|---|---|---|---|
| 1 | **Join Class** | `join-class.tsx` `handleJoin()` navigates to home without verifying the join code | P0 |
| 2 | **Create Class** | Backend `/api/classes` endpoint — need to verify RPC execution with service_role key and authenticated user handling | P0 |
| 3 | **Class membership** | `create_class_with_owner()` RPC uses `security definer` granting execute only to `service_role` — verify frontend/backend properly uses service_role key | P0 |
| 4 | **Image upload** | Photos saved locally only; no Supabase Storage integration for cross-device access | P1 |
| 5 | **Session restoration** | `useAuth` hook depends on `supabase.auth.getSession()` on mount — verify cold-start behavior and loading state | P1 |

---

## Security Issues

| # | Issue | Details |
|---|---|---|
| 1 | **Service role key in backend** | `backend/src/lib/supabase.ts` creates a Supabase client with `service_role` key. Verify this is NOT used in the frontend. |
| 2 | **RLS policies** | Verify `profiles` table has proper RLS. The schema creates the table but may need triggers for on-signup auto-insert. |
| 3 | **CORS configuration** | Backend `origin: env.frontendUrl` — ensure production frontend URL is set, not just `http://localhost:8081`. |
| 4 | **No input validation sanitization** | Frontend validates, but ensure backend validators are comprehensive. |
| 5 | **Join code exposure** | Join codes are 8-char uppercase hex; no rate limiting on join attempts visible. |

---

## Database TODO List

| Priority | Status | Area | Task | File/Directory | Dependencies |
|---|---|---|---|---|---|
| P0 | NOT_STARTED | RPC function | Verify `create_class_with_owner()` works with service_role key and authenticated sessions | `database/migrations/002_class_creation_rpc.sql` | Backend env vars |
| P0 | NOT_STARTED | RLS policies | Verify profiles table RLS; add on-signup trigger for auto-profile creation | `database/migrations/001_initial_schema.sql` | Supabase project |
| P1 | NOT_STARTED | Indexes | Add missing indexes for query performance on class_members, daily_posts | `database/migrations/001_initial_schema.sql` | — |
| P2 | NOT_STARTED | Storage | Verify `class-photos` bucket policies are correct and private | `database/migrations/003_daily_photo_storage_policies.sql` | Frontend upload code |
| P2 | NOT_STARTED | Profiles | Ensure profile auto-creation on new user sign-up | `database` | Frontend auth |
| P3 | NOT_STARTED | Device tokens | Implement device token registration and push notification handling | `database/migrations/001_initial_schema.sql` | `useNotifications` hook |

---

## Authentication TODO List

| Priority | Status | Task | File/Directory | Dependencies |
|---|---|---|---|---|
| P0 | NOT_STARTED | Verify `/api/classes` create endpoint works end-to-end with authenticated user | `frontend/app/(onboarding)/create-class.tsx`, `backend/src/controllers/class.controller.ts` | Supabase config, backend env |
| P0 | NOT_STARTED | Fix Join Class — implement actual join code verification in `join-class.tsx` | `frontend/app/(onboarding)/join-class.tsx` | `useClass.ts` `joinClass` function |
| P1 | NOT_STARTED | Verify Remember Me uses proper Supabase session persistence (`persistSession: true`) | `frontend/hooks/useAuth.ts` | Supabase client config |
| P1 | NOT_STARTED | Session restoration on cold start — verify `isLoading` state handles properly | `frontend/hooks/useAuth.ts`, `frontend/app/_layout.tsx` | — |
| P1 | NOT_STARTED | Forgot password flow — verify `resetPasswordForEmail` works with configured email redirect | `frontend/app/(auth)/forgot-password.tsx`, `frontend/lib/supabase/auth.ts` | Supabase email config |
| P2 | NOT_STARTED | Profile creation on register — auto-insert into `profiles` table on sign-up | `frontend/app/(auth)/register.tsx`, backend services | Database trigger/migration |
| P2 | NOT_STARTED | Password validation — ensure minimum 6 chars matches Supabase requirements | `frontend/app/(auth)/login.tsx`, `frontend/hooks/useAuth.ts` | — |
| P3 | NOT_STARTED | Session expiration handling — refresh token on background | `frontend/hooks/useAuth.ts` | Supabase autoRefreshToken |

---

## Create Class and Join Class Implementation Plan

### Create Class — Current Flow

1. **Frontend** (`create-class.tsx`): User fills class name, school, academic year → presses "Create class"
2. **Frontend**: Gets Supabase session via `supabase.auth.getSession()`, extracts access token
3. **Frontend**: POSTs to `${backendUrl}/api/classes` with `{name, schoolName, academicYear}` and `Authorization: Bearer <token>`
4. **Backend** (`class.controller.ts`): `requireAuth` middleware extracts `userId` from Bearer token via `supabase.auth.getUser()`
5. **Backend** (`class.service.ts` → `class.repository.ts`): `createClassWithOwner()` uses `supabaseAdmin` (service_role key) to:
   - Generate unique 8-char join code (e.g., `MEM-AB12CD34`)
   - Insert into `classes` table
   - Insert creator into `class_members` as `owner`
   - Return created class
6. **Frontend**: On success, navigates to `/(tabs)/home`

**Critical Issues to Investigate**:
- ✅ Does the backend have `SUPABASE_SERVICE_ROLE_KEY` set in environment?
- ✅ Does the `/api/ready` health check pass (supabase connected)?
- ⚠️ Verify the RPC `create_class_with_owner()` actually executes successfully with the service_role client
- ⚠️ Verify RLS doesn't block the service_role inserts (function has `security definer` so it bypasses RLS)
- ⚠️ After class creation, verify the user is automatically a member/owner and navigation works

### Join Class — Current Flow (BROKEN)

1. **Frontend** (`join-class.tsx`): User enters join code → presses "Join class" → **just navigates home** (broken)
2. **Correct flow should be**:
   - User enters join code → validate format → call backend `/api/classes/join` endpoint
   - **Backend** (`class.controller.ts`): `requireAuth` middleware → `ClassService.joinClassByCode(joinCode, userId)`
   - **Backend** (`class.service.ts` → `class.repository.ts`):
     - `findByJoinCode(joinCode)` — looks up class by join_code (case-insensitive)
     - If not found → return error
     - `addMember(classId, userId, 'member')` — inserts user into `class_members` with role='member' (uses upsert with onConflict)
   - **Frontend**: On success, navigate to `/(tabs)/home`, set active class, load class data

**What Needs to Be Done**:
- P0: Rewrite `join-class.tsx` `handleJoin()` to actually call the backend join endpoint
- P0: Add join code validation and error handling (invalid code, duplicate membership)
- P1: Display join code on create-class screen so users can share it
- P1: Show class details after joining (active class, member count, role)

---

## UI/UX TODO List — Dark Theme (Priority Colors)

| Priority | Status | Component | Task | Target Colors (Dark) |
|---|---|---|---|---|
| P0 | NOT_STARTED | Verify dark theme matches spec: background `#0B0813`, deep purple `#211633`, purple accent `#8052C8`, lavender `#C3A6F2`, warm yellow `#FFC857`, primary text `#F6F0FF`, secondary text `#A99BB9` | `frontend/constants/theme.ts` `darkColors` | — |
| P0 | NOT_STARTED | Verify light theme matches spec: background `#F7F2E9`, card surfaces `#FFFDF8`, primary accent `#80658F`, primary text `#30243D`, secondary text `#75677E`, highlight `#E6B957` | `frontend/constants/theme.ts` `lightColors` | — |
| P1 | NOT_STARTED | Centralize all component styles in `componentStyles` — no screen should hardcode hex colors | `frontend/constants/theme.ts` `componentStyles` | All screens |
| P1 | NOT_STARTED | Update BottomNavigation to use correct accent colors matching dark `#8052C8` / light `#80658F` | `frontend/components/ui/BottomNavigation.tsx` | theme.ts |
| P1 | NOT_STARTED | Update SearchBar input background/border to use theme tokens | `frontend/components/ui/SearchBar.tsx` | theme.ts |
| P2 | NOT_STARTED | Update MemoryCard top-left/top-right pills to use correct accent colors | `frontend/components/ui/MemoryCard.tsx` | theme.ts |
| P2 | NOT_STARTED | Update Avatar component colors to match theme | `frontend/components/ui/Avatar.tsx` | — |
| P3 | NOT_STARTED | Ensure all new components read from `useAppTheme()` instead of hardcoding colors | All component files | — |

---

## Other Features TODO List

| Priority | Status | Feature | Task | File/Directory |
|---|---|---|---|---|
| P0 | NOT_STARTED | Fix Join Class screen to actually verify codes and grant access | `frontend/app/(onboarding)/join-class.tsx` |
| P1 | NOT_STARTED | Implement image upload to Supabase Storage with signed URLs | `frontend/lib/photo-draft.ts`, `frontend/components/ui/` |
| P1 | NOT_STARTED | Pagination and lazy loading on memory lists | `frontend/app/(tabs)/home.tsx`, `frontend/app/(tabs)/memories.tsx` |
| P1 | NOT_STARTED | Network error handling — show proper errors on API failures | All screen files with `fetch`/`supabase` calls |
| P1 | NOT_STARTED | Offline handling — gracefully handle when backend is unavailable | `frontend/hooks/useClass.ts`, `frontend/hooks/useAuth.ts` |
| P2 | NOT_STARTED | Onboarding screen — refine welcome and flow | `frontend/app/(onboarding)/welcome.tsx` |
| P2 | NOT_STARTED | Discover screen — implement real search/filter functionality | `frontend/app/(tabs)/discover.tsx` |
| P2 | NOT_STARTED | Profile screen — show user info, stats, edit profile | `frontend/app/(tabs)/profile.tsx` |
| P2 | NOT_STARTED | Settings screen — complete appearance and data options | `frontend/app/settings.tsx` |
| P3 | NOT_STARTED | Search screen — implement search across memories | `frontend/app/search.tsx` (if needed) |
| P3 | NOT_STARTED | Yearbook/Year view screen | Check if needed for product scope |
| P3 | NOT_STARTED | Circle screen — class member interactions | `frontend/app/(tabs)/circle.tsx` currently shows placeholder |

---

## Testing TODO List

| Priority | Status | Test Case | Related Feature |
|---|---|---|---|
| P0 | NOT_STARTED | Registration with valid email/password | `frontend/app/(auth)/register.tsx` |
| P0 | NOT_STARTED | Login with valid credentials | `frontend/app/(auth)/login.tsx` |
| P0 | NOT_STARTED | Remember Me — enable and disable, verify session persistence | `frontend/hooks/useAuth.ts`, `frontend/app/(auth)/login.tsx` |
| P0 | NOT_STARTED | Logout — clears session locally and from Supabase | `frontend/app/(auth)/login.tsx`, `frontend/hooks/useAuth.ts` |
| P0 | NOT_STARTED | Session restoration on app restart | `frontend/hooks/useAuth.ts`, `frontend/app/_layout.tsx` |
| P0 | NOT_STARTED | Create Class with valid data | `frontend/app/(onboarding)/create-class.tsx`, backend |
| P0 | NOT_STARTED | Join Class with valid join code | `frontend/app/(onboarding)/join-class.tsx` (NEEDS FIX) |
| P1 | NOT_STARTED | Invalid join code handling | `frontend/app/(onboarding)/join-class.tsx` |
| P1 | NOT_STARTED | Duplicate membership prevention | `backend/src/services/class.service.ts` |
| P1 | NOT_STARTED | Owner permissions — only owner can create class, manage members | `backend/src/controllers/class.controller.ts` |
| P1 | NOT_STARTED | Member permissions — can create posts, view class data | `backend/src/controllers/class.controller.ts` |
| P2 | NOT_STARTED | Class data isolation — users can only access their classes | `backend/src/middleware/auth.middleware.ts` |
| P2 | NOT_STARTED | Image upload — success and failure paths | `frontend/lib/photo-draft.ts` |
| P2 | NOT_STARTED | Private image access — only class members can view | `database/migrations/003_daily_photo_storage_policies.sql` |
| P3 | NOT_STARTED | Network failure — app doesn't crash on API errors | All screens |
| P3 | NOT_STARTED | App restart — session restored correctly | `frontend/hooks/useAuth.ts` |
| P3 | NOT_STARTED | Android emulator compatibility — ensure all screens render | Entire app |

---

## 14-Day Launch Roadmap

### Day 1: Project Audit and Architecture Verification
- [ ] Verify Supabase environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Verify backend health endpoint `/api/ready` passes
- [ ] Verify frontend can connect to Supabase auth
- [ ] Document current broken features (Join Class, Create Class verification)
- [ ] Set up version control backup state

### Day 2–3: Database, Supabase and Security
- [ ] Apply migrations to Supabase project (001, 002, 003)
- [ ] Verify `create_class_with_owner()` RPC function works via Supabase dashboard
- [ ] Verify RLS policies are active and correct on all tables
- [ ] Verify `class-photos` storage bucket is private and policies work
- [ ] Add profile auto-creation trigger or on-signup handler
- [ ] Fix: Remove service-role key exposure risk from any frontend code

### Day 4–5: Authentication and Session Persistence
- [ ] Fix Remember Me: ensure `persistSession: true` works correctly
- [ ] Fix session restoration on cold start — verify `isLoading` state
- [ ] Implement profile auto-creation on register (Supabase auth trigger or frontend)
- [ ] Fix Forgot Password — verify email redirect configuration
- [ ] Test login/logout/restore cycle thoroughly

### Day 6–7: Create Class and Join Class
- [ ] **P0**: Fix `join-class.tsx` — implement actual join code verification by calling `/api/classes/join`
- [ ] **P0**: Fix `create-class.tsx` — verify end-to-end create class flow works, navigation after success
- [ ] Display join code on create-class screen for sharing
- [ ] After join: set active class, load class data, show member count and role
- [ ] Prevent duplicate membership on join

### Day 8–9: Theme System and Reusable Components
- [ ] Verify dark theme colors match spec exactly (#0B0813, #211633, #8052C8, #C3A6F2, #FFC857, #F6F0FF, #A99BB9)
- [ ] Verify light theme colors match spec exactly (#F7F2E9, #FFFDF8, #80658F, #30243D, #75677E, #E6B957)
- [ ] Centralize all component styles in `componentStyles` — remove hardcoded hex colors from screens
- [ ] Update BottomNavigation to use theme-aware accent colors
- [ ] Update SearchBar, MemoryCard pills, Avatar to use theme tokens
- [ ] Ensure all components read from `useAppTheme()` not hardcoded values

### Day 10–11: Login, Splash Screen, Home and Classes UI
- [ ] Create branded splash screen (2–3 second cold start)
- [ ] Fix Login screen: redirect after sign-in to `/(onboarding)/welcome` (already in place)
- [ ] Refine Home screen: personalized daily memory, prompts, recent memories, class feed
- [ ] Fix Class screen: show actual class data instead of placeholder
- [ ] Implement empty states and error states on all screens
- [ ] Add skeleton loaders where currently missing

### Day 12: Remaining Screen Improvements
- [ ] Refine Memories screen with proper filters and search
- [ ] Implement Create Memory flow fully (photo capture → save → show in home)
- [ ] Improve Settings screen: appearance, import/export, data management
- [ ] Fix Bottom Navigation active/inactive states
- [ ] Add toast notifications for all user actions
- [ ] Implement Fav/Unfav and Pin/Unpin functionality

### Day 13: Testing and Bug Fixing
- [ ] Test all registration paths
- [ ] Test all login paths (Remember Me on/off)
- [ ] Test Create Class end-to-end
- [ ] Test Join Class with valid and invalid codes
- [ ] Test session restoration on app restart
- [ ] Test network failure scenarios
- [ ] Test Android emulator compatibility
- [ ] Fix all console errors and warnings

### Day 14: Final Release Preparation
- [ ] Generate production build and verify it runs
- [ ] Final review of all TODO items — ensure nothing P0 is missing
- [ ] Prepare release notes and launch checklist
- [ ] Submit to app stores (or expo start for internal testing)

---

## Final Production-Readiness Checklist

### Critical (P0) — Must Fix Before Launch
- [ ] **Join Class** — code verification actually works (currently broken: navigates without verifying)
- [ ] **Create Class** — end-to-end flow verified with authenticated sessions
- [ ] **Supabase configuration** — all environment variables set, health check passes
- [ ] **RLS policies** — verified on all tables (profiles, classes, class_members, daily_posts, storage)
- [ ] **Service role key** — NOT used in frontend; only in backend
- [ ] **Authentication** — login, logout, remember me, session restoration all work

### High (P1) — Important for Launch
- [ ] **Theme system** — dark and light themes match specified colors
- [ ] **Image upload** — photos can be captured/selected and saved (local currently OK, cloud sync needed for launch)
- [ ] **Pagination/lazy loading** — memory lists don't load infinitely
- [ ] **Network error handling** — graceful errors on API failures
- [ ] **Offline handling** — app doesn't crash when backend unavailable
- [ ] **Profile creation** — auto-creation on sign-up works

### Medium (P2) — Important Improvement
- [ ] **Skeleton loaders** — on all data-fetching screens
- [ ] **Empty states** — thoughtful messages on all empty screens
- [ ] **Error states** — user-friendly error messages
- [ ] **Search and filtering** — works across memories
- [ ] **Toast notifications** — for all user actions
- [ ] **Component styling** — no hardcoded hex colors in screens

### Low (P3) — Optional Enhancement
- [ ] **Splash screen** — branded 2-3 second cold start animation
- [ ] **Yearbook/Discover enhancements** — beyond minimum
- [ ] **Advanced gestures** — pull-to-refresh, etc.
- [ ] **Accessibility audit** — full ARIA compliance
- [ ] **Performance optimization** — virtualization, image optimization

---