import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
// import SignUp from "../pages/SignUp";
// import Dashboard from "../pages/admin/Dashboard";
import { isAuthenticated } from "../utils/auth";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* <Route path="/signup" element={<SignUp />} /> */}
        <Route
          path="/admin"
          element={isAuthenticated() ? <Dashboard /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
