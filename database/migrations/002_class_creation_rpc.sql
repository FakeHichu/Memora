create or replace function public.create_class_with_owner(
  class_name text,
  class_school_name text,
  class_academic_year integer,
  owner_user_id uuid
)
returns public.classes
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  created_class public.classes;
begin
  loop
    begin
      insert into public.classes (
        name,
        school_name,
        academic_year,
        join_code,
        created_by
      )
      values (
        class_name,
        class_school_name,
        class_academic_year,
        upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8)),
        owner_user_id
      )
      returning * into created_class;

      exit;
    exception when unique_violation then
      -- Retry if the generated join code collides with an existing class.
      null;
    end;
  end loop;

  insert into public.class_members (class_id, user_id, role)
  values (created_class.id, owner_user_id, 'owner');

  return created_class;
end;
$$;

revoke all on function public.create_class_with_owner(text, text, integer, uuid) from public, anon, authenticated;
grant execute on function public.create_class_with_owner(text, text, integer, uuid) to service_role;
