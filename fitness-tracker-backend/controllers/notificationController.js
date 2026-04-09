const Notification = require('../models/Notification');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Progress = require('../models/Progress');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
};

const generateDailyReminders = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const settings = req.user.settings?.notifications || {};
    const reminders = [];

    // 1. Workout Reminder
    if (settings.workoutReminders) {
      const workoutToday = await Workout.findOne({
        user: req.user._id,
        createdAt: { $gte: startOfDay }
      });
      if (!workoutToday) {
        const existingRem = await Notification.findOne({
          user: req.user._id,
          message: { $regex: 'Reminder: Don\'t forget to log your workout' },
          createdAt: { $gte: startOfDay }
        });
        if (!existingRem) {
          reminders.push({ user: req.user._id, message: '💡 Reminder: Don\'t forget to log your workout for today!' });
        }
      }
    }

    // 2. Meal Reminder
    if (settings.mealReminders) {
      const mealToday = await Nutrition.findOne({
        user: req.user._id,
        date: { $gte: startOfDay }
      });
      if (!mealToday) {
        const existingRem = await Notification.findOne({
          user: req.user._id,
          message: { $regex: 'Reminder: Stay on track with your nutrition' },
          createdAt: { $gte: startOfDay }
        });
        if (!existingRem) {
          reminders.push({ user: req.user._id, message: '💡 Reminder: Stay on track with your nutrition—log your meals!' });
        }
      }
    }

    // 3. Progress Update Reminder
    if (settings.progressUpdates) {
      // Check if logged in the last 24 hours (progress often isn't daily, but we'll follow user's "daily reminder" wish)
      const progressToday = await Progress.findOne({
        user: req.user._id,
        date: { $gte: startOfDay }
      });
      if (!progressToday) {
        const existingRem = await Notification.findOne({
          user: req.user._id,
          message: { $regex: 'Reminder: Update your progress' },
          createdAt: { $gte: startOfDay }
        });
        if (!existingRem) {
          reminders.push({ user: req.user._id, message: '💡 Reminder: Update your progress to stay motivated!' });
        }
      }
    }

    if (reminders.length > 0) {
      await Notification.insertMany(reminders);
    }

    res.json({ message: `${reminders.length} reminders generated`, reminders });
  } catch (err) {
    console.error('Reminder generation error:', err);
    res.status(500).json({ message: 'Failed to generate reminders' });
  }
};

module.exports = { getNotifications, markAsRead, generateDailyReminders };
