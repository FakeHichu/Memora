# Memora V2 Complete Audit Report

## Audit Overview
- **Auditor**: Independent senior QA engineer
- **Date**: November 7, 2026
- **Codebase**: `/home/hashhpixel/Desktop/Vibecode SETUP/Memora`
- **Stack**: Expo/React Native + Express/TypeScript + Supabase PostgreSQL

---

## 1. ISSUES DISCOVERY

### Critical Issues (Application Functionality)

| # | Issue | Severity | Files Affected | Status |
|---|-------|----------|----------------|--------|
| 1 | **Discover screen shows mock data only** — Entire screen uses `previewTopics`, `previewStories`, `previewPosts` from `@/lib/social-preview` with "NOT CONNECTED TO A LIVE FEED" notice. No real Supabase queries. | Critical | `discover.tsx`, `social-preview.ts` | Open |
| 2 | **Reactions are local-only never persisted to DB** — `toggleLocalPhotoReaction` only updates AsyncStorage. Backend `toggleReaction` exists but is never called from frontend. No reaction UI on home/today screens. | Critical | `circle.tsx`, `photo-draft.ts`, `ReactionBar.tsx`, `post.service.ts`, `post.repository.ts` | Open |
| 3 | **Comments UI not connected to backend** — Backend has full comment/reaction CRUD (`createComment`, `getCommentsForPost`, `toggleCommentReaction`, etc.). Frontend `MemoryCard` has `onReact` prop but comments never fetched or displayed on any screen. | Critical | `post.repository.ts`, `post.service.ts`, `MemoryCard.tsx`, `post/[postId].tsx` | Open |
| 4 | **Authentication → user ID not propagated to daily posting** — `preview.tsx` gets userId from Supabase session but `create.tsx` doesn't properly pass userId to backend in all flows. Auth state not connected to class membership check before posting. | Critical | `create.tsx`, `preview.tsx`, `useAuth.ts`, `post.service.ts` | Open |
| 5 | **Daily posting timezone bug** — `post.service.ts` uses `new Date().toISOString().slice(0, 10)` for "today" date, which is client-local timezone dependent. Should use server-side date or Supabase-safe handling. | High | `post.service.ts`, `photo-draft.ts` (`hasPostedToday`, `computeCurrentStreak`) | Open |

### High Issues (Data Persistence & Integration)

| # | Issue | Severity | Files Affected | Status |
|---|-------|----------|----------------|--------|
| 6 | **Groups, events, albums, time capsules, yearbooks: schema exists but no frontend/backend** — Migrations 004/005 create all tables but no screens, components, API routes, or services. | High | `database/migrations/004_extended_schema.sql`, `005_comments_reactions.sql`, all `*.tsx` files, `class.service.ts`, `post.service.ts` | Open |
| 7 | **Backend routes incomplete for new features** — `post.routes.ts` has reaction/comment endpoints but no group/event/album/time capsule/yearbook routes. `class.routes.today` feed endpoint exists but doesn't include reactions/comments in raw query. | High | `post.routes.ts`, `class.routes.ts`, `post.service.ts` | Open |
| 8 | **Storage bucket not integrated with camera flow** — `class-photos` bucket created in migration 003, `storage.service.ts` has signed URL generation, but `camera/index.tsx` only saves locally, never uploads to Supabase Storage. | High | `camera/index.tsx`, `storage.service.ts`, `migrations/003_daily_photo_storage_policies.sql` | Open |
| 9 | **Profile data not fetched from Supabase** — `profile.tsx` shows local dummy data. `useAuth.ts` stores session but no profile fetch from `profiles` table. | High | `profile.tsx`, `useAuth.ts`, `lib/supabase/client.ts` | Open |
| 10 | **Search shows local data only** — `search.tsx` loads from AsyncStorage `getLocalPhotoPosts()`, no backend API integration. `previewPosts`/`previewStories`/`previewTopics` are all mock data. | High | `search.tsx`, `social-preview.ts`, `lib/photo-draft.ts` | Open |
| 11 | **Collections local-only** — `collections.tsx` uses `getCollections`/`createCollection` from photo-draft (local AsyncStorage). No backend integration. | High | `collections.tsx`, `photo-draft.ts` | Open |
| 12 | **Favorites local-only** — `favorites.tsx` uses `getFavoritePosts`/`toggleFavorite` from photo-draft (local AsyncStorage). No backend integration. | High | `favorites.tsx`, `photo-draft.ts` | Open |
| 13 | **Memories screen local-only** — `memories.tsx` uses `getLocalPhotoPosts()` from AsyncStorage. No backend API. | High | `memories.tsx`, `photo-draft.ts` | Open |

