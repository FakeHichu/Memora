-- Migration 007: Circles - Private photo sharing groups within classes

-- Create circles table
create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'archived'))
);

-- Create circle_members table
create table if not exists public.circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (circle_id, user_id)
);

-- Create circle_posts table (photos shared only within a specific circle)
create table if not exists public.circle_posts (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_path text not null,
  caption text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Create circle_post_reactions table
create table if not exists public.circle_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.circle_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('heart', 'laugh', 'cry', 'fire', 'dead', 'respect')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id, reaction_type)
);

-- Create circle_post_comments table
create table if not exists public.circle_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.circle_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.circle_post_comments(id) on delete cascade,
  content text not null,
  is_edited boolean not null default false,
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

-- Create user_active_circle table (tracks which circle a user is currently viewing)
create table if not exists public.user_active_circle (
  user_id uuid primary key references auth.users(id) on delete cascade,
  circle_id uuid not null references public.circles(id) on delete cascade,
  last_accessed timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_circles_class_id on public.circles(class_id);
create index if not exists idx_circles_created_by on public.circles(created_by);
create index if not exists idx_circle_members_circle_id on public.circle_members(circle_id);
create index if not exists idx_circle_members_user_id on public.circle_members(user_id);
create index if not exists idx_circle_posts_circle_id on public.circle_posts(circle_id);
create index if not exists idx_circle_posts_user_id on public.circle_posts(user_id);
create index if not exists idx_circle_posts_created_at on public.circle_posts(created_at);
create index if not exists idx_circle_post_reactions_post_id on public.circle_post_reactions(post_id);
create index if not exists idx_circle_post_reactions_user_id on public.circle_post_reactions(user_id);
create index if not exists idx_circle_post_comments_post_id on public.circle_post_comments(post_id);
create index if not exists idx_circle_post_comments_user_id on public.circle_post_comments(user_id);
create index if not exists idx_user_active_circle_circle_id on public.user_active_circle(circle_id);

-- Grant permissions
grant all on public.circles to public, anon, authenticated;
grant all on public.circle_members to public, anon, authenticated;
grant all on public.circle_posts to public, anon, authenticated;
grant all on public.circle_post_reactions to public, anon, authenticated;
grant all on public.circle_post_comments to public, anon, authenticated;
grant all on public.user_active_circle to public, anon, authenticated;

-- RLS Policies

-- Circles: users can view circles they're members of
alter table public.circles enable row level security;

create policy "Users can view circles they are members of"
  on public.circles for select
  using (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circles.id
      and circle_members.user_id = auth.uid()
    )
  );

create policy "Circle creators can insert circles"
  on public.circles for insert
  with check (created_by = auth.uid());

create policy "Circle owners can update circles"
  on public.circles for update
  using (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circles.id
      and circle_members.user_id = auth.uid()
      and circle_members.role = 'owner'
    )
  );

-- Circle Members: members can view other members in their circle
alter table public.circle_members enable row level security;

create policy "Users can view circle members in their circles"
  on public.circle_members for select
  using (
    exists (
      select 1 from public.circle_members cm
      where cm.circle_id = circle_members.circle_id
      and cm.user_id = auth.uid()
    )
  );

create policy "Circle owners can add members"
  on public.circle_members for insert
  with check (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circle_members.circle_id
      and circle_members.user_id = auth.uid()
      and circle_members.role in ('owner', 'admin')
    )
  );

-- Circle Posts: only circle members can view posts
alter table public.circle_posts enable row level security;

create policy "Circle members can view circle posts"
  on public.circle_posts for select
  using (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circle_posts.circle_id
      and circle_members.user_id = auth.uid()
    )
  );

create policy "Circle members can create posts"
  on public.circle_posts for insert
  with check (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circle_posts.circle_id
      and circle_members.user_id = auth.uid()
    )
    and user_id = auth.uid()
  );

create policy "Post authors can update their posts"
  on public.circle_posts for update
  using (user_id = auth.uid());

create policy "Post authors can delete their posts"
  on public.circle_posts for delete
  using (user_id = auth.uid());

-- Circle Post Reactions
alter table public.circle_post_reactions enable row level security;

create policy "Circle members can view reactions"
  on public.circle_post_reactions for select
  using (
    exists (
      select 1 from public.circle_posts
      join public.circle_members on circle_members.circle_id = circle_posts.circle_id
      where circle_posts.id = circle_post_reactions.post_id
      and circle_members.user_id = auth.uid()
    )
  );

create policy "Circle members can add reactions"
  on public.circle_post_reactions for insert
  with check (user_id = auth.uid());

create policy "Users can delete their own reactions"
  on public.circle_post_reactions for delete
  using (user_id = auth.uid());

-- Circle Post Comments
alter table public.circle_post_comments enable row level security;

create policy "Circle members can view comments"
  on public.circle_post_comments for select
  using (
    exists (
      select 1 from public.circle_posts
      join public.circle_members on circle_members.circle_id = circle_posts.circle_id
      where circle_posts.id = circle_post_comments.post_id
      and circle_members.user_id = auth.uid()
    )
  );

create policy "Circle members can add comments"
  on public.circle_post_comments for insert
  with check (user_id = auth.uid());

create policy "Comment authors can update comments"
  on public.circle_post_comments for update
  using (user_id = auth.uid());

create policy "Comment authors can delete comments"
  on public.circle_post_comments for delete
  using (user_id = auth.uid());

-- User Active Circle
alter table public.user_active_circle enable row level security;

create policy "Users can view their own active circle"
  on public.user_active_circle for select
  using (user_id = auth.uid());

create policy "Users can set their own active circle"
  on public.user_active_circle for insert
  with check (user_id = auth.uid());

create policy "Users can update their own active circle"
  on public.user_active_circle for update
  using (user_id = auth.uid());
