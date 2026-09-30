# Camera App

An Expo web/mobile frontend, Express backend, and Supabase/PostgreSQL database. Run commands below from PowerShell at the project root unless a step says otherwise.

## Quick Start

Install dependencies once:

```powershell
npm install
npm install --prefix frontend
npm install --prefix backend
```

Start the full app:

```powershell
npm run dev
```

This runs the API at `http://localhost:4000` and starts the web app. Open the URL Expo prints in the terminal, usually `http://localhost:8081`. If that port is busy, Expo will select another one and print it.

## Run Only The Web App

```powershell
Set-Location frontend
npm run dev
```

## Run On A Phone

From the `frontend` folder, use `npm start` and scan the QR code with Expo Go. Or run `npm run android` / `npm run ios` to open a specific platform.

## Supabase Setup

The app currently works as a private, local photo journal without a database. Photos are compressed and stored in app-private storage; captions and dates are saved locally and remain after restarting the app. To add accounts and shared class posting later, create local env files from the examples:

```powershell
Copy-Item frontend/.env.example frontend/.env
Copy-Item backend/.env.example backend/.env
```

Set the Supabase URL and anon key in `frontend/.env`. Set the URL and service-role key in `backend/.env`; never put the service-role key in the frontend. Apply the SQL files in `database/migrations/` to your Supabase project before using class creation.

## Useful Commands

Run from the project root:

- `npm run dev` — start frontend and backend together
- `npm run frontend` — start only the web frontend
- `npm run backend` — start only the backend
- `npm run typecheck:frontend` — check frontend TypeScript
- `npm run typecheck:backend` — check backend TypeScript
