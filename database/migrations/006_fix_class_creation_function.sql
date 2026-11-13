
-- Memora: Fix class creation and invitation code generation

CREATE OR REPLACE FUNCTION public.create_class_with_owner(
    class_name text,
    class_school_name text,
    class_academic_year integer,
    owner_user_id uuid
)
RETURNS public.classes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
    created_class public.classes;
    generated_code text;
    attempt integer;
BEGIN
    FOR attempt IN 1..10 LOOP

        generated_code := upper(
            substring(
                replace(pg_catalog.gen_random_uuid()::text, '-', ''),
                1,
                8
            )
        );

        INSERT INTO public.classes (
            name,
            school_name,
            academic_year,
            join_code,
            created_by
        )
        VALUES (
            class_name,
            class_school_name,
            class_academic_year,
            generated_code,
            owner_user_id
        )
        ON CONFLICT (join_code) DO NOTHING
        RETURNING * INTO created_class;

        IF FOUND THEN
            EXIT;
        END IF;

    END LOOP;

    IF created_class.id IS NULL THEN
        RAISE EXCEPTION
            'Unable to generate a unique class invitation code after 10 attempts';
    END IF;

    INSERT INTO public.class_members (
        class_id,
        user_id,
        role
    )
    VALUES (
        created_class.id,
        owner_user_id,
        'owner'
    );

    RETURN created_class;
END;
$$;

REVOKE ALL ON FUNCTION
    public.create_class_with_owner(text, text, integer, uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
    public.create_class_with_owner(text, text, integer, uuid)
TO service_role;
