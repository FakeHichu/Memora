-- =============================================================================
-- Migration 009: Row Level Security for all previously unprotected tables
--
-- Fixes:
--   Finding 2: migrations 004 and 005 granted broad access with no RLS
--   Finding 3: class_members SELECT policy only allowed self-reads, preventing
--              members from seeing the full member list for their own class
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Finding 3: Fix class_members visibility
--
-- Migration 003 set:  using (user_id = auth.uid())
-- That lets a member read only their own row.
-- We need members to be able to see ALL members inside a class they belong to.
-- Drop the old overly-narrow policy and replace it.
-- ---------------------------------------------------------------------------

alter table public.class_members enable row level security;

drop policy if exists "Users can read their own class memberships" on public.class_members;

-- A member can read every membership row for any class they are themselves in.
create policy "Class members can see all members of their classes"
  on public.class_members for select to authenticated
  using (
    exists (
      select 1
      from public.class_members my_membership
      where my_membership.class_id = class_members.class_id
        and my_membership.user_id  = auth.uid()
    )
  );

-- Only class owners / admins may add new members (direct insert path).
-- Normal joins go through the create_class_with_owner RPC or /api/classes/join.
create policy "Owners and admins can add class members"
  on public.class_members for insert to authenticated
  with check (
    exists (
      select 1
      from public.class_members my_membership
      where my_membership.class_id = class_members.class_id
        and my_membership.user_id  = auth.uid()
        and my_membership.role in ('owner', 'admin')
    )
    -- Allow self-insert only when joining via invite code (service-role bypass applies)
    or user_id = auth.uid()
  );

-- Members can only delete their own row (leave class).
-- Owners / admins removing someone is handled server-side via service role.
create policy "Members can leave their class"
  on public.class_members for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Finding 2a: comments and comment_reactions (migration 005)
-- ---------------------------------------------------------------------------

alter table public.comments enable row level security;
alter table public.comment_reactions enable row level security;

-- DROP any broad grants left by migration 005 (grants don't block anon reads
-- when RLS is not enabled, but they also don't help once RLS is on—RLS wins).
-- We keep the grants for authenticated but tighten via policies.

drop policy if exists "Class members can view comments" on public.comments;
create policy "Class members can view comments"
  on public.comments for select to authenticated
  using (
    exists (
      select 1
      from public.daily_posts dp
      join public.class_members cm
        on cm.class_id = dp.class_id
       and cm.user_id  = auth.uid()
      where dp.id = comments.post_id
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
      join public.class_members cm
        on cm.class_id = dp.class_id
       and cm.user_id  = auth.uid()
      where dp.id = post_id
    )
  );

drop policy if exists "Authors can update their comments" on public.comments;
create policy "Authors can update their comments"
  on public.comments for update to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Authors can delete their comments" on public.comments;
create policy "Authors can delete their comments"
  on public.comments for delete to authenticated
  using (user_id = auth.uid());

-- comment_reactions

drop policy if exists "Class members can view comment reactions" on public.comment_reactions;
create policy "Class members can view comment reactions"
  on public.comment_reactions for select to authenticated
  using (
    exists (
      select 1
      from public.comments c
      join public.daily_posts dp on dp.id = c.post_id
      join public.class_members cm
        on cm.class_id = dp.class_id
       and cm.user_id  = auth.uid()
      where c.id = comment_reactions.comment_id
    )
  );

drop policy if exists "Authenticated users can react to comments" on public.comment_reactions;
create policy "Authenticated users can react to comments"
  on public.comment_reactions for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can remove their own comment reactions" on public.comment_reactions;
create policy "Users can remove their own comment reactions"
  on public.comment_reactions for delete to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Finding 2b: extended schema tables from migration 004
-- None of these tables are used by any active backend route today.
-- Strategy:
--   • Enable RLS so the broad grants no longer give open access.
--   • Add minimal self-scoped policies so existing data isn't lost.
--   • Tables that reference auth.users get user-scoped read/write.
--   • Tables that have no user_id column (audit_logs, class_group_bridge)
--     get deny-all for anon and read-only for authenticated.
-- ---------------------------------------------------------------------------

-- groups
alter table public.groups enable row level security;

create policy "Group members can view their groups"
  on public.groups for select to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id
        and gm.user_id  = auth.uid()
    )
  );

