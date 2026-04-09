import React, { useState } from "react";
import axios from "axios";

const SignupModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await axios.post("http://localhost:5000/api/auth/register", { name, email, password });
      localStorage.setItem("token", response.data.token);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-[8px] animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
    >
      {/* Modal card — dark glassmorphism */}
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl p-8 text-white shadow-2xl"
        style={{
          background: "rgba(15, 15, 30, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-white/50 hover:text-white transition-colors"
        >
          ×
        </button>

        <h1 className="text-center text-4xl font-bold mb-6 text-white">Sign Up</h1>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { type: "text", placeholder: "Full Name", value: name, setter: setName },
            { type: "email", placeholder: "Email", value: email, setter: setEmail },
            { type: "password", placeholder: "Password", value: password, setter: setPassword },
            { type: "password", placeholder: "Confirm Password", value: confirmPassword, setter: setConfirmPassword },
          ].map(({ type, placeholder, value, setter }) => (
            <input
              key={placeholder}
              type={type}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setter(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/45 focus:outline-none focus:border-[var(--primary-400)] transition-colors text-sm"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl bg-[var(--primary-400)] hover:bg-[var(--primary-main)] active:scale-95 disabled:opacity-60 text-black font-bold text-base transition-all duration-200"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;
