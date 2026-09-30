insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('class-photos', 'class-photos', false, 10485760, array['image/jpeg'])
on conflict (id) do nothing;

alter table public.class_members enable row level security;

 drop policy if exists "Users can read their own class memberships" on public.class_members;
create policy "Users can read their own class memberships"
  on public.class_members for select to authenticated
  using (user_id = auth.uid());

alter table public.daily_posts enable row level security;

drop policy if exists "Class members can read daily posts" on public.daily_posts;
create policy "Class members can read daily posts"
  on public.daily_posts for select to authenticated
  using (
    exists (
      select 1
      from public.class_members membership
      where membership.class_id = daily_posts.class_id
        and membership.user_id = auth.uid()
    )
  );

drop policy if exists "Class members can create their own daily posts" on public.daily_posts;
create policy "Class members can create their own daily posts"
  on public.daily_posts for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.class_members membership
      where membership.class_id = daily_posts.class_id
        and membership.user_id = auth.uid()
    )
  );

drop policy if exists "Class members can read class photos" on storage.objects;
create policy "Class members can read class photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'class-photos'
    and exists (
      select 1
      from public.class_members membership
      where membership.class_id::text = (storage.foldername(name))[1]
        and membership.user_id = auth.uid()
    )
  );

drop policy if exists "Members can upload their own class photos" on storage.objects;
create policy "Members can upload their own class photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'class-photos'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1
      from public.class_members membership
      where membership.class_id::text = (storage.foldername(name))[1]
        and membership.user_id = auth.uid()
    )
  );

drop policy if exists "Members can remove their own class photos" on storage.objects;
create policy "Members can remove their own class photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'class-photos'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1
      from public.class_members membership
      where membership.class_id::text = (storage.foldername(name))[1]
        and membership.user_id = auth.uid()
    )
  );
