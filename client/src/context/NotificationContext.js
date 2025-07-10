import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Axios config with auth header
  const getAxiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch notifications
  const fetchNotifications = async (unreadOnly = false) => {
    if (!isAuthenticated || !token) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/notifications?unreadOnly=${unreadOnly}&limit=20`,
        getAxiosConfig()
      );
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count only
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/notifications/count`,
        getAxiosConfig()
      );
      
      if (response.data.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        getAxiosConfig()
      );
      
      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true, readAt: new Date() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/notifications/read-all`,
        {},
        getAxiosConfig()
      );
      
      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            isRead: true, 
            readAt: new Date() 
          }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}`,
        getAxiosConfig()
      );
      
      if (response.data.success) {
        // Update local state
        const deletedNotification = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Create notification (for testing purposes)
  const createNotification = async (notificationData) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/notifications`,
        notificationData,
        getAxiosConfig()
      );
      
      if (response.data.success) {
        setNotifications(prev => [response.data.data, ...prev]);
        setUnreadCount(prev => prev + 1);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Auto-refresh notifications periodically
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, token]);

  // Reset state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 