# Memora Phase 1 Implementation Report

## Existing architecture

- Expo 57, React Native, TypeScript, Expo Router, and TanStack Query.
- Routes are split into auth, onboarding, tabs, camera, class, and post screens.
- Supabase is optional and configured from Expo app extras; auth sessions persist through the Supabase client.
- The current photo journal stores processed photos locally with AsyncStorage and app document storage. It does not upload them to Supabase.

## Existing screens and reusable UI

- Screens: Today, Memories, Yearbook, Profile, Class, class detail, camera capture/preview, post detail, login/register/password reset, and onboarding.
- Shared UI: Button, Card, Badge; design tokens live in `constants/theme.ts`.
- Hooks: `useAuth` observes Supabase sessions. `useClass` and `useNotifications` currently return placeholders.
- Photo operations are centralized in `lib/photo-draft.ts` and can power Home, Memories, Yearbook, Profile storage counts, and camera previews.

## Supabase, database, and storage

- Auth wrappers provide email sign-in, registration, sign-out, and password reset.
- The schema defines profiles, classes, class memberships, daily prompts/posts, reactions, reports, notifications, device tokens, and admin actions.
- Migrations include class creation and private `class-photos` storage policies scoped by class membership.
- There is no implemented social-feed query, friend graph, messaging service, class-photo upload flow, or signed-URL client service. RLS and private-bucket policies must remain authoritative.

## Reuse and redesign boundaries

- Reuse Expo Router, the existing local photo repository, auth/session handling, shared primitives, theme tokens, and current camera routes.
- Redesign the tab shell and Today/Home, add Discover, reshape Memories into a timeline/grid, make Profile a profile with preserved local-storage controls, and present Yearbook as a yearly collection.
- Keep social preview fixtures isolated and labeled as previews; do not represent them as live Supabase data.
- Do not replace Expo, Supabase, auth, class membership, local photo storage, RLS, or existing routes. No database changes are required for Phase 1.

## Phase 1 delivered

1. Refined the warm theme and added accessible Home, Discover, Create, Memories, and Me navigation while retaining the existing `today` route.
2. Built a Home/Moments feed from local memories and clearly labeled social previews; the Create action opens the existing Expo Camera route.
3. Added searchable Discover previews for topics, people, and moments, with an explicit notice that they are not live network data.
4. Added All/Mine/Friends/Class/Events filters and Timeline/Grid views to Memories using local photos only.
5. Redesigned Profile and Yearbook around identity, private-device storage, and dated monthly chapters. Profile edits use authenticated Supabase user metadata; photo deletion remains local.
6. Added explanatory empty states for messaging, notifications, friends, and class-yearbook data that do not yet have working client services.

## Verification and remaining work

- Visual direction is now dark gothic glass with Y2K lavender/cyan accents, expressive serif headings, and native light status-bar content.
- No database migrations, RLS policies, Supabase storage settings, or photo upload behavior changed.
- TypeScript, ESLint, Expo startup, and mobile route checks passed. A live camera preview rendered in the IDE browser.
- Social feed, friend graph, messaging, notification queries, shared class memories, profile links, and class yearbooks still require verified backend services before their preview UI can become live data.
