import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Plus, Minus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AddonService {
  id: string;
  name: string;
  description: string | null;
  price: number;
  price_type: string;
  display_order: number;
}

const AdditionalServices = () => {
  const navigate = useNavigate();
  const [addonServices, setAddonServices] = useState<AddonService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("addon_services")
      .select("*")
      .eq("is_active", true)
      .order("display_order")
      .then(({ data }) => {
        if (data) setAddonServices(data as AddonService[]);
        setLoading(false);
      });
  }, []);

  const breakfastAddons = addonServices.filter((a) => a.display_order >= 1 && a.display_order <= 14);
  const vegAddons = addonServices.filter((a) => a.display_order >= 15 && a.display_order <= 18);
  const nonVegAddons = addonServices.filter((a) => a.display_order >= 19 && a.display_order <= 26);
  const otherAddons = addonServices.filter((a) => a.display_order >= 27);

  const categories = [
    { label: "Breakfast Items", items: breakfastAddons },
    { label: "Veg Thali & Meals", items: vegAddons },
    { label: "Non-Veg Thali & Dishes", items: nonVegAddons },
    { label: "Activities", items: otherAddons },
  ].filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-cottage">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground flex items-center gap-3">
              <UtensilsCrossed className="w-8 h-8 text-primary" />
              Additional Services
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse our homemade food options and activities. You can add these during booking.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : addonServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">
              No additional services available at the moment.
            </p>
          ) : (
            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat.label}>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {cat.label}
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cat.items.map((addon) => (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all"
                      >
                        <div>
                          <span className="font-medium text-foreground">{addon.name}</span>
                          <span className="text-primary font-semibold ml-2">₹{addon.price}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-primary/40 flex items-center justify-center text-primary/60">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Want to add these services to your stay?
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate("/#booking")}>
              Book Now & Select Services
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdditionalServices;
