import { Heart, Mountain, TreePine, Sunrise } from "lucide-react";
import cottageInterior from "@/assets/cottage-interior.jpg";

const About = () => {
  const highlights = [
    {
      icon: Mountain,
      title: "Mountain Views",
      description: "Wake up to breathtaking panoramic mountain vistas",
    },
    {
      icon: TreePine,
      title: "Nature Immersion",
      description: "Surrounded by lush forests and pristine wilderness",
    },
    {
      icon: Sunrise,
      title: "Peaceful Retreat",
      description: "Find tranquility away from the city's hustle",
    },
    {
      icon: Heart,
      title: "Homely Comfort",
      description: "Enjoy warm hospitality and home-cooked meals",
    },
  ];

  return (
    <section id="about" className="section-padding bg-secondary/30">
      <div className="container-cottage">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="relative animate-fade-in-up">
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={cottageInterior}
                alt="Cozy interior of Gopika Cottage"
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -right-6 md:bottom-8 md:-right-8 bg-card p-6 rounded-xl shadow-elevated max-w-[200px]">
              <div className="text-4xl font-heading font-semibold text-primary mb-1">
                16+ Years
              </div>
              <div className="text-sm text-muted-foreground">
                Creating memorable stays
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="animate-fade-in-up">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">
              Our Story
            </span>
            <h2 className="heading-section text-foreground mt-2 mb-6">
              Welcome to{" "}
              <span className="text-primary">Gopika Cottage</span>
            </h2>
            <p className="subtitle mb-6">
              Gopika Cottage is more than just a place to stay — it's an experience 
              of warmth, nature, and genuine hospitality. Located near the pristine 
              beaches of Alibaug Kihim, our family-run cottage offers the best beach 
              views and has been welcoming travelers from around the world since 2009.
            </p>
            <p className="text-muted-foreground mb-8">
              Whether you're seeking a romantic getaway, a family vacation, or a solo 
              retreat to reconnect with nature, Gopika Cottage offers the perfect 
              sanctuary. Our commitment to sustainable tourism and authentic experiences 
              ensures every guest leaves with cherished memories.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-4">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card/50 hover:bg-card transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
