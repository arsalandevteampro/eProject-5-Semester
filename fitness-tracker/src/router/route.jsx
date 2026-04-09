import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import AdminLayout from "../components/admin/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import BMICalculator from "../pages/admin/Bmi";
import UserProfile from "../pages/admin/UserProfile";
import Settings from "../pages/admin/Settings";
import Workouts from "../pages/admin/Workouts";
import Nutrition from "../pages/admin/Nutrition";
import Progress from "../pages/admin/Progress";
import { isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />           {/* /admin */}
          <Route path="user" element={<UserProfile />} />         {/* /admin/user */}
          <Route path="workouts" element={<Workouts />} />         {/* /admin/workouts */}
          <Route path="nutrition" element={<Nutrition />} />         {/* /admin/nutrition */}
          <Route path="progress" element={<Progress />} />         {/* /admin/progress */}
          <Route path="bmi" element={<BMICalculator />} />         {/* /admin/bmi */}
          <Route path="settings" element={<Settings />} />  {/* /admin/settings */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
