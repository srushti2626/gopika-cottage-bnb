import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Star } from "lucide-react";
import heroImage from "@/assets/hero-cottage.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Gopika Cottage - A beautiful mountain retreat"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="container-cottage relative z-10 pt-24 md:pt-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-in">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-sm font-medium text-background">
              Top Rated Beach Retreat
            </span>
          </div>

          {/* Heading */}
          <h1 className="heading-display text-background mb-6 animate-fade-in-up">
            Your Perfect{" "}
            <span className="text-accent">Beach Escape</span>{" "}
            Awaits
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-background/90 font-light mb-8 leading-relaxed animate-fade-in-delay">
            Nestled near Chamunda Devi Temple in Kihim, Gopika Cottage offers a tranquil retreat 
            where nature meets comfort. Experience the perfect blend of coastal charm 
            and modern amenities.
          </p>

          {/* Location */}
          <div className="flex items-center gap-2 text-background/80 mb-8 animate-fade-in-delay">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">Kihim, Alibaug, Maharashtra, India</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay">
            <Button variant="accent" size="xl" asChild>
              <a href="#booking" className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Check Availability
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="bg-background/10 backdrop-blur-sm border-background/30 text-background hover:bg-background/20 hover:text-background"
              asChild
            >
              <a href="#gallery">Explore Cottage</a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-background/20 animate-fade-in-delay">
            <div>
              <div className="text-3xl md:text-4xl font-heading font-semibold text-background">
                4.9
              </div>
              <div className="text-sm text-background/70">Guest Rating</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-heading font-semibold text-background">
                500+
              </div>
              <div className="text-sm text-background/70">Happy Guests</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-heading font-semibold text-background">
                5+
              </div>
              <div className="text-sm text-background/70">Years of Service</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
        <div className="w-6 h-10 rounded-full border-2 border-background/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-background/80 rounded-full animate-pulse-soft" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
