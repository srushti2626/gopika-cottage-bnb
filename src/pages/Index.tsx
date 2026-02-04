import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Amenities from "@/components/Amenities";
import Gallery from "@/components/Gallery";
import Pricing from "@/components/Pricing";
import FoodMenu from "@/components/FoodMenu";
import CottageRules from "@/components/CottageRules";
import Testimonials from "@/components/Testimonials";
import BookingSection from "@/components/BookingSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Amenities />
        <Gallery />
        <Pricing />
        <FoodMenu />
        <CottageRules />
        <Testimonials />
        <BookingSection />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
