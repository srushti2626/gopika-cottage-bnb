import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, CalendarDays } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string; id: string } | null>(null);
  const [bookings, setBookings] = useState<Tables<"bookings">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/auth");
        return;
      }
      setUser({ email: data.session.user.email, id: data.session.user.id });

      const { data: userBookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", data.session.user.id)
        .order("created_at", { ascending: false });

      setBookings(userBookings ?? []);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
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
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> My Bookings
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="card-cottage p-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
            <Button variant="hero" asChild>
              <a href="/#booking">Book a Stay</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
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
                  <div className="text-right">
                    <p className="font-semibold text-foreground">₹{booking.total_amount.toLocaleString("en-IN")}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                      booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
