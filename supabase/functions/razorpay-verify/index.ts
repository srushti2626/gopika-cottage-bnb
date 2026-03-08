// Edge function: Verify Razorpay payment and update booking status
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expectedSig === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;

  // Auth
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    return new Response(JSON.stringify({ error: "Missing payment details" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify signature
  const isValid = await verifySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    RAZORPAY_KEY_SECRET
  );

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Payment verification failed" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Update booking status
  const supabaseAdmin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: booking, error: fetchErr } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("user_id", userId)
    .single();

  if (fetchErr || !booking) {
    return new Response(JSON.stringify({ error: "Booking not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: updateErr } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "confirmed",
      payment_status: "paid",
      stripe_payment_id: razorpay_payment_id, // reusing column for payment reference
    })
    .eq("id", booking.id);

  if (updateErr) {
    console.error("Update error:", updateErr);
    return new Response(JSON.stringify({ error: "Failed to update booking" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ success: true, message: "Payment verified and booking confirmed" }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
