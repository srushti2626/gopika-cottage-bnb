import { AlertTriangle, Clock, UtensilsCrossed, Users } from "lucide-react";

const CottageRules = () => {
  const rules = [
    {
      icon: Clock,
      title: "No Music After 10 PM",
      description: "Music is not allowed after 10:00 PM to maintain a peaceful environment for all guests.",
    },
    {
      icon: UtensilsCrossed,
      title: "Advance Food Orders",
      description: "All food orders must be placed in advance. Please inform us at least a few hours before mealtime.",
    },
    {
      icon: Users,
      title: "Respect Other Guests",
      description: "Guests must maintain a respectful and peaceful atmosphere. Please be considerate of other families and groups.",
    },
  ];

  return (
    <section className="py-12 bg-accent/10 border-y border-accent/20">
      <div className="container-cottage">
        <div className="flex items-center justify-center gap-3 mb-8">
          <AlertTriangle className="w-6 h-6 text-accent" />
          <h2 className="text-xl md:text-2xl font-heading font-semibold text-foreground">
            Cottage Rules & Policies
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-background rounded-xl border border-border shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                <rule.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{rule.title}</h3>
              <p className="text-sm text-muted-foreground">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CottageRules;
