ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS reservation_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'reservation_click'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'impression_type')
  ) THEN
    ALTER TYPE public.impression_type ADD VALUE 'reservation_click';
  END IF;
END$$;