const Notification = require('../models/Notification');
const Task = require('../models/Task');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, unreadOnly = false } = req.query;
    
    const query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('relatedTask', 'title subject type dueDate priority')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching notifications'
    });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { title, message, type, relatedTask, priority } = req.body;

    const notification = await Notification.create({
      user: req.user.id,
      title,
      message,
      type,
      relatedTask,
      priority
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('relatedTask', 'title subject type dueDate priority');

    res.status(201).json({
      success: true,
      data: populatedNotification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while creating notification'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = Date.now();
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while marking notification as read'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { 
        isRead: true,
        readAt: Date.now()
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while marking all notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while deleting notification'
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching notification count'
    });
  }
};

// Helper function to create task-related notifications
const createTaskNotification = async (userId, taskId, type, customMessage = null) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) return;

    let title, message;
    
    switch (type) {
      case 'task_due':
        title = 'Task Due Today';
        message = customMessage || `Your ${task.type} "${task.title}" for ${task.subject} is due today!`;
        break;
      case 'task_overdue':
        title = 'Task Overdue';
        message = customMessage || `Your ${task.type} "${task.title}" for ${task.subject} is overdue!`;
        break;
      case 'task_reminder':
        title = 'Task Reminder';
        message = customMessage || `Don't forget: "${task.title}" for ${task.subject} is due soon!`;
        break;
      case 'task_completed':
        title = 'Task Completed';
        message = customMessage || `Great job! You completed "${task.title}" for ${task.subject}!`;
        break;
      default:
        return;
    }

    const priority = task.priority === 'high' ? 'high' : 'medium';

    await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedTask: taskId,
      priority
    });
  } catch (error) {
    console.error('Create task notification error:', error);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createTaskNotification
}; 