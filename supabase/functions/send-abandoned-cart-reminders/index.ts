import { createClient } from "npm:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const SITE_URL = "https://printmycase.com.br";

interface PendingRow {
  id: string;
  user_id: string;
  product_id: string;
  updated_at: string;
}

interface StepConfig {
  step: 1 | 2 | 3;
  minHours: number;
  maxHours: number;
}

// Janelas de tempo desde updated_at — cron a cada 30min, dá margem segura
const STEPS: StepConfig[] = [
  { step: 1, minHours: 1, maxHours: 6 },
  { step: 2, minHours: 24, maxHours: 30 },
  { step: 3, minHours: 72, maxHours: 78 },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== Deno.env.get("CRON_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  let totalSent = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  for (const cfg of STEPS) {
    const now = Date.now();
    const minTs = new Date(now - cfg.maxHours * 3600 * 1000).toISOString();
    const maxTs = new Date(now - cfg.minHours * 3600 * 1000).toISOString();

    const { data: pending, error } = await supabase
      .from("pending_checkouts")
      .select("id, user_id, product_id, updated_at")
      .gte("updated_at", minTs)
      .lte("updated_at", maxTs);

    if (error) {
      errors.push(`step ${cfg.step}: ${error.message}`);
      continue;
    }

    for (const row of (pending ?? []) as PendingRow[]) {
      const messageId = `abandoned-cart-${row.id}-${cfg.step}`;

      // Pular se já enviado/pendente
      const { data: existingLog } = await supabase
        .from("email_send_log")
        .select("status")
        .eq("message_id", messageId)
        .in("status", ["pending", "sent"])
        .limit(1)
        .maybeSingle();

      if (existingLog) {
        totalSkipped++;
        continue;
      }

      // Pular se usuário já completou pedido para esse produto após o updated_at
      const { data: paidOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", row.user_id)
        .eq("product_id", row.product_id)
        .neq("status", "pending")
        .gte("created_at", row.updated_at)
        .limit(1)
        .maybeSingle();

      if (paidOrder) {
        totalSkipped++;
        continue;
      }

      // Buscar email do usuário
      const { data: userResp, error: userErr } =
        await supabase.auth.admin.getUserById(row.user_id);
      if (userErr || !userResp?.user?.email) {
        totalSkipped++;
        continue;
      }
      const recipientEmail = userResp.user.email;

      // Buscar nome do produto + slug
      const isUuid = /^[0-9a-f-]{36}$/i.test(row.product_id);
      const productQuery = supabase
        .from("products")
        .select("name, slug, images, device_image")
        .limit(1);
      const { data: product } = await (isUuid
        ? productQuery.eq("id", row.product_id).maybeSingle()
        : productQuery.eq("slug", row.product_id).maybeSingle());

      const productName = product?.name ?? "sua capa personalizada";
      const productSlug = product?.slug ?? row.product_id;
      const productImageUrl =
        (product?.images && product.images[0]) ?? product?.device_image ?? null;

      // Nome do usuário
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", row.user_id)
        .maybeSingle();
      const userName =
        (profile?.full_name && profile.full_name.split(" ")[0]) ||
        recipientEmail.split("@")[0];

      const resumeUrl = `${SITE_URL}/customize/${productSlug}`;

      const { error: invokeError } = await supabase.functions.invoke(
        "send-transactional-email",
        {
          body: {
            templateName: "abandoned-cart-reminder",
            recipientEmail,
            messageId,
            idempotencyKey: messageId,
            templateData: {
              userName,
              productName,
              productImageUrl,
              resumeUrl,
              step: cfg.step,
            },
          },
        },
      );

      if (invokeError) {
        errors.push(`${messageId}: ${invokeError.message}`);
      } else {
        totalSent++;
      }
    }
  }

  return new Response(
    JSON.stringify({ sent: totalSent, skipped: totalSkipped, errors }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
