# Backend

This folder contains the server-side layer for the Camera App.

## Current setup

- Express API with TypeScript
- Supabase client integration for server-side data access
- validation using Zod
- health and readiness endpoints for local verification

## Run locally

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Then start the API:

```bash
npm run dev
```

## API endpoints

- `GET /api/health` — simple service health status
- `GET /api/ready` — checks whether the Supabase environment is configured and reachable
- `POST /api/classes` — requires a Supabase bearer access token and creates a class plus its owner membership
- `POST /api/posts/validate` — validates a post payload; this endpoint does not persist a post yet

Class creation calls `create_class_with_owner` from `database/migrations/002_class_creation_rpc.sql`. Apply the database migrations before using this endpoint. Keep `SUPABASE_SERVICE_ROLE_KEY` on the server only; the frontend should send the signed-in user's Supabase access token as `Authorization: Bearer <token>`.

## Environment variables

```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:8081
```

## Notes

This backend layer is intended to hold privileged logic such as moderation, notifications, and database orchestration, while keeping the mobile app focused on the user experience.
