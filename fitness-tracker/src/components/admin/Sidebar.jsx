import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, User, Dumbbell, Apple, LineChart, Calculator, Settings } from "lucide-react";

export default function Sidebar() {
  const { pathname } = useLocation();

  const navLinks = [
    { path: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { path: "/admin/user", label: "User Profile", Icon: User },
    { path: "/admin/workouts", label: "Workouts", Icon: Dumbbell },
    { path: "/admin/nutrition", label: "Nutrition", Icon: Apple },
    { path: "/admin/progress", label: "Progress", Icon: LineChart },
    { path: "/admin/bmi", label: "BMI Calculator", Icon: Calculator },
    { path: "/admin/settings", label: "Preferences", Icon: Settings },
  ];

  const linkClass = (path) => {
    const isActive = pathname === path || (path !== '/admin/dashboard' && pathname.startsWith(path + "/")) || (path === '/admin/dashboard' && pathname === '/admin');
    
    return `flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 font-medium ${
      isActive
        ? "bg-[var(--primary-400)] text-gray-900 shadow-md translate-x-1"
        : "text-[var(--text-color)] hover:bg-[var(--primary-400)] hover:text-gray-900 hover:bg-opacity-80"
    }`;
  };

  return (
    <div
      className="
    w-72
    p-6
    bg-black/60
    backdrop-blur-xl
    rounded-r-2xl
    shadow-2xl
    flex flex-col
    text-[var(--text-color)]
  "
      aria-label="Sidebar"
    >
      <div className="flex justify-center items-center mb-10 mt-2 relative">
        <Link to="/">
          <img
            src="/assets/logo.png"
            alt="Logo"
            className="cursor-pointer h-14 w-auto drop-shadow-lg"
            style={{ backgroundColor: "transparent" }}
          />
        </Link>
      </div>

      <nav className="flex flex-col space-y-3 flex-1">
        {navLinks.map(({ path, label, Icon }) => (
          <Link key={path} to={path === '/admin/dashboard' ? '/admin' : path} className={linkClass(path)}>
            <Icon size={20} className={pathname === path || (path !== '/admin/dashboard' && pathname.startsWith(path + "/")) || (path === '/admin/dashboard' && pathname === '/admin') ? "text-gray-900" : "text-gray-400"} />
            {label}
          </Link>
        ))}
      </nav>
      
      <footer className="mt-8 text-xs text-[var(--primary-light)]/70 text-center pt-6 font-medium tracking-wide">
        © 2025 FitTrack Inc.
      </footer>
    </div>
  );
}
