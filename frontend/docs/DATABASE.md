# Database overview

The application is designed for a PostgreSQL instance managed by Supabase, with the following primary tables:

- profiles
- classes
- class_members
- daily_prompts
- daily_posts
- reactions
- reports
- notifications
- device_tokens
- admin_actions

## Core rules

- Use UUID primary keys for all app-owned records.
- Use `created_at` and `updated_at` timestamps where applicable.
- Enforce `ONE PHOTO PER USER PER CLASS PER DAY` with a unique constraint on `(class_id, user_id, post_date)`.
- Use a private storage bucket and signed URLs for media delivery.
- Require all authorization logic to pass through database policies and RLS.

## Migration entry point

See `../database/migrations/001_initial_schema.sql` for the base schema and constraints.
