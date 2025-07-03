const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getCalendarTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const taskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be between 1 and 100 characters'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Subject is required and must be between 1 and 50 characters'),
  body('dueDate')
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('type')
    .optional()
    .isIn(['assignment', 'exam', 'project', 'reading', 'other'])
    .withMessage('Type must be one of: assignment, exam, project, reading, other'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('Estimated hours must be between 0.5 and 100'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('dueTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('subject')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Subject must be between 1 and 50 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid due date'),
  body('type')
    .optional()
    .isIn(['assignment', 'exam', 'project', 'reading', 'other'])
    .withMessage('Type must be one of: assignment, exam, project, reading, other'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('Estimated hours must be between 0.5 and 100'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('dueTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format')
];

// Apply protection middleware to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getTasks)
  .post(taskValidation, createTask);

router.get('/calendar', getCalendarTasks);

router.route('/:id')
  .get(getTask)
  .put(updateTaskValidation, updateTask)
  .delete(deleteTask);

module.exports = router; 