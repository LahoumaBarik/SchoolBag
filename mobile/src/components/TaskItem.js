import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TaskItem = ({ task, onEdit, onDelete, onStatusChange, onViewNotes }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'play-circle';
      case 'pending':
        return 'time';
      default:
        return 'ellipse';
    }
  };

  const isOverdue = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today && task.status !== 'completed';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusPress = () => {
    const statusOptions = [
      { label: 'Pending', value: 'pending' },
      { label: 'In Progress', value: 'in-progress' },
      { label: 'Completed', value: 'completed' },
    ];

    const buttons = statusOptions.map(option => ({
      text: option.label,
      onPress: () => onStatusChange(option.value),
      style: task.status === option.value ? 'default' : 'cancel',
    }));

    buttons.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Change Status', 'Select a new status for this task:', buttons);
  };

  return (
    <View style={[styles.container, isOverdue() && styles.overdueContainer]}>
      {/* Task Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleStatusPress} style={styles.statusButton}>
          <Ionicons
            name={getStatusIcon(task.status)}
            size={20}
            color={getStatusColor(task.status)}
          />
        </TouchableOpacity>
        
        <View style={styles.taskInfo}>
          <Text style={[styles.title, task.status === 'completed' && styles.completedTitle]}>
            {task.title}
          </Text>
          <Text style={styles.subject}>{task.subject}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onViewNotes(task)} style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={18} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="create-outline" size={18} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Task Details */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={[styles.detailText, isOverdue() && styles.overdueText]}>
            Due: {formatDate(task.dueDate)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
          <Text style={styles.detailText}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </Text>
        </View>
      </View>

      {/* Description */}
      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      {/* Status Badge */}
      <View style={styles.footer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>
            {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
          </Text>
        </View>
        
        {isOverdue() && (
          <View style={styles.overdueBadge}>
            <Ionicons name="alert" size={12} color="#fff" />
            <Text style={styles.overdueLabel}>Overdue</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  overdueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statusButton: {
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  subject: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  overdueText: {
    color: '#ef4444',
    fontWeight: '500',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default TaskItem; 