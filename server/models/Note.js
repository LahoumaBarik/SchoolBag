const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a note title'],
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: [true, 'Please provide note content'],
    trim: true,
    maxlength: 50000 // Allow up to 50KB of text content
  },
  template: {
    type: String,
    enum: ['blank', 'exam_revision', 'lab_report', 'reading_summary', 'essay_outline', 'custom'],
    default: 'blank'
  },
  isMarkdown: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt and lastSyncedAt fields before saving
noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastSyncedAt = Date.now();
  next();
});

// Index for efficient querying
noteSchema.index({ task: 1 });
noteSchema.index({ user: 1, updatedAt: -1 });
noteSchema.index({ user: 1, task: 1 });

// Virtual to get task details when populating
noteSchema.virtual('taskDetails', {
  ref: 'Task',
  localField: 'task',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Note', noteSchema); 