CREATE TABLE public.seller_profiles (
 user_id uuid PRIMARY KEY,
 full_name text NOT NULL,
 email text NOT NULL,
 phone text NOT NULL,
 nid_number text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','suspended')),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seller_profiles TO authenticated;
GRANT ALL ON public.seller_profiles TO service_role;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller profile owner read" ON public.seller_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "seller profile admin read" ON public.seller_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE UNIQUE INDEX seller_phone_unique ON public.seller_profiles(phone);
CREATE TABLE public.seller_stores (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL UNIQUE REFERENCES public.seller_profiles(user_id),
 name text NOT NULL,
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 business_type text NOT NULL,
 address text NOT NULL,
 city text NOT NULL,
 district text NOT NULL,
 postal_code text NOT NULL,
 description text NOT NULL,
 contact_phone text NOT NULL,
 contact_email text NOT NULL,
 logo_path text NOT NULL DEFAULT '',
 banner_path text NOT NULL DEFAULT '',
 facebook text NOT NULL DEFAULT '',
 instagram text NOT NULL DEFAULT '',
 return_policy text NOT NULL DEFAULT '',
 shipping_policy text NOT NULL DEFAULT '',
 terms_accepted_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.seller_stores TO authenticated;
GRANT ALL ON public.seller_stores TO service_role;
ALTER TABLE public.seller_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller store owner read" ON public.seller_stores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "seller store admin read" ON public.seller_stores FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "seller store owner update" ON public.seller_stores FOR UPDATE TO authenticated USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.seller_profiles p WHERE p.user_id = auth.uid() AND p.status IN ('pending','approved'))) WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.submit_seller_application(p_full_name text, p_email text, p_phone text, p_nid text, p_name text, p_slug text, p_type text, p_address text, p_city text, p_district text, p_postal text, p_description text, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF current_user <> 'postgres' AND current_user <> 'service_role' AND session_user <> 'postgres' THEN
   NULL;
 END IF;
 INSERT INTO public.seller_profiles(user_id,full_name,email,phone,nid_number) VALUES(p_user_id,p_full_name,p_email,p_phone,p_nid);
 INSERT INTO public.seller_stores(user_id,name,slug,business_type,address,city,district,postal_code,description,contact_phone,contact_email) VALUES(p_user_id,p_name,p_slug,p_type,p_address,p_city,p_district,p_postal,p_description,p_phone,p_email);
END; $$;
REVOKE ALL ON FUNCTION public.submit_seller_application(text,text,text,text,text,text,text,text,text,text,text,text,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_seller_application(text,text,text,text,text,text,text,text,text,text,text,text,uuid) TO service_role;
CREATE POLICY "seller media owner read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'seller-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "seller media owner insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'seller-media' AND (storage.foldername(name))[1] = auth.uid()::text AND EXISTS(SELECT 1 FROM public.seller_profiles WHERE user_id = auth.uid() AND status IN ('pending','approved')));
CREATE POLICY "seller media owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'seller-media' AND (storage.foldername(name))[1] = auth.uid()::text);