// routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

// All settings routes require authentication
router.use(authMiddleware);

router.get('/', getSettings);
router.post('/', updateSettings);
router.put('/', updateSettings);

module.exports = router;
