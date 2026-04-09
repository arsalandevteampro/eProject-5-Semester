// Footer.jsx
import React from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-bold text-gold">FitTrack</h2>
          <p className="mt-3 text-gray-300">
            Your personal fitness & diet companion. Track, train, and transform
            with us.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-gold"><Facebook size={20} /></a>
            <a href="#" className="hover:text-gold"><Twitter size={20} /></a>
            <a href="#" className="hover:text-gold"><Instagram size={20} /></a>
            <a href="#" className="hover:text-gold"><Youtube size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-gold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-300">
            <li><a href="#" className="hover:text-gold">Home</a></li>
            <li><a href="#" className="hover:text-gold">About Us</a></li>
            <li><a href="#" className="hover:text-gold">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-gold mb-3">Contact</h3>
          <p className="text-gray-300">📧 support@fittrack.com</p>
          <p className="text-gray-300">📞 +123 456 789</p>
          <p className="text-gray-300">🏠 123 Fitness St, New York</p>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-gold mb-3">Subscribe</h3>
          <p className="text-gray-300 mb-3">Stay updated with our latest fitness tips.</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-2 rounded-md text-black focus:outline-none flex-1"
            />
            <button
              type="submit"
              className="bg-gold text-black bg-yellow-400 px-4 py-2 rounded-md hover:bg-yellow-500 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center text-gray-400 text-sm mt-10 border-t border-gray-700 pt-5">
        © {new Date().getFullYear()} FitTrack. All rights reserved.
      </div>
    </footer>
  );
}
