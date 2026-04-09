// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' }, // optional
  settings: {
    notifications: {
      workoutReminders: { type: Boolean, default: true },
      mealReminders: { type: Boolean, default: true },
      progressUpdates: { type: Boolean, default: true },
      goalAchievements: { type: Boolean, default: true }
    },
    units: {
      weight: { type: String, default: 'kg' },
      height: { type: String, default: 'cm' },
      distance: { type: String, default: 'km' },
      measurements: { type: String, default: 'cm' }
    },
    dailyGoals: {
      calories: { type: Number, default: 2000 }
    },
    privacy: {
      profileVisibility: { type: String, default: 'public' },
      progressSharing: { type: Boolean, default: false },
      workoutSharing: { type: Boolean, default: false }
    },
    theme: { type: String, default: 'dark' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
