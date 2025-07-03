import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { tasks, getTasksByStatus, getOverdueTasks } = useTask();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const completedTasks = getTasksByStatus('completed');
  const pendingTasks = getTasksByStatus('pending');
  const inProgressTasks = getTasksByStatus('in-progress');
  const overdueTasks = getOverdueTasks();

  const completionRate = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  const profileItems = [
    {
      icon: 'person-outline',
      title: 'Account Information',
      subtitle: 'Manage your account details',
      onPress: () => Alert.alert('Feature Coming Soon', 'Account management will be available in a future update.'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () => Alert.alert('Feature Coming Soon', 'Notification settings will be available in a future update.'),
    },
    {
      icon: 'color-palette-outline',
      title: 'Theme & Appearance',
      subtitle: 'Customize your app experience',
      onPress: () => Alert.alert('Feature Coming Soon', 'Theme customization will be available in a future update.'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Help & Support', 'For support, please contact your system administrator or check the app documentation.'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'Version 1.0.0',
      onPress: () => Alert.alert('SchoolBag Mobile', 'Version 1.0.0\nYour Academic Assistant\n\nBuilt with React Native & Expo'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.firstName, user?.lastName)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.statNumber}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color="#f59e0b" />
            <Text style={styles.statNumber}>{pendingTasks.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="play-circle" size={24} color="#3b82f6" />
            <Text style={styles.statNumber}>{inProgressTasks.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
            <Text style={styles.statNumber}>{overdueTasks.length}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        {/* Completion Rate */}
        <View style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>Task Completion Rate</Text>
            <Text style={styles.completionPercentage}>{completionRate}%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${completionRate}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.completionSubtext}>
            {completedTasks.length} of {tasks.length} tasks completed
          </Text>
        </View>
      </View>

      {/* Profile Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        {profileItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={20} color="#667eea" />
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  statsSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  completionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 15,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  completionPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  completionSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
  },
  menuItem: {
    marginBottom: 15,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 15,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  logoutSection: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 15,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen; 