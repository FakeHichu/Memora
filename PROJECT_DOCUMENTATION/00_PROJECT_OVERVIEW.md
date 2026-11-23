# 00_PROJECT_OVERVIEW.md

## Project Introduction

**Memora** is a full-stack private class memory application designed for schools, colleges, friend groups, clubs, and private communities. The core concept is centered around a simple but powerful product rule: **one photo per person, per day, per class/group**. Over time, this builds a private, chronological collection of shared memories that can eventually become a digital yearbook.

The application is architected with a strongly separated frontend-backend-boundary, where the frontend is treated as a replaceable presentation layer and all business logic, authorization, and data persistence lives in the backend with a Supabase PostgreSQL database.

## Technology Stack

### Frontend
- **Framework**: Expo 57 + React Native 0.86 with TypeScript
- **Navigation**: Expo Router (file-based routing with support for deep linking)
- **UI Library**: Custom component library using React Native components
- **Styling**: Tailwind CSS-inspired theming via JavaScript objects (catppuccin-inspired palette)
- **State Management**: React useState + AsyncStorage for local persistence
- **HTTP Client**: Native fetch API with Bearer token authentication
- **Navigation Library**: expo-router
- **Image Handling**: expo-image-manipulator for compression, expo-image-picker for camera/gallery
- **AsyncStorage**: @react-native-async-storage/async-storage for local data persistence
- **Dependencies**: zod (validation), minimatch, glob, @opentui/solid

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **ORM/Database**: Supabase (PostgreSQL) with raw SQL migrations
- **Authentication**: Supabase Auth (email/password, Bearer tokens)
- **Storage**: Supabase Storage (private bucket: `class-photos`)
- **API**: RESTful endpoints under `/api/`
- **Dependencies**: zod, express, @supabase/supabase-js, bcryptjs, jsonwebtoken

### Database
- **Technology**: Supabase PostgreSQL
- **Migrations**: 5 SQL migration files (001-005)
- **Schema**: Complete relational schema with tables for users, classes/groups, posts, reactions, comments, reports, notifications, etc.

### Key Features (Planned/Partial)
1. Daily photo posting with one-photo-per-day enforcement
2. Class/group creation and membership management
3. Photo feed viewing for class members
4. Reaction/like system (heart, laugh, cry, fire, dead, respect)
5. Comment system with threaded replies
6. Profile management
7. Search functionality
8. Invite codes for class joining
9. Streak tracking (individual and group)
10. Storage with private signed URLs
11. Admin dashboard capabilities
12. Time capsules, yearbooks, memory timeline

## Overall Purpose

Memora enables private communities to capture and preserve daily moments as a shared photographic archive. Unlike public social networks, Memora focuses on:
- **Privacy**: All photos stored privately, never publicly accessible
- **Simplicity**: One photo per day per member - the core constraint
- **Nostalgia**: Building chronological memories over time (yearbooks, then vs now)
- **Community**: Class-specific interactions without outside interference

The application is designed so the frontend can be completely redesigned without requiring major backend changes, preserving API stability and database schema integrity.

## Architecture Philosophy

The project follows a **clean API/service/repository architecture**:

```
Frontend (React Native/Expo)
    ↓ (fetch API calls)
Backend (Express + TypeScript)
    ↓ (Supabase Client)
Database (PostgreSQL)
    ↓ (Row Level Security)
Storage (Supabase private bucket)
```

Key design decisions:
- **Service layer** contains business logic, keeping controllers thin
- **Repository layer** abstracts database operations
- **Row Level Security (RLS)** in Supabase for data access control
- **Private storage bucket** with signed URLs for photo access
- **Service-role key** for backend operations that need admin privileges
- **Environment-based configuration** for different deployment stages