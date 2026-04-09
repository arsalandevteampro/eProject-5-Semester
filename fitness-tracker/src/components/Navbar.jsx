import React, { useState, useEffect } from "react";

const navItems = [
  { id: "banner", label: "Banner" },
  { id: "slider", label: "Slider" },
  { id: "gallery", label: "Gallery" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact Us" },
];

export default function Navbar({ onSignupClick, onLoginClick }) {
  const [active, setActive] = useState("banner");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  const handleClick = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handlePortalClick = () => {
    window.location.href = "/admin";
  };

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-[999] flex items-center justify-between px-8 py-3 rounded-2xl bg-white/10 backdrop-blur-xl shadow-lg">
      {/* Logo */}
      <img
        src="/assets/logo.png"
        alt="Logo"
        className="h-16 w-auto cursor-pointer"
        style={{ backgroundColor: "transparent" }}
      />

      {/* Hamburger — mobile only */}
      <button
        className="md:hidden flex flex-col gap-[5px] cursor-pointer z-[1001]"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-[3px] bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-x-[5px] translate-y-[5px]" : ""}`} />
        <span className={`block w-6 h-[3px] bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-[3px] bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 translate-x-[5px] -translate-y-[5px]" : ""}`} />
      </button>

      {/* Desktop nav */}
      <ul className="hidden md:flex gap-2 list-none">
        {navItems.map(({ id, label }) => (
          <li key={id}>
            <button
              onClick={() => handleClick(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active === id
                  ? "bg-[var(--primary-main)] text-white shadow-md"
                  : "text-white/85 hover:bg-white/10"
                }`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* Desktop auth buttons */}
      <div className="hidden md:flex gap-3">
        {!isLoggedIn ? (
          <>
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-lg bg-white/10 text-[var(--primary-main)] font-semibold text-sm hover:bg-[var(--primary-light)] transition-all duration-200"
            >
              Login
            </button>
            <button
              onClick={onSignupClick}
              className="px-4 py-2 rounded-lg bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white font-semibold text-sm transition-all duration-200"
            >
              Sign Up
            </button>
          </>
        ) : (
          <button
            onClick={handlePortalClick}
            className="px-4 py-2 rounded-lg bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white font-semibold text-sm transition-all duration-200"
          >
            Portal
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-gray-900/95 backdrop-blur-xl rounded-2xl p-5 flex flex-col gap-3 shadow-2xl md:hidden">
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleClick(id)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active === id
                  ? "bg-[var(--primary-main)] text-white"
                  : "text-white/80 hover:bg-white/10"
                }`}
            >
              {label}
            </button>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={onLoginClick}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-[var(--primary-main)] font-semibold text-sm hover:bg-[var(--primary-light)] transition-all"
                >
                  Login
                </button>
                <button
                  onClick={onSignupClick}
                  className="w-full px-4 py-2 rounded-lg bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white font-semibold text-sm transition-all"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={handlePortalClick}
                className="w-full px-4 py-2 rounded-lg bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white font-semibold text-sm transition-all"
              >
                Portal
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
