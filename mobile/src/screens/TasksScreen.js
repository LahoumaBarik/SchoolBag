import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTask } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import TaskFormModal from '../components/TaskFormModal';

const TasksScreen = () => {
  const { tasks, loading, createTask, updateTask, deleteTask, getTasksByStatus, getOverdueTasks } = useTask();
  const [filter, setFilter] = useState('all');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'list-outline' },
    { key: 'pending', label: 'Pending', icon: 'time-outline' },
    { key: 'in-progress', label: 'In Progress', icon: 'play-outline' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-outline' },
    { key: 'overdue', label: 'Overdue', icon: 'alert-outline' },
  ];

  const getFilteredTasks = () => {
    switch (filter) {
      case 'pending':
        return getTasksByStatus('pending');
      case 'in-progress':
        return getTasksByStatus('in-progress');
      case 'completed':
        return getTasksByStatus('completed');
      case 'overdue':
        return getOverdueTasks();
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      let result;
      if (editingTask) {
        result = await updateTask(editingTask._id, taskData);
      } else {
        result = await createTask(taskData);
      }

      if (result.success) {
        setShowTaskModal(false);
        setEditingTask(null);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const handleDeleteTask = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteTask(taskId);
            if (!result.success) {
              Alert.alert('Error', result.message);
            }
          },
        },
      ]
    );
  };

  const renderFilterButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === item.key && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(item.key)}
    >
      <Ionicons
        name={item.icon}
        size={16}
        color={filter === item.key ? '#fff' : '#667eea'}
        style={styles.filterIcon}
      />
      <Text
        style={[
          styles.filterText,
          filter === item.key && styles.activeFilterText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTaskItem = ({ item }) => (
    <TaskItem
      task={item}
      onEdit={() => handleEditTask(item)}
      onDelete={() => handleDeleteTask(item._id)}
      onStatusChange={(newStatus) => 
        updateTask(item._id, { ...item, status: newStatus })
      }
    />
  );

  const getEmptyStateMessage = () => {
    switch (filter) {
      case 'pending':
        return 'No pending tasks';
      case 'in-progress':
        return 'No tasks in progress';
      case 'completed':
        return 'No completed tasks';
      case 'overdue':
        return 'No overdue tasks';
      default:
        return 'No tasks yet';
    }
  };

  return (
    <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={filterOptions}
          renderItem={renderFilterButton}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Task Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getTasksByStatus('completed').length}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{getOverdueTasks().length}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
      </View>

      {/* Task List */}
      <View style={styles.taskListContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>{getEmptyStateMessage()}</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' ? 'Create your first task to get started' : ''}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            renderItem={renderTaskItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.taskList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateTask}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Task Form Modal */}
      <TaskFormModal
        visible={showTaskModal}
        task={editingTask}
        onSubmit={handleTaskSubmit}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterContainer: {
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterList: {
    paddingHorizontal: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  activeFilterButton: {
    backgroundColor: '#667eea',
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    fontSize: 14,
    color: '#667eea',
  },
  activeFilterText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
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
    marginTop: 2,
  },
  taskListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
    textAlign: 'center',
  },
  taskList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default TasksScreen; 