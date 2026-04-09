// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getWorkoutAnalytics, getNutritionAnalytics } = require('../controllers/analyticsController');
const protect = require('../middleware/authMiddleware');

router.get('/workout', protect, getWorkoutAnalytics);
router.get('/nutrition', protect, getNutritionAnalytics);

module.exports = router;
