
-- Update handle_new_user to process referral codes
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _referrer_id uuid;
  _ref_code text;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Process referral code if present
  _ref_code := NEW.raw_user_meta_data->>'referral_code';
  IF _ref_code IS NOT NULL AND _ref_code != '' THEN
    SELECT id INTO _referrer_id FROM public.profiles WHERE referral_code = _ref_code;
    IF _referrer_id IS NOT NULL AND _referrer_id != NEW.id THEN
      INSERT INTO public.referrals (referrer_id, referred_id)
      VALUES (_referrer_id, NEW.id)
      ON CONFLICT (referred_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
