# Security model

## Core security principles

- The mobile app is never a trust boundary.
- Authorization must be enforced by Supabase RLS and database constraints.
- Storage is private and never public.
- Signed URLs are short-lived and class-scoped.
- Client-side validation is supplemental, not authoritative.

## Access policy summary

- Profiles: users can read and update their own record.
- Classes: members can read only classes they are in.
- Posts: members can read posts from joined classes only.
- Reactions: users can create reactions only as themselves.
- Reports: users can create reports and view only their own records where appropriate.
- Moderation: admin and owner roles are authorized at the database and policy layer.

## Storage rules

- Bucket name: `class-photos`
- No public access.
- Topic path is scoped by class and date.
- Access is granted only after membership verification and signed URL generation.

## Important non-negotiables

- No service-role keys in the client.
- No public bucket exposure.
- No client-side role trust.
- No direct access to other users’ class photos.

## Future implementation

This project currently documents the security model and the required architecture. Full RLS enforcement and security tests should be applied once the project reaches the production-ready phases.
