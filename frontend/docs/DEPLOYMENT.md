# Deployment guide

## Local development

- install dependencies using `npm install`
- set environment variables in `.env`
- run `npx expo start` or `npm start`
- test in Expo Go or an emulator

## Supabase setup

1. Create a Supabase project.
2. Run migrations in `supabase/migrations`.
3. Create a private bucket named `class-photos`.
4. Set up auth redirect URLs for your mobile app.
5. Configure PostgreSQL storage and RLS policies.

## Production checklist

- use production Supabase project settings
- enable row-level security
- restrict storage bucket access
- validate environment variables
- confirm notification and auth configuration
- run TypeScript and lint validation before release
