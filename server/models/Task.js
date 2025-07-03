const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['assignment', 'exam', 'project', 'reading', 'other'],
    default: 'assignment'
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
    maxlength: 50
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide a due date']
  },
  dueTime: {
    type: String,
    default: '23:59'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  estimatedHours: {
    type: Number,
    min: 0.5,
    max: 100,
    default: 1
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema); 