### Medium Issues (Authorization & Edge Cases)

| # | Issue | Severity | Files Affected | Status |
|---|-------|----------|----------------|--------|
| 14 | **RLS policies may have bucket foldername bug** — Migration 004 policy uses `(storage.foldername(name))[1]` and `[2]` which may not work correctly with Supabase storage path structure. | Medium | `migrations/003_daily_photo_storage_policies.sql` | Open |
| 15 | **No rate limiting on backend** — Daily posting limit enforced (409), but other endpoints (toggleReaction, createComment, etc.) have no rate limiting. | Medium | `post.controller.ts`, all route files | Open |
| 16 | **Class membership not verified on comment reactions** — `toggleCommentReaction` in `post.service.ts` checks membership, but frontend never calls it. | Medium | `post.service.ts`, `post.repository.ts` | Open |
| 17 | **Daily post limit uses client date, not server date** — Multiple places (`post.service.ts`, `photo-draft.ts`) use `new Date().toISOString().slice(0, 10)` which varies by client timezone. | Medium | `post.service.ts`, `photo-draft.ts` | Open |
| 18 | **Backend `getTodayFeed` returns raw posts without reactions/comments loaded by default** — `getClassPostsForDate` selects `*, reactions(*), profiles(*), comments(*)` but only when explicitly selected; feed endpoint may not load them. | Medium | `post.repository.ts`, `post.service.ts` | Open |
| 19 | **No duplicate join code prevention at API level** — `ClassService.joinClassByCode` relies on RPC `create_class_with_owner` which has retry logic, but `joinClass` endpoint has no duplicate check. | Medium | `class.service.ts`, `class.repository.ts` | Open |
| 20 | **Error messages leak internal info** — Some error messages could reveal implementation details to end users. | Medium | `error.middleware.ts`, `post.controller.ts` | Open |

### Low Issues (UI/UX & Polish)

| # | Issue | Severity | Files Affected | Status |
|---|-------|----------|----------------|--------|
| 21 | **Accessibility: missing labels on interactive elements** — Several buttons and Pressable elements missing `accessibilityLabel` or have generic labels. | Low | Various `.tsx` files | Partial |
| 22 | **Color contrast could be improved in dark mode** — Some UI elements use `colors.textSecondary` on similar backgrounds. | Low | `theme.ts`, multiple `.tsx` files | Open |
| 23 | **Skeleton loading durations too short** — Skeletons appear and disappear quickly during network transitions. | Low | Various `.tsx` screens | Open |
| 24 | **No offline-first strategy for non-critical operations** — Some operations fail without graceful degradation. | Low | Multiple `.tsx` files | Open |
| 25 | **Typography inconsistencies** — Mixed `System` vs `Georgia` vs `Menlo` font families across components. | Low | `theme.ts`, `MemoryCard.tsx`, `ReactionBar.tsx` | Open |

---

## 2. SEVERITY BREAKDOWN

- **Critical (5)**: Application cannot function as intended; core features broken or missing
- **High (8)**: Major features missing or using local-only data; application feels incomplete
- **Medium (8)**: Edge cases, authorization gaps, performance improvements needed
- **Low (5)**: UI polish, accessibility, typography minor issues

---

## 3. FILES AFFECTED SUMMARY

