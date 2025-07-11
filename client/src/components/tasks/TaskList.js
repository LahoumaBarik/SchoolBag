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
import { motion } from 'framer-motion';

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

  const priorityStyles = {
    high: { 
      bg: 'bg-red-100 dark:bg-red-900/50', 
      text: 'text-red-700 dark:text-red-300', 
      border: 'border-red-500 dark:border-red-400' 
    },
    medium: { 
      bg: 'bg-yellow-100 dark:bg-yellow-900/50', 
      text: 'text-yellow-700 dark:text-yellow-300', 
      border: 'border-yellow-500 dark:border-yellow-400' 
    },
    low: { 
      bg: 'bg-green-100 dark:bg-green-900/50', 
      text: 'text-green-700 dark:text-green-300', 
      border: 'border-green-500 dark:border-green-400' 
    },
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'in-progress':
        return <Clock size={20} className="text-blue-500" />;
      default:
        return <Circle size={20} className="text-gray-400 dark:text-gray-500" />;
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
    <div className="space-y-6">
      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="subject">Subject</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <Circle size={48} className="mx-auto text-gray-300 dark:text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-gray-800 dark:text-gray-200">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? "You don't have any tasks yet. Create your first task!" 
                : `No tasks with status "${filter}"`
              }
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { 
              transition: { 
                staggerChildren: 0.1 
              } 
            }
          }}
        >
          {filteredTasks.map(task => {
            const priorityStyle = priorityStyles[task.priority] || {};
            const taskVariants = {
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            };
            return (
              <motion.div
                key={task._id}
                variants={taskVariants}
                onClick={() => onViewTask(task)}
                className={`bg-white rounded-lg shadow p-5 cursor-pointer transition-shadow duration-200 hover:shadow-lg border-l-4 ${priorityStyle.border} ${isOverdue(task.dueDate, task.status) ? 'bg-red-50 dark:bg-red-900/20' : 'dark:bg-gray-800'} dark:hover:bg-gray-700/50`}
              >
                <div className="flex items-start gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextStatus = task.status === 'pending' 
                        ? 'in-progress' 
                        : task.status === 'in-progress' 
                          ? 'completed' 
                          : 'pending';
                      handleStatusChange(task._id, nextStatus);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
                    title="Click to change status"
                  >
                    {getStatusIcon(task.status)}
                  </motion.button>
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                      <h3 className={`font-bold text-lg ${task.status === 'completed' ? 'text-gray-500 line-through dark:text-gray-600' : 'text-gray-800 dark:text-gray-100'}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {task.type}
                      </span>
                    </div>
                    {task.description && <p className="text-sm text-gray-600 mb-3 dark:text-gray-400">{task.description}</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Book size={14} />
                        <span>{task.subject}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${isOverdue(task.dueDate, task.status) ? 'text-red-600 font-semibold dark:text-red-400' : ''}`}>
                        <Calendar size={14} />
                        <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
                      className="p-2 text-gray-500 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      title="Edit Task"
                    >
                      <Edit size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task._id); }}
                      className="p-2 text-gray-500 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  );
};

export default TaskList; 