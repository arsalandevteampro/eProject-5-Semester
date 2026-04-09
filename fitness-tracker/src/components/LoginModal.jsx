import React, { useState } from "react";
import axios from "axios";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const LoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      saveToken(response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onClose();
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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

        <h1 className="text-center text-4xl font-bold mb-6 text-white">Login</h1>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-white placeholder-white/45 focus:outline-none focus:border-[var(--primary-400)] transition-colors text-sm"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-white placeholder-white/45 focus:outline-none focus:border-[var(--primary-400)] transition-colors text-sm"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-[var(--primary-400)] hover:bg-[var(--primary-main)] active:scale-95 text-black font-bold text-base transition-all duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
