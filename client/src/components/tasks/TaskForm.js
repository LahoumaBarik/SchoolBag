import React, { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { X, Save, Calendar, Clock, Book, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const TaskForm = ({ task, onClose, onTaskSaved }) => {
  const { createTask, updateTask, loading } = useTask();
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
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
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
      dueDate: new Date(formData.dueDate).toISOString(),
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 24px 0 24px',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#333'
          }}>
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              color: '#666'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
          <div className="form-group">
            <label className="form-label">
              <Book size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
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
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
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

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gap: '16px'
          }}>
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
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
                <Clock size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
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

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
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
      </div>
    </div>
  );
};

export default TaskForm; 