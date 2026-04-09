const express = require('express');
const router = express.Router();
const { exportUserData } = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');

// All export routes require authentication
router.use(authMiddleware);

router.get('/data', exportUserData);

module.exports = router;
