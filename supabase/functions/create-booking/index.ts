// Lovable Cloud backend function: create-booking
// Public (no JWT) booking creation with server-side validation and availability check.

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
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(checkIn: Date, checkOut: Date): number {
  const ms = checkOut.getTime() - checkIn.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function yyyymmdd(d: Date): string {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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

  if (roomType !== "ac" && roomType !== "non_ac") {
    return new Response(JSON.stringify({ error: "Invalid room type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const checkIn = parseDateOnly(checkInStr);
  const checkOut = parseDateOnly(checkOutStr);
  if (!checkIn || !checkOut) {
    return new Response(JSON.stringify({ error: "Invalid dates" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (checkOut <= checkIn) {
    return new Response(JSON.stringify({ error: "Check-out must be after check-in" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const nights = daysBetween(checkIn, checkOut);
  if (nights < 1 || nights > 30) {
    return new Response(JSON.stringify({ error: "Invalid stay length" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (fullName.length < 2 || fullName.length > 100) {
    return new Response(JSON.stringify({ error: "Invalid full name" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!isValidIndianMobile(mobileNumber)) {
    return new Response(JSON.stringify({ error: "Invalid mobile number" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!isValidEmail(email) || email.length > 255) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!Number.isInteger(adults) || adults < 1 || adults > 8) {
    return new Response(JSON.stringify({ error: "Invalid adults count" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!Number.isInteger(children) || children < 0 || children > 8) {
    return new Response(JSON.stringify({ error: "Invalid children count" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (specialRequests && specialRequests.length > 500) {
    return new Response(JSON.stringify({ error: "Special requests too long" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const totalGuests = adults + children;
  if (totalGuests > 8) {
    return new Response(JSON.stringify({ error: "Too many guests" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Choose an available room on the server.
  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id, price_per_night, max_guests")
    .eq("is_active", true)
    .eq("room_type", roomType)
    .gte("max_guests", totalGuests)
    .limit(25);

  if (roomsError) {
    console.error("roomsError", roomsError);
    return new Response(JSON.stringify({ error: "Unable to check availability" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!rooms || rooms.length === 0) {
    return new Response(JSON.stringify({ error: "No rooms available for selected guest count" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const lastNight = new Date(checkOut);
  lastNight.setUTCDate(lastNight.getUTCDate() - 1);
  const lastNightStr = `${lastNight.getUTCFullYear()}-${String(lastNight.getUTCMonth() + 1).padStart(2, "0")}-${String(lastNight.getUTCDate()).padStart(2, "0")}`;

  let selectedRoomId: string | null = null;
  let pricePerNight = 0;

  for (const r of rooms) {
    const roomId = r.id as string;

    // Blocked dates can be global (room_id NULL) or room-specific.
    const { data: blocked, error: blockedError } = await supabase
      .from("blocked_dates")
      .select("id")
      .gte("blocked_date", checkInStr)
      .lte("blocked_date", lastNightStr)
      .or(`room_id.is.null,room_id.eq.${roomId}`)
      .limit(1);
    if (blockedError) {
      console.error("blockedError", blockedError);
      return new Response(JSON.stringify({ error: "Unable to check availability" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (blocked && blocked.length > 0) continue;

    // Overlap: existing.check_in < desired.check_out AND existing.check_out > desired.check_in
    const { data: conflicts, error: conflictsError } = await supabase
      .from("bookings")
      .select("id")
      .eq("room_id", roomId)
      .in("status", ["pending", "confirmed"])
      .lt("check_in_date", checkOutStr)
      .gt("check_out_date", checkInStr)
      .limit(1);
    if (conflictsError) {
      console.error("conflictsError", conflictsError);
      return new Response(JSON.stringify({ error: "Unable to check availability" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (conflicts && conflicts.length > 0) continue;

    selectedRoomId = roomId;
    pricePerNight = Number(r.price_per_night ?? 0);
    break;
  }

  if (!selectedRoomId) {
    return new Response(JSON.stringify({ error: "No rooms available for selected dates" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
    console.error("Invalid price_per_night for selected room");
    return new Response(JSON.stringify({ error: "Unable to calculate price" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const subtotal = pricePerNight * nights;
  const tax = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + tax;

  // booking_id column is NOT NULL and has no default; generate it here.
  const id = crypto.randomUUID();
  const bookingId = `GC${yyyymmdd(new Date())}-${id.slice(0, 8)}`;

  const { error: insertError } = await supabase.from("bookings").insert({
    id,
    booking_id: bookingId,
    room_id: selectedRoomId,
    room_type: roomType,
    check_in_date: checkInStr,
    check_out_date: checkOutStr,
    total_nights: nights,
    total_amount: totalAmount,
    status: "pending",
    full_name: fullName,
    mobile_number: mobileNumber,
    email,
    adults,
    children,
    special_requests: specialRequests,
    user_id: null,
    payment_status: "unpaid",
  });

  if (insertError) {
    console.error("insertError", insertError);
    return new Response(JSON.stringify({ error: "Unable to create booking" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ bookingId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
