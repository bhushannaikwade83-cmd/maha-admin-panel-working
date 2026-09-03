CREATE TABLE public.societies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  postal_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.societies TO authenticated;
GRANT ALL ON public.societies TO service_role;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage societies" ON public.societies FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  society_id uuid REFERENCES public.societies(id) ON DELETE SET NULL,
  secretary_name text NOT NULL,
  phone text,
  is_committee boolean NOT NULL DEFAULT false,
  is_enabled boolean NOT NULL DEFAULT true,
  approval_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.members TO authenticated;
GRANT ALL ON public.members TO service_role;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage members" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_members_society_id ON public.members(society_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_societies_updated_at BEFORE UPDATE ON public.societies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();