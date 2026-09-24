const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

// All notification routes require authentication
router.use(protect);

// List current user's notifications
router.get('/', notificationController.listMyNotifications);

// Mark notifications as read
router.post('/read', notificationController.markAsRead);

module.exports = router;
