// routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const { addProgress, getProgressLogs, updateProgress, deleteProgress } = require('../controllers/progressController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, addProgress);
router.get('/', protect, getProgressLogs);
router.put('/:id', protect, updateProgress);
router.delete('/:id', protect, deleteProgress);

module.exports = router;
