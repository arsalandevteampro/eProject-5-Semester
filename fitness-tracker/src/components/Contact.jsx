import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const Contact = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
    AOS.init({ duration: 1000 });
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Email is invalid";
    }
    if (!formData.message.trim()) errs.message = "Message is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      setShowSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <section
      id="contact"
      className="relative bg-cover bg-center py-20 px-6"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1599058917212-d750089bcbe2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')", // gym background
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative max-w-2xl mx-auto text-center text-white">
        <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">
          Get in Touch 💬
        </h2>
        <p className="mb-8 text-gray-200">
          We'd love to hear from you! Whether you have a question, suggestion,
          or just want to say hello.
        </p>

        {/* Glass Form */}
        <form
          className="backdrop-blur-lg bg-white/10 shadow-xl rounded-2xl p-8 space-y-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div>
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-white/80 text-black focus:ring-2 focus:ring-green-500 outline-none shadow-md"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 rounded-lg bg-white/80 text-black focus:ring-2 focus:ring-green-500 outline-none shadow-md"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Your Message"
              rows="5"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full p-3 bg-white/80 text-black focus:ring-2 focus:ring-green-500 outline-none shadow-md"
            />
            {errors.message && (
              <p className="text-red-400 text-sm mt-1">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--primary-400)] hover:bg-[var(--primary-main)] text-white font-semibold py-3 shadow-lg transition-transform transform hover:scale-105"
          >
            Send Message
          </button>
        </form>

        {/* Success Message */}
        {showSuccess && (
          <div className="mt-6 bg-green-600/80 backdrop-blur-md text-white p-4 rounded-lg shadow-lg animate-bounce">
            ✅ Thank you for reaching out! We'll get back to you soon 🚀
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
