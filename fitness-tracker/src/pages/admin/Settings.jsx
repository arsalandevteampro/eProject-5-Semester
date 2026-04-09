import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

export default function Settings() {
  const { settings, updateSettings, loading } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('notifications');

  // Update local settings when global settings load
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSettingChange = (category, setting, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const resetToDefaults = () => {
    const defaultSettings = {
      notifications: {
        workoutReminders: true,
        mealReminders: true,
        progressUpdates: true,
        goalAchievements: true
      },
      units: {
        weight: 'kg',
        height: 'cm',
        distance: 'km',
        measurements: 'cm'
      },
      dailyGoals: {
        calories: 2000,
        weeklyWorkouts: 5,
        streakGoal: 30
      },
      theme: 'dark'
    };
    setLocalSettings(defaultSettings);
    setMessage('Settings reset to defaults! Click Save to apply.');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className="p-6 text-white text-center">Loading settings...</div>;

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'units', label: 'Units', icon: '📏' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
          Settings & Preferences
        </h2>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-semibold transition-all"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg hover:scale-105 active:scale-95"
          >
            Save Settings
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex bg-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-base font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#f2c22d] text-gray-900 shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-4">Notification Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(localSettings.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                    <div>
                      <h4 className="text-white font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-gray-300 text-sm">
                        Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-1">Daily Targets</h3>
                <p className="text-gray-400 text-sm">Set your fitness goals. These are used to track your progress on the Dashboard.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* ── Daily Calorie Goal ── */}
                <div className="p-6 bg-white/10 rounded-2xl shadow-sm flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">🍽️</div>
                  <div>
                    <p className="text-white font-semibold text-base">Daily Calorie Goal</p>
                    <p className="text-gray-400 text-xs mt-0.5">Target calorie intake per day (kcal)</p>
                  </div>
                  {/* Stepper */}
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, calories: Math.max(500, (prev.dailyGoals?.calories || 2000) - 50) } }))}
                      className="w-10 h-10 flex-shrink-0 rounded-xl bg-orange-500/20 text-orange-300 hover:bg-orange-500/40 font-bold text-xl transition-all flex items-center justify-center"
                    >−</button>
                    <input
                      type="number"
                      value={localSettings.dailyGoals?.calories || 2000}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, calories: parseInt(e.target.value) || 0 } }))}
                      className="min-w-0 flex-1 p-3 text-center text-lg font-bold rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-[#f2c22d] outline-none transition-all"
                      placeholder="2000"
                    />
                    <button
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, calories: (prev.dailyGoals?.calories || 2000) + 50 } }))}
                      className="w-10 h-10 flex-shrink-0 rounded-xl bg-orange-500/20 text-orange-300 hover:bg-orange-500/40 font-bold text-xl transition-all flex items-center justify-center"
                    >+</button>
                  </div>
                  <p className="text-xs text-gray-500 italic">⭐ Recommended: <span className="text-orange-300 font-medium">2000 kcal</span> (WHO general guideline)</p>
                </div>

                {/* ── Weekly Workout Goal ── */}
                <div className="p-6 bg-white/10 rounded-2xl shadow-sm flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">🏋️</div>
                  <div>
                    <p className="text-white font-semibold text-base">Weekly Workout Goal</p>
                    <p className="text-gray-400 text-xs mt-0.5">Target workouts per week (days)</p>
                  </div>
                  {/* Stepper */}
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, weeklyWorkouts: Math.max(1, (prev.dailyGoals?.weeklyWorkouts || 5) - 1) } }))}
                      className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 font-bold text-xl transition-all flex items-center justify-center"
                    >−</button>
                    <input
                      type="number"
                      min="1" max="14"
                      value={localSettings.dailyGoals?.weeklyWorkouts || 5}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, weeklyWorkouts: parseInt(e.target.value) || 0 } }))}
                      className="min-w-0 flex-1 p-3 text-center text-lg font-bold rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-[#f2c22d] outline-none transition-all"
                      placeholder="5"
                    />
                    <button
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, weeklyWorkouts: Math.min(14, (prev.dailyGoals?.weeklyWorkouts || 5) + 1) } }))}
                      className="w-10 h-10 flex-shrink-0 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 font-bold text-xl transition-all flex items-center justify-center"
                    >+</button>
                  </div>
                  <p className="text-xs text-gray-500 italic">⭐ Recommended: <span className="text-blue-300 font-medium">5 days</span> (WHO: 150 min/week)</p>
                </div>

                {/* ── Streak Goal ── */}
                <div className="p-6 bg-white/10 rounded-2xl shadow-sm flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">🔥</div>
                  <div>
                    <p className="text-white font-semibold text-base">Streak Goal</p>
                    <p className="text-gray-400 text-xs mt-0.5">Target consecutive workout days (days)</p>
                  </div>
                  {/* Stepper */}
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, streakGoal: Math.max(1, (prev.dailyGoals?.streakGoal || 30) - 5) } }))}
                      className="w-10 h-10 flex-shrink-0 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 font-bold text-xl transition-all flex items-center justify-center"
                    >−</button>
                    <input
                      type="number"
                      min="1" max="365"
                      value={localSettings.dailyGoals?.streakGoal || 30}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, streakGoal: parseInt(e.target.value) || 0 } }))}
                      className="min-w-0 flex-1 p-3 text-center text-lg font-bold rounded-xl bg-white/5 text-white focus:ring-2 focus:ring-[#f2c22d] outline-none transition-all"
                      placeholder="30"
                    />
                    <button
                      type="button"
                      onClick={() => setLocalSettings(prev => ({ ...prev, dailyGoals: { ...prev.dailyGoals, streakGoal: Math.min(365, (prev.dailyGoals?.streakGoal || 30) + 5) } }))}
                      className="w-10 h-10 flex-shrink-0 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 font-bold text-xl transition-all flex items-center justify-center"
                    >+</button>
                  </div>
                  <p className="text-xs text-gray-500 italic">⭐ Recommended: <span className="text-purple-300 font-medium">30 days</span> (habit formation benchmark)</p>
                </div>

              </div>
            </div>
          )}

          {/* Units Tab */}
          {activeTab === 'units' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white mb-4">Measurement Units</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(localSettings.units).map(([key, value]) => (
                  <div key={key} className="p-4 bg-white/10 rounded-lg">
                    <label className="block text-white font-medium mb-2 capitalize">
                      {key} Units
                    </label>
                    <select
                      value={value}
                      onChange={(e) => handleSettingChange('units', key, e.target.value)}
                      className="w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 text-white transition-all outline-none"
                    >
                      {key === 'weight' && (
                        <>
                          <option value="kg" className="text-black">Kilograms (kg)</option>
                          <option value="lbs" className="text-black">Pounds (lbs)</option>
                        </>
                      )}
                      {key === 'height' && (
                        <>
                          <option value="cm" className="text-black">Centimeters (cm)</option>
                          <option value="ft" className="text-black">Feet & Inches (ft)</option>
                        </>
                      )}
                      {key === 'distance' && (
                        <>
                          <option value="km" className="text-black">Kilometers (km)</option>
                          <option value="mi" className="text-black">Miles (mi)</option>
                        </>
                      )}
                      {key === 'measurements' && (
                        <>
                          <option value="cm" className="text-black">Metric (cm)</option>
                          <option value="in" className="text-black">Imperial (in)</option>
                        </>
                      )}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
