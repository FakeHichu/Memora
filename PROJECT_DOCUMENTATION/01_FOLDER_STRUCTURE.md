# 01_FOLDER_STRUCTURE.md

## Complete Folder and File Tree

This documentation covers the original source files of the Memora project, excluding generated artifacts, vendor directories, and dependency source code.

```
/home/hashhpixel/Desktop/Vibecode SETUP/Memora/
├── PROJECT_DOCUMENTATION/          ← Generated documentation (this folder)
├── .gitignore
├── IDEAS_Deva                      ← Full build specification and design requirements
├── FINAL_AUDIT.md                  ← Independent senior QA audit report
├── FEATURE_AUDIT.md                ← Feature audit and status report
├── package.json                    ← Root package.json (concurrently dev scripts)
├── package-lock.json
├── README.md
├── database/                       ← Database schema and migrations
│   ├── migrations/               ← SQL migrations (001-005)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_class_creation_rpc.sql
│   │   ├── 003_daily_photo_storage_policies.sql
│   │   ├── 004_extended_schema.sql
│   │   └── 005_comments_reactions.sql
│   └── seed.sql                  ← Development seed data
├── backend/                        ← Backend (Node.js + Express + TypeScript)
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo      ← Build info file
│   ├── src/                      ← Original TypeScript source code
│   │   ├── index.ts              ← Entry point, app configuration
│   │   ├── config/               ← Environment configuration
│   │   │   └── env.ts            ← Env variable definitions
│   │   ├── types/                ← Shared TypeScript types
│   │   │   └── index.ts          ← All type interfaces
│   │   ├── lib/                  ← Library utilities
│   │   │   └── supabase.ts       ← Supabase client configuration
│   │   ├── middleware/           ← Express middleware
│   │   │   ├── auth.middleware.ts ← Bearer token authentication
│   │   │   └── error.middleware.ts ← Centralized error handling
│   │   ├── controllers/          ← HTTP route handlers (thin, delegate to services)
│   │   │   ├── class.controller.ts
│   │   │   ├── post.controller.ts
│   │   │   └── prompt.controller.ts
│   │   ├── services/             ← Business logic layer
│   │   │   ├── class.service.ts
│   │   │   ├── post.service.ts
│   │   │   └── prompt.service.ts
│   │   ├── repositories/         ← Database operation layer
│   │   │   ├── class.repository.ts
│   │   │   ├── post.repository.ts
│   │   │   └── prompt.repository.ts
│   │   ├── routes/               ← Express route definitions
│   │   │   ├── class.routes.ts
│   │   │   ├── post.routes.ts
│   │   │   └── index.ts          ← Route composition
│   │   ├── validators/           ← Zod validation schemas
│   │   │   ├── class.validator.ts
│   │   │   ├── post.validator.ts
│   │   │   └── reaction.validator.ts
│   │   ├── storage/              ← Storage service
│   │   │   └── storage.service.js ← (compiled JS, not original TS)
│   │   └── index.ts              ← Root export
│   └── dist/                       ← Compiled JavaScript output
│       ├── index.js
│       ├── middleware/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── repositories/
│       ├── types/
│       ├── validators/
│       └── lib/
│           └── supabase.js       ← Compiled version
├── frontend/                       ← Next.js/Expo frontend (app router)
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   ├── app/                      ← Next.js/app Router pages and layouts
│   │   ├── (auth)/               ← Auth layout and screens
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   ├── (onboarding)/         ← Onboarding layout and screens
│   │   │   ├── _layout.tsx
│   │   │   ├── welcome.tsx
│   │   │   ├── create-class.tsx
│   │   │   └── join-class.tsx
│   │   ├── (tabs)/               ← Main tab navigation layout
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx
│   │   │   ├── create.tsx
│   │   │   ├── edit/[postId].tsx
│   │   │   ├── class.tsx
│   │   │   ├── collections.tsx
│   │   │   ├── favorites.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── search.tsx
│   │   │   ├── discover.tsx
│   │   │   ├── today.tsx
│   │   │   ├── circle.tsx
│   │   │   └── yearbook.tsx
│   │   ├── camera/               ← Camera screen
│   │   │   ├── index.tsx
│   │   │   └── preview.tsx
│   │   ├── class/[classId].tsx   ← Class detail screen
│   │   ├── post/[postId].tsx     ← Post detail screen
│   │   ├── edit/[postId].tsx     ← Edit post screen
│   │   ├── settings.tsx
│   │   ├── splash.tsx
│   │   ├── index.tsx             ← Root page
│   │   ├── layout.tsx            ← Root layout
│   │   └── _layout.tsx           ← Global layout
│   ├── components/               ← UI component library
│   │   └── ui/                   ← Reusable UI components
│   │       ├── AppHeader.tsx
│   │       ├── Avatar.tsx
│   │       ├── BackgroundPattern.tsx
│   │       ├── Badge.tsx
│   │       ├── BottomNavigation.tsx
│   │       ├── BrandLogo.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── CircleCard.tsx
│   │       ├── CommandPalette.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── FilterChips.tsx
│   │       ├── IconButton.tsx
│   │       ├── Icons.tsx
│   │       ├── MemoryCard.tsx
│   │       ├── ProfileSection.tsx
│   │       ├── ReactionBar.tsx
│   │       ├── SearchBar.tsx
│   │       ├── SectionHeader.tsx
│   │       ├── Skeleton.tsx
│   │       ├── TagBadge.tsx
│   │       └── Toast.tsx
│   ├── constants/                ← Configuration constants
│   │   ├── prompts.ts            ← Default daily prompts
│   │   └── theme.ts              ← Color tokens and spacing
│   ├── hooks/                    ← Custom React hooks
│   │   ├── useAuth.ts            ← Authentication state management
│   │   ├── useClass.ts           ← Class/membership management
│   │   └── useNotifications.ts   ← Notification stub (not fully implemented)
│   ├── lib/                      ← Utility libraries
│   │   ├── photo-draft.ts        ← Local-first photo management (AsyncStorage)
│   │   ├── supabase/auth.ts      ← Supabase auth configuration
│   │   ├── supabase/client.ts    ← Supabase client instance
│   │   └── social-preview.ts     ← Mock preview data
│   ├── app.json                  ← Expo configuration
│   ├── eas.json                  ← Expo EAS build configuration
│   ├── metro.config.js           ← Metro bundler config
│   ├── .env                      ← Frontend environment variables
│   ├── .env.example              ← Environment variable examples
│   ├── .eslintrc.js              ← ESLint configuration
│   ├── .prettierrc               ← Prettier configuration
│   ├── frontend/ package-lock.json
│   └── dist/                     ← Built distribution files
├── backend/                        ← (Duplicate/backup of main backend)
│   ├── dist/                     ← Compiled output
│   └── ... (similar structure)
├── database/                       ← Database files (also at root level)
│   ├── migrations/
│   └── seed.sql
├── .git/                         ← Git version control
├── node_modules/                 ← Dependencies (EXCLUDE from analysis)
└── PROJECT_DOCUMENTATION/        ← Generated documentation (this folder)
```

## Directory Purpose Explanation

### Root Level
- **`package.json`**: Root configuration that defines dev scripts (`npm run dev`, `npm run backend`, `npm run frontend`) using `concurrently` to start both backend and frontend simultaneously
- **`README.md`**: Project overview and available scripts
- **`FEATURE_AUDIT.md`**: Audit report documenting current feature status, issues, and priorities
- **`FINAL_AUDIT.md`: Independent senior QA audit with severity breakdown and remaining work
- **`IDEAS_Deva`**: Complete build specification and design requirements document (500+ pages)
- **.gitignore**: Git exclusion patterns

### Backend (`backend/`)
The backend is a TypeScript/Node.js Express application with clean architecture:

- **`src/`**: Original source code (the primary analysis target)
  - **`index.ts`**: Entry point - configures Express, CORS, routes, and error middleware; starts the server
  - **`config/env.ts`**: Environment variable configuration (port, Supabase URLs, frontend URL)
  - **`lib/supabase.ts`**: Supabase client creation - uses service role key for admin operations, anonymous key for client ops
  - **`middleware/`**: Express middleware for auth (`requireAuth`) and error handling
  - **`controllers/`**: Thin HTTP handlers that validate input and delegate to services
  - **`services/`**: Business logic layer - orchestrate repositories, enforce rules, return formatted responses
  - **`repositories/`**: Database operations - direct Supabase queries (insert, select, update, delete)
  - **`routes/`**: Express route definitions composing controllers
  - **`validators/`**: Zod schemas for input validation
  - **`types/`**: Shared TypeScript interfaces

- **`dist/`**: Compiled JavaScript output (generated from `src/` TypeScript)

### Frontend (`frontend/`)
A Next.js application with Expo Router for navigation:

- **`app/`**: Next.js/app Router containing all pages, layouts, and route segments
  - **`(auth)/`**: Authentication flow screens (login, register, forgot-password)
  - **`(onboarding)/`**: Onboarding flow (welcome, class creation/joining)
  - **`(tabs)/`**: Bottom-tab navigation container with individual screens
  - **`(auth)/_layout.tsx`**: Auth layout component
  - **`(onboarding)/_layout.tsx`**: Onboarding layout component
  - **`(tabs)/_layout.tsx`**: Tab navigation layout component
  - **`camera/`**: Camera and preview screens
  - **`class/[classId].tsx`**: Class detail screen
  - **`post/[postId].tsx`**: Individual post detail screen
  - **`edit/[postId].tsx`**: Post editing screen
  - **`settings.tsx`**: User settings screen
  - **`splash.tsx`**: Splash/start screen
  - **`index.tsx`**: Root/app entry point
  - **`layout.tsx`**: Global layout component
  - **`_layout.tsx`**: Global layout component

- **`components/ui/`**: Reusable UI component library (buttons, cards, inputs, etc.)
- **`hooks/`**: Custom React hooks (useAuth, useClass, useNotifications)
- **`constants/`**: Theme colors, prompts, spacing, typography
- **`lib/`**: Utility libraries (photo-draft for local photo management, supabase clients, social-preview mock data)
- **`dist/`**: Built distribution files

### Database (`database/`)
- **`migrations/`**: SQL migrations that define and evolve the schema (5 migration files)
- **`seed.sql`**: Development seed data for initial setup

### Generated/Artifacts (Excluded from exhaustive analysis)
- **`node_modules/`**: Third-party dependencies (not original source code)
- **`*.next/`**: Next.js build output, turbopack cache, and server-side render artifacts
- **`frontend/dist/`**: Compiled frontend assets
- **`backend/dist/`**: Compiled backend JavaScript
- **`*.tsbuildinfo`**: TypeScript build information files
- **`.next/`**: Turbopack cache and build manifest