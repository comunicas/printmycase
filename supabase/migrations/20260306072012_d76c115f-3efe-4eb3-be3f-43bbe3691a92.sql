DROP TRIGGER IF EXISTS trigger_referral_code ON public.profiles;
DROP TRIGGER IF EXISTS trigger_signup_bonus ON public.profiles;
DROP TRIGGER IF EXISTS trigger_referral_bonus ON public.referrals;

CREATE TRIGGER trigger_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_code();

CREATE TRIGGER trigger_signup_bonus
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_signup_bonus();

CREATE TRIGGER trigger_referral_bonus
  AFTER INSERT ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_referral_bonus();