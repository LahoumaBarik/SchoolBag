import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, Book, AlertCircle, FileText, Edit3, Eye, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useTask } from '../../context/TaskContext';
import './TaskDetailModal.css';
import ReactMarkdown from 'react-markdown';

const TaskDetailModal = ({ task, onClose, onTaskSaved, initialTab = 'details' }) => {
  const { createTask, updateTask, loading } = useTask();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'assignment',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    dueTime: '23:59',
    estimatedHours: 1
  });
  const [errors, setErrors] = useState({});
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteFormVisible, setNoteFormVisible] = useState(false);
  const [noteFormData, setNoteFormData] = useState({
    title: '',
    content: '',
    template: 'blank'
  });
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncInterval, setSyncInterval] = useState(null);

  // Note templates
  const noteTemplates = [
    { id: 'blank', name: 'Blank Page', description: 'Start with a blank note' },
    { id: 'exam_revision', name: 'Exam Revision', description: 'Structured template for exam preparation' },
    { id: 'lab_report', name: 'Lab Report', description: 'Complete lab report template' },
    { id: 'reading_summary', name: 'Reading Summary', description: 'Template for summarizing readings' },
    { id: 'essay_outline', name: 'Essay Outline', description: 'Comprehensive essay outline structure' }
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        subject: task.subject,
        type: task.type,
        priority: task.priority,
        status: task.status,
        dueDate: format(new Date(task.dueDate), 'yyyy-MM-dd'),
        dueTime: task.dueTime,
        estimatedHours: task.estimatedHours
      });
      
      // Fetch notes for this task
      fetchTaskNotes();
      
      // Start periodic sync for notes
      startNotesSync();
    }
    
    // Cleanup sync on unmount or task change
    return () => {
      stopNotesSync();
    };
  }, [task]);

  const fetchTaskNotes = async () => {
    if (!task) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/task/${task._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotes(data.data);
        setLastSyncTime(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error fetching task notes:', error);
    }
  };

  // Start periodic sync for notes
  const startNotesSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
    
    const interval = setInterval(async () => {
      try {
        await syncNotesInBackground();
      } catch (error) {
        console.error('Background notes sync failed:', error);
      }
    }, 30000); // 30 seconds
    
    setSyncInterval(interval);
  };

  // Stop periodic sync
  const stopNotesSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      setSyncInterval(null);
    }
  };

  // Background sync for notes updates
  const syncNotesInBackground = async () => {
    if (!task || !lastSyncTime) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/task/${task._id}?since=${encodeURIComponent(lastSyncTime)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const latestNotes = data.data || [];
        
        if (latestNotes.length > 0) {
          // Merge latest notes with existing ones
          setNotes(prev => {
            const noteMap = new Map(prev.map(note => [note._id, note]));
            
            latestNotes.forEach(note => {
              noteMap.set(note._id, note);
            });
            
            return Array.from(noteMap.values()).sort((a, b) => 
              new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          });
          
          // Update selected note if it was modified
          if (selectedNote) {
            const updatedSelectedNote = latestNotes.find(note => note._id === selectedNote._id);
            if (updatedSelectedNote) {
              setSelectedNote(updatedSelectedNote);
            }
          }
          
          setLastSyncTime(new Date().toISOString());
        }
      }
    } catch (error) {
      // Silently fail background sync to avoid disrupting user experience
      console.warn('Background notes sync failed:', error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } 
    // else {
    //   const selectedDate = new Date(formData.dueDate);
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);
      
    //   if (selectedDate < today) {
    //     newErrors.dueDate = 'Due date cannot be in the past';
    //   }
    // }
    
    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 100) {
      newErrors.estimatedHours = 'Estimated hours must be between 0.5 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const taskData = {
      ...formData,
      dueDate: new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString(),
      estimatedHours: parseFloat(formData.estimatedHours)
    };

    let result;
    if (task) {
      result = await updateTask(task._id, taskData);
    } else {
      result = await createTask(taskData);
    }

    if (result.success) {
      onTaskSaved();
    }
  };

  const handleCreateNote = async () => {
    if (!task || !noteFormData.title.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: task._id,
          template: noteFormData.template,
          title: noteFormData.title,
          content: noteFormData.content
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => [data.data, ...prev]);
        setNoteFormVisible(false);
        setNoteFormData({ title: '', content: '', template: 'blank' });
        setSelectedNote(data.data);
        setLastSyncTime(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(prev => prev.map(note => 
          note._id === noteId ? data.data : note
        ));
        setSelectedNote(data.data);
        setLastSyncTime(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(prev => prev.filter(note => note._id !== noteId));
        if (selectedNote && selectedNote._id === noteId) {
          setSelectedNote(null);
        }
        setLastSyncTime(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const renderDetailsTab = () => (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label className="form-label">
          <Book size={16} />
          Task Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter task title"
        />
        {errors.title && <div className="error-message">{errors.title}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-input"
          placeholder="Enter task description (optional)"
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Subject *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Mathematics, History"
          />
          {errors.subject && <div className="error-message">{errors.subject}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="assignment">Assignment</option>
            <option value="exam">Exam</option>
            <option value="project">Project</option>
            <option value="reading">Reading</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="form-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-select"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <Calendar size={16} />
            Due Date *
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="form-input"
            min={format(new Date(), 'yyyy-MM-dd')}
          />
          {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            <Clock size={16} />
            Time
          </label>
          <input
            type="time"
            name="dueTime"
            value={formData.dueTime}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Hours</label>
          <input
            type="number"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            className="form-input"
            min="0.5"
            max="100"
            step="0.5"
          />
          {errors.estimatedHours && <div className="error-message">{errors.estimatedHours}</div>}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          <Save size={16} />
          {task ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderNotesTab = () => (
    <div className="notes-container">
      <div className="notes-sidebar">
        <div className="notes-header">
          <h3>Notes</h3>
          <div>
            <button
              onClick={() => setNoteFormVisible(true)}
              className="btn btn-primary btn-sm"
              disabled={!task}
            >
              <Plus size={16} />
              Add Note
            </button>
          </div>
        </div>
        
        <div className="notes-list">
          {notes.length === 0 ? (
            <div className="notes-empty">
              <FileText size={32} />
              <p>No notes yet</p>
              {task && (
                <button
                  onClick={() => setNoteFormVisible(true)}
                  className="btn btn-outline"
                >
                  Create your first note
                </button>
              )}
            </div>
          ) : (
            notes.map(note => (
              <div
                key={note._id}
                className={`note-item ${selectedNote?._id === note._id ? 'active' : ''}`}
                onClick={() => setSelectedNote(note)}
              >
                <h4>{note.title}</h4>
                <p>{note.content.substring(0, 100)}...</p>
                <span className="note-date">
                  {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="notes-content">
        {selectedNote ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleUpdateNote}
            onDelete={handleDeleteNote}
          />
        ) : (
          <div className="notes-placeholder">
            <FileText size={48} />
            <h3>Select a note to view</h3>
            <p>Choose a note from the sidebar to start reading or editing.</p>
          </div>
        )}
      </div>

      {/* Note Creation Modal */}
      {noteFormVisible && (
        <div className="note-form-modal">
          <div className="note-form-content">
            <div className="note-form-header">
              <h3>Create New Note</h3>
              <button onClick={() => setNoteFormVisible(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="note-form-body">
              <div className="form-group">
                <label>Template</label>
                <select
                  value={noteFormData.template}
                  onChange={(e) => setNoteFormData(prev => ({
                    ...prev,
                    template: e.target.value
                  }))}
                  className="form-select"
                >
                  {noteTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <small>
                  {noteTemplates.find(t => t.id === noteFormData.template)?.description}
                </small>
              </div>

              <div className="form-group">
                <label>Note Title *</label>
                <input
                  type="text"
                  value={noteFormData.title}
                  onChange={(e) => setNoteFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  className="form-input"
                  placeholder="Enter note title"
                />
              </div>

              <div className="note-form-actions">
                <button
                  onClick={handleCreateNote}
                  className="btn btn-primary"
                  disabled={!noteFormData.title.trim()}
                >
                  Create Note
                </button>
                <button
                  onClick={() => setNoteFormVisible(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="task-detail-modal-overlay">
      <div className="task-detail-modal">
        <div className="modal-header">
          <h2>{task ? 'Task Details' : 'Create New Task'}</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Book size={16} />
            Details
          </button>
          {task && (
            <button
              className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <FileText size={16} />
              Notes
              {notes.length > 0 && (
                <span className="tab-badge">{notes.length}</span>
              )}
            </button>
          )}
        </div>

        <div className="modal-content">
          {activeTab === 'details' ? renderDetailsTab() : renderNotesTab()}
        </div>
      </div>
    </div>
  );
};

// Simple Note Editor Component
const NoteEditor = ({ note, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onSave(note._id, { title, content });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(false);
  };

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="note-title-input"
          />
        ) : (
          <h3>{note.title}</h3>
        )}
        
        <div className="note-editor-actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="btn btn-primary btn-sm">
                <Save size={16} />
                Save
              </button>
              <button onClick={handleCancel} className="btn btn-secondary btn-sm">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm">
                <Edit3 size={16} />
                Edit
              </button>
              <button 
                onClick={() => onDelete(note._id)} 
                className="btn btn-danger btn-sm"
              >
                <X size={16} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="note-editor-content">
        {isEditing ? (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="note-content-editor"
              rows="20"
              placeholder="Write your notes here... (Markdown supported)"
            />
            <div className="markdown-hint">💡 <b>Tip:</b> You can use <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer">Markdown</a> for formatting (headings, checkboxes, tables, etc.).</div>
          </>
        ) : (
          <div className="note-content-display styled-markdown">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailModal; 