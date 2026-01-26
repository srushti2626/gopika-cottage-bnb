import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import gopikaCottageLogo from "@/assets/gopika-cottage-logo.png";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
    });
    supabase.auth.getSession().then(({
      data
    }) => {
      setIsAuthed(!!data.session);
    });
    return () => subscription.unsubscribe();
  }, []);
  const navLinks = [{
    name: "Home",
    href: "#home"
  }, {
    name: "About",
    href: "#about"
  }, {
    name: "Amenities",
    href: "#amenities"
  }, {
    name: "Gallery",
    href: "#gallery"
  }, {
    name: "Food Menu",
    href: "#food-menu"
  }, {
    name: "Reviews",
    href: "#reviews"
  }, {
    name: "Contact",
    href: "#contact"
  }];
  return <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container-cottage">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center">
            <img src={gopikaCottageLogo} alt="Gopika Cottage" className="h-12 md:h-16 w-auto object-cover border-0 border-none opacity-80 rounded-none shadow-none" />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => <a key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 mx-0 my-0 px-0 py-[2px] font-serif border-0">
                {link.name}
              </a>)}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://www.justdial.com/Alibaug/Gopika-Cottage-Near-Chamunda-Devi-Temple-Kihim/9999PX22-X22-191205125956-V6F7_BZDET" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="w-4 h-4" />
              <span>9969759811 / 8369564979</span>
            </a>
            <Button variant="hero" size="lg" asChild>
              <a href="#booking">Book Now</a>
            </Button>

            {/* Admin entrypoint (for staff/admin) */}
            {isAuthed ? <>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/admin">Dashboard</Link>
                </Button>
                <Button variant="ghost" size="lg" onClick={() => supabase.auth.signOut()}>
                  Logout
                </Button>
              </> : <Button variant="outline" size="lg" asChild>
                <Link to="/auth">Admin Login</Link>
              </Button>}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-foreground" aria-label="Toggle menu">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map(link => <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2">
                  {link.name}
                </a>)}
              <div className="pt-4 border-t border-border/50">
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <a href="#booking">Book Now</a>
                </Button>

                <div className="mt-3 flex flex-col gap-2">
                  {isAuthed ? <>
                      <Button variant="outline" size="lg" className="w-full" asChild>
                        <Link to="/admin" onClick={() => setIsOpen(false)}>
                          Dashboard
                        </Link>
                      </Button>
                      <Button variant="ghost" size="lg" className="w-full" onClick={() => {
                  supabase.auth.signOut();
                  setIsOpen(false);
                }}>
                        Logout
                      </Button>
                    </> : <Button variant="outline" size="lg" className="w-full" asChild>
                      <Link to="/auth" onClick={() => setIsOpen(false)}>
                        Admin Login
                      </Link>
                    </Button>}
                </div>
              </div>
            </div>
          </div>}
      </div>
    </nav>;
};
export default Navbar;