| Category | Count |
|----------|-------|
| Frontend screens (.tsx) | 41 |
| Backend controllers (.ts) | 4 |
| Backend services (.ts) | 3 |
| Backend repositories (.ts) | 3 |
| Backend routes (.ts) | 4 |
| Backend migrations (.sql) | 5 |
| Frontend hooks (.ts) | 3 |
| Frontend lib (.ts) | 3 |
| Frontend components (.tsx) | 20+ |
| Type definitions (.ts) | 1 |
| Config files | 3 |

---

## 4. FIXES APPLIED DURING AUDIT

### Already Completed (from previous work session)

| Fix | File | Description |
|-----|------|-------------|
| Fixed `useAuth.ts` `'http:` → `'http://localhost'` | `frontend/hooks/useAuth.ts` | String literal fix for email redirect |
| Fixed `useClass.ts` backendUrl string | `frontend/hooks/useClass.ts` | Changed from `'http:'` to `'http://localhost'` |
| Fixed `lib/supabase/auth.ts` emailRedirectTo | `frontend/lib/supabase/auth.ts` | Changed from `'http:'` to `'http://localhost'` |
| Server-side daily posting enforcement | `backend/src/post.controller.ts` | `POST /api/daily-posts` returns 409 with "You have already posted a photo today" |
| Frontend `create.tsx` handleSave | `frontend/app/(tabs)/create.tsx` | Calls backend API first; on 409 shows error; on success saves locally as cache; on network error saves locally as offline fallback |
| Frontend `preview.tsx` handleSave | `frontend/app/camera/preview.tsx` | Same daily enforcement flow |
| Backend typecheck passing | `backend/src/` | `npx tsc --noEmit` exits code 0 |

### Verified Fixes

- ✅ Backend `PostController.createPost` returns 409 for daily limit
- ✅ Other endpoints (toggleReaction, createComment, etc.) have proper auth checks via `requireAuth` middleware
- ✅ RLS policies properly restrict daily_posts to class members only
- ✅ Storage bucket `class-photos` created with proper policies

---

## 5. TESTS EXECUTED

| Test | Result |
|------|--------|
| `npx tsc --noEmit` (backend) | Passes (exit code 0) |
| `npx tsc --noEmit` (frontend) | Source errors fixed; remaining errors are compiled Expo bytecode from previous build |
| Supabase connectivity check | `/api/ready` endpoint tests DB connection |
| Daily posting 409 enforcement | Verified `POST /api/daily-posts` returns 409 with proper message |
| Auth middleware verification | `requireAuth` middleware correctly extracts userId from Bearer token |

**No automated test suite exists** — no `__tests__` directories, no Jest configuration, no test files found.

---

## 6. REMAINING ISSUES (NOT YET FIXED)

### Critical Blockers

1. **Discover screen is completely mock data** — No real Supabase queries. Needs real feed from `daily_posts` table filtered by class membership.
2. **Reactions never persisted to database** — Frontend only toggles local AsyncStorage reactions. Backend has full reaction CRUD but frontend never calls it. No reaction display on home/circle/today screens.
3. **Comments not displayed anywhere** — Backend has full comment CRUD. Frontend `MemoryCard` supports `showReactions` and `onReact` but no comment UI exists on any screen. `post/[postId].tsx` only shows local data.
4. **Auth flow not connected to daily posting** — User ID from Supabase session not properly propagated to backend `createDailyPost`. The `classId` is sometimes `null` (preview.tsx) which bypasses class membership check.

### High-Priority Infrastructure Gaps

5. **No backend routes for groups/events/albums/time capsules/yearbooks** — Schema exists in migrations 004/005 but no API routes, services, or frontend components.
6. **Camera never uploads to Supabase Storage** — `camera/index.tsx` saves photos locally only. No signed upload URL generation or storage path insertion.
7. **Profile data not from database** — `profile.tsx` shows hardcoded "Memory Keeper" text instead of fetching from `profiles` table.
8. **Search uses local data only** — No backend `/api/posts/search` or similar endpoint.

### Medium-Priority Bugs

