DO $$
DECLARE
  fk record;
BEGIN
  -- Move references from duplicate landlord rows to the newest kept landlord row for each user.
  FOR fk IN
    SELECT
      conrelid::regclass AS child_table,
      a.attname AS child_column
    FROM pg_constraint c
    JOIN pg_attribute a
      ON a.attrelid = c.conrelid
     AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'f'
      AND c.confrelid = 'public.landlords'::regclass
      AND array_length(c.conkey, 1) = 1
  LOOP
    EXECUTE format($sql$
      WITH ranked AS (
        SELECT
          id,
          user_id,
          first_value(id) OVER (
            PARTITION BY user_id
            ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
          ) AS keep_id
        FROM public.landlords
        WHERE user_id IS NOT NULL
      ), dupes AS (
        SELECT id, keep_id
        FROM ranked
        WHERE id <> keep_id
      )
      UPDATE %s child
      SET %I = dupes.keep_id
      FROM dupes
      WHERE child.%I = dupes.id
    $sql$, fk.child_table, fk.child_column, fk.child_column);
  END LOOP;
END $$;

-- Delete duplicate landlord rows after references have been moved.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.landlords
  WHERE user_id IS NOT NULL
)
DELETE FROM public.landlords l
USING ranked r
WHERE l.id = r.id
  AND r.rn > 1;

-- Make ON CONFLICT (user_id) valid and keep one landlord profile per user.
ALTER TABLE public.landlords
  ADD CONSTRAINT landlords_user_id_key UNIQUE (user_id);

-- Remove older duplicate triggers so approval runs once.
DROP TRIGGER IF EXISTS landlord_requests_on_approval ON public.landlord_requests;
DROP TRIGGER IF EXISTS on_landlord_request_review ON public.landlord_requests;

CREATE OR REPLACE FUNCTION public.handle_landlord_request_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can approve landlord requests';
    END IF;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'landlord')
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.landlords (user_id, full_name, phone)
    VALUES (NEW.user_id, NEW.full_name, NEW.phone)
    ON CONFLICT (user_id) DO UPDATE
      SET full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          updated_at = now();

    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can reject landlord requests';
    END IF;

    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_landlord_request_review
BEFORE UPDATE OF status ON public.landlord_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_landlord_request_approval();