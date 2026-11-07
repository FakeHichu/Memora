-- Migration 004: Add groups, event albums, time capsules, and extended features

-- Create groups table (extends classes concept for broader use cases)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_image text,
  is_private boolean not null default true,
  invite_only boolean not null default false,
  join_code text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'archived'))
);

-- Create group_members table
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

-- Create group_invitations table
create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  inviter_id uuid not null references auth.users(id),
  email text not null,
  code text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  unique (group_id, email)
);

-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create event_albums table
create table if not exists public.event_albums (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  cover_photo text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create album_photos table
create table if not exists public.album_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.event_albums(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_path text not null,
  caption text,
  created_at timestamptz not null default now(),
  unique (album_id, photo_path)
);

-- Create saved_memories table
create table if not exists public.saved_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.daily_posts(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

-- Create memory_notes table
create table if not exists public.memory_notes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.daily_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- Create time_capsules table
create table if not exists public.time_capsules (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete set null,
  creator_id uuid not null references auth.users(id),
  title text not null,
  description text,
  created_at timestamz not null default now(),
  unlock_date timestamptz not null,
  is_group_capsule boolean not null default false,
  participant_ids uuid[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'unlocked', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create time_capsule_items table
create table if not exists public.time_capsule_items (
  id uuid primary key default gen_random_uuid(),
  capsule_id uuid not null references public.time_capsules(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid references public.daily_posts(id) on delete set null,
  content_type text not null check (content_type in ('photo', 'video', 'message')),
  content_path text,
  created_at timestamptz not null default now(),
  unique (capsule_id, user_id, post_id)
);

-- Create blocked_users table
create table if not exists public.blocked_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, blocked_user_id)
);

-- Create audit_logs table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Create yearbooks table
create table if not exists public.yearbooks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  year integer not null,
  title text,
  generated_at timestamptz,
  cover_photo text,
  generated_by uuid references auth.users(id),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create yearbook_members table
create table if not exists public.yearbook_members (
  id uuid primary key default gen_random_uuid(),
  yearbook_id uuid not null references public.yearbooks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  can_view boolean not null default true,
  can_contribute boolean not null default true,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  added_at timestamptz not null default now(),
  unique (yearbook_id, user_id)
);

-- Create class_group bridge for legacy compatibility
create table if not exists public.class_group_bridge (
  class_id uuid not null references public.classes(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  primary (class_id, group_id)
);

-- Create indexes

create index if not exists idx_groups_join_code on public.groups(join_code);
create index if not exists idx_groups_created_by on public.groups(created_by);
create index if not exists idx_group_members_group_id on public.group_members(group_id);
create index if not exists idx_group_members_user_id on public.group_members(user_id);
create index if not exists idx_group_invitations_group_id on public.group_invitations(group_id);
create index if not exists idx_group_invitations_code on public.group_invitations(code);
create index if not exists idx_events_group_id on public.events(group_id);
create index if not exists idx_events_created_by on public.events(created_by);
create index if not exists idx_event_albums_event_id on public.event_albums(event_id);
create index if not exists idx_event_albums_group_id on public.event_albums(group_id);
create index if not exists idx_album_photos_album_id on public.album_photos(album_id);
create index if not exists idx_saved_memories_user_id on public.saved_memories(user_id);
create index if not exists idx_saved_memories_post_id on public.saved_memories(post_id);
create index if not exists idx_memory_notes_post_id on public.memory_notes(post_id);
create index if not exists idx_memory_notes_user_id on public.memory_notes(user_id);
create index if not exists idx_time_capsules_group_id on public.time_capsules(group_id);
create index if not exists idx_time_capsules_creator_id on public.time_capsules(creator_id);
create index if not exists idx_time_capsules_status on public.time_capsules(status);
create index if not exists idx_time_capsule_items_capsule_id on public.time_capsule_items(capsule_id);
create index if not exists idx_time_capsule_items_user_id on public.time_capsule_items(user_id);
create index if not exists idx_blocked_users_user_id on public.blocked_users(user_id);
create index if not exists idx_blocked_users_blocked_user_id on public.blocked_users(blocked_user_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_yearbooks_group_id on public.yearbooks(group_id);
create index if not exists idx_yearbook_members_yearbook_id on public.yearbook_members(yearbook_id);
create index if not exists idx_yearbook_members_user_id on public.yearbook_members(user_id);
create index if not exists idx_class_group_bridge_class_id on public.class_group_bridge(class_id);
create index if not exists idx_class_group_bridge_group_id on public.class_group_bridge(group_id);

-- Grant permissions
grant all on public.groups to public, anon, authenticated;
grant all on public.group_members to public, anon, authenticated;
grant all on public.group_invitations to public, anon, authenticated;
grant all on public.events to public, anon, authenticated;
grant all on public.event_albums to public, anon, authenticated;
grant all on public.album_photos to public, anon, authenticated;
grant all on public.saved_memories to public, anon, authenticated;
grant all on public.memory_notes to public, anon, authenticated;
grant all on public.time_capsules to public, anon, authenticated;
grant all on public.time_capsule_items to public, anon, authenticated;
grant all on public.blocked_users to public, anon, authenticated;
grant all on public.audit_logs to public, anon, authenticated;
grant all on public.yearbooks to public, anon, authenticated;
grant all on public.yearbook_members to public, anon, authenticated;
grant all on public.class_group_bridge to public, anon, authenticated;