// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, generateDailyReminders } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.post('/reminders', protect, generateDailyReminders);

module.exports = router;
