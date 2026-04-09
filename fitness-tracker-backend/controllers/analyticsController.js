// controllers/analyticsController.js
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');

const getWorkoutAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(`Fetching workout analytics for user: ${userId}`);
    

    // Get workout count per day (last 7 days)
    const workouts = await Workout.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ workouts });
  } catch (err) {
    res.status(500).json({ message: 'Workout analytics failed', error: err.message });
  }
};

const getNutritionAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const nutrition = await Nutrition.aggregate([
      { $match: { user: userId } },
      { $unwind: "$items" }, // items array ko tod do
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalCalories: { $sum: "$items.calories" },
          totalProtein: { $sum: "$items.protein" },
          totalCarbs: { $sum: "$items.carbs" },
          totalFats: { $sum: "$items.fat" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ nutrition });
  } catch (err) {
    res.status(500).json({ message: 'Nutrition analytics failed', error: err.message });
  }
};

module.exports = { getWorkoutAnalytics, getNutritionAnalytics };
