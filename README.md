# Memora — Class Memory Sharing App

A private, class-based photo sharing application built with React Native (Expo) and a Node.js/Express backend, using Supabase for auth, database, and storage.

## Status

Cross-user photo sharing is **fully operational** when both the backend and Supabase credentials are configured. Without credentials the app falls back to a login screen (no silent bypass). A user without credentials sees the auth screen, not the main feed.

## Features

### Circles (Classes)
- Create private circles with auto-generated 8-character join codes
- Join circles using invite codes
- Leave any circle you are not the owner of (`DELETE /api/classes/:id/leave`)
- Switch between multiple circles without logging out
- Member list visible to all members of the same circle

### Shared Memory Feed
- Upload photos from camera or gallery
- Photos go to Supabase Storage (`class-photos` bucket, private)
- Backend signs time-limited download URLs (7-day expiry)
- Feed loads all posts for the active circle via `GET /api/classes/:id/feed`
- Pull-to-refresh, loading skeletons, empty states

### Interactions
- Six reaction types: heart, laugh, cry, fire, dead, respect
- Toggle reactions (re-sending the same type removes it)
- Comments — any authenticated circle member can comment
- Edit and delete own comments

### Security
- JWT authentication via Supabase Auth on every backend request
- Row Level Security on all tables (see migrations 003, 007, 008, 009)
- Storage bucket is private; only class members can read their class folder
- Owners cannot leave their own class (must transfer ownership first)
- Service-role key is backend-only; never sent to clients

### Themes
- **Default**: Catppuccin Mocha (dark) — `#1E1E2E` base, `#B4BEFE` lavender accent
- **Light**: Catppuccin Latte — `#EFF1F5` base, `#7287FD` lavender accent
- Persisted across restarts; switchable from Profile → Appearance

---

## Quick Start

### Prerequisites
- Node.js 18+
- A Supabase project
- Expo CLI (`npm install -g expo-cli`)

### 1. Database

Run migrations in the Supabase SQL editor in order:

```
database/migrations/001_initial_schema.sql
database/migrations/002_class_creation_rpc.sql
database/migrations/003_daily_photo_storage_policies.sql
database/migrations/004_extended_schema.sql
database/migrations/005_comments_reactions.sql
database/migrations/006_fix_class_creation_function.sql
database/migrations/007_circles_implementation.sql
database/migrations/008_fixes_and_improvements.sql   ← adds member_count, bio, join_requests
database/migrations/009_rls_security_fixes.sql        ← RLS on all previously unprotected tables
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Runs on `http://localhost:4000`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_BACKEND_URL
npx expo start
```

**Platform-specific backend URLs:**
| Platform | `EXPO_PUBLIC_BACKEND_URL` |
|---|---|
| Web / iOS Simulator | `http://localhost:4000` |
| Android Emulator | `http://10.0.2.2:4000` |
| Physical device | `http://<your-local-ip>:4000` |

---

## Environment Variables

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_BACKEND_URL=http://localhost:4000
```

> ⚠️ Never commit `.env` files. The service role key must only exist on the backend.

---

## Project Structure

```
memora/
├── backend/
│   └── src/
│       ├── controllers/   route handlers
│       ├── services/      business logic
│       ├── repositories/  database access (Supabase admin client)
│       ├── middleware/    auth (JWT) + error handler
│       ├── validators/    Zod schemas
│       └── routes/        Express routers
├── frontend/
│   ├── app/
│   │   ├── (auth)/        login · register · forgot-password · callback
│   │   ├── (onboarding)/  create-class · join-class · welcome
│   │   └── (tabs)/        home · memories · create · circle · profile
│   ├── components/
│   │   ├── circle/        CircleHomeSection · CircleSwitcher · …
│   │   └── ui/            Button · Avatar · MemoryCard · MemoraTabBar · …
│   ├── constants/theme.ts  Catppuccin Mocha + Latte design tokens
│   ├── contexts/          CircleContext (active circle, join, leave)
│   ├── hooks/             useAuth · useClass · useCircleFeed · …
│   └── providers/         ThemeProvider (default: dark)
└── database/migrations/
```

---

## API Reference

All routes require `Authorization: Bearer <access_token>` except `/api/health` and `/api/ready`.

### Classes
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/classes` | Create a class |
| `POST` | `/api/classes/join` | Join via invite code |
| `GET` | `/api/classes` | List user's classes |
| `GET` | `/api/classes/:id` | Class details |
| `GET` | `/api/classes/:id/members` | Member list |
| `GET` | `/api/classes/:id/feed` | All posts in class |
| `GET` | `/api/classes/:id/feed/today` | Posts + today status |
| `DELETE` | `/api/classes/:id/leave` | Leave a class (non-owners) |

### Posts
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/posts/upload` | Upload photo to storage |
| `POST` | `/api/posts` | Create post record |
| `PATCH` | `/api/posts/:id` | Update caption |
| `DELETE` | `/api/posts/:id` | Delete own post |
| `POST` | `/api/posts/:id/reactions` | Toggle reaction |
| `POST` | `/api/posts/:id/comments` | Add comment |
| `GET` | `/api/posts/:id/comments` | List comments |
| `PATCH` | `/api/posts/:id/comments/:cid` | Edit own comment |
| `DELETE` | `/api/posts/:id/comments/:cid` | Delete own comment |
| `POST` | `/api/posts/:id/comments/:cid/reactions` | React to comment |

### Circles (sub-groups, migration 007)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/circles` | Create circle inside a class |
| `GET` | `/api/circles` | User's circles |
| `POST` | `/api/circles/:id/join` | Join circle |
| `GET` | `/api/circles/:id/feed` | Circle posts feed |

---

## Security Notes

- Migrations 008 and 009 must be run to close the gaps left by migrations 004 and 005.
- 004 and 005 used `grant all ... to public, anon, authenticated` without enabling RLS. Migration 009 enables RLS on all 17 affected tables and revokes the `anon` grants.
- The `class_members` SELECT policy was narrowed in 003 (self-read only). Migration 009 replaces it with a policy that allows members to see everyone in classes they belong to.
- The splash screen routes unauthenticated users to the login screen regardless of Supabase configuration state; there is no silent bypass into the main app.

---

## Development Commands

```bash
# Frontend
npx expo start              # dev server
npx tsc --noEmit            # type check (0 errors expected)
npx eslint . --max-warnings=0

# Backend
npm run dev                 # ts-node dev server
npx tsc --noEmit            # type check (0 errors expected)
```
