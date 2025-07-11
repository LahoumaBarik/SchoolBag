import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

// TaskProvider component
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, API_BASE_URL } = useAuth();
  const { createNotification } = useNotifications();

  // Create axios instance
  const api = useCallback(() => axios.create({
    baseURL: API_BASE_URL || '/api',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }), [token, API_BASE_URL]);


  // Fetch all tasks
  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await api().get(`/tasks?${params}`);
      setTasks(res.data.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch tasks';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Fetch tasks for calendar
  const fetchCalendarTasks = useCallback(async (month, year) => {
    setLoading(true);
    try {
      const res = await api().get(`/tasks/calendar?month=${month}&year=${year}`);
      setCalendarTasks(res.data.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch calendar tasks';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Create a new task
  const createTask = useCallback(async (taskData) => {
    setLoading(true);
    try {
      const res = await api().post('/tasks', taskData);
      const newTask = res.data.data;
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully!');

      if (new Date(newTask.dueDate) < new Date() && newTask.status !== 'completed') {
        await createNotification({
          title: 'Task Overdue',
          message: `Your task "${newTask.title}" was created in an overdue state.`,
          type: 'task_overdue',
          data: { taskId: newTask._id }
        });
      }

      return { success: true, data: newTask };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [api, createNotification]);

  // Update an existing task
  const updateTask = useCallback(async (taskId, taskData) => {
    setLoading(true);
    try {
      const res = await api().put(`/tasks/${taskId}`, taskData);
      const updatedTask = res.data.data;
      setTasks(prev => prev.map(task => task._id === taskId ? updatedTask : task));
      toast.success('Task updated successfully!');

      if (new Date(updatedTask.dueDate) < new Date() && updatedTask.status !== 'completed') {
        await createNotification({
          title: 'Task Overdue',
          message: `Your task "${updatedTask.title}" is currently overdue.`,
          type: 'task_overdue',
          data: { taskId: updatedTask._id }
        });
      }

      return { success: true, data: updatedTask };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [api, createNotification]);

  // Delete a task
  const deleteTask = useCallback(async (taskId) => {
    setLoading(true);
    try {
      await api().delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      setError(message);
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, [api]);

  const value = {
    tasks,
    calendarTasks,
    loading,
    error,
    fetchTasks,
    fetchCalendarTasks,
    createTask,
    updateTask,
    deleteTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}; 