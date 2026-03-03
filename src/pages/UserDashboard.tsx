import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, CalendarDays, Download, Home, Star, MessageSquare, Send } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function generateInvoicePdf(booking: Tables<"bookings">, invoice: Tables<"invoices">) {
  const roomLabel = booking.room_type === "ac" ? "AC Room" : "Non-AC Room";
  const subtotal = invoice.subtotal;
  const tax = invoice.tax_amount;
  const total = invoice.total_amount;

  // Build a simple PDF using raw PDF spec (no external lib needed)
  const lines = [
    `INVOICE`,
    ``,
    `Invoice No: ${invoice.invoice_number}`,
    `Date: ${new Date(invoice.created_at).toLocaleDateString("en-IN")}`,
    ``,
    `Guest: ${invoice.guest_name}`,
    `Email: ${invoice.guest_email}`,
    `Mobile: ${invoice.guest_mobile}`,
    ``,
    `Booking ID: ${booking.booking_id}`,
    `Room Type: ${roomLabel}`,
    `Check-in: ${booking.check_in_date}`,
    `Check-out: ${booking.check_out_date}`,
    `Nights: ${booking.total_nights}`,
    `Adults: ${booking.adults} | Children: ${booking.children}`,
    ``,
    `--- Price Breakdown ---`,
    `Rate/Night: Rs.${invoice.room_price_per_night.toLocaleString("en-IN")}`,
    `Subtotal: Rs.${subtotal.toLocaleString("en-IN")}`,
    `GST (18%): Rs.${tax.toLocaleString("en-IN")}`,
    `Total: Rs.${total.toLocaleString("en-IN")}`,
    ``,
    `Payment Status: ${booking.payment_status ?? "unpaid"}`,
    `Booking Status: ${booking.status}`,
    ``,
    `Thank you for choosing Gopika Cottage!`,
  ];

  // Generate a proper text-based downloadable file (text/plain as simple invoice)
  // For a proper PDF we'll use a minimal HTML-to-print approach
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<title>Invoice ${invoice.invoice_number}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; max-width: 700px; margin: 40px auto; padding: 40px; color: #333; }
  .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
  .header p { color: #666; margin: 5px 0 0; }
  .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .section { margin-bottom: 25px; }
  .section h3 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; font-size: 16px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
  th { background: #f8fafc; font-weight: 600; color: #374151; }
  .total-row td { font-weight: 700; font-size: 18px; color: #2563eb; border-top: 2px solid #2563eb; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 13px; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .status-pending { background: #fef3c7; color: #92400e; }
  .status-confirmed { background: #d1fae5; color: #065f46; }
  .status-cancelled { background: #fee2e2; color: #991b1b; }
  @media print { body { margin: 0; padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <h1>Gopika Cottage</h1>
    <p>Beach Cottage & Homestay</p>
  </div>
  
  <div class="invoice-meta">
    <div>
      <strong>Invoice No:</strong> ${invoice.invoice_number}<br/>
      <strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
    </div>
    <div style="text-align:right">
      <strong>Booking ID:</strong> ${booking.booking_id}<br/>
      <span class="status status-${booking.status}">${booking.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="section">
    <h3>Guest Details</h3>
    <table>
      <tr><td><strong>Name</strong></td><td>${invoice.guest_name}</td></tr>
      <tr><td><strong>Email</strong></td><td>${invoice.guest_email}</td></tr>
      <tr><td><strong>Mobile</strong></td><td>${invoice.guest_mobile}</td></tr>
    </table>
  </div>

  <div class="section">
    <h3>Stay Details</h3>
    <table>
      <tr><td><strong>Room Type</strong></td><td>${roomLabel}</td></tr>
      <tr><td><strong>Check-in</strong></td><td>${booking.check_in_date}</td></tr>
      <tr><td><strong>Check-out</strong></td><td>${booking.check_out_date}</td></tr>
      <tr><td><strong>Duration</strong></td><td>${booking.total_nights} Night${booking.total_nights > 1 ? "s" : ""}</td></tr>
      <tr><td><strong>Guests</strong></td><td>${booking.adults} Adult${booking.adults > 1 ? "s" : ""}${booking.children > 0 ? `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}` : ""}</td></tr>
    </table>
  </div>

  <div class="section">
    <h3>Price Breakdown</h3>
    <table>
      <tr><td>Rate per Night</td><td style="text-align:right">₹${invoice.room_price_per_night.toLocaleString("en-IN")}</td></tr>
      <tr><td>Subtotal (${booking.total_nights} night${booking.total_nights > 1 ? "s" : ""})</td><td style="text-align:right">₹${subtotal.toLocaleString("en-IN")}</td></tr>
      <tr><td>GST (18%)</td><td style="text-align:right">₹${tax.toLocaleString("en-IN")}</td></tr>
      <tr class="total-row"><td>Total Amount</td><td style="text-align:right">₹${total.toLocaleString("en-IN")}</td></tr>
    </table>
  </div>

  <div class="footer">
    <p>Thank you for choosing Gopika Cottage!</p>
    <p>For queries, contact us via WhatsApp or email.</p>
  </div>
</body>
</html>`;

  // Open in new window and trigger print (saves as PDF)
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

interface ReviewForm {
  bookingId: string;
  rating: number;
  text: string;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [bookings, setBookings] = useState<Tables<"bookings">[]>([]);
  const [invoices, setInvoices] = useState<Tables<"invoices">[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState<ReviewForm | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchData = useCallback(async (userId: string) => {
    const [bookingsRes, invoicesRes, reviewsRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("testimonials")
        .select("*")
        .eq("user_id", userId),
    ]);

    setBookings(bookingsRes.data ?? []);
    setInvoices(invoicesRes.data ?? []);
    setReviews(reviewsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/auth");
        return;
      }
      setUser({ email: data.session.user.email, id: data.session.user.id });
      fetchData(data.session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate, fetchData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInvoiceForBooking = (bookingId: string) => {
    return invoices.find((inv) => inv.booking_id === bookingId);
  };

  const hasReviewForBooking = (bookingId: string) => {
    return reviews.some((r) => r.booking_id === bookingId);
  };

  const handleSubmitReview = async () => {
    if (!reviewForm || !user || !reviewForm.text.trim()) return;
    setSubmittingReview(true);

    const booking = bookings.find((b) => b.id === reviewForm.bookingId);
    const { error } = await supabase.from("testimonials").insert({
      guest_name: booking?.full_name || user.email || "Guest",
      review_text: reviewForm.text.trim(),
      rating: reviewForm.rating,
      user_id: user.id,
      booking_id: reviewForm.bookingId,
      is_active: false,
      display_order: 0,
    });

    setSubmittingReview(false);
    if (error) {
      toast({ title: "Error", description: "Could not submit review. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Review submitted!", description: "Your review will appear after approval." });
      setReviewForm(null);
      fetchData(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-heading font-semibold text-foreground">My Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/"><Home className="w-4 h-4 mr-1.5" /> Home</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        {/* My Bookings */}
        <section>
          <h2 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5 text-primary" /> My Bookings
          </h2>

          {bookings.length === 0 ? (
            <div className="card-cottage p-8 text-center">
              <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
              <Button variant="hero" asChild>
                <a href="/#booking">Book a Stay</a>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => {
                const invoice = getInvoiceForBooking(booking.id);
                const reviewed = hasReviewForBooking(booking.id);
                return (
                  <div key={booking.id} className="card-cottage p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{booking.booking_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.check_in_date} → {booking.check_out_date} · {booking.total_nights} night{booking.total_nights > 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize">
                          Room: {booking.room_type === "ac" ? "AC" : "Non-AC"} · {booking.adults} adults, {booking.children} children
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-semibold text-foreground">₹{booking.total_amount.toLocaleString("en-IN")}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                          booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {booking.status}
                        </span>
                        <div className="flex gap-2 mt-1">
                          {invoice && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateInvoicePdf(booking, invoice)}
                            >
                              <Download className="w-4 h-4 mr-1.5" />
                              Download Invoice
                            </Button>
                          )}
                          {(booking.status === "confirmed" || booking.status === "completed") && !reviewed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewForm({ bookingId: booking.id, rating: 5, text: "" })}
                            >
                              <Star className="w-4 h-4 mr-1.5" />
                              Write Review
                            </Button>
                          )}
                          {reviewed && (
                            <span className="text-xs text-green-700 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current" /> Reviewed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Inline review form */}
                    {reviewForm?.bookingId === booking.id && (
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground mr-2">Rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 transition-colors ${
                                  star <= reviewForm.rating
                                    ? "text-accent fill-accent"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Share your experience at Gopika Cottage..."
                          value={reviewForm.text}
                          onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                          rows={3}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setReviewForm(null)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSubmitReview}
                            disabled={submittingReview || !reviewForm.text.trim()}
                          >
                            <Send className="w-4 h-4 mr-1.5" />
                            {submittingReview ? "Submitting…" : "Submit Review"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* My Reviews */}
        {reviews.length > 0 && (
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" /> My Reviews
            </h2>
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="card-cottage p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_: unknown, i: number) => (
                        <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                      ))}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      review.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {review.is_active ? "Published" : "Pending approval"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">"{review.review_text}"</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
