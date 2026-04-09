const Nutrition = require('../models/Nutrition');
const Notification = require('../models/Notification');

const addNutrition = async (req, res) => {
  const { mealType, items } = req.body;

  try {
    const newEntry = new Nutrition({
      user: req.user._id,
      mealType,
      items
    });

    await newEntry.save();
    
    // Create a notification if user has mealReminders enabled
    if (req.user.settings?.notifications?.mealReminders !== false) {
      await Notification.create({
        user: req.user._id,
        message: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} logged successfully!`,
      });
    }

    // Goal Achievement Check: Check if daily calorie goal is reached
    if (req.user.settings?.notifications?.goalAchievements !== false) {
      // Calculate total calories for today including the new entry
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const todayLogs = await Nutrition.find({
        user: req.user._id,
        date: { $gte: startOfDay }
      });
      
      const totalCalories = todayLogs.reduce((sum, log) => {
        return sum + log.items.reduce((itemSum, item) => itemSum + (item.calories || 0), 0);
      }, 0);
      
      const calorieGoal = req.user.settings?.dailyGoals?.calories || 2000;
      
      if (totalCalories >= calorieGoal) {
        // Check if we already sent a goal achievement notification today
        const existingNotification = await Notification.findOne({
          user: req.user._id,
          message: { $regex: 'Daily calorie goal reached' },
          createdAt: { $gte: startOfDay }
        });
        
        if (!existingNotification) {
          await Notification.create({
            user: req.user._id,
            message: `🎉 Daily calorie goal reached! (${totalCalories}/${calorieGoal} kcal)`,
          });
        }
      }
    }
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add nutrition log', error: err.message });
  }
};

const getNutritionLogs = async (req, res) => {
  try {
    const logs = await Nutrition.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch logs', error: err.message });
  }
};

const deleteNutritionLog = async (req, res) => {
  try {
    const deleted = await Nutrition.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Log not found' });

    res.json({ message: 'Nutrition log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

const searchNutrition = async (req, res) => {
  try {
    const { keyword, mealType } = req.query;

    const query = { user: req.user._id };

    if (keyword) {
      query['entries.food'] = { $regex: keyword, $options: 'i' };
    }

    if (mealType) {
      query.mealType = mealType; // breakfast/lunch/dinner/snacks
    }

    const logs = await Nutrition.find(query).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Nutrition search failed' });
  }
};

const updateNutrition = async (req, res) => {
  try {
    const updated = await Nutrition.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Nutrition log not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update nutrition log', error: err.message });
  }
};

module.exports = {
  addNutrition,
  getNutritionLogs,
  deleteNutritionLog,
  searchNutrition,
  updateNutrition,
};
