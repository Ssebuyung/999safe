const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

/**
 * Public Routes
 */

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

/**
 * Protected Routes (require JWT token)
 */

// Get current logged-in user
router.get('/me', protect, getMe);

module.exports = router;
