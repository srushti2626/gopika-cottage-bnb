import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  IndianRupee,
  Loader2,
  Home,
  AlertCircle,
  Download,
  ArrowLeft,
  Phone,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface BookingAddon {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  addon_service_id: string;
  addon_services?: { name: string; price_type: string } | null;
}

function generateReceiptHtml(booking: Tables<"bookings">, addons: BookingAddon[]) {
  const subtotal = Math.round(booking.total_amount / 1.18);
  const gst = booking.total_amount - subtotal;
  const roomLabel = booking.room_type === "ac" ? "AC Room" : "Non-AC Room";

  const addonRows = addons.map(
    (a) => `<tr><td>${a.addon_services?.name || "Add-on"}</td><td>₹${a.total_price.toLocaleString("en-IN")}</td></tr>`
  ).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Booking Confirmation - ${booking.booking_id}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; max-width: 700px; margin: 40px auto; padding: 40px; color: #1a1a1a; }
  .header { text-align: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: #16a34a; margin: 0; font-size: 28px; }
  .header p { color: #666; margin: 5px 0 0; }
  .badge { display: inline-block; background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-top: 12px; }
  .section { margin-bottom: 24px; }
  .section h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 8px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 8px 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
  td:first-child { color: #888; width: 40%; }
  .total { font-size: 20px; font-weight: 700; color: #16a34a; text-align: right; margin-top: 16px; padding-top: 16px; border-top: 2px solid #16a34a; }
  .footer { text-align: center; margin-top: 40px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  @media print { body { margin: 0; padding: 20px; } }
</style></head><body>
  <div class="header">
    <h1>Gopika Cottage</h1>
    <p>Beach Cottage & Homestay</p>
    <div class="badge">✓ Booking Confirmed</div>
  </div>
  <div class="section"><h3>Booking Details</h3>
    <table>
      <tr><td>Booking ID</td><td><strong>${booking.booking_id}</strong></td></tr>
      <tr><td>Date</td><td>${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</td></tr>
      <tr><td>Status</td><td><strong style="color:#16a34a">Confirmed</strong></td></tr>
      <tr><td>Payment</td><td>Pay at Check-in</td></tr>
    </table>
  </div>
  <div class="section"><h3>Guest Details</h3>
    <table>
      <tr><td>Name</td><td>${booking.full_name}</td></tr>
      <tr><td>Email</td><td>${booking.email}</td></tr>
      <tr><td>Mobile</td><td>${booking.mobile_number}</td></tr>
    </table>
  </div>
  <div class="section"><h3>Stay Details</h3>
    <table>
      <tr><td>Room Type</td><td>${roomLabel}</td></tr>
      <tr><td>Check-in</td><td>${booking.check_in_date}</td></tr>
      <tr><td>Check-out</td><td>${booking.check_out_date}</td></tr>
      <tr><td>Duration</td><td>${booking.total_nights} Night${booking.total_nights > 1 ? "s" : ""}</td></tr>
    </table>
  </div>
  ${addons.length > 0 ? `<div class="section"><h3>Additional Services</h3><table>${addonRows}</table></div>` : ""}
  <div class="section"><h3>Amount</h3>
    <table>
      <tr><td>Subtotal</td><td>₹${subtotal.toLocaleString("en-IN")}</td></tr>
      <tr><td>GST (18%)</td><td>₹${gst.toLocaleString("en-IN")}</td></tr>
    </table>
    <div class="total">Total: ₹${booking.total_amount.toLocaleString("en-IN")}</div>
  </div>
  <div class="footer">
    <p>Thank you for choosing Gopika Cottage!</p>
    <p>Payment to be made at check-in (Cash / UPI accepted).</p>
  </div>
  <script>window.onload = () => window.print();</script>
</body></html>`;
}

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingReference = searchParams.get("id")?.trim() ?? "";

  const [booking, setBooking] = useState<Tables<"bookings"> | null>(null);
  const [addons, setAddons] = useState<BookingAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingReference) {
      setNotFoundMessage("No booking reference was provided.");
      setLoading(false);
      return;
    }

    let normalizedReference = bookingReference;
    try {
      normalizedReference = decodeURIComponent(bookingReference).trim();
    } catch {
      normalizedReference = bookingReference.trim();
    }

    const isUuidReference =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalizedReference);

    let data: Tables<"bookings"> | null = null;
    let error: Error | null = null;

    if (isUuidReference) {
      const byUuid = await supabase.from("bookings").select("*").eq("id", normalizedReference).maybeSingle();
      data = byUuid.data;
      error = byUuid.error as Error | null;
    }

    if (!data && !error) {
      const byBookingId = await supabase
        .from("bookings")
        .select("*")
        .ilike("booking_id", normalizedReference)
        .maybeSingle();
      data = byBookingId.data;
      error = byBookingId.error as Error | null;
    }

    if (error) {
      console.error("Error loading booking confirmation:", error);
      setNotFoundMessage("We couldn't load your booking right now. Please try again.");
      setLoading(false);
      return;
    }

    if (data) {
      setBooking(data);
      setNotFoundMessage(null);
      // Fetch add-ons for this booking
      const { data: addonData } = await supabase
        .from("booking_addons")
        .select("*, addon_services(name, price_type)")
        .eq("booking_id", data.id);
      if (addonData) setAddons(addonData as BookingAddon[]);
    } else {
      setNotFoundMessage("This booking link is invalid, expired, or the booking was removed.");
    }

    setLoading(false);
  }, [bookingReference]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth");
        return;
      }
      fetchBooking();
    });
  }, [navigate, fetchBooking]);

  const handleDownloadReceipt = () => {
    if (!booking) return;
    const html = generateReceiptHtml(booking, addons);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onafterprint = () => URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-xl font-heading font-semibold">Booking Not Found</h2>
          <Button variant="outline" asChild>
            <Link to="/"><Home className="w-4 h-4 mr-2" /> Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = Math.round(booking.total_amount / 1.18);
  const gst = booking.total_amount - subtotal;
  const roomLabel = booking.room_type === "ac" ? "AC Room" : "Non-AC Room";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-1.5" /> Dashboard</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/"><Home className="w-4 h-4 mr-1.5" /> Home</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card-cottage p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-semibold text-foreground">Booking Confirmed!</h2>
            <p className="text-muted-foreground mt-2">
              Your booking <strong>{booking.booking_id}</strong> has been confirmed.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-xl p-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Guest</span>
              <span className="font-medium">{booking.full_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Room</span>
              <span className="font-medium">{roomLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Check-in</span>
              <span className="font-medium">{booking.check_in_date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Check-out</span>
              <span className="font-medium">{booking.check_out_date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nights</span>
              <span className="font-medium">{booking.total_nights}</span>
            </div>

            {/* Add-ons */}
            {addons.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Additional Services</p>
                {addons.map((a) => (
                  <div key={a.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {a.addon_services?.name || "Add-on"}
                      {a.quantity > 1 && ` (×${a.quantity})`}
                    </span>
                    <span className="font-medium">₹{a.total_price.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </>
            )}

            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST (18%)</span>
              <span>₹{gst.toLocaleString("en-IN")}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount</span>
              <span className="text-primary flex items-center">
                <IndianRupee className="w-4 h-4" />
                {booking.total_amount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-left">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Payment at Check-in
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Please pay the total amount at the time of check-in. We accept Cash and UPI.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleDownloadReceipt} variant="outline">
              <Download className="w-4 h-4 mr-2" /> Download Confirmation
            </Button>
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
