# Memora - Class Memory Sharing App

A private, class-based photo sharing application built with React Native (Expo) and Node.js backend.

![Memora Logo](https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=82)

## 📱 Overview

Memora helps classes capture and share daily moments through photos. Users can create or join classes, upload photos with daily prompts, and view a filtered feed of memories from their class community.

## ✨ Features

### Class Management
- Create private class circles with 8-character join codes
- Join classes using invitation codes
- Automatic owner assignment and member role management
- View all classes you're a member of

### Daily Posts
- Upload daily photos with captions
- Daily prompts to inspire memories
- Class-wide feed showing all members' posts
- Reaction system (heart, laugh, cry, fire, dead, respect)
- Comment on posts

### Security
- JWT authentication via Supabase
- Row-level security (RLS) for data isolation
- Member-only access to class content
- Unique and validated join codes

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Supabase account
- Expo CLI
- Android Studio (for Android testing) or iOS Simulator

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

Backend runs on `http://localhost:4000`

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npx expo start
```

**Platform-specific backend URLs:**
- **Web**: `EXPO_PUBLIC_BACKEND_URL=http://localhost:4000`
- **Android Emulator**: `EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:4000`
- **Physical Android**: `EXPO_PUBLIC_BACKEND_URL=http://YOUR_LOCAL_IP:4000`
- **iOS Simulator**: `EXPO_PUBLIC_BACKEND_URL=http://localhost:4000`

## 📁 Project Structure

```
memora/
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Database access
│   │   ├── middleware/   # Auth & error handling
│   │   ├── validators/   # Input validation (Zod)
│   │   └── routes/       # API routes
│   └── package.json
│
├── frontend/             # React Native (Expo)
│   ├── app/             # File-based routing
│   │   ├── (auth)/      # Login, register
│   │   ├── (onboarding)/ # Create/join class
│   │   └── (tabs)/      # Main app tabs
│   ├── components/      # Reusable UI
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utilities & Supabase client
│
└── database/
    └── migrations/       # Supabase schema
```

## 🔑 Environment Variables

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
EXPO_PUBLIC_BACKEND_URL=http://10.0.2.2:4000
EXPO_PUBLIC_APP_NAME=Memora
EXPO_PUBLIC_APP_SCHEME=memora
```

> ⚠️ **Important**: Never commit `.env` files to version control. The service role key must only exist in the backend.

## 🧪 Testing

### Backend Commands

```bash
npm run build      # TypeScript compilation
npm run typecheck  # Type checking only
npm run dev        # Development server
```

### Frontend Commands

```bash
npx expo start         # Start dev server
npx expo start -c      # Clear cache and start
npx expo start --web   # Web only
```

### Manual Test Flow

1. **Create Class**: User A creates "CS 2024" → receives 8-char code
2. **Join Class**: User B enters code → successfully joins
3. **Verify**: Both users see class in their list
4. **Duplicate Check**: User B rejoins → handled gracefully
5. **Invalid Code**: User C tries "FAKE1234" → error shown
```

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles
- `classes` - Class circles
- `class_members` - Class membership with roles
- `daily_posts` - Photo posts with date
- `reactions` - Post reactions (heart, laugh, etc.)
- `daily_prompts` - Daily photo prompts

### Key Constraints
- Unique join codes (8 characters)
- Unique class membership per user
- One post per user per day per class
```

## 🛠️ Development Commands

### Backend

```bash
npm run dev        # Start dev server with watch
npm run build      # Compile TypeScript
npm run start      # Run compiled code
npm run typecheck  # Check types without building
```

### Frontend

```bash
npx expo start         # Start dev server
npx expo start -c      # Clear cache and start
npx expo start --web   # Web only
npx expo start --android # Android only
npx expo start --ios   # iOS only
```
```

## 🐛 Common Issues & Solutions

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Frontend can't connect to backend
1. Check backend is running: `curl http://localhost:4000`
2. Verify `.env` has correct URL for your platform
3. For Android: Use `10.0.2.2` not `localhost`
4. Restart Expo: Press `r` in terminal

### Database errors
1. Check Supabase dashboard for logs
2. Verify migrations are applied
3. Check service role key is correct
3. Ensure RPC function `create_class_with_owner` exists

### Android emulator connection
1. Backend URL must be `http://10.0.2.2:4000`
2. Backend must be running on host machine
3. Restart Expo dev server after `.env` changes
4. Clear Expo cache: `npx expo start -c`
```

## 🔐 Security Notes

- Never commit `.env` files to version control
- Service role key only in backend (never frontend)
- All API endpoints require authentication
- RLS policies enforce data isolation
- Join codes are unique and validated
```

## 📦 Database Migrations

Apply migrations in order via Supabase Dashboard SQL Editor or CLI:

1. `001_initial_schema.sql` - Core tables
2. `002_class_creation_rpc.sql` - Atomic class creation
3. `003_daily_photo_storage_policies.sql` - Storage RLS
4. `004_extended_schema.sql` - Groups & advanced features
5. `005_comments_reactions.sql` - Social features

```
```

## 🚢 Deployment

### Backend
- Configure environment variables in hosting platform
- Build: `npm run build`
- Start: `npm run start`
- Ensure port 4000 accessible (or configure PORT env var)

### Frontend
```bash
# Build for production
npx expo build:android
npx expo build:ios
npx expo build:web

# Or use EAS Build
eas build --platform android
eas build --platform ios
```
```

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Build backend: `cd backend && npm run build`
5. Commit with descriptive message
6. Create pull request
```

## 📄 License

Private project - All rights reserved

## 🆘 Support

For issues or questions:
1. Check this README
2. Review `.env.example` files
3. Check Supabase dashboard logs
4. Review backend logs

**Last Updated**: 2026

**Version**: 1.0.0