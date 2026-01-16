import {
  Wifi,
  Car,
  UtensilsCrossed,
  Thermometer,
  Droplets,
  Zap,
  Tv,
  Coffee,
  Mountain,
  ShowerHead,
  Flame,
  TreePine,
} from "lucide-react";

const Amenities = () => {
  const amenities = [
    {
      icon: Wifi,
      name: "High-Speed WiFi",
      description: "Stay connected with complimentary internet",
    },
    {
      icon: Car,
      name: "Free Parking",
      description: "Secure parking space for your vehicle",
    },
    {
      icon: UtensilsCrossed,
      name: "Fully Equipped Kitchen",
      description: "Cook your own meals if you prefer",
    },
    {
      icon: Thermometer,
      name: "Air Conditioning",
      description: "Climate control for your comfort",
    },
    {
      icon: Droplets,
      name: "Hot Water 24/7",
      description: "Geyser available round the clock",
    },
    {
      icon: Zap,
      name: "Power Backup",
      description: "Uninterrupted power supply",
    },
    {
      icon: Tv,
      name: "Smart TV",
      description: "Entertainment with streaming services",
    },
    {
      icon: Coffee,
      name: "Tea/Coffee Maker",
      description: "Start your mornings right",
    },
    {
      icon: Mountain,
      name: "Mountain View",
      description: "Stunning views from every room",
    },
    {
      icon: ShowerHead,
      name: "Private Bathroom",
      description: "Modern attached bathroom",
    },
    {
      icon: Flame,
      name: "Bonfire Pit",
      description: "Evening bonfires under the stars",
    },
    {
      icon: TreePine,
      name: "Garden Access",
      description: "Private garden and outdoor seating",
    },
  ];

  return (
    <section id="amenities" className="section-padding bg-background">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            What We Offer
          </span>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            Thoughtful <span className="text-primary">Amenities</span> for Your Comfort
          </h2>
          <p className="subtitle">
            Every detail at Gopika Cottage is designed to ensure your stay is 
            comfortable, convenient, and memorable.
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {amenities.map((amenity, index) => (
            <div
              key={amenity.name}
              className="card-cottage p-6 text-center group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                <amenity.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {amenity.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {amenity.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Amenities;
