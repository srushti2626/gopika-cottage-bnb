import { UtensilsCrossed, AlertCircle, Leaf, Drumstick } from "lucide-react";

const FoodMenu = () => {
  const breakfastItems = [
    { name: "Upma", price: "₹50" },
    { name: "Kanda Poha", price: "₹50" },
    { name: "Sheera", price: "₹50" },
    { name: "Thalipeeth (2 pcs)", price: "₹75" },
    { name: "Kanda Bhaji", price: "₹80" },
    { name: "Batata Bhaji", price: "₹60" },
    { name: "Misal Pav", price: "₹75" },
    { name: "Ghavne & Chutney", price: "₹75" },
    { name: "Sabudana Khichdi", price: "₹75" },
    { name: "Bread Butter", price: "₹75" },
    { name: "Jam Bread", price: "₹80" },
    { name: "Omelette Pav", price: "₹80" },
    { name: "Bhurji Pav", price: "₹80" },
    { name: "Boiled Egg", price: "₹20" },
  ];

  const vegThalis = [
    { name: "Veg Thali", price: "₹250" },
    { name: "Dal Khichdi", price: "₹150" },
    { name: "Zunka Bhakri", price: "₹120" },
    { name: "Pitla Bhakri", price: "₹150" },
  ];

  const nonVegThalis = [
    { name: "Chicken Thali", price: "₹350" },
    { name: "Gavran Chicken Thali", price: "₹400" },
    { name: "Kombdi Vade", price: "₹350" },
    { name: "Gavran Kombdi Vade", price: "₹450" },
    { name: "Mutton Thali", price: "₹450" },
    { name: "Mutton Vade", price: "₹475" },
    { name: "Fish Thali", price: "₹475" },
    { name: "Anda Thali", price: "₹250" },
  ];

  return (
    <section id="food-menu" className="section-padding bg-muted/30">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <UtensilsCrossed className="w-4 h-4" />
            <span className="text-sm font-medium">Food Menu</span>
          </div>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            Homemade <span className="text-primary">Delicacies</span>
          </h2>
          <p className="subtitle">
            Enjoy authentic homemade vegetarian and non-vegetarian dishes 
            prepared with love and fresh ingredients.
          </p>
        </div>

        {/* Important Note */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-12 max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/20 rounded-lg shrink-0">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Important Food Note</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>• Kindly place food orders in advance</li>
                <li>• Homemade Veg & Non-Veg food available</li>
                <li>• Some items seasonal / as per market rate</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Breakfast Items */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <UtensilsCrossed className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Breakfast Items</h3>
            </div>
            <ul className="space-y-3">
              {breakfastItems.map((item) => (
                <li key={item.name} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-foreground">{item.name}</span>
                  <span className="font-semibold text-primary">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Veg Thali & Meals */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Veg Thali & Meals</h3>
            </div>
            <ul className="space-y-3">
              {vegThalis.map((item) => (
                <li key={item.name} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-foreground">{item.name}</span>
                  <span className="font-semibold text-primary">{item.price}</span>
                </li>
              ))}
            </ul>

            {/* Decorative space filler */}
            <div className="mt-8 p-4 bg-muted/50 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">
                🌿 Fresh, homemade vegetarian options prepared with local ingredients
              </p>
            </div>
          </div>

          {/* Non-Veg Thali & Dishes */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Drumstick className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Non-Veg Thali & Dishes</h3>
            </div>
            <ul className="space-y-3">
              {nonVegThalis.map((item) => (
                <li key={item.name} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className="text-foreground">{item.name}</span>
                  <span className="font-semibold text-primary">{item.price}</span>
                </li>
              ))}
            </ul>

            {/* Decorative note */}
            <div className="mt-6 p-4 bg-muted/50 rounded-xl text-center">
              <p className="text-sm text-muted-foreground">
                🍗 Authentic Konkan-style non-veg dishes
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-muted-foreground mt-8 text-sm">
          * Prices may vary based on seasonal availability and market rates
        </p>
      </div>
    </section>
  );
};

export default FoodMenu;
