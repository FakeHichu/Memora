-- Initial schema foundation for the private class memory app.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school_name text,
  academic_year integer not null,
  join_code text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'archived'))
);

create table if not exists class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (class_id, user_id)
);

create table if not exists daily_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_text text not null,
  prompt_date date not null unique,
  created_at timestamptz not null default now()
);

create table if not exists daily_posts (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_path text not null,
  prompt_id uuid references daily_prompts(id),
  post_date date not null,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (class_id, user_id, post_date)
);

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references daily_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('heart', 'laugh', 'cry', 'fire', 'dead', 'respect')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction_type)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references daily_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id),
  reason text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed', 'removed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null,
  platform text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  admin_id uuid not null references auth.users(id),
  action_type text not null,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_class_members_class_id on class_members(class_id);
create index if not exists idx_class_members_user_id on class_members(user_id);
create index if not exists idx_daily_posts_class_date on daily_posts(class_id, post_date);
create index if not exists idx_daily_posts_user_date on daily_posts(user_id, post_date);
create index if not exists idx_daily_posts_class_created_at on daily_posts(class_id, created_at);
create index if not exists idx_reactions_post_id on reactions(post_id);
create index if not exists idx_reports_status on reports(status);
create index if not exists idx_notifications_user_read_at on notifications(user_id, read_at);
