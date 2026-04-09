import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const images = [
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
];

const Gallery = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <section
      id="gallery"
      className="py-20 px-6 bg-gradient-to-b from-gray-950 to-black text-center"
      data-aos="fade-up"
    >
      <h2 className="text-4xl font-extrabold text-white mb-3">
        Fitness <span className="text-[var(--primary-main)]">Gallery</span>
      </h2>
      <p className="text-gray-400 text-lg mb-12">Strong looks better with sweat.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {images.map((src, index) => (
          <div
            key={index}
            data-aos="zoom-in"
            className="group overflow-hidden rounded-xl shadow-lg transition-all duration-300"
          >
            <img
              src={src}
              alt={`Fitness ${index + 1}`}
              className="w-full h-52 object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
