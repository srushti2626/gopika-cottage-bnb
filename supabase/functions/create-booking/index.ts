// Backend function: create-booking
// Authenticated booking creation with server-side validation.
// Uses an atomic database function to prevent double-booking race conditions.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RoomType = "ac" | "non_ac";

const rateLimitWindowMs = 60_000;
const rateLimitMax = 8;
const bucket = new Map<string, number[]>();

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

function parseDateOnly(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
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

  // Rate limiting
  const ip = getIp(req);
  const now = Date.now();
  const hits = (bucket.get(ip) ?? []).filter((t) => now - t < rateLimitWindowMs);
  if (hits.length >= rateLimitMax) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  hits.push(now);
  bucket.set(ip, hits);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing required env: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Authenticate user from JWT
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Authentication required. Please sign in." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Invalid or expired session. Please sign in again." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const roomType: RoomType = body?.roomType;
  const checkInStr = String(body?.checkInDate ?? "");
  const checkOutStr = String(body?.checkOutDate ?? "");
  const fullName = String(body?.fullName ?? "").trim();
  const mobileNumber = String(body?.mobileNumber ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const adults = Number(body?.adults ?? NaN);
  const children = Number(body?.children ?? NaN);
  const specialRequests = body?.specialRequests == null ? null : String(body?.specialRequests).trim();

  // Validation
  if (roomType !== "ac" && roomType !== "non_ac") {
    return new Response(JSON.stringify({ error: "Invalid room type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const checkIn = parseDateOnly(checkInStr);
  const checkOut = parseDateOnly(checkOutStr);
  if (!checkIn || !checkOut) {
    return new Response(JSON.stringify({ error: "Invalid dates" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (checkOut <= checkIn) {
    return new Response(JSON.stringify({ error: "Check-out must be after check-in" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const nights = daysBetween(checkIn, checkOut);
  if (nights < 1 || nights > 30) {
    return new Response(JSON.stringify({ error: "Invalid stay length" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return new Response(JSON.stringify({ error: "Invalid full name" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (!isValidIndianMobile(mobileNumber)) {
    return new Response(JSON.stringify({ error: "Invalid mobile number" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (!isValidEmail(email) || email.length > 255) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  if (!Number.isInteger(adults) || adults < 1 || adults > 8) {
    return new Response(JSON.stringify({ error: "Invalid adults count" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (!Number.isInteger(children) || children < 0 || children > 8) {
    return new Response(JSON.stringify({ error: "Invalid children count" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (specialRequests && specialRequests.length > 500) {
    return new Response(JSON.stringify({ error: "Special requests too long" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const totalGuests = adults + children;
  if (totalGuests > 8) {
    return new Response(JSON.stringify({ error: "Too many guests" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Use atomic database function to prevent race conditions
  const { data: result, error: rpcError } = await supabase.rpc("create_booking_atomic", {
    p_room_type: roomType,
    p_check_in: checkInStr,
    p_check_out: checkOutStr,
    p_full_name: fullName,
    p_mobile: mobileNumber,
    p_email: email,
    p_adults: adults,
    p_children: children,
    p_special_requests: specialRequests,
    p_user_id: user.id,
  });

  if (rpcError) {
    console.error("rpcError", rpcError);
    return new Response(JSON.stringify({ error: "Unable to create booking" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (result?.error) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ bookingId: result.bookingId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
