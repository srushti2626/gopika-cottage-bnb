import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import cottageExterior from "@/assets/cottage-exterior.jpg";
import room1 from "@/assets/room1.jpg";
import room2 from "@/assets/room2.jpg";
import passage1 from "@/assets/passage1.jpg";
import passage2 from "@/assets/passage2.jpg";
import sittingArea from "@/assets/sitting-area.jpg";
import sittingArea2 from "@/assets/sitting-area2.jpg";

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  span: string;
}

const defaultImages: GalleryImage[] = [
  {
    src: cottageExterior,
    alt: "Gopika Cottage exterior view",
    caption: "Our Beautiful Cottage",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    src: room1,
    alt: "Cozy bedroom with modern ceiling",
    caption: "Comfortable Bedroom",
    span: "",
  },
  {
    src: room2,
    alt: "Spacious room with wooden ceiling",
    caption: "Spacious Room",
    span: "",
  },
  {
    src: passage2,
    alt: "Lobby with traditional Warli art",
    caption: "Welcome Lobby",
    span: "md:col-span-2",
  },
  {
    src: passage1,
    alt: "Sunlit hallway with wooden flooring",
    caption: "Bright Passage",
    span: "",
  },
  {
    src: sittingArea2,
    alt: "Evening ambiance at outdoor seating",
    caption: "Evening Vibes",
    span: "",
  },
  {
    src: sittingArea,
    alt: "Beach side sitting area",
    caption: "Beach Sitting Area",
    span: "md:col-span-2",
  },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<GalleryImage[]>(defaultImages);

  useEffect(() => {
    const fetchGalleryPhotos = async () => {
      const { data, error } = await supabase
        .from("gallery_photos")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const dbImages: GalleryImage[] = data.map((photo) => ({
          src: photo.image_url,
          alt: photo.alt_text,
          caption: photo.caption || photo.alt_text,
          span: photo.span_class || "",
        }));
        setImages(dbImages);
      }
    };

    fetchGalleryPhotos();
  }, []);

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