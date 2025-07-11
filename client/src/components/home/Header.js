import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Header = () => {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 border-b border-gray-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <BarChart3 size={32} className="text-indigo-600" />
            <span className="text-2xl font-bold text-gray-800">SchoolBag</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block text-gray-600 font-medium hover:text-indigo-600 transition-colors">
              Log in
            </Link>
            <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg">
              Sign up
            </Link>
          </nav>
        </div>
      </div>
    </motion.header>
  );
}; 