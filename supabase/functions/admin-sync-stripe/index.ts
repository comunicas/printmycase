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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAnon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAnon.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role using service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, product_id } = await req.json();
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    // Fetch product from DB
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripeRequest = async (path: string, method: string, body?: URLSearchParams) => {
      const res = await fetch(`https://api.stripe.com/v1${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body?.toString(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Stripe API error");
      return data;
    };

    if (action === "create") {
      // Create Stripe product
      const productParams = new URLSearchParams();
      productParams.append("name", product.name);
      if (product.description) productParams.append("description", product.description);
      if (product.images?.length > 0) {
        product.images.forEach((img: string, i: number) => {
          productParams.append(`images[${i}]`, img);
        });
      }
      const stripeProduct = await stripeRequest("/products", "POST", productParams);

      // Create Stripe price
      const priceParams = new URLSearchParams();
      priceParams.append("product", stripeProduct.id);
      priceParams.append("unit_amount", String(product.price_cents));
      priceParams.append("currency", "brl");
      const stripePrice = await stripeRequest("/prices", "POST", priceParams);

      // Update DB
      await supabaseAdmin
        .from("products")
        .update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
        })
        .eq("id", product_id);

      return new Response(
        JSON.stringify({ stripe_product_id: stripeProduct.id, stripe_price_id: stripePrice.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update_price") {
      const stripeProductId = product.stripe_product_id;
      if (!stripeProductId) {
        return new Response(JSON.stringify({ error: "Product not synced with Stripe" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create new price
      const priceParams = new URLSearchParams();
      priceParams.append("product", stripeProductId);
      priceParams.append("unit_amount", String(product.price_cents));
      priceParams.append("currency", "brl");
      const newPrice = await stripeRequest("/prices", "POST", priceParams);

      // Deactivate old price
      if (product.stripe_price_id) {
        const deactivateParams = new URLSearchParams();
        deactivateParams.append("active", "false");
        await stripeRequest(`/prices/${product.stripe_price_id}`, "POST", deactivateParams);
      }

      // Update product name/description on Stripe
      const updateParams = new URLSearchParams();
      updateParams.append("name", product.name);
      if (product.description) updateParams.append("description", product.description);
      await stripeRequest(`/products/${stripeProductId}`, "POST", updateParams);

      // Update DB
      await supabaseAdmin
        .from("products")
        .update({ stripe_price_id: newPrice.id })
        .eq("id", product_id);

      return new Response(
        JSON.stringify({ stripe_price_id: newPrice.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "archive") {
      if (product.stripe_product_id) {
        const archiveParams = new URLSearchParams();
        archiveParams.append("active", "false");
        await stripeRequest(`/products/${product.stripe_product_id}`, "POST", archiveParams);
      }

      return new Response(
        JSON.stringify({ archived: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("admin-sync-stripe error:", err);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
