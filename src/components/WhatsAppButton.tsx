import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const phoneNumber = "919876543210"; // Replace with actual number
  const message = encodeURIComponent(
    "Hello! I'm interested in booking a stay at Gopika Cottage. Please share availability details."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
      <span className="font-medium hidden sm:inline group-hover:inline">
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;
