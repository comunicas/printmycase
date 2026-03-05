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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const { product_id, customization_data, original_image_url, edited_image_url, shipping_cents, address_id, address_inline, save_address } = await req.json();

    if (!product_id) {
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
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve shipping address
    let shippingAddress = null;
    let resolvedAddressId = address_id || null;

    if (address_id) {
      // Use saved address - verify ownership
      const { data: addr } = await supabaseAdmin
        .from("addresses")
        .select("*")
        .eq("id", address_id)
        .eq("user_id", userId)
        .single();
      if (!addr) {
        return new Response(JSON.stringify({ error: "Address not found or access denied" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      {
        shippingAddress = {
          street: addr.street, number: addr.number, complement: addr.complement,
          neighborhood: addr.neighborhood, city: addr.city, state: addr.state,
          zip_code: addr.zip_code, label: addr.label,
        };
      }
    } else if (address_inline) {
      // Use inline address from form
      shippingAddress = {
        street: address_inline.street, number: address_inline.number,
        complement: address_inline.complement, neighborhood: address_inline.neighborhood,
        city: address_inline.city, state: address_inline.state,
        zip_code: address_inline.zip_code, label: address_inline.label || "Casa",
      };

      // Save address if requested
      if (save_address) {
        const { data: newAddr } = await supabaseAdmin
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
        if (newAddr) resolvedAddressId = newAddr.id;
      }
    }

    const origin = req.headers.get("origin") || req.headers.get("referer") || "https://artiscase-v2.lovable.app";
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const shippingValue = shipping_cents ? Number(shipping_cents) : 0;
    const totalCents = product.price_cents + shippingValue;

    const params = new URLSearchParams();
    params.append("payment_method_types[0]", "card");
    params.append("mode", "payment");

    if (product.stripe_price_id) {
      params.append("line_items[0][price]", product.stripe_price_id);
    } else {
      params.append("line_items[0][price_data][currency]", "brl");
      params.append("line_items[0][price_data][unit_amount]", String(product.price_cents));
      params.append("line_items[0][price_data][product_data][name]", `Capa Personalizada - ${product.name}`);
      params.append("line_items[0][price_data][product_data][description]", product.description || "Capa de celular personalizada");
    }
    params.append("line_items[0][quantity]", "1");

    if (shippingValue > 0) {
      params.append("line_items[1][price_data][currency]", "brl");
      params.append("line_items[1][price_data][unit_amount]", String(shippingValue));
      params.append("line_items[1][price_data][product_data][name]", "Frete");
      params.append("line_items[1][price_data][product_data][description]", "Envio para todo o Brasil");
      params.append("line_items[1][quantity]", "1");
    }

    params.append("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${origin}/customize/${product.slug}`);
    params.append("metadata[user_id]", userId);
    params.append("metadata[product_id]", product_id);

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
      console.error("Stripe API error:", session);
      throw new Error(session.error?.message || "Stripe API error");
    }

    await supabaseAdmin.from("orders").insert({
      user_id: userId,
      product_id,
      total_cents: totalCents,
      shipping_cents: shippingValue || null,
      shipping_address: shippingAddress,
      address_id: resolvedAddressId,
      stripe_session_id: session.id,
      customization_data: {
        ...customization_data,
        original_image_url: original_image_url || null,
        edited_image_url: edited_image_url || null,
      },
      status: "pending",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
