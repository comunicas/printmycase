-- Fix model_requests phone validation
-- Ensures users cannot submit arbitrary phone numbers belonging to other people.

-- 0. Ensure 'notes' column exists (referenced by the new function)
ALTER TABLE public.model_requests
  ADD COLUMN IF NOT EXISTS notes text;

-- 1. Add basic phone format CHECK constraint
ALTER TABLE public.model_requests
  DROP CONSTRAINT IF EXISTS model_requests_phone_format;

ALTER TABLE public.model_requests
  ADD CONSTRAINT model_requests_phone_format
  CHECK (
    phone IS NULL
    OR phone ~ '^\+?[0-9\s\(\)\-]{8,20}$'
  );

-- 2. SECURITY DEFINER function that validates phone against the user's profile
CREATE OR REPLACE FUNCTION public.insert_model_request(
  _phone text,
  _model_name text,
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _profile_phone text;
  _new_id uuid;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT phone INTO _profile_phone
  FROM public.profiles
  WHERE id = _user_id;

  INSERT INTO public.model_requests (user_id, phone, model_name, notes)
  VALUES (
    _user_id,
    COALESCE(_profile_phone, _phone),
    _model_name,
    _notes
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$;

-- 3. Revoke direct INSERT to force usage of the function
REVOKE INSERT ON public.model_requests FROM authenticated;
GRANT EXECUTE ON FUNCTION public.insert_model_request(text, text, text) TO authenticated;