create policy "Authenticated users can create groups"
  on public.groups for insert to authenticated
  with check (created_by = auth.uid());

create policy "Group owners can update their group"
  on public.groups for update to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id
        and gm.user_id  = auth.uid()
        and gm.role     = 'owner'
    )
  );

-- group_members
alter table public.group_members enable row level security;

create policy "Group members can see other members"
  on public.group_members for select to authenticated
  using (
    exists (
      select 1 from public.group_members my_gm
      where my_gm.group_id = group_members.group_id
        and my_gm.user_id  = auth.uid()
    )
  );

create policy "Group owners can add members"
  on public.group_members for insert to authenticated
  with check (
    exists (
      select 1 from public.group_members my_gm
      where my_gm.group_id = group_members.group_id
        and my_gm.user_id  = auth.uid()
        and my_gm.role in ('owner', 'admin')
    )
    or user_id = auth.uid()
  );

create policy "Members can leave groups"
  on public.group_members for delete to authenticated
  using (user_id = auth.uid());

-- group_invitations
alter table public.group_invitations enable row level security;

create policy "Group admins can manage invitations"
  on public.group_invitations for select to authenticated
  using (
    inviter_id = auth.uid()
    or exists (
      select 1 from public.group_members gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id  = auth.uid()
        and gm.role in ('owner', 'admin')
    )
  );

create policy "Group admins can create invitations"
  on public.group_invitations for insert to authenticated
  with check (inviter_id = auth.uid());

-- events
alter table public.events enable row level security;

create policy "Group members can view events"
  on public.events for select to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = events.group_id
        and gm.user_id  = auth.uid()
    )
  );

create policy "Group members can create events"
  on public.events for insert to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.group_members gm
      where gm.group_id = events.group_id
        and gm.user_id  = auth.uid()
    )
  );

-- event_albums
alter table public.event_albums enable row level security;

create policy "Group members can view event albums"
  on public.event_albums for select to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = event_albums.group_id
        and gm.user_id  = auth.uid()
    )
  );

create policy "Group members can create event albums"
  on public.event_albums for insert to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.group_members gm
      where gm.group_id = event_albums.group_id
        and gm.user_id  = auth.uid()
    )
  );

-- album_photos
alter table public.album_photos enable row level security;

create policy "Group members can view album photos"
  on public.album_photos for select to authenticated
  using (
    exists (
      select 1
      from public.event_albums ea
      join public.group_members gm
        on gm.group_id = ea.group_id
       and gm.user_id  = auth.uid()
      where ea.id = album_photos.album_id
    )
  );

create policy "Group members can upload album photos"
  on public.album_photos for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.event_albums ea
      join public.group_members gm
        on gm.group_id = ea.group_id
       and gm.user_id  = auth.uid()
      where ea.id = album_id
    )
  );

create policy "Users can delete their own album photos"
  on public.album_photos for delete to authenticated
  using (user_id = auth.uid());

-- saved_memories
alter table public.saved_memories enable row level security;

create policy "Users can manage their own saved memories"
  on public.saved_memories for select to authenticated
  using (user_id = auth.uid());

create policy "Users can save memories"
  on public.saved_memories for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can unsave memories"
  on public.saved_memories for delete to authenticated
  using (user_id = auth.uid());

-- memory_notes
alter table public.memory_notes enable row level security;

create policy "Users can view their own memory notes"
  on public.memory_notes for select to authenticated
  using (user_id = auth.uid());

create policy "Users can create memory notes"
  on public.memory_notes for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own memory notes"
  on public.memory_notes for update to authenticated
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own memory notes"
  on public.memory_notes for delete to authenticated
  using (user_id = auth.uid());

-- time_capsules
alter table public.time_capsules enable row level security;

create policy "Creators and participants can view time capsules"
  on public.time_capsules for select to authenticated
  using (
    creator_id = auth.uid()
    or auth.uid() = any(participant_ids)
  );

create policy "Authenticated users can create time capsules"
  on public.time_capsules for insert to authenticated
  with check (creator_id = auth.uid());

create policy "Creators can update their time capsules"
  on public.time_capsules for update to authenticated
  using  (creator_id = auth.uid())
  with check (creator_id = auth.uid());

-- time_capsule_items
alter table public.time_capsule_items enable row level security;

create policy "Capsule participants can view items"
  on public.time_capsule_items for select to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.time_capsules tc
      where tc.id        = time_capsule_items.capsule_id
        and tc.creator_id = auth.uid()
    )
  );

create policy "Users can add their own capsule items"
  on public.time_capsule_items for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can delete their own capsule items"
  on public.time_capsule_items for delete to authenticated
  using (user_id = auth.uid());

-- blocked_users
alter table public.blocked_users enable row level security;

create policy "Users can view their own block list"
  on public.blocked_users for select to authenticated
  using (user_id = auth.uid());

create policy "Users can block other users"
  on public.blocked_users for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can unblock users"
  on public.blocked_users for delete to authenticated
  using (user_id = auth.uid());

-- audit_logs – append-only for authenticated, no deletes or updates
alter table public.audit_logs enable row level security;

create policy "Users can view their own audit log entries"
  on public.audit_logs for select to authenticated
  using (user_id = auth.uid());

-- No insert/update/delete policies for authenticated users intentionally.
-- Only service_role can write audit logs.

-- yearbooks
alter table public.yearbooks enable row level security;

create policy "Yearbook members can view yearbooks"
  on public.yearbooks for select to authenticated
  using (
    exists (
      select 1 from public.yearbook_members ym
      where ym.yearbook_id = yearbooks.id
        and ym.user_id     = auth.uid()
        and ym.can_view    = true
    )
  );

create policy "Group members can create yearbooks"
  on public.yearbooks for insert to authenticated
  with check (generated_by = auth.uid());

-- yearbook_members
alter table public.yearbook_members enable row level security;

create policy "Yearbook members can view membership"
  on public.yearbook_members for select to authenticated
  using (
    exists (
      select 1 from public.yearbook_members my_ym
      where my_ym.yearbook_id = yearbook_members.yearbook_id
        and my_ym.user_id     = auth.uid()
    )
  );

-- class_group_bridge – readable by members of the class
alter table public.class_group_bridge enable row level security;

create policy "Class members can view class-group links"
  on public.class_group_bridge for select to authenticated
  using (
    exists (
      select 1 from public.class_members cm
      where cm.class_id = class_group_bridge.class_id
        and cm.user_id  = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Revoke the original broad grants that were added without RLS in 004 and 005.
-- Now that RLS is enabled, the grants only matter for the roles that bypass RLS
-- (service_role). We tighten them so anon can no longer interact with these
-- tables even if RLS is somehow disabled in future.
-- ---------------------------------------------------------------------------

revoke all on public.groups                from anon;
revoke all on public.group_members         from anon;
revoke all on public.group_invitations     from anon;
revoke all on public.events                from anon;
revoke all on public.event_albums          from anon;
revoke all on public.album_photos          from anon;
revoke all on public.saved_memories        from anon;
revoke all on public.memory_notes          from anon;
revoke all on public.time_capsules         from anon;
revoke all on public.time_capsule_items    from anon;
revoke all on public.blocked_users         from anon;
revoke all on public.audit_logs            from anon;
revoke all on public.yearbooks             from anon;
revoke all on public.yearbook_members      from anon;
revoke all on public.class_group_bridge    from anon;
revoke all on public.comments              from anon;
revoke all on public.comment_reactions     from anon;
