import { useState } from "react";
import { X } from "lucide-react";
import cottageInterior from "@/assets/cottage-interior.jpg";
import cottageBedroom from "@/assets/cottage-bedroom.jpg";
import cottageOutdoor from "@/assets/cottage-outdoor.jpg";
import heroImage from "@/assets/hero-cottage.jpg";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    {
      src: heroImage,
      alt: "Gopika Cottage exterior view",
      caption: "Our Beautiful Cottage",
      span: "md:col-span-2 md:row-span-2",
    },
    {
      src: cottageBedroom,
      alt: "Cozy bedroom with mountain view",
      caption: "Master Bedroom",
      span: "",
    },
    {
      src: cottageInterior,
      alt: "Living room with rustic decor",
      caption: "Living Area",
      span: "",
    },
    {
      src: cottageOutdoor,
      alt: "Outdoor deck with stunning views",
      caption: "Private Deck",
      span: "md:col-span-2",
    },
  ];

  return (
    <section id="gallery" className="section-padding bg-secondary/30">
      <div className="container-cottage">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">
            Photo Gallery
          </span>
          <h2 className="heading-section text-foreground mt-2 mb-4">
            Explore <span className="text-primary">Our Space</span>
          </h2>
          <p className="subtitle">
            Take a visual tour of Gopika Cottage and discover the charm that 
            awaits you.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer overflow-hidden rounded-xl ${image.span}`}
              onClick={() => setSelectedImage(image.src)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full min-h-[250px] object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-background font-medium">
                  {image.caption}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-background hover:text-accent transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Gallery preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
