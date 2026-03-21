import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENDER_DOMAIN = "notify.printmycase.com.br";
const FROM = "PrintMyCase <noreply@notify.printmycase.com.br>";

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  analyzing: "Em Análise",
  customizing: "Customizando",
  producing: "Produzindo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "#9ca3af",
  paid: "#22c55e",
  analyzing: "#f59e0b",
  customizing: "#8b5cf6",
  producing: "#3b82f6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

function buildEmailHtml(params: {
  userName: string;
  orderId: string;
  productName: string;
  newStatus: string;
  totalCents: number;
  trackingCode?: string | null;
  appUrl: string;
  logoUrl: string;
}): string {
  const { userName, orderId, productName, newStatus, totalCents, trackingCode, appUrl, logoUrl } = params;
  const shortId = orderId.slice(0, 8);
  const statusLabel = statusLabels[newStatus] ?? newStatus;
  const statusColor = statusColors[newStatus] ?? "#8b5cf6";
  const price = (totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const trackingSection = newStatus === "shipped" && trackingCode
    ? `<tr><td style="padding:16px 0 0;">
        <p style="margin:0 0 8px;font-size:14px;color:#555;">Código de rastreio:</p>
        <p style="margin:0;font-size:16px;font-weight:600;font-family:monospace;color:#1a1a1a;">${trackingCode}</p>
        <a href="https://www.linkcorreios.com.br/?id=${trackingCode}" target="_blank" style="display:inline-block;margin-top:8px;font-size:13px;color:hsl(265,83%,57%);">Rastrear nos Correios →</a>
      </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center" style="padding:40px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
    <tr><td align="center" style="padding-bottom:32px;">
      <img src="${logoUrl}" alt="PrintMyCase" height="40" style="height:40px;width:auto;" />
    </td></tr>
    <tr><td>
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a1a;">Olá, ${userName}!</h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.5;">
        Seu pedido <strong>#${shortId}</strong> teve uma atualização de status.
      </p>
    </td></tr>
    <tr><td>
      <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;width:100%;">
        <tr><td style="padding:20px;">
          <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">Novo Status</p>
          <span style="display:inline-block;padding:6px 16px;border-radius:999px;font-size:14px;font-weight:600;color:#fff;background:${statusColor};">${statusLabel}</span>
        </td></tr>
        <tr><td style="padding:0 20px 20px;">
          <p style="margin:0;font-size:13px;color:#888;">Produto: <strong style="color:#1a1a1a;">${productName}</strong></p>
          <p style="margin:4px 0 0;font-size:13px;color:#888;">Total: <strong style="color:#1a1a1a;">${price}</strong></p>
        </td></tr>
      </table>
    </td></tr>
    ${trackingSection}
    <tr><td align="center" style="padding:32px 0;">
      <a href="${appUrl}/orders" target="_blank" style="display:inline-block;padding:14px 32px;background:hsl(265,83%,57%);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:1.5rem;">Ver Meus Pedidos</a>
    </td></tr>
    <tr><td align="center" style="padding-top:24px;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#aaa;">PrintMyCase — Capas personalizadas</p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[notify] Start");

    // --- Auth: verify caller is admin ---
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      console.error("[notify] Missing authorization token");
      return new Response(
        JSON.stringify({ error: "Missing authorization token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: userData, error: authError } = await supabaseUser.auth.getUser(token);
    const callerUserId = userData?.user?.id;
    if (authError || !callerUserId) {
      console.error("[notify] Invalid token:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: callerUserId,
      _role: "admin",
    });
    if (!isAdmin) {
      console.error("[notify] Forbidden: not admin, userId:", callerUserId);
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Parse body ---
    const { order_id, new_status } = await req.json();
    if (!order_id || !new_status) {
      return new Response(
        JSON.stringify({ error: "order_id and new_status required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[notify] Processing:", JSON.stringify({ order_id, new_status }));

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("[notify] Order not found:", orderError?.message);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user email + profile + product in parallel
    const [userRes, profileRes, productRes] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(order.user_id),
      supabaseAdmin.from("profiles").select("full_name").eq("id", order.user_id).single(),
      supabaseAdmin
        .from("products")
        .select("name")
        .or(`id.eq."${order.product_id}",slug.eq."${order.product_id}"`)
        .limit(1)
        .single(),
    ]);

    if (userRes.error || !userRes.data?.user?.email) {
      console.error("[notify] User not found:", userRes.error?.message);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userEmail = userRes.data.user.email;
    const userName = profileRes.data?.full_name || userEmail.split("@")[0];
    const productName = productRes.data?.name ?? order.product_id;
    const appUrl = Deno.env.get("APP_URL") || "https://studio.printmycase.com.br";
    const logoUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/email-assets/logo-printmycase.png`;

    const html = buildEmailHtml({
      userName,
      orderId: order_id,
      productName,
      newStatus: new_status,
      totalCents: order.total_cents,
      trackingCode: order.tracking_code,
      appUrl,
      logoUrl,
    });

    const statusLabel = statusLabels[new_status] ?? new_status;
    const shortId = order_id.slice(0, 8);

    // --- Enqueue email via pgmq ---
    const payload = {
      to: userEmail,
      from: FROM,
      sender_domain: SENDER_DOMAIN,
      subject: `Pedido #${shortId} — ${statusLabel}`,
      html,
      purpose: "transactional",
    };

    const { data: msgId, error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload,
    });

    if (enqueueError) {
      console.error("[notify] Enqueue failed:", enqueueError.message);
      return new Response(
        JSON.stringify({ error: "Failed to enqueue email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log to email_send_log
    await supabaseAdmin.from("email_send_log").insert({
      recipient_email: userEmail,
      template_name: "order_status_update",
      status: "pending",
      metadata: { order_id, new_status, msg_id: msgId },
    });

    console.log("[notify] Enqueued successfully:", JSON.stringify({ msgId, to: userEmail, status: new_status }));

    return new Response(
      JSON.stringify({ success: true, msg_id: msgId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[notify] Unhandled error:", (err as Error).message);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