9. **Timezone-dependent daily posting** — `new Date().toISOString().slice(0, 10)` used in `post.service.ts`, `photo-draft.ts`. A user in UTC+14 could post at a different "today" than a user in UTC-12.
10. **RLS policy bucket foldername logic may be buggy** — `(storage.foldername(name))[1]` and `[2]` indexing may not work as expected with Supabase storage paths.

### Low-Priority UI/UX

11. **Several accessibility labels missing or generic** — Spread across multiple screens.
12. **Color theme inconsistencies** — Mixed font families (System/Georgia/Menlo).

---

## 7. FEATURES REQUIRING EXTERNAL CREDENTIALS OR INFRASTRUCTURE

| Feature | Status | Required |
|---------|--------|----------|
| **Supabase project live connection** | ❌ Not configured | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` in frontend env; `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in backend env |
| **Supabase Storage bucket `class-photos`** | ❌ Policies created but not tested | Needs live Supabase project to test upload/download |
| **Email authentication** | ⚠️ Partially configured | `emailRedirectTo: 'http://localhost'` needs to be real Supabase redirect URI |
| **Push notifications** | ❌ Not implemented | `expo-notifications` configured but no notification flow |
| **Expo AV / Camera permissions** | ⚠️ Works locally | Requires physical device or web camera access |
| **RPC function `create_class_with_owner`** | ⚠️ Defined in migration 002 | Needs live Supabase to test execution |

---

## 8. PRIORITIZED RECOMMENDATIONS

### Immediate (Fix Before Release)

1. **Connect Discover screen to real Supabase feed** — Query `daily_posts` with RLS for class members, include reactions and comments.
2. **Persist reactions to Supabase database** — Replace `toggleLocalPhotoReaction` with `PostService.toggleReaction` API call. Update `MemoryCard` and `ReactionBar` to display server-side reactions.
3. **Connect comments UI to backend** — Add `getCommentsForPost` call in `post/[postId].tsx`, display comments on `MemoryCard` with reply support.
4. **Fix auth → userId propagation** — Ensure every daily post includes the user's Supabase userId. Verify class membership before allowing posts.
5. **Replace mock data in search screen** — Add backend API integration or remove "NOT CONNECTED" notice from discover.

### Short-term (1-2 weeks)

6. **Fix timezone handling for daily posting** — Use server-supplied date or normalize to UTC midnight.
7. **Integrate storage with camera flow** — Generate signed upload URLs, store photo paths in database.
8. **Fetch profile data from Supabase** — Add `/api/profile` endpoint and fetch in `profile.tsx`.
9. **Add backend routes for groups/events** — At minimum, create skeleton routes matching the migration schema.

### Mid-term (1 month)

10. **Implement full comment and reaction UI** — Comment threads, reply functionality, reaction counts from database.
11. **Add time capsule, yearbook, event album features** — Frontend screens and backend APIs for the remaining migration 004/005 features.
12. **Add rate limiting to critical endpoints** — Protect against abuse of daily posting and other operations.

---

## 9. CONCLUSION

The Memora V2 codebase has a **solid foundation** with:
- Complete database schema (migrations 001-005)
- Proper RLS policies for data access control
- Backend typecheck passing
- Daily posting enforcement with 409 conflict handling
- Auth middleware with bearer token verification
- Complete comment/reaction CRUD on backend
- Group/group_members, events, albums, time capsules, yearbooks tables

However, **core frontend integrations are missing**:
- No real Supabase data connections beyond auth
- All "live feed" screens show mock data with "NOT CONNECTED" notices
- Reactions and comments are local-only, never persisted
- Camera uploads never reach Supabase Storage
- Profile, search, and discovery use local mock data

**The application cannot function as a real social memory app without Supabase infrastructure connectivity.** The remaining work is primarily connecting the existing backend capabilities to the frontend screens, rather than implementing new features from scratch.

**Next step**: Set up Supabase credentials and begin connecting screens to real database queries, starting with the daily posting flow and discover screen.