import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import NotificationService from '../services/NotificationService';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, API_BASE_URL } = useAuth();

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // Update auth header when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      const fetchedTasks = response.data.data || [];
      setTasks(fetchedTasks);
      
      // Schedule notifications for existing tasks that don't have them
      await scheduleNotificationsForExistingTasks(fetchedTasks);
      
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch tasks');
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Schedule notifications for existing tasks
  const scheduleNotificationsForExistingTasks = async (tasksList) => {
    try {
      for (const task of tasksList) {
        // Only schedule for incomplete tasks with due dates
        if (task.status !== 'completed' && task.dueDate) {
          await NotificationService.scheduleTaskReminder(task, 24);
          await NotificationService.scheduleTaskDueNotification(task);
          await NotificationService.scheduleOverdueNotification(task);
        }
      }
      console.log('Scheduled notifications for existing tasks');
    } catch (error) {
      console.error('Error scheduling notifications for existing tasks:', error);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      const newTask = response.data.data;
      setTasks(prev => [newTask, ...prev]);
      
      // Schedule notifications for the new task if it has a due date
      if (newTask.dueDate) {
        await NotificationService.scheduleTaskReminder(newTask, 24); // 24 hours before
        await NotificationService.scheduleTaskDueNotification(newTask); // 2 hours before due time
        await NotificationService.scheduleOverdueNotification(newTask); // 24 hours after due date
      }
      
      return { success: true, task: newTask };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      setError(message);
      return { success: false, message };
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      const updatedTask = response.data.data;
      setTasks(prev => 
        prev.map(task => 
          task._id === taskId ? updatedTask : task
        )
      );
      
      // Cancel existing notifications for this task
      await NotificationService.cancelTaskNotifications(taskId);
      
      // Schedule new notifications if task is not completed and has due date
      if (updatedTask.status !== 'completed' && updatedTask.dueDate) {
        await NotificationService.scheduleTaskReminder(updatedTask, 24);
        await NotificationService.scheduleTaskDueNotification(updatedTask);
        await NotificationService.scheduleOverdueNotification(updatedTask);
      }
      
      // Send completion notification if task was just completed
      if (updatedTask.status === 'completed') {
        await NotificationService.sendTaskCompletionNotification(updatedTask);
      }
      
      return { success: true, task: updatedTask };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      setError(message);
      return { success: false, message };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      
      // Cancel all notifications for the deleted task
      await NotificationService.cancelTaskNotifications(taskId);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      setError(message);
      return { success: false, message };
    }
  };

  const getTasksByDate = async (year, month) => {
    try {
      const response = await api.get(`/tasks/calendar/${year}/${month}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Get tasks by date error:', error);
      return [];
    }
  };

  // Utility functions
  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && task.status !== 'completed';
    });
  };

  const getTasksForDate = (date) => {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === targetDate.getTime();
    });
  };

  const value = {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByDate,
    getTasksByStatus,
    getOverdueTasks,
    getTasksForDate,
    clearError: () => setError(null),
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 