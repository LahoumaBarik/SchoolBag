import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, BookOpen } from 'lucide-react';
import NotificationDropdown from '../notifications/NotificationDropdown';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 rounded-lg p-2 flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              SchoolBag
            </h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationDropdown />
            
            <div className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg dark:bg-gray-800">
              <User size={20} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-indigo-600 font-semibold text-sm dark:text-gray-200">
                {user?.name}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 