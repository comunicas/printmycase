import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_ORIGINS = [
  "https://printmycase.com.br",
  "https://studio.printmycase.com.br",
];
const DEFAULT_ORIGIN = "https://studio.printmycase.com.br";

function getSafeOrigin(req: Request): string {
  const raw = req.headers.get("origin") || req.headers.get("referer") || "";
  try {
    const url = new URL(raw);
    const origin = url.origin;
    if (ALLOWED_ORIGINS.includes(origin)) return origin;
    if (origin.endsWith(".lovable.app")) return origin;
  } catch { /* invalid URL */ }
  return DEFAULT_ORIGIN;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.warn("[checkout] Missing or invalid Authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      console.warn("[checkout] Auth claims error:", claimsError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const { product_id, design_id, customization_data, raw_image_url, original_image_url, edited_image_url, shipping_cents, address_id, address_inline, save_address, initiate_checkout_event_id } = await req.json();

    const isCollectionPurchase = !!design_id;

    console.log("[checkout] Start:", JSON.stringify({
      userId,
      productId: product_id,
      designId: design_id || null,
      isCollection: isCollectionPurchase,
      shippingCents: shipping_cents || 0,
      addressId: address_id || null,
      hasInlineAddress: !!address_inline,
      saveAddress: !!save_address,
    }));

    if (!product_id) {
      console.warn("[checkout] Missing product_id");
      return new Response(JSON.stringify({ error: "product_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("active", true)
      .single();

    if (productError || !product) {
      console.error("[checkout] Product not found:", product_id, productError?.message);
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch design if collection purchase
    let design = null;
    if (isCollectionPurchase) {
      const { data: designData, error: designError } = await supabaseAdmin
        .from("collection_designs")
        .select("*")
        .eq("id", design_id)
        .eq("active", true)
        .single();
      if (designError || !designData) {
        console.error("[checkout] Design not found:", design_id, designError?.message);
        return new Response(JSON.stringify({ error: "Design not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      design = designData;
    }

    // Resolve shipping address
    let shippingAddress = null;
    let resolvedAddressId = address_id || null;

    if (address_id) {
      const { data: addr } = await supabaseAdmin
        .from("addresses")
        .select("*")
        .eq("id", address_id)
        .eq("user_id", userId)
        .single();
      if (!addr) {
        console.warn("[checkout] Address not found or access denied:", address_id);
        return new Response(JSON.stringify({ error: "Address not found or access denied" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      shippingAddress = {
        street: addr.street, number: addr.number, complement: addr.complement,
        neighborhood: addr.neighborhood, city: addr.city, state: addr.state,
        zip_code: addr.zip_code, label: addr.label,
      };
    } else if (address_inline) {
      shippingAddress = {
        street: address_inline.street, number: address_inline.number,
        complement: address_inline.complement, neighborhood: address_inline.neighborhood,
        city: address_inline.city, state: address_inline.state,
        zip_code: address_inline.zip_code, label: address_inline.label || "Casa",
      };

      if (save_address) {
        const { data: newAddr, error: addrError } = await supabaseAdmin
          .from("addresses")
          .insert({
            user_id: userId,
            street: address_inline.street,
            number: address_inline.number,
            complement: address_inline.complement || null,
            neighborhood: address_inline.neighborhood,
            city: address_inline.city,
            state: address_inline.state,
            zip_code: address_inline.zip_code,
            label: address_inline.label || "Casa",
          })
          .select("id")
          .single();
        if (addrError) {
          console.error("[checkout] Failed to save address:", addrError.message);
        } else if (newAddr) {
          resolvedAddressId = newAddr.id;
          console.log("[checkout] Address saved:", newAddr.id);
        }
      }
    }

    const origin = getSafeOrigin(req);
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const shippingValue = shipping_cents ? Number(shipping_cents) : 0;
    const itemPriceCents = isCollectionPurchase ? design!.price_cents : product.price_cents;
    const totalCents = itemPriceCents + shippingValue;
    const itemName = isCollectionPurchase
      ? `Capa ${design!.name} - ${product.name}`
      : `Capa Personalizada - ${product.name}`;

    console.log("[checkout] Price:", JSON.stringify({
      itemPriceCents,
      shippingValue,
      totalCents,
      origin,
    }));

    const params = new URLSearchParams();
    params.append("payment_method_types[0]", "card");
    params.append("mode", "payment");

    const stripePriceId = isCollectionPurchase ? design!.stripe_price_id : product.stripe_price_id;

    if (stripePriceId) {
      params.append("line_items[0][price]", stripePriceId);
    } else {
      params.append("line_items[0][price_data][currency]", "brl");
      params.append("line_items[0][price_data][unit_amount]", String(itemPriceCents));
      params.append("line_items[0][price_data][product_data][name]", itemName);
      params.append("line_items[0][price_data][product_data][description]", isCollectionPurchase ? "Capa com design de coleção" : (product.description || "Capa de celular personalizada"));
    }
    params.append("line_items[0][quantity]", "1");

    if (shippingValue > 0) {
      params.append("line_items[1][price_data][currency]", "brl");
      params.append("line_items[1][price_data][unit_amount]", String(shippingValue));
      params.append("line_items[1][price_data][product_data][name]", "Frete");
      params.append("line_items[1][price_data][product_data][description]", "Envio para todo o Brasil");
      params.append("line_items[1][quantity]", "1");
    }

    const eventId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    params.append("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&eid=${eventId}`);
    params.append("cancel_url", `${origin}/customize/${product.slug}`);
    params.append("metadata[user_id]", userId);
    params.append("metadata[product_id]", product_id);
    params.append("metadata[event_id]", eventId);
    params.append("metadata[origin_url]", origin);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("[checkout] Stripe API error:", JSON.stringify(session.error));
      throw new Error(session.error?.message || "Stripe API error");
    }

    console.log("[stripe-session] Created:", JSON.stringify({ id: session.id, url: session.url?.slice(0, 60) }));

    const { data: orderData, error: orderError } = await supabaseAdmin.from("orders").insert({
      user_id: userId,
      product_id,
      design_id: design_id || null,
      total_cents: totalCents,
      shipping_cents: shippingValue || null,
      shipping_address: shippingAddress,
      address_id: resolvedAddressId,
      stripe_session_id: session.id,
      customization_data: isCollectionPurchase ? null : {
        ...customization_data,
        raw_image_url: raw_image_url || null,
        original_image_url: original_image_url || null,
        edited_image_url: edited_image_url || null,
      },
      status: "pending",
    }).select("id").single();

    if (orderError) {
      console.error("[checkout] Order insert failed:", orderError.message);
    } else {
      console.log("[order] Created:", orderData?.id);
    }

    // Clean up pending checkout draft (only for customizable orders)
    if (!isCollectionPurchase) {
      const { error: deleteError } = await supabaseAdmin
        .from("pending_checkouts")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", product_id);
      if (deleteError) {
        console.warn("[checkout] Failed to clean pending_checkouts:", deleteError.message);
      }
    }

    // Fire InitiateCheckout CAPI event
    if (initiate_checkout_event_id) {
      const userEmail = claimsData.claims.email as string | undefined;
      const capiBody: Record<string, unknown> = {
        event_name: "InitiateCheckout",
        event_id: initiate_checkout_event_id,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: origin,
        user_data: { ...(userEmail ? { em: userEmail } : {}) },
        custom_data: { content_ids: [product_id], content_type: "product", value: itemPriceCents / 100, currency: "BRL" },
      };
      const capiUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/meta-capi`;
      fetch(capiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-cron-secret": Deno.env.get("CRON_SECRET") || "" },
        body: JSON.stringify(capiBody),
      }).catch((e) => console.error("[capi] InitiateCheckout error:", e.message));
    }

    console.log("[checkout] Complete for user:", userId);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[checkout] Unhandled error:", (err as Error).message, (err as Error).stack);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
