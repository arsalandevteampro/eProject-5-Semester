// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, deleteAccount } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.delete('/delete-account', authMiddleware, deleteAccount);

module.exports = router;
