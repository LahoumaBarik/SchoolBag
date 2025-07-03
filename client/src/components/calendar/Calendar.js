import React, { useState, useEffect } from 'react';
import { useTask } from '../../context/TaskContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import Loading from '../common/Loading';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const { calendarTasks, fetchCalendarTasks, loading } = useTask();

  useEffect(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    fetchCalendarTasks(month, year);
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous and next month to fill the grid
  const firstDayOfWeek = monthStart.getDay();
  const lastDayOfWeek = monthEnd.getDay();
  
  const prevMonthDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(monthStart);
    day.setDate(day.getDate() - (i + 1));
    prevMonthDays.push(day);
  }

  const nextMonthDays = [];
  for (let i = 1; i <= (6 - lastDayOfWeek); i++) {
    const day = new Date(monthEnd);
    day.setDate(day.getDate() + i);
    nextMonthDays.push(day);
  }

  const allDays = [...prevMonthDays, ...calendarDays, ...nextMonthDays];

  const getTasksForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return calendarTasks[dateKey] || [];
  };

  const getTaskLoad = (date) => {
    const tasks = getTasksForDate(date);
    return tasks.length;
  };

  const getHeatmapColor = (taskCount) => {
    if (taskCount === 0) return 'rgba(102, 126, 234, 0.1)';
    if (taskCount === 1) return 'rgba(102, 126, 234, 0.3)';
    if (taskCount === 2) return 'rgba(102, 126, 234, 0.5)';
    if (taskCount >= 3) return 'rgba(102, 126, 234, 0.8)';
    return 'rgba(102, 126, 234, 0.1)';
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
    <div>
      {/* Calendar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '600',
          color: '#333'
        }}>
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigateMonth(-1)}
            className="btn btn-secondary"
            style={{ padding: '8px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '14px' }}
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="btn btn-secondary"
            style={{ padding: '8px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        background: 'rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {/* Week day headers */}
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              padding: '12px 8px',
              background: 'rgba(102, 126, 234, 0.1)',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '600',
              color: '#667eea'
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {allDays.map((day, index) => {
          const taskCount = getTaskLoad(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayIsToday = isToday(day);

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day)}
              style={{
                padding: '12px 8px',
                minHeight: '80px',
                background: getHeatmapColor(taskCount),
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                opacity: isCurrentMonth ? 1 : 0.5,
                border: isSelected ? '2px solid #667eea' : 'none',
                ...(dayIsToday && {
                  background: 'linear-gradient(135deg, #667eea 0%, #4f63d2 100%)',
                  color: 'white'
                })
              }}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: dayIsToday ? '700' : '500',
                marginBottom: '4px'
              }}>
                {format(day, 'd')}
              </div>
              
              {taskCount > 0 && (
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: dayIsToday ? 'white' : '#667eea'
                }}>
                  {taskCount} task{taskCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="card" style={{ padding: '20px' }}>
          <h4 style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CalendarIcon size={20} />
            Tasks for {format(selectedDate, 'MMMM d, yyyy')}
          </h4>
          
          {getTasksForDate(selectedDate).length === 0 ? (
            <p style={{ color: '#666', margin: 0 }}>
              No tasks scheduled for this date.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {getTasksForDate(selectedDate).map(task => (
                <div
                  key={task._id}
                  style={{
                    padding: '12px 16px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '4px'
                  }}>
                    <h5 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {task.title}
                    </h5>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: 'rgba(102, 126, 234, 0.2)',
                      color: '#667eea'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <span>{task.subject}</span>
                    <span>Due: {task.dueTime}</span>
                    <span className={`status-${task.status}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(102, 126, 234, 0.05)',
        borderRadius: '8px'
      }}>
        <h5 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#333'
        }}>
          Task Load Heatmap
        </h5>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>Less</span>
          {[0, 1, 2, 3].map(count => (
            <div
              key={count}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '2px',
                background: getHeatmapColor(count)
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 