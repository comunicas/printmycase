// Shared helper to build enriched user_data for Meta CAPI events.
// Fields are returned in PLAIN TEXT (the meta-capi function does the SHA-256 hashing).

type SupabaseAdmin = {
  auth: { admin: { getUserById: (id: string) => Promise<{ data: { user: { email?: string } | null } | null }> } };
  from: (table: string) => any;
};

export interface MetaUserDataInput {
  email?: string | null;
  externalId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
}

export function toCapiUserData(input: MetaUserDataInput): Record<string, string> {
  const out: Record<string, string> = {};
  if (input.email) out.em = input.email;
  if (input.externalId) out.external_id = input.externalId;
  if (input.firstName) out.fn = input.firstName;
  if (input.lastName) out.ln = input.lastName;
  if (input.phone) out.ph = input.phone;
  if (input.city) out.ct = input.city;
  if (input.state) out.st = input.state;
  if (input.zip) out.zp = input.zip;
  if (input.fbp) out.fbp = input.fbp;
  if (input.fbc) out.fbc = input.fbc;
  if (input.clientIpAddress) out.client_ip_address = input.clientIpAddress;
  if (input.clientUserAgent) out.client_user_agent = input.clientUserAgent;
  return out;
}

export async function buildMetaUserDataForUser(
  supabaseAdmin: SupabaseAdmin,
  userId: string,
  extras: { fbp?: string | null; fbc?: string | null; email?: string | null; clientIpAddress?: string | null; clientUserAgent?: string | null } = {},
): Promise<MetaUserDataInput> {
  let email = extras.email || null;
  let fullName = "";
  let phone: string | null = null;
  let city: string | null = null;
  let state: string | null = null;
  let zip: string | null = null;

  try {
    const [userRes, profileRes, addrRes] = await Promise.all([
      email ? Promise.resolve(null) : supabaseAdmin.auth.admin.getUserById(userId),
      supabaseAdmin.from("profiles").select("full_name, phone").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("addresses").select("city, state, zip_code, is_default, created_at").eq("user_id", userId).order("is_default", { ascending: false }).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (!email) email = (userRes as any)?.data?.user?.email ?? null;
    fullName = (profileRes as any)?.data?.full_name || "";
    phone = (profileRes as any)?.data?.phone || null;
    city = (addrRes as any)?.data?.city || null;
    state = (addrRes as any)?.data?.state || null;
    zip = (addrRes as any)?.data?.zip_code || null;
  } catch (_e) { /* best-effort */ }

  const { firstName, lastName } = splitName(fullName);

  return {
    email,
    externalId: userId,
    firstName,
    lastName,
    phone: normalizePhoneBR(phone),
    city: city ? city.trim() : null,
    state: state ? normalizeState(state) : null,
    zip: zip ? zip.replace(/\D/g, "") : null,
    fbp: extras.fbp || null,
    fbc: extras.fbc || null,
    clientIpAddress: extras.clientIpAddress || null,
    clientUserAgent: extras.clientUserAgent || null,
  };
}

function splitName(full: string): { firstName: string | null; lastName: string | null } {
  const trimmed = (full || "").trim();
  if (!trimmed) return { firstName: null, lastName: null };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: null };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function normalizePhoneBR(phone: string | null): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Add BR country code if missing (10 or 11 digits = local BR number)
  if (digits.length === 10 || digits.length === 11) digits = "55" + digits;
  return digits;
}

function normalizeState(state: string): string {
  // Meta expects 2-letter state codes lowercased; we keep as-is and lowercase below in hashing.
  const trimmed = state.trim();
  return trimmed;
}
