// routes/workoutRoutes.js
const express = require('express');
const router = express.Router();
const {
  addWorkout,
  getUserWorkouts,
  updateWorkout,
  deleteWorkout,
  searchWorkouts,
} = require('../controllers/workoutController');

const protect = require('../middleware/authMiddleware');

router.post('/', protect, addWorkout);           // Add new workout
router.get('/', protect, getUserWorkouts);       // Get all workouts of user
router.put('/:id', protect, updateWorkout);      // Update a workout
router.delete('/:id', protect, deleteWorkout);   // Delete a workout
router.get('/search', protect, searchWorkouts);

module.exports = router;
