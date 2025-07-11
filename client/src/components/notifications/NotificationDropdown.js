import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, Clock, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(showUnreadOnly);
    }
  }, [isOpen, showUnreadOnly]);

  const handleBellClick = () => setIsOpen(!isOpen);
  const handleMarkAllRead = async () => await markAllAsRead();
  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    await deleteNotification(id);
  };
  
  const getNotificationIcon = (type) => {
    const icons = {
      task_completed: <CheckCircle className="text-green-500" />,
      task_due: <Clock className="text-yellow-500" />,
      task_due_soon: <Clock className="text-yellow-500" />,
      task_reminder: <Clock className="text-blue-500" />,
      exam_reminder: <Calendar className="text-purple-500" />,
      task_overdue: <AlertCircle className="text-red-500" />,
      task_updated: <AlertCircle className="text-blue-500" />,
      default: <BookOpen className="text-gray-500" />
    };
    return icons[type] || icons.default;
  };
  
  const displayedNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 transform -translate-y-1/2 translate-x-1/2 ring-2 ring-white" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-80 max-h-[70vh] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden animate-scale-in dark:bg-gray-800 dark:border-gray-700"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="notifications-menu"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 id="notifications-menu" className="font-bold text-lg dark:text-gray-200">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                  Mark all as read
                </button>
              )}
            </div>
            <div className="mt-2">
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className={`px-3 py-1 text-sm rounded-full ${showUnreadOnly ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                aria-pressed={showUnreadOnly}
              >
                {showUnreadOnly ? 'Showing Unread Only' : 'Show All'}
              </button>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto" role="list">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="text-center p-8">
                <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-500" />
                <h4 className="mt-4 font-semibold dark:text-gray-200">No notifications</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
              </div>
            ) : (
              <div>
                {displayedNotifications.map(n => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-4 p-4 border-b border-gray-100 ${!n.isRead ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-white dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer`}
                    onClick={() => markAsRead(n._id)}
                    role="listitem"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && markAsRead(n._id)}
                  >
                    <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center" aria-hidden="true">
                        {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-sm dark:text-gray-200">{n.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteNotification(e, n._id)} 
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full dark:text-gray-500 dark:hover:text-red-400"
                      aria-label={`Delete notification: ${n.title}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 