import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Banner = ({ onSignupClick }) => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section
      id="banner"
      className="relative h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=1650&q=80')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div
        className="relative z-10 text-center text-white max-w-2xl px-6 py-10 mx-4 rounded-2xl backdrop-blur-sm bg-black/30"
        data-aos="fade-up"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-[var(--primary-light)] drop-shadow-lg leading-tight">
          Track Your Fitness Journey
        </h1>
        <p className="text-xl text-gray-200 mb-8 leading-relaxed">
          Unlock your potential with personalized workout plans, nutrition
          tracking, and real-time progress analytics.
        </p>
        <button
          onClick={onSignupClick}
          className="px-8 py-3 bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] active:scale-95 text-white font-bold text-lg rounded-full shadow-xl transition-all duration-300"
        >
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Banner;
