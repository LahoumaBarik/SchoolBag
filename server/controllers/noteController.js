const Note = require('../models/Note');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// Note templates for context-aware note creation
const noteTemplates = {
  exam_revision: {
    title: 'Exam Revision Notes',
    content: `# 📚 {{taskTitle}} – Exam Revision

---

## 📝 Key Topics to Review
- [ ] Topic 1: *Add a short description or page number*
- [ ] Topic 2: *Add a short description or page number*
- [ ] Topic 3: *Add a short description or page number*

---

## 🧠 Important Formulas / Concepts
> ✏️ Write down any formulas, definitions, or concepts you need to remember.

---

## ❓ Practice Questions
- [ ] Question 1: *Write your question here*
- [ ] Question 2: *Write your question here*

---

## 📅 Review Schedule
| Review | Date         | Notes                |
|--------|--------------|----------------------|
| 1️⃣    | {{date}}     | *What to focus on?*  |
| 2️⃣    | {{date}}     | *What to focus on?*  |
| ✅     | {{date}}     | *Final review tips*  |

---

## 🗒️ Extra Notes
- *Add any extra thoughts, reminders, or links here!*`
  },
  lab_report: {
    title: 'Lab Report',
    content: `# {{taskTitle}} - Lab Report

## Objective
*What is the purpose of this lab?*

## Materials
- Material 1
- Material 2
- Material 3

## Procedure
1. Step 1
2. Step 2
3. Step 3

## Observations
| Trial | Observation | Result |
|-------|-------------|--------|
| 1     |             |        |
| 2     |             |        |

## Analysis
*Analyze your results here*

## Conclusion
*Summarize your findings*

## References
- Reference 1
- Reference 2`
  },
  reading_summary: {
    title: 'Reading Summary',
    content: `# {{taskTitle}} - Reading Summary

## Reading Information
- **Author:** 
- **Title:** 
- **Pages/Chapters:** 
- **Date:** {{date}}

## Main Ideas
1. **Key Point 1**
   - Supporting detail
   - Supporting detail

2. **Key Point 2**
   - Supporting detail
   - Supporting detail

## Important Quotes
> "Quote 1" - Page X

> "Quote 2" - Page Y

## Personal Reflections
*What did you think about this reading?*

## Questions for Discussion
1. Question 1
2. Question 2

## Action Items
- [ ] Review notes
- [ ] Discuss with classmates
- [ ] Prepare for class discussion`
  },
  essay_outline: {
    title: 'Essay Outline',
    content: `# {{taskTitle}} - Essay Outline

## Essay Information
- **Topic:** 
- **Length:** 
- **Due Date:** {{dueDate}}
- **Format:** 

## Thesis Statement
*Your main argument or thesis goes here*

## Introduction
- Hook/attention grabber
- Background information
- Thesis statement

## Body Paragraph 1
- **Topic Sentence:** 
- **Evidence/Examples:**
  - Evidence 1
  - Evidence 2
- **Analysis:**
- **Transition:**

## Body Paragraph 2
- **Topic Sentence:** 
- **Evidence/Examples:**
  - Evidence 1
  - Evidence 2
- **Analysis:**
- **Transition:**

## Body Paragraph 3
- **Topic Sentence:** 
- **Evidence/Examples:**
  - Evidence 1
  - Evidence 2
- **Analysis:**
- **Transition:**

## Conclusion
- Restate thesis
- Summarize main points
- Final thought/call to action

## Sources
1. Source 1
2. Source 2
3. Source 3`
  },
  blank: {
    title: 'Notes',
    content: `# {{taskTitle}} - Notes

*Start writing your notes here...*`
  }
};

// @desc    Get notes for a specific task
// @route   GET /api/notes/task/:taskId
// @access  Private
const getTaskNotes = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verify task belongs to user
    const task = await Task.findOne({
      _id: taskId,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const notes = await Note.find({
      task: taskId,
      user: req.user.id
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Get task notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching notes'
    });
  }
};

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
const getAllNotes = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, since } = req.query;
    
    const query = { user: req.user.id };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Filter by modification time for sync
    if (since) {
      query.updatedAt = { $gt: new Date(since) };
    }

    const notes = await Note.find(query)
      .populate('task', 'title subject type dueDate priority')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Note.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: notes
    });
  } catch (error) {
    console.error('Get all notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching notes'
    });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('task', 'title subject type dueDate priority');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching note'
    });
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { taskId, template = 'blank', title, content, tags } = req.body;

    // Verify task belongs to user
    const task = await Task.findOne({
      _id: taskId,
      user: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    let noteData = {
      task: taskId,
      user: req.user.id,
      template,
      tags: tags || []
    };

    // If using a template, apply it
    if (template && noteTemplates[template]) {
      const templateData = noteTemplates[template];
      noteData.title = title || templateData.title.replace('{{taskTitle}}', task.title);
      noteData.content = content || templateData.content
        .replace(/{{taskTitle}}/g, task.title)
        .replace(/{{date}}/g, new Date().toLocaleDateString())
        .replace(/{{dueDate}}/g, task.dueDate.toLocaleDateString());
    } else {
      noteData.title = title || `${task.title} - Notes`;
      noteData.content = content || '';
    }

    const note = await Note.create(noteData);

    const populatedNote = await Note.findById(note._id)
      .populate('task', 'title subject type dueDate priority');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: populatedNote
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while creating note'
    });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastSyncedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    ).populate('task', 'title subject type dueDate priority');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while updating note'
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while deleting note'
    });
  }
};

// @desc    Get available note templates
// @route   GET /api/notes/templates
// @access  Private
const getTemplates = async (req, res) => {
  try {
    const templates = Object.keys(noteTemplates).map(key => ({
      id: key,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: getTemplateDescription(key)
    }));

    res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching templates'
    });
  }
};

// Helper function to get template descriptions
const getTemplateDescription = (templateId) => {
  const descriptions = {
    blank: 'Start with a blank note',
    exam_revision: 'Structured template for exam preparation with topics, formulas, and review schedule',
    lab_report: 'Complete lab report template with sections for objective, procedure, and analysis',
    reading_summary: 'Template for summarizing readings with main ideas, quotes, and reflections',
    essay_outline: 'Comprehensive essay outline with introduction, body paragraphs, and conclusion structure'
  };
  return descriptions[templateId] || 'Custom template';
};

module.exports = {
  getTaskNotes,
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getTemplates
}; 