// controllers/dashboardController.js
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const recentWorkouts = await Workout.find({ user: userId }).sort({ date: -1 }).limit(5);
    const recentMeals = await Nutrition.find({ user: userId }).sort({ date: -1 }).limit(5);
    const progressLogs = await Progress.find({ user: userId }).sort({ date: -1 }).limit(5);

    res.json({
      workouts: recentWorkouts,
      meals: recentMeals,
      progress: progressLogs
    });

  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard', error: err.message });
  }
};

module.exports = { getDashboard };
