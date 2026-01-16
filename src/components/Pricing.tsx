import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Weekday Stay",
      subtitle: "Sunday - Thursday",
      price: "₹3,500",
      unit: "per night",
      popular: false,
      features: [
        "Standard Check-in: 2 PM",
        "Check-out: 11 AM",
        "Breakfast Included",
        "All Amenities Access",
        "Free WiFi & Parking",
        "Bonfire on Request",
      ],
    },
    {
      name: "Weekend Stay",
      subtitle: "Friday - Saturday",
      price: "₹4,500",
      unit: "per night",
      popular: true,
      features: [
        "Early Check-in: 12 PM",
        "Late Check-out: 1 PM",
        "Breakfast & Evening Tea",
        "All Amenities Access",
        "Free WiFi & Parking",
        "Complimentary Bonfire",
        "Welcome Drinks",
      ],
    },
    {
      name: "Extended Stay",
      subtitle: "3+ Nights",
      price: "₹3,000",
      unit: "per night",
      popular: false,
      features: [
        "Flexible Check-in/out",
        "All Meals Included",
        "All Amenities Access",
        "Free WiFi & Parking",
        "Daily Bonfire",
        "Local Guide Assistance",
        "10% Off Activities",
      ],
    },
  ];

  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Transparent Pricing
          </span>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            Choose Your <span className="text-primary">Stay</span>
          </h2>
          <p className="subtitle">
            Simple, honest pricing with no hidden fees. All rates include taxes 
            and complimentary breakfast.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative card-cottage p-6 lg:p-8 ${
                plan.popular
                  ? "ring-2 ring-primary md:scale-105"
                  : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6 pt-2">
                <h3 className="text-xl font-semibold text-foreground mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl lg:text-5xl font-heading font-semibold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground ml-2">
                  {plan.unit}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.popular ? "hero" : "outline"}
                size="lg"
                className="w-full"
                asChild
              >
                <a href="#booking">Book Now</a>
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          * All prices are inclusive of GST. Extra person charges apply for 
          groups larger than 4.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
