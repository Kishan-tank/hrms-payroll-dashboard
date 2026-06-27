import Notification from '../models/Notification.js';

// ─── Get all notifications for logged-in user ─────────────────────────────────
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      read: false,
    });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Mark a single notification as read ───────────────────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Mark ALL notifications as read for logged-in user ─────────────────────────
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete a single notification ─────────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete ALL read notifications for logged-in user ──────────────────────────
export const clearReadNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user.id,
      read: true,
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} read notification(s) cleared`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create a notification (HR Manager only — broadcast) ──────────────────────
import User from '../models/user.js';

export const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetUserId, link } = req.body;

    if (!title || !message) {
      return res
        .status(400)
        .json({ success: false, message: 'Title and message are required.' });
    }

    let userIds = [];

    if (targetUserId) {
      // Send to a specific user
      userIds = [targetUserId];
    } else {
      // Broadcast to all active users
      const users = await User.find({ isActive: true }).select('_id');
      userIds = users.map((u) => u._id);
    }

    const notifications = userIds.map((uid) => ({
      userId: uid,
      title,
      message,
      type: type || 'system',
      link: link || null,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${userIds.length} user(s)`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
