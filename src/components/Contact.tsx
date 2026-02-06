import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open email client with pre-filled message for reliable contact
    const subject = encodeURIComponent(`Inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:stay@gopikacottage.com?subject=${subject}&body=${body}`;
    toast.info("Your email client will open. Please send the email to complete your inquiry.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      details: "Gopika Cottage, Near Chamunda Devi Temple,\nAt & Post Kihim, Tal- Alibag,\nKihim, Alibaug-402201, Maharashtra",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "Suraj Mhatre – 9969759811\nSachin Mhatre – 8369564979",
    },
    {
      icon: Mail,
      title: "Email",
      details: "stay@gopikacottage.com\nbookings@gopikacottage.com",
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: "Mon - Sun: 8 AM - 10 PM\nCheck-in: 2 PM | Check-out: 11 AM",
    },
  ];

  return (
    <section id="contact" className="section-padding bg-background">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Get In Touch
          </span>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            We'd Love to <span className="text-primary">Hear From You</span>
          </h2>
          <p className="subtitle">
            Have questions about your stay? Need help planning your trip? 
            Reach out and we'll respond promptly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div className="card-cottage p-6 lg:p-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  required
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Message
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your travel plans, dates, or any questions..."
                  rows={5}
                  required
                />
              </div>
              <Button variant="hero" size="lg" className="w-full" type="submit">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            {/* Contact Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {contactInfo.map((item) => (
                <div
                  key={item.title}
                  className="bg-secondary/50 rounded-xl p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {item.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map - Gopika Cottage, Kihim, Alibaug location */}
            <div className="rounded-xl overflow-hidden shadow-soft h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.5!2d72.8783!3d18.7289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be87c95e4c9d7c1%3A0x1234567890abcdef!2sNear%20Chamunda%20Devi%20Temple%2C%20Kihim%2C%20Alibaug!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Gopika Cottage Location - Near Chamunda Devi Temple, Kihim, Alibaug"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
