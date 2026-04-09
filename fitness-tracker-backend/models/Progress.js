// models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  weight: Number,
  bodyFat: Number,
  muscleMass: Number,
  chest: Number,
  waist: Number,
  hips: Number,
  biceps: Number,
  thighs: Number,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', progressSchema);
