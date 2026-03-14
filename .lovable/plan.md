

## Fix: Referrals INSERT Policy Vulnerability

### Problem
The `referrals` table INSERT policy only checks `referred_id = auth.uid()` but doesn't validate `referrer_id`. A user could forge referral records via direct API calls, triggering the `handle_referral_bonus()` trigger and generating fraudulent coins.

### Context
Referrals are legitimately created only by the `handle_new_user()` trigger (SECURITY DEFINER), which already validates the referral code against `profiles`. Client-side code never inserts into `referrals` directly.

### Fix
Remove the permissive INSERT policy for authenticated users entirely. The trigger runs as SECURITY DEFINER and bypasses RLS, so legitimate inserts still work. No client code needs this policy.

| Change | Detail |
|---|---|
| Drop RLS policy | `DROP POLICY "Authenticated users can insert referrals" ON referrals` |

No code changes needed — only a database migration to drop the policy.

