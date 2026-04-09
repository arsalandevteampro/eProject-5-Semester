import React from "react";

const About = () => {
  return (
    <section
      id="about"
      className="relative flex items-center justify-center py-20 px-6 bg-gradient-to-r from-gray-900 via-black to-gray-900"
    >
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Text Section */}
        <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform duration-300">
          <h2 className="text-4xl font-bold text-white mb-4">
            About <span className="text-[var(--primary-main)]">FitnessTracker</span>
          </h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            FitnessTracker is your ultimate fitness companion — helping you
            track your workouts, meals, and progress with style and precision.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Built by fitness lovers, for lovers of fitness — our app gives you
            the power to stay consistent, stay strong, and celebrate your
            wins—every step of the way.
          </p>
        </div>

        {/* Image Section */}
        <div className="relative group">
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=1500&q=80"
              alt="About Fitness Tracker"
              className="w-full h-[450px] object-cover transform group-hover:scale-110 transition duration-500"
            />
          </div>
          {/* Floating Glow Effect */}
          <div className="absolute -inset-2 bg-[var(--primary-main)]/30 blur-3xl rounded-full opacity-0 group-hover:opacity-60 transition duration-500"></div>
        </div>
      </div>
    </section>
  );
};

export default About;
