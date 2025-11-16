-- Remove the blanket denial policy that blocks profile creation
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- The existing policies already provide proper protection:
-- - Users can only view their own profile
-- - Users can only update their own profile  
-- - Admins can view all profiles
-- - Profile creation is handled by the secure trigger function with SECURITY DEFINER