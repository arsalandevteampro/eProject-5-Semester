// models/Nutrition.js
const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: String }, // e.g., "1 cup", "200g"
      calories: { type: Number },
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Nutrition', nutritionSchema);
