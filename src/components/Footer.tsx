import { Instagram, Youtube, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Amenities", href: "#amenities" },
    { name: "Gallery", href: "#gallery" },
    { name: "Pricing", href: "#pricing" },
    { name: "Food Menu", href: "#food-menu" },
    { name: "Contact", href: "#contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms & Conditions", href: "#terms" },
    { name: "Cancellation Policy", href: "#cancellation" },
    { name: "Refund Policy", href: "#refund" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/reel/CqXSpZaPBau/?utm_source=ig_web_button_share_sheet", label: "Instagram" },
    { icon: Youtube, href: "https://youtu.be/a1DeUBvv1CQ?si=r-InEJ30NT4yzD1_", label: "YouTube" },
  ];

  return (
    <footer className="bg-foreground text-background/80">
      {/* Main Footer */}
      <div className="container-cottage py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#home" className="inline-block mb-6">
              <span className="font-heading text-3xl font-semibold text-background">
                Gopika Cottage
              </span>
            </a>
            <p className="text-background/70 mb-6 leading-relaxed">
              Your perfect beach retreat near Chamunda Devi Temple in Kihim, Alibaug. 
              Experience nature, comfort, and genuine hospitality by the sea.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2 rounded-full bg-background/10 hover:bg-background/20 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-background font-semibold text-lg mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-background font-semibold text-lg mb-6">
              Policies
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-background font-semibold text-lg mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4 text-background/70">
              <li>
                <span className="block text-background/50 text-sm mb-1">
                  Address
                </span>
                Gopika Cottage, Near Chamunda Devi Temple,
                <br />
                At & Post Kihim, Tal- Alibag,
                <br />
                Kihim, Alibaug-402201, Maharashtra
              </li>
              <li>
                <span className="block text-background/50 text-sm mb-1">
                  Phone
                </span>
                <div className="space-y-1">
                  <a 
                    href="https://www.justdial.com/Alibaug/Gopika-Cottage-Near-Chamunda-Devi-Temple-Kihim/9999PX22-X22-191205125956-V6F7_BZDET" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-background block"
                  >
                    Suraj Mhatre – 9969759811
                  </a>
                  <a 
                    href="https://www.justdial.com/Alibaug/Gopika-Cottage-Near-Chamunda-Devi-Temple-Kihim/9999PX22-X22-191205125956-V6F7_BZDET" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-background block"
                  >
                    Sachin Mhatre – 8369564979
                  </a>
                </div>
              </li>
              <li>
                <span className="block text-background/50 text-sm mb-1">
                  Email
                </span>
                <a
                  href="mailto:stay@gopikacottage.com"
                  className="hover:text-background"
                >
                  stay@gopikacottage.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-cottage py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
            <p>
              © {currentYear} Gopika Cottage. All rights reserved.
            </p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-destructive fill-destructive" /> for nature lovers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
