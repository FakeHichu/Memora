# Architecture

## App structure

- `app/` contains the Expo Router screens and route groups.
- `components/` contains reusable UI primitives and business-safe presentational blocks.
- `lib/` holds Supabase and shared app utilities.
- `constants/` stores design tokens and central configuration.
- `supabase/` contains migrations and seed SQL.

## Core design principles

1. Keep all routing in Expo Router.
2. Centralize UI tokens in `constants/theme.ts`.
3. Keep business logic out of visual components.
4. Treat Supabase as the source of truth for auth, membership, and photos.
5. Prefer signed URLs and authenticated storage access over public URLs.

## Planned phases

- Phase 0: foundation and app shell
- Phase 1: authentication and protected routes
- Phase 2: database and RLS
- Phase 3: class system
- Phase 4: private storage and signed URLs
- Phase 5: daily photo upload and one-photo-per-day enforcement
- Phase 6: class feed and moderation
- Phase 7: notifications and prompts
- Phase 8: memories and yearbook foundation

## Notes

This repository currently contains the foundation described in the brief: app shell, route structure, design tokens, environment config, and migration scaffolding. The remaining business logic should be added incrementally as the project moves through the planned phases.
