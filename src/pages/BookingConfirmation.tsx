import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  IndianRupee,
  Loader2,
  Home,
  CreditCard,
  AlertCircle,
  Download,
  ArrowLeft,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function generateReceiptHtml(booking: Tables<"bookings">, paymentId: string) {
  const subtotal = Math.round(booking.total_amount / 1.18);
  const gst = booking.total_amount - subtotal;
  const roomLabel = booking.room_type === "ac" ? "AC Room" : "Non-AC Room";

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Payment Receipt - ${booking.booking_id}</title>
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
    <div class="badge">✓ Payment Successful</div>
  </div>
  <div class="section"><h3>Payment Details</h3>
    <table>
      <tr><td>Booking ID</td><td><strong>${booking.booking_id}</strong></td></tr>
      <tr><td>Payment Reference</td><td>${paymentId}</td></tr>
      <tr><td>Date</td><td>${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</td></tr>
      <tr><td>Status</td><td><strong style="color:#16a34a">Confirmed & Paid</strong></td></tr>
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
  <div class="section"><h3>Amount Paid</h3>
    <table>
      <tr><td>Subtotal</td><td>₹${subtotal.toLocaleString("en-IN")}</td></tr>
      <tr><td>GST (18%)</td><td>₹${gst.toLocaleString("en-IN")}</td></tr>
    </table>
    <div class="total">Total: ₹${booking.total_amount.toLocaleString("en-IN")}</div>
  </div>
  <div class="footer">
    <p>Thank you for choosing Gopika Cottage!</p>
    <p>This is a computer-generated receipt.</p>
  </div>
  <script>window.onload = () => window.print();</script>
</body></html>`;
}

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState<Tables<"bookings"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_id", bookingId)
      .single();

    if (data) {
      setBooking(data);
      if (data.payment_status === "paid") {
        setPaymentSuccess(true);
        setPaymentRef(data.stripe_payment_id || "");
      }
    }
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/auth");
        return;
      }
      fetchBooking();
    });
  }, [navigate, fetchBooking]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!booking) return;
    setPaying(true);

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: "Error", description: "Failed to load payment gateway", variant: "destructive" });
        setPaying(false);
        return;
      }

      // Create Razorpay order via edge function
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        "razorpay-order",
        { body: { bookingId: booking.booking_id } }
      );

      if (orderError || !orderData?.orderId) {
        toast({
          title: "Payment Error",
          description: orderData?.error || "Could not initiate payment. Please try again.",
          variant: "destructive",
        });
        setPaying(false);
        return;
      }

      // Open Razorpay checkout popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Gopika Cottage",
        description: `Booking ${booking.booking_id}`,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        theme: { color: "#2d5016" },
        handler: async (response: any) => {
          // Verify payment on server
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
            "razorpay-verify",
            {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking.booking_id,
              },
            }
          );

          if (verifyError || !verifyData?.success) {
            toast({
              title: "Verification Failed",
              description: "Payment was received but verification failed. Please contact support.",
              variant: "destructive",
            });
            setPaying(false);
            return;
          }

          setPaymentSuccess(true);
          setPaymentRef(response.razorpay_payment_id);
          setBooking((prev) =>
            prev ? { ...prev, status: "confirmed", payment_status: "paid", stripe_payment_id: response.razorpay_payment_id } : prev
          );
          toast({ title: "Payment Successful!", description: "Your booking is confirmed." });
          setPaying(false);
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast({ title: "Payment Cancelled", description: "You can pay later from your dashboard.", variant: "destructive" });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setPaying(false);
        toast({
          title: "Payment Failed",
          description: response.error?.description || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      });
      rzp.open();
    } catch (err) {
      setPaying(false);
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    }
  };

  const handleDownloadReceipt = () => {
    if (!booking || !paymentRef) return;
    const html = generateReceiptHtml(booking, paymentRef);
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
        {/* Success State */}
        {paymentSuccess ? (
          <div className="card-cottage p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-semibold text-foreground">Booking Confirmed & Paid!</h2>
              <p className="text-muted-foreground mt-2">
                Your booking <strong>{booking.booking_id}</strong> has been confirmed.
              </p>
              {paymentRef && (
                <p className="text-sm text-muted-foreground mt-1">
                  Payment Reference: <code className="bg-muted px-2 py-0.5 rounded text-xs">{paymentRef}</code>
                </p>
              )}
            </div>

            <div className="bg-secondary/50 rounded-xl p-6 text-left space-y-3">
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
              <div className="h-px bg-border" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span className="text-primary flex items-center">
                  <IndianRupee className="w-4 h-4" />
                  {booking.total_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleDownloadReceipt} variant="outline">
                <Download className="w-4 h-4 mr-2" /> Download Receipt
              </Button>
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        ) : (
          /* Payment Pending State */
          <div className="card-cottage p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-heading font-semibold text-foreground">Complete Your Payment</h2>
              <p className="text-muted-foreground mt-2">
                Booking <strong>{booking.booking_id}</strong> is awaiting payment.
              </p>
            </div>

            <div className="bg-secondary/50 rounded-xl p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Room</span>
                <span className="font-medium">{roomLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guest</span>
                <span className="font-medium">{booking.full_name}</span>
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
              <div className="flex justify-between font-semibold text-xl">
                <span>Total Amount</span>
                <span className="text-primary flex items-center">
                  <IndianRupee className="w-5 h-5" />
                  {booking.total_amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={handlePayNow}
              disabled={paying}
            >
              {paying ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Pay Now — ₹{booking.total_amount.toLocaleString("en-IN")}
                </span>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Secured by Razorpay. Your payment information is encrypted.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
