-- Migration 005: Add comments table and enhance reactions

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.daily_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  is_edited boolean not null default false,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, parent_id, user_id, content)
);

-- Create comment_reactions table
create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('heart', 'laugh', 'cry', 'fire', 'dead', 'respect')),
  created_at timestamptz not null default now(),
  unique (comment_id, user_id, reaction_type)
);

-- Add column to daily_posts for comments count (optional, can be computed)
-- We'll compute it on queries rather than storing

-- Enhance existing reactions table if needed (already has unique constraint)
-- No changes needed - reactions table already has proper unique constraint

-- Add index for comment lookups
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_parent_id on public.comments(parent_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_comment_reactions_comment_id on public.comment_reactions(comment_id);
create index if not exists idx_comment_reactions_user_id on public.comment_reactions(user_id);

-- Grant permissions
grant all on public.comments to public, anon, authenticated;
grant all on public.comment_reactions to public, anon, authenticated;