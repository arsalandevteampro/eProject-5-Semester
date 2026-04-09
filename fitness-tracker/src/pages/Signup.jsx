import { useState } from "react";
import axios from "../api/axios";
import { saveToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/signup", { email, password });
      saveToken(res.data.token);
      navigate("/admin");
    } catch (err) {
      alert("Signup failed", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Sisdfasdgn Up</button>
    </form>
  );
}
