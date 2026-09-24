const Notification = require('../models/notification.model');

// List unread notifications for current user
exports.listMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id, read: false })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('incident');
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

// Mark notifications as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'ids array is required' });
    }
    await Notification.updateMany({ _id: { $in: ids }, user: req.user.id }, { $set: { read: true } });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
