const express = require('express');
const router = express.Router();
const {
  getTaskNotes,
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getTemplates
} = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Template routes
router.get('/templates', getTemplates);

// Note CRUD routes
router.route('/')
  .get(getAllNotes)
  .post(createNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

// Task-specific notes
router.get('/task/:taskId', getTaskNotes);

module.exports = router; 