import React, { useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

export default function ThemeToggle() {
  const { settings, updateSettings } = useSettings();
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    updateSettings({
      ...settings,
      theme: isDark ? 'light' : 'dark'
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className={`backdrop-blur-md text-sm px-4 py-2 rounded-lg font-semibold transition-all hover:bg-white/20 ${
        isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
      }`}
    >
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}