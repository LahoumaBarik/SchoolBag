import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const TaskContext = createContext();

// Task reducer
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOADING_END':
      return {
        ...state,
        loading: false
      };
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        loading: false,
        error: null
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        ),
        loading: false,
        error: null
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
        loading: false,
        error: null
      };
    case 'SET_CALENDAR_TASKS':
      return {
        ...state,
        calendarTasks: action.payload,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  tasks: [],
  calendarTasks: {},
  loading: false,
  error: null
};

// TaskProvider component
export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Fetch all tasks
  const fetchTasks = async (filters = {}) => {
    dispatch({ type: 'LOADING_START' });
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`/api/tasks?${params}`);
      dispatch({
        type: 'SET_TASKS',
        payload: res.data.data
      });
      return { success: true, data: res.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch tasks';
      dispatch({
        type: 'SET_ERROR',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Fetch calendar tasks
  const fetchCalendarTasks = async (month, year) => {
    dispatch({ type: 'LOADING_START' });
    try {
      const res = await axios.get(`/api/tasks/calendar?month=${month}&year=${year}`);
      dispatch({
        type: 'SET_CALENDAR_TASKS',
        payload: res.data.data
      });
      return { success: true, data: res.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch calendar tasks';
      dispatch({
        type: 'SET_ERROR',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Create task
  const createTask = async (taskData) => {
    dispatch({ type: 'LOADING_START' });
    try {
      const res = await axios.post('/api/tasks', taskData);
      dispatch({
        type: 'ADD_TASK',
        payload: res.data.data
      });
      toast.success('Task created successfully!');
      return { success: true, data: res.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create task';
      dispatch({
        type: 'SET_ERROR',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Update task
  const updateTask = async (taskId, taskData) => {
    dispatch({ type: 'LOADING_START' });
    try {
      const res = await axios.put(`/api/tasks/${taskId}`, taskData);
      dispatch({
        type: 'UPDATE_TASK',
        payload: res.data.data
      });
      toast.success('Task updated successfully!');
      return { success: true, data: res.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update task';
      dispatch({
        type: 'SET_ERROR',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    dispatch({ type: 'LOADING_START' });
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      dispatch({
        type: 'DELETE_TASK',
        payload: taskId
      });
      toast.success('Task deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete task';
      dispatch({
        type: 'SET_ERROR',
        payload: message
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    fetchTasks,
    fetchCalendarTasks,
    createTask,
    updateTask,
    deleteTask,
    clearError
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

// Custom hook to use task context
export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext; 