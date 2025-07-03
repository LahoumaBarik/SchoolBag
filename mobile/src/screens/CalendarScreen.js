import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../context/TaskContext';

const { width } = Dimensions.get('window');

const CalendarScreen = () => {
  const { tasks, getTasksForDate } = useTask();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    generateCalendarData();
  }, [tasks, currentDate]);

  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = [];
    const taskCounts = {};
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = getTasksForDate(date);
      taskCounts[dateStr] = dayTasks.length;
      
      calendarDays.push({
        date: new Date(date),
        dateStr,
        taskCount: dayTasks.length,
        tasks: dayTasks,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    
    setCalendarData({ days: calendarDays, taskCounts });
  };

  const getIntensityColor = (taskCount) => {
    if (taskCount === 0) return '#f1f5f9';
    if (taskCount <= 2) return '#bfdbfe';
    if (taskCount <= 4) return '#60a5fa';
    if (taskCount <= 6) return '#3b82f6';
    return '#1d4ed8';
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleDatePress = (day) => {
    setSelectedDate(day);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderCalendarDay = (day, index) => {
    const isSelected = selectedDate && selectedDate.dateStr === day.dateStr;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          !day.isCurrentMonth && styles.dayOutsideMonth,
          day.isToday && styles.today,
          isSelected && styles.selectedDay,
        ]}
        onPress={() => handleDatePress(day)}
      >
        <View
          style={[
            styles.dayIndicator,
            { backgroundColor: getIntensityColor(day.taskCount) },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              !day.isCurrentMonth && styles.dayTextOutsideMonth,
              day.isToday && styles.todayText,
              day.taskCount > 4 && styles.lightText,
            ]}
          >
            {day.date.getDate()}
          </Text>
        </View>
        
        {day.taskCount > 0 && (
          <View style={styles.taskCountBadge}>
            <Text style={styles.taskCountText}>{day.taskCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTaskItem = ({ item }) => {
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return '#ef4444';
        case 'medium': return '#f59e0b';
        case 'low': return '#10b981';
        default: return '#6b7280';
      }
    };

    return (
      <View style={styles.taskItem}>
        <View style={styles.taskHeader}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
          <Text style={styles.taskTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.taskSubject}>{item.subject}</Text>
        <Text style={styles.taskStatus}>{item.status}</Text>
      </View>
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#667eea" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Task Density:</Text>
        <View style={styles.legendItems}>
          {[0, 1, 3, 5, 7].map((count, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: getIntensityColor(count) },
                ]}
              />
              <Text style={styles.legendLabel}>{count === 0 ? '0' : count === 7 ? '6+' : count}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Weekday Headers */}
        <View style={styles.weekHeader}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDayText}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {calendarData.days?.map((day, index) => renderCalendarDay(day, index))}
        </View>

        {/* Selected Date Tasks */}
        {selectedDate && (
          <View style={styles.selectedDateSection}>
            <Text style={styles.selectedDateTitle}>
              {formatDate(selectedDate.date)}
            </Text>
            
            {selectedDate.tasks.length > 0 ? (
              <FlatList
                data={selectedDate.tasks}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noTasksText}>No tasks scheduled for this day</Text>
            )}
          </View>
        )}

        {/* Overall Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>This Month</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {calendarData.days?.filter(day => day.isCurrentMonth && day.taskCount > 0).length || 0}
              </Text>
              <Text style={styles.statLabel}>Days with Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {calendarData.days?.reduce((total, day) => 
                  day.isCurrentMonth ? total + day.taskCount : total, 0) || 0}
              </Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {Math.round((calendarData.days?.reduce((total, day) => 
                  day.isCurrentMonth ? total + day.taskCount : total, 0) || 0) / 
                  (calendarData.days?.filter(day => day.isCurrentMonth).length || 1) * 10) / 10}
              </Text>
              <Text style={styles.statLabel}>Avg per Day</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  navButton: {
    padding: 10,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginRight: 10,
  },
  legendItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginBottom: 2,
  },
  legendLabel: {
    fontSize: 10,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginTop: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  dayCell: {
    width: width / 7,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayOutsideMonth: {
    opacity: 0.3,
  },
  today: {
    backgroundColor: '#eff6ff',
  },
  selectedDay: {
    backgroundColor: '#ddd6fe',
  },
  dayIndicator: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  dayTextOutsideMonth: {
    color: '#999',
  },
  todayText: {
    fontWeight: '700',
    color: '#667eea',
  },
  lightText: {
    color: '#fff',
  },
  taskCountBadge: {
    position: 'absolute',
    top: 2,
    right: 8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCountText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedDateSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  taskItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  taskSubject: {
    fontSize: 12,
    color: '#667eea',
    marginBottom: 2,
  },
  taskStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  noTasksText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default CalendarScreen; 