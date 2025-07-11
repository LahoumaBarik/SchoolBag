import React, { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, subDays } from 'date-fns';
import Loading from '../common/Loading';
import { motion } from 'framer-motion';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const { calendarTasks, fetchCalendarTasks, loading } = useTask();

  useEffect(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    fetchCalendarTasks(month, year);
  }, [currentDate, fetchCalendarTasks]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Add days from previous and next month to fill the grid
  const firstDayOfWeek = monthStart.getDay();
  const lastDayOfWeek = monthEnd.getDay();
  
  const prevMonthDays = Array.from({ length: firstDayOfWeek }).map((_, i) => subDays(monthStart, firstDayOfWeek - i));

  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonthDays = Array.from({ length: 6 - lastDayOfWeek }).map((_, i) => addDays(monthEnd, i + 1));


  const allDays = [...prevMonthDays, ...calendarDays, ...nextMonthDays];

  const getTasksForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return calendarTasks[dateKey] || [];
  };

  const getHeatmapClass = (taskCount) => {
    if (taskCount === 0) return 'bg-gray-100 dark:bg-gray-800/50';
    if (taskCount === 1) return 'bg-indigo-200 dark:bg-indigo-900/40';
    if (taskCount === 2) return 'bg-indigo-300 dark:bg-indigo-800/60';
    if (taskCount >= 3) return 'bg-indigo-400 dark:bg-indigo-700/80';
    return 'bg-gray-100 dark:bg-gray-800/50';
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <Loading text="Loading calendar..." />;
  }

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-900/50 rounded-2xl shadow-lg border border-transparent dark:border-gray-800">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700/50 rounded-lg overflow-hidden">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div
            key={day}
            className="py-2 text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-gray-50 dark:bg-gray-800"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {allDays.map((day, index) => {
          const taskCount = getTasksForDate(day).length;
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayIsToday = isToday(day);

          const dayClasses = [
            'p-2 min-h-[100px] cursor-pointer relative transition-colors duration-200 group',
            getHeatmapClass(taskCount),
            isCurrentMonth ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600',
            dayIsToday ? 'bg-indigo-600 dark:bg-indigo-500 text-white font-bold shadow-lg' : '',
            isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 ring-inset' : '',
            !dayIsToday && isCurrentMonth ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : ''
          ].join(' ');

          return (
            <motion.div
              key={index}
              onClick={() => setSelectedDate(day)}
              className={dayClasses}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`text-sm font-medium ${dayIsToday ? 'text-white' : ''}`}>
                {format(day, 'd')}
              </div>
              
              {taskCount > 0 && (
                <div className={`mt-1 text-xs font-semibold ${dayIsToday ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-300'}`}>
                  {taskCount} task{taskCount !== 1 ? 's' : ''}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="font-semibold">Task Load Heatmap</div>
          <div className="flex items-center gap-2">
            <span>Less</span>
            {[0, 1, 2, 3].map(count => (
              <div
                key={count}
                className={`w-4 h-4 rounded-sm ${getHeatmapClass(count)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/70 rounded-lg"
        >
          <h4 className="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            <CalendarIcon size={20} />
            Tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </h4>
          
          {getTasksForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No tasks scheduled for this date.
            </p>
          ) : (
            <div className="space-y-3">
              {getTasksForDate(selectedDate).map(task => (
                <motion.div
                  key={task._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border-indigo-500"
                >
                  <div className="flex justify-between items-center">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                      {task.title}
                    </h5>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {task.priority}
                    </span>
                  </div>
                  
                  {task.subject && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>{task.subject}</span>
                        {task.dueTime && <span className="mx-2">•</span>}
                        {task.dueTime && <span>Due: {task.dueTime}</span>}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Calendar; 