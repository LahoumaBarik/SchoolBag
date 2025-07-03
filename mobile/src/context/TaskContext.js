import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

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
      setTasks(response.data.data || []);
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch tasks');
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      setTasks(prev => [response.data.data, ...prev]);
      return { success: true, task: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      setError(message);
      return { success: false, message };
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      setTasks(prev => 
        prev.map(task => 
          task._id === taskId ? response.data.data : task
        )
      );
      return { success: true, task: response.data.data };
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