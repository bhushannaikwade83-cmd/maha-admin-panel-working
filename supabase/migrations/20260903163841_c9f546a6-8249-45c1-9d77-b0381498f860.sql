DROP POLICY IF EXISTS "Authenticated users can manage societies" ON public.societies;
DROP POLICY IF EXISTS "Authenticated users can manage members" ON public.members;
DO $$ DECLARE r record; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname='public' AND tablename IN ('societies','members') LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.societies TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO anon, authenticated;
CREATE POLICY "Anyone can manage societies" ON public.societies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can manage members" ON public.members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);