-- Migration 008: Bug fixes, security improvements, and missing features

-- ============================================================================
-- 1. Add member_count column to classes table (used by frontend)
-- ============================================================================
alter table public.classes
  add column if not exists member_count integer not null default 1;

-- Keep member_count in sync via trigger
create or replace function public.update_class_member_count()
returns trigger language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    update public.classes
    set member_count = (select count(*) from public.class_members where class_id = new.class_id)
    where id = new.class_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.classes
    set member_count = (select count(*) from public.class_members where class_id = old.class_id)
    where id = old.class_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_update_class_member_count on public.class_members;
create trigger trg_update_class_member_count
  after insert or delete on public.class_members
  for each row execute function public.update_class_member_count();

-- Initialize member_count for existing classes
update public.classes c
set member_count = (
  select count(*) from public.class_members cm where cm.class_id = c.id
);

-- ============================================================================
-- 2. Add comments table (migration 005 may have created it; this is idempotent)
-- ============================================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.daily_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null check (char_length(content) > 0 and char_length(content) <= 1000),
  is_edited boolean not null default false,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_comments_created_at on public.comments(created_at);

-- RLS for comments
alter table public.comments enable row level security;

drop policy if exists "Class members can view comments" on public.comments;
create policy "Class members can view comments"
  on public.comments for select to authenticated
  using (
    exists (
      select 1
      from public.daily_posts dp
      join public.class_members cm on cm.class_id = dp.class_id
      where dp.id = comments.post_id
        and cm.user_id = auth.uid()
    )
  );

drop policy if exists "Class members can add comments" on public.comments;
create policy "Class members can add comments"
  on public.comments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.daily_posts dp
      join public.class_members cm on cm.class_id = dp.class_id
      where dp.id = post_id
        and cm.user_id = auth.uid()
    )
  );

drop policy if exists "Authors can update their comments" on public.comments;
create policy "Authors can update their comments"
  on public.comments for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Authors can delete their comments" on public.comments;
create policy "Authors can delete their comments"
  on public.comments for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- 3. Add RLS to profiles table (missing in original schema)
-- ============================================================================
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select to authenticated
  using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- ============================================================================
-- 4. Add RLS to classes table
-- ============================================================================
alter table public.classes enable row level security;

drop policy if exists "Class members can view their classes" on public.classes;
create policy "Class members can view their classes"
  on public.classes for select to authenticated
  using (
    exists (
      select 1 from public.class_members
      where class_members.class_id = classes.id
        and class_members.user_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can create classes" on public.classes;
create policy "Authenticated users can create classes"
  on public.classes for insert to authenticated
  with check (created_by = auth.uid());

drop policy if exists "Class owners can update their class" on public.classes;
create policy "Class owners can update their class"
  on public.classes for update to authenticated
  using (
    exists (
      select 1 from public.class_members
      where class_members.class_id = classes.id
        and class_members.user_id = auth.uid()
        and class_members.role = 'owner'
    )
  );

-- ============================================================================
-- 5. Additional class_members RLS policies (allow members to see all members in their class)
-- ============================================================================
drop policy if exists "Class members can see all members in their class" on public.class_members;
create policy "Class members can see all members in their class"
  on public.class_members for select to authenticated
  using (
    exists (
      select 1 from public.class_members cm
      where cm.class_id = class_members.class_id
        and cm.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. Add cover_image_path and join_requests to classes
-- ============================================================================
alter table public.classes
  add column if not exists cover_image_path text,
  add column if not exists description text;

-- ============================================================================
-- 7. Add notifications RLS
-- ============================================================================
alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update to authenticated
  using (user_id = auth.uid());

drop policy if exists "Service can insert notifications" on public.notifications;
create policy "Service can insert notifications"
  on public.notifications for insert to authenticated
  with check (true);

-- ============================================================================
-- 8. Add bio column to profiles if not exists
-- ============================================================================
alter table public.profiles
  add column if not exists bio text,
  add column if not exists avatar_url text;

-- ============================================================================
-- 9. Create join_requests table for circle membership requests
-- ============================================================================
create table if not exists public.class_join_requests (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  message text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  unique (class_id, user_id)
);

create index if not exists idx_join_requests_class_id on public.class_join_requests(class_id);
create index if not exists idx_join_requests_user_id on public.class_join_requests(user_id);
create index if not exists idx_join_requests_status on public.class_join_requests(status);

alter table public.class_join_requests enable row level security;

create policy "Users can see their own requests"
  on public.class_join_requests for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.class_members
      where class_members.class_id = class_join_requests.class_id
        and class_members.user_id = auth.uid()
        and class_members.role in ('owner', 'admin')
    )
  );

create policy "Users can submit join requests"
  on public.class_join_requests for insert to authenticated
  with check (user_id = auth.uid());

create policy "Class owners/admins can update requests"
  on public.class_join_requests for update to authenticated
  using (
    exists (
      select 1 from public.class_members
      where class_members.class_id = class_join_requests.class_id
        and class_members.user_id = auth.uid()
        and class_members.role in ('owner', 'admin')
    )
  );

-- ============================================================================
-- 10. Update storage bucket to support PNG and WebP in addition to JPEG
-- ============================================================================
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
where id = 'class-photos';

-- ============================================================================
-- 11. Add storage policy for circle_posts bucket (migration 007 circle photos)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('circle-photos', 'circle-photos', false, 20971520, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Circle members can read circle photos" on storage.objects;
create policy "Circle members can read circle photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'circle-photos'
    and exists (
      select 1
      from public.circle_members
      where circle_members.circle_id::text = (storage.foldername(name))[1]
        and circle_members.user_id = auth.uid()
    )
  );

drop policy if exists "Circle members can upload circle photos" on storage.objects;
create policy "Circle members can upload circle photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'circle-photos'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1
      from public.circle_members
      where circle_members.circle_id::text = (storage.foldername(name))[1]
        and circle_members.user_id = auth.uid()
    )
  );

drop policy if exists "Circle members can delete their circle photos" on storage.objects;
create policy "Circle members can delete their circle photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'circle-photos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
