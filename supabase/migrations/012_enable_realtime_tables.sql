DO $$$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'consultations') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'wallets') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'doctor_profiles') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.doctor_profiles;
    END IF;
  END IF;
END
$$$;
