# Database

This folder contains the PostgreSQL schema and data definitions for the application.

## Contents

- `migrations/` — SQL migration files
- `seed.sql` — baseline sample data for local development

## Core design

The schema includes:

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

All critical access control is enforced through Supabase RLS and database constraints.
