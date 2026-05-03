import { supabase } from "@/integrations/supabase/client";

export async function invokeApplyAiFilter(params: {
  imageUrl: string;
  filterId: string;
  stepNumber: number;
  sessionId: string;
}) {
  return supabase.functions.invoke("apply-ai-filter", {
    body: {
      imageUrl: params.imageUrl,
      filterId: params.filterId,
      step_number: params.stepNumber,
      session_id: params.sessionId,
    },
  });
}

export async function invokeUpscaleImage(params: {
  imageUrl: string;
  stepNumber: number;
  sessionId: string;
}) {
  return supabase.functions.invoke("upscale-image", {
    body: {
      imageUrl: params.imageUrl,
      step_number: params.stepNumber,
      session_id: params.sessionId,
    },
  });
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&") + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function splitName(full?: string | null) {
  const t = (full || "").trim();
  if (!t) return { fn: null as string | null, ln: null as string | null };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { fn: parts[0], ln: null };
  return { fn: parts[0], ln: parts.slice(1).join(" ") };
}

function normalizePhoneBR(phone?: string | null): string | null {
  if (!phone) return null;
  let d = phone.replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return d;
}

async function buildEnrichedUserData(): Promise<Record<string, string>> {
  const ud: Record<string, string> = {
    client_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
  const fbp = getCookie("_fbp");
  const fbc = getCookie("_fbc");
  if (fbp) ud.fbp = fbp;
  if (fbc) ud.fbc = fbc;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return ud;
    ud.external_id = user.id;
    if (user.email) ud.em = user.email;

    const [profileRes, addrRes] = await Promise.all([
      supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
      supabase.from("addresses").select("city, state, zip_code, is_default, created_at").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    const { fn, ln } = splitName(profileRes.data?.full_name);
    if (fn) ud.fn = fn;
    if (ln) ud.ln = ln;
    const ph = normalizePhoneBR(profileRes.data?.phone);
    if (ph) ud.ph = ph;

    const addr = addrRes.data;
    if (addr?.city) ud.ct = addr.city.trim();
    if (addr?.state) ud.st = addr.state.trim();
    if (addr?.zip_code) ud.zp = addr.zip_code.replace(/\D/g, "");
  } catch { /* best-effort */ }

  return ud;
}

export async function invokeMetaCapiAddToCart(payload: {
  eventId: string;
  productId: string;
  value: number;
}) {
  const user_data = await buildEnrichedUserData();
  return supabase.functions.invoke("meta-capi", {
    body: {
      event_name: "AddToCart",
      event_id: payload.eventId,
      event_source_url: window.location.href,
      user_data,
      custom_data: {
        content_ids: [payload.productId],
        content_type: "product",
        value: payload.value,
        currency: "BRL",
      },
    },
  });
}

export { buildEnrichedUserData as buildMetaCapiUserData };
