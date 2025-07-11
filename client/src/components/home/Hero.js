import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CalendarDemo = () => (
    <motion.div 
        className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200/50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">November 2024</h3>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="font-medium text-gray-500">{day}</div>
        ))}
        {Array.from({ length: 30 }, (_, i) => {
          const intensity = Math.floor(Math.random() * 4);
          const dayClasses = [
            'bg-gray-100 text-gray-600', 
            'bg-green-200 text-green-800', 
            'bg-green-400 text-white font-semibold', 
            'bg-green-600 text-white font-bold'
          ];
          return (
            <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${dayClasses[intensity]}`}>
              {i + 1}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-200" />
          <div className="w-3 h-3 rounded-sm bg-green-200" />
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <div className="w-3 h-3 rounded-sm bg-green-600" />
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );

export const Hero = () => {
  return (
    <section className="relative pt-40 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50 to-white z-0"></div>
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-br from-indigo-100 via-purple-100 to-transparent z-0 opacity-40"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div 
            className="text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
              Clarity, <span className="text-indigo-600">finally.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto md:mx-0">
              Get organized and stay on top of your academic life with our intelligent task management system. Never miss a deadline again.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                    to="/register" 
                    className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                    Create my account <ArrowRight size={20} />
                </Link>
            </motion.div>
          </motion.div>
          <div className="hidden md:block">
            <CalendarDemo />
          </div>
        </div>
      </div>
    </section>
  );
}; 