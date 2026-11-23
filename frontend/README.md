# Camera App

A private daily-photo platform for classmates, built with Expo, React Native, TypeScript, and Supabase.

## Overview

This project follows the private-yearbook pattern described in the product brief: users join a class, receive a daily prompt, post exactly one photo per day, and browse a class timeline protected by Supabase security policies.

## Tech stack

- React Native + Expo
- Expo Router
- TypeScript
- Supabase Auth + PostgreSQL + Storage
- TanStack Query
- Expo Camera / Image Picker / Image Manipulator
- Expo Notifications

## Local setup

1. Install dependencies:
   npm install
2. Copy `.env.example` to `.env` and fill in your Supabase values.
3. Start Expo:
   npm start
4. Run on a device or emulator:
   npm run android
   npm run ios

## Environment variables

Required values in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_SCHEME`

## Supabase setup

- Create a new Supabase project.
- Run the migration under `../database/migrations`.
- Configure a private bucket named `class-photos`.
- Enable Row Level Security on all tables and storage objects.
- Configure auth and email redirect URLs if needed.

## Scripts

- `npm start` — run Expo dev client
- `npm run android` — Android simulator
- `npm run ios` — iOS simulator
- `npm run web` — web preview
- `npm run lint` — ESLint checks
- `npm run typecheck` — TypeScript verification
- `npm run format` — Prettier formatting

## Security notes

- Never expose a Supabase service-role key in the client.
- Never make the storage bucket public.
- Always authorize class membership server-side and via RLS.
- Signed image URLs are the only media delivery path for class members.

## Production checklist

- secure environment variables
- verify RLS for all tables
- test storage authorization
- verify daily post uniqueness
- review notification preferences
- validate moderation workflow

## Roadmap

See `docs/ROADMAP.md` for future features and phased delivery information.
