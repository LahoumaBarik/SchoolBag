const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a notification title'],
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: [true, 'Please provide a notification message'],
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['task_reminder', 'task_due', 'task_due_soon', 'task_overdue', 'task_completed', 'task_updated', 'exam_reminder', 'system'],
    default: 'system'
  },
  data: {
    type: Object,
    required: false
  },
  relatedTask: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date,
    required: false
  }
});

// Index for efficient querying
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema); 