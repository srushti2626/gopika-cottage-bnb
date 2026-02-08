import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TestimonialData {
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
}

const defaultTestimonials: TestimonialData[] = [
  {
    name: "Priya Sharma",
    location: "Delhi, India",
    rating: 5,
    text: "An absolutely magical experience! The cottage is even more beautiful than the pictures. Waking up to the mountain views was surreal. The hosts were incredibly warm and made us feel at home.",
    date: "December 2024",
  },
  {
    name: "Michael Chen",
    location: "Singapore",
    rating: 5,
    text: "Perfect getaway from the city chaos. The cottage is spotlessly clean, well-maintained, and has all modern amenities. The bonfire evening was the highlight of our trip!",
    date: "November 2024",
  },
  {
    name: "Anjali & Rahul Kapoor",
    location: "Mumbai, India",
    rating: 5,
    text: "We celebrated our anniversary here and it couldn't have been more perfect. The peaceful surroundings, delicious home-cooked meals, and warm hospitality made it truly special.",
    date: "October 2024",
  },
  {
    name: "David Thompson",
    location: "London, UK",
    rating: 5,
    text: "Having traveled extensively in India, Gopika Cottage stands out for its authenticity and attention to detail. A genuine hidden gem that I'll definitely return to.",
    date: "September 2024",
  },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(defaultTestimonials);

  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const dbTestimonials: TestimonialData[] = data.map((t) => ({
          name: t.guest_name,
          location: t.guest_location || "",
          rating: t.rating,
          text: t.review_text,
          date: t.review_date || "",
        }));
        setTestimonials(dbTestimonials);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section id="reviews" className="section-padding bg-secondary/30">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Guest Reviews
          </span>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            What Our <span className="text-primary">Guests Say</span>
          </h2>
          <p className="subtitle">
            Don't just take our word for it — hear from travelers who've 
            experienced the Gopika Cottage magic.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="card-cottage p-6 lg:p-8 relative"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-accent fill-accent"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.location}
                    {testimonial.location && testimonial.date && " • "}
                    {testimonial.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 bg-card p-6 rounded-2xl shadow-soft">
            <div>
              <div className="text-4xl font-heading font-semibold text-foreground">
                4.9
              </div>
              <div className="text-sm text-muted-foreground">Overall Rating</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-6 h-6 text-accent fill-accent"
                />
              ))}
            </div>
            <div className="w-px h-12 bg-border" />
            <div>
              <div className="text-4xl font-heading font-semibold text-foreground">
                500+
              </div>
              <div className="text-sm text-muted-foreground">Happy Guests</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;