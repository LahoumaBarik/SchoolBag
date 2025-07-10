import React, { useState } from 'react';
import { useTask } from '../../context/TaskContext';
import { 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Book,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import Loading from '../common/Loading';

const TaskList = ({ onEditTask, onViewTask }) => {
  const { tasks, loading, updateTask, deleteTask } = useTask();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter);
    }

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffd43b';
      case 'low': return '#51cf66';
      default: return '#868e96';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#51cf66" />;
      case 'in-progress':
        return <Clock size={20} color="#339af0" />;
      default:
        return <Circle size={20} color="#868e96" />;
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return <Loading text="Loading tasks..." />;
  }

  return (
    <div>
      {/* Filters and Sort */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#555' }}>
            Filter by Status
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#555' }}>
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ minWidth: '150px' }}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="subject">Subject</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <Circle size={48} color="#ddd" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#888' }}>No tasks found</h3>
          <p style={{ margin: 0 }}>
            {filter === 'all' 
              ? "You don't have any tasks yet. Create your first task!" 
              : `No tasks with status "${filter}"`
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {filteredTasks.map(task => (
            <div
              key={task._id}
              className="card"
              onClick={() => onViewTask(task)}
              style={{
                padding: '20px',
                position: 'relative',
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
                ...(isOverdue(task.dueDate, task.status) && {
                  background: 'rgba(255, 107, 107, 0.05)',
                  borderColor: '#ff6b6b'
                })
              }}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '16px',
                alignItems: 'start'
              }}>
                {/* Status Icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextStatus = task.status === 'pending' 
                      ? 'in-progress' 
                      : task.status === 'in-progress' 
                        ? 'completed' 
                        : 'pending';
                    handleStatusChange(task._id, nextStatus);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background 0.2s ease'
                  }}
                  title="Click to change status"
                >
                  {getStatusIcon(task.status)}
                </button>

                {/* Task Content */}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '18px',
                      fontWeight: '600',
                      color: task.status === 'completed' ? '#888' : '#333',
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </h3>
                    
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: `${getPriorityColor(task.priority)}20`,
                      color: getPriorityColor(task.priority)
                    }}>
                      {task.priority}
                    </span>

                    <span className={`type-${task.type}`} style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {task.type}
                    </span>
                  </div>

                  {task.description && (
                    <p style={{
                      margin: '0 0 12px 0',
                      color: '#666',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {task.description}
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#666',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Book size={14} />
                      {task.subject}
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: isOverdue(task.dueDate, task.status) ? '#ff6b6b' : '#666'
                    }}>
                      {isOverdue(task.dueDate, task.status) ? (
                        <AlertCircle size={14} />
                      ) : (
                        <Calendar size={14} />
                      )}
                      {format(new Date(task.dueDate), 'MMM d, yyyy')} at {task.dueTime}
                      {isOverdue(task.dueDate, task.status) && (
                        <span style={{ fontWeight: '600', marginLeft: '4px' }}>
                          (Overdue)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      {task.estimatedHours}h estimated
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                    className="btn btn-secondary"
                    style={{
                      padding: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <Edit size={14} />
                  </button>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                    className="btn btn-danger"
                    style={{
                      padding: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList; 