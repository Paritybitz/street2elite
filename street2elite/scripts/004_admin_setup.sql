-- Add admin role to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('parent', 'admin', 'coach')) DEFAULT 'parent';

-- Create admin user (update with real admin email)
UPDATE public.profiles SET role = 'admin' WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@street2elite.com'
);

-- Add RLS policies for admin access
CREATE POLICY "admins_can_view_all_profiles" ON public.profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'coach')
  )
);

CREATE POLICY "admins_can_view_all_children" ON public.children FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'coach')
  )
);

CREATE POLICY "admins_can_view_all_bookings" ON public.bookings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'coach')
  )
);

CREATE POLICY "admins_can_manage_sessions" ON public.sessions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'coach')
  )
);

CREATE POLICY "admins_can_manage_bookings" ON public.bookings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'coach')
  )
);
