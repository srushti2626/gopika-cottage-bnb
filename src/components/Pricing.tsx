import { Button } from "@/components/ui/button";
import { Check, Bed, Wind, Fan } from "lucide-react";

const Pricing = () => {
  const rooms = [
    {
      name: "AC Room",
      icon: Wind,
      price: "₹3,000",
      unit: "per night",
      description: "Air-conditioned comfort with modern amenities",
      features: [
        "One double bed",
        "Air conditioning",
        "Attached bathroom",
        "Free WiFi",
        "Room service",
        "Additional mattresses on request",
      ],
    },
    {
      name: "Non-AC Room",
      icon: Fan,
      price: "₹2,000",
      unit: "per night",
      description: "Well-ventilated room with natural breeze",
      features: [
        "One double bed",
        "Ceiling fan & ventilation",
        "Attached bathroom",
        "Free WiFi",
        "Room service",
        "Additional mattresses on request",
      ],
    },
  ];

  return (
    <section id="pricing" className="section-padding bg-background">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Room Pricing
          </span>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            Our <span className="text-primary">Rooms</span>
          </h2>
          <p className="subtitle">
            Simple, transparent pricing with no hidden fees. All rates include 
            complimentary breakfast and are subject to 18% GST.
          </p>
        </div>

        {/* Room Cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {rooms.map((room) => (
            <div
              key={room.name}
              className="card-cottage p-6 lg:p-8"
            >
              {/* Room Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <room.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {room.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-border">
                <span className="text-4xl lg:text-5xl font-heading font-semibold text-foreground">
                  {room.price}
                </span>
                <span className="text-muted-foreground ml-2">
                  {room.unit}
                </span>
              </div>

              {/* Room Info */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
                <Bed className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">
                  One double bed included • Extra mattresses available
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {room.features.map((feature) => (
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
                variant="hero"
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
          * All prices are subject to 18% GST. Additional mattresses provided on request at no extra charge.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
