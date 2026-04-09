import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

export default function AdminLayout() {
  const location = useLocation();

  useEffect(() => {
    AOS.refresh();
  }, [location]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/dashboard') return 'Dashboard';
    if (path.includes('/user')) return 'User Profile';
    if (path.includes('/workouts')) return 'Workout Management';
    if (path.includes('/nutrition')) return 'Nutrition Tracking';
    if (path.includes('/progress')) return 'Progress Tracking';
    if (path.includes('/bmi')) return 'BMI Calculator';
    if (path.includes('/settings')) return 'Preferences';
    return '';
  };

  return (
    <div
      className="flex min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1601597111515-79b41fe7c5b7?auto=format&fit=crop&w=1740&q=80)',
      }}
    >
      <Sidebar />
      <div className="flex-1 p-6 bg-black/80 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-4 pb-4">
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
            {getPageTitle()}
          </h1>
          <NotificationBell />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
