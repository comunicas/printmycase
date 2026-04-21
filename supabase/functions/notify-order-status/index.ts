import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Auth: verify caller is admin ---
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
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

    const { data: claimsData, error: authError } = await supabaseUser.auth.getClaims(token);
    const callerUserId = claimsData?.claims?.sub as string | undefined;
    if (authError || !callerUserId) {
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
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Parse body ---
    const { order_id, new_status, rejection_reason } = await req.json();
    if (!order_id || !new_status) {
      return new Response(
        JSON.stringify({ error: "order_id and new_status required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
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
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userEmail = userRes.data.user.email;
    const userName = profileRes.data?.full_name || userEmail.split("@")[0];
    const productName = productRes.data?.name ?? order.product_id;

    // Send via send-transactional-email (must pass service role key explicitly)
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { error: sendError } = await supabaseAdmin.functions.invoke(
      "send-transactional-email",
      {
        headers: { Authorization: `Bearer ${serviceRoleKey}` },
        body: {
          templateName: "order-status-update",
          recipientEmail: userEmail,
          idempotencyKey: `order-status-${order_id}-${new_status}`,
          templateData: {
            userName,
            orderId: order_id,
            productName,
            newStatus: new_status,
            totalCents: order.total_cents,
            trackingCode: order.tracking_code,
            rejectionReason: rejection_reason || null,
          },
        },
      }
    );

    if (sendError) {
      console.error("[notify] send-transactional-email failed:", sendError);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
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
