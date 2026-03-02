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
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all products without stripe_product_id
    const { data: products, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("*")
      .is("stripe_product_id", null)
      .eq("active", true);

    if (fetchError) throw fetchError;

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ synced: 0, errors: [], message: "All products already synced" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const results: { synced: number; errors: { product_id: string; name: string; error: string }[] } = {
      synced: 0,
      errors: [],
    };

    for (const product of products) {
      try {
        // Create Stripe product
        const productParams = new URLSearchParams();
        productParams.append("name", product.name);
        if (product.description) productParams.append("description", product.description);
        if (product.images?.length > 0) {
          product.images.forEach((img: string, i: number) => {
            productParams.append(`images[${i}]`, img);
          });
        }

        const stripeProductRes = await fetch("https://api.stripe.com/v1/products", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: productParams.toString(),
        });
        const stripeProduct = await stripeProductRes.json();
        if (!stripeProductRes.ok) throw new Error(stripeProduct.error?.message || "Failed to create product");

        // Create Stripe price
        const priceParams = new URLSearchParams();
        priceParams.append("product", stripeProduct.id);
        priceParams.append("unit_amount", String(product.price_cents));
        priceParams.append("currency", "brl");

        const stripePriceRes = await fetch("https://api.stripe.com/v1/prices", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: priceParams.toString(),
        });
        const stripePrice = await stripePriceRes.json();
        if (!stripePriceRes.ok) throw new Error(stripePrice.error?.message || "Failed to create price");

        // Update DB
        await supabaseAdmin
          .from("products")
          .update({
            stripe_product_id: stripeProduct.id,
            stripe_price_id: stripePrice.id,
          })
          .eq("id", product.id);

        results.synced++;
      } catch (err) {
        results.errors.push({
          product_id: product.id,
          name: product.name,
          error: err.message,
        });
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("bulk-sync-stripe error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
