import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, Clock, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(showUnreadOnly);
    }
  }, [isOpen, showUnreadOnly]);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="notification-type-icon completed" />;
      case 'task_due':
      case 'task_due_soon':
      case 'task_reminder':
        return <Clock className="notification-type-icon due" />;
      case 'exam_reminder':
        return <Calendar className="notification-type-icon reminder" />;
      case 'task_overdue':
        return <AlertCircle className="notification-type-icon overdue" />;
      case 'task_updated':
        return <AlertCircle className="notification-type-icon system" />;
      default:
        return <BookOpen className="notification-type-icon system" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInHours = Math.floor((now - notificationDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const displayedNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        className={`notification-bell ${isOpen ? 'active' : ''}`}
        onClick={handleBellClick}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="notification-dropdown-menu">
          {/* Header */}
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-header-actions">
              <button
                className={`filter-toggle ${showUnreadOnly ? 'active' : ''}`}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                title={showUnreadOnly ? 'Show all' : 'Show unread only'}
              >
                {showUnreadOnly ? 'All' : 'Unread'}
              </button>
              {unreadCount > 0 && !showUnreadOnly && (
                <button
                  className="mark-all-read"
                  onClick={handleMarkAllRead}
                  title="Mark all as read"
                >
                  <CheckCircle size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="notification-content">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
                <span>Loading notifications...</span>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={48} className="empty-icon" />
                <h4>
                  {showUnreadOnly 
                    ? 'No unread notifications' 
                    : 'No notifications yet'
                  }
                </h4>
                <p>
                  {showUnreadOnly 
                    ? 'All caught up! 🎉' 
                    : 'When you have new notifications, they\'ll show up here.'
                  }
                </p>
              </div>
            ) : (
              <div className="notification-list">
                {displayedNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="notification-content-text">
                      <h4 className="notification-title">
                        {notification.title}
                      </h4>
                      <p className="notification-message">
                        {notification.message}
                      </p>
                      <div className="notification-meta">
                        <span className="notification-time">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.relatedTask && (
                          <span className="notification-task">
                            • {notification.relatedTask.title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="notification-actions">
                      {!notification.isRead && (
                        <div className="unread-indicator" title="Unread"></div>
                      )}
                      <button
                        className="delete-notification"
                        onClick={(e) => handleDeleteNotification(e, notification._id)}
                        title="Delete notification"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {displayedNotifications.length > 0 && (
            <div className="notification-footer">
              <span className="notification-count">
                {showUnreadOnly 
                  ? `${displayedNotifications.length} unread`
                  : `${displayedNotifications.length} of ${notifications.length}`
                }
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 