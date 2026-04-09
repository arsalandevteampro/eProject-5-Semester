import React, { useEffect, useState } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { getToken } from "../../utils/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import { convertWeight } from "../../utils/units";
import { Dumbbell, Apple, PieChart } from "lucide-react";
import { useNotifications } from "../../contexts/NotificationContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function Dashboard() {
  const { settings } = useSettings();
  const { generateReminders } = useNotifications();
  const [dashboardData, setDashboardData] = useState({
    workouts: [],
    nutrition: [],
    progress: [],
    recentWorkouts: [],
    recentNutrition: [],
    recentProgress: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    generateReminders();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = getToken();

      // Fetch all data in parallel
      const [workoutsRes, nutritionRes, progressRes] = await Promise.all([
        axios.get('http://localhost:5000/api/workouts', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/nutrition', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/progress', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const workouts = workoutsRes.data;
      const nutrition = nutritionRes.data;
      const progress = progressRes.data;

      setDashboardData({
        workouts,
        nutrition,
        progress,
        recentWorkouts: workouts.slice(0, 5),
        recentNutrition: nutrition.slice(0, 5),
        recentProgress: progress.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const totalWorkouts = dashboardData.workouts.length;
  const totalCalories = dashboardData.nutrition.reduce((sum, log) => {
    return sum + log.items.reduce((itemSum, item) => itemSum + (Number(item.calories) || 0), 0);
  }, 0);
  const avgCalories = totalCalories > 0 ? Math.round(totalCalories / dashboardData.nutrition.length) : 0;

  const latestWeightRaw = dashboardData.progress.length > 0 ? [...dashboardData.progress].sort((a,b) => new Date(b.date) - new Date(a.date))[0].weight : null;
  const latestWeight = latestWeightRaw ? convertWeight(latestWeightRaw, settings.units.weight) : null;
  
  const sortedProgress = [...dashboardData.progress].sort((a,b) => new Date(b.date) - new Date(a.date));
  const weightChange = sortedProgress.length > 1 ?
    (convertWeight(sortedProgress[0].weight, settings.units.weight) - 
     convertWeight(sortedProgress[1].weight, settings.units.weight)).toFixed(1) : 0;

  // Calculate workout frequency
  const thisWeekWorkouts = dashboardData.workouts.filter(workout => {
    const workoutDate = new Date(workout.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  }).length;

  // Calculate streak
  const calculateStreak = () => {
    if (dashboardData.workouts.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasWorkout = dashboardData.workouts.some(workout => {
        const workoutDate = new Date(workout.createdAt);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === checkDate.getTime();
      });

      if (hasWorkout) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Prepare chart data
  const workoutTrendData = {
    labels: dashboardData.workouts.slice(-7).map(w => new Date(w.createdAt).toLocaleDateString()),
    datasets: [{
      label: 'Workouts This Week',
      data: dashboardData.workouts.slice(-7).map(() => 1),
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.2)',
      tension: 0.4,
      fill: true,
    }]
  };

  const nutritionTrendData = {
    labels: dashboardData.nutrition.slice(-7).map(n => new Date(n.date).toLocaleDateString()),
    datasets: [{
      label: 'Daily Calories',
      data: dashboardData.nutrition.slice(-7).map(log =>
        log.items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)
      ),
      borderColor: 'rgba(34, 197, 94, 0.9)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      tension: 0.4,
      fill: true,
    }]
  };

  const macroDistributionData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{
      data: [
        dashboardData.nutrition.reduce((sum, log) =>
          sum + log.items.reduce((itemSum, item) => itemSum + (Number(item.protein) || 0), 0), 0
        ),
        dashboardData.nutrition.reduce((sum, log) =>
          sum + log.items.reduce((itemSum, item) => itemSum + (Number(item.carbs) || 0), 0), 0
        ),
        dashboardData.nutrition.reduce((sum, log) =>
          sum + log.items.reduce((itemSum, item) => itemSum + (Number(item.fat) || 0), 0), 0
        )
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(251, 191, 36, 1)'
      ],
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: 'white', font: { size: 12, weight: 'bold' } }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 4,
        padding: 8,
      }
    },
    scales: {
      x: {
        ticks: { color: 'white', font: { size: 11, weight: '600' } },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: 'white', font: { size: 11, weight: '600' }, beginAtZero: true },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 4,
        padding: 8,
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-8 text-white drop-shadow-md">
        Fitness Dashboard
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">🏋️</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Workouts</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{totalWorkouts}</p>
          <p className="text-xs font-semibold text-blue-800">{thisWeekWorkouts} this week</p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-green-100 to-green-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">🍎</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Calories</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{totalCalories}</p>
          <p className="text-xs font-semibold text-green-800">Avg: {avgCalories}/day</p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">🔥</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Current Streak</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{currentStreak}</p>
          <p className="text-xs font-semibold text-orange-800">days</p>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-sm p-6">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/60 flex items-center justify-center text-2xl shadow-sm">⚖️</div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Current Weight</h3>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">{latestWeight ? `${latestWeight} ${settings.units.weight}` : 'N/A'}</p>
          <p className="text-xs font-semibold text-purple-800">
            {weightChange > 0 ? `+${weightChange}` : weightChange < 0 ? weightChange : '0'} {settings.units.weight} trend
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Workout Trend */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Workout Activity (Last 7 Days)</h3>
          {dashboardData.workouts.length > 0 ? (
            <div className="h-64">
              <Line data={workoutTrendData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center rounded-xl bg-white/5">
              <Dumbbell className="text-orange-400 mb-3" size={48} />
              <p className="text-white font-medium">No workouts yet</p>
              <p className="text-sm text-gray-300">Log a workout to see trends</p>
            </div>
          )}
        </div>

        {/* Nutrition Trend */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Daily Calorie Intake (Last 7 Days)</h3>
          {dashboardData.nutrition.length > 0 ? (
            <div className="h-64">
              <Line data={nutritionTrendData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center rounded-xl bg-white/5">
              <Apple className="text-green-400 mb-3" size={48} />
              <p className="text-white font-medium">No meals logged</p>
              <p className="text-sm text-gray-300">Log your nutrition to see trends</p>
            </div>
          )}
        </div>
      </div>

      {/* Macro Distribution and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Macro Distribution</h3>
          {dashboardData.nutrition.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-48">
              <div className="w-1/2 h-full relative">
                <Doughnut data={macroDistributionData} options={doughnutOptions} />
              </div>
              <div className="flex flex-col justify-center space-y-3 w-1/2">
                {macroDistributionData.labels.map((label, i) => {
                  const val = macroDistributionData.datasets[0].data[i];
                  const total = macroDistributionData.datasets[0].data.reduce((a,b)=>a+b, 0);
                  const pct = total === 0 ? 0 : Math.round((val/total)*100);
                  const color = macroDistributionData.datasets[0].backgroundColor[i];
                  return (
                    <div key={label} className="flex items-center text-sm font-medium">
                      <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                      <span className="text-gray-200 flex-1">{label}</span>
                      <span className="text-white font-bold">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center rounded-xl bg-white/5">
              <PieChart className="text-blue-400 mb-2" size={36} />
              <p className="text-white font-medium text-sm">No macros data</p>
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white/20 backdrop-blur-md rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activities</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {dashboardData.recentWorkouts.map((workout, index) => (
              <div key={workout._id} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{workout.title}</p>
                    <p className="text-gray-300 text-sm">
                      <span className={`mr-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        workout.category === 'strength' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {workout.category}
                      </span>
                      {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'}
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">
                  {new Date(workout.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {dashboardData.recentWorkouts.length === 0 && (
              <p className="text-gray-400 text-center py-4">No recent workouts</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/workouts')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-semibold transition-colors"
          >
            🏋️ Log New Workout
          </button>
          <button
            onClick={() => navigate('/admin/nutrition')}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-semibold transition-colors"
          >
            🍎 Log Meal
          </button>
          <button
            onClick={() => navigate('/admin/progress')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-semibold transition-colors"
          >
            📊 Track Progress
          </button>
        </div>
      </div>

      {/* Goals and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">🏆 Achievements</h3>
          <div className="space-y-3">
            {totalWorkouts >= 10 && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-500/20 rounded-lg">
                <div className="text-2xl">🥇</div>
                <div>
                  <p className="text-white font-medium">Workout Warrior</p>
                  <p className="text-gray-300 text-sm">Completed 10+ workouts</p>
                </div>
              </div>
            )}
            {currentStreak >= 7 && (
              <div className="flex items-center space-x-3 p-3 bg-orange-500/20 rounded-lg">
                <div className="text-2xl">🔥</div>
                <div>
                  <p className="text-white font-medium">Streak Master</p>
                  <p className="text-gray-300 text-sm">7+ day workout streak</p>
                </div>
              </div>
            )}
            {totalCalories >= 10000 && (
              <div className="flex items-center space-x-3 p-3 bg-green-500/20 rounded-lg">
                <div className="text-2xl">🍎</div>
                <div>
                  <p className="text-white font-medium">Nutrition Tracker</p>
                  <p className="text-gray-300 text-sm">Logged 10,000+ calories</p>
                </div>
              </div>
            )}
            {dashboardData.recentWorkouts.length === 0 && (
              <p className="text-gray-400 text-center py-4">Start your fitness journey to earn achievements!</p>
            )}
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">📈 This Month's Progress</h3>
          <div className="space-y-4">
            {/* Workouts This Week */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Workouts This Week</span>
              <span className="text-white font-semibold">
                {thisWeekWorkouts} / {settings.dailyGoals?.weeklyWorkouts || 5} days
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((thisWeekWorkouts / (settings.dailyGoals?.weeklyWorkouts || 5)) * 100, 100)}%` }}
              ></div>
            </div>

            {/* Calorie Goal */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Calorie Goal (avg/day)</span>
              <span className="text-white font-semibold">
                {avgCalories} / {settings.dailyGoals?.calories || 2000} kcal
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((avgCalories / (settings.dailyGoals?.calories || 2000)) * 100, 100)}%` }}
              ></div>
            </div>

            {/* Streak Goal */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Workout Streak</span>
              <span className="text-white font-semibold">
                {currentStreak} / {settings.dailyGoals?.streakGoal || 30} days
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentStreak / (settings.dailyGoals?.streakGoal || 30)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
