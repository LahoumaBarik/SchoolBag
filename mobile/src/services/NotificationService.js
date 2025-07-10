import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      // Register for push notifications
      await this.registerForPushNotificationsAsync();
      
      // Set up notification listeners
      this.setupNotificationListeners();
      
      // Schedule periodic checks for due tasks
      await this.scheduleDueDateChecks();
      
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  // Register for push notifications
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        const projectId = process.env.EXPO_PROJECT_ID || 'your-project-id';
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo push token:', token);
      } catch (error) {
        console.log('Error getting Expo push token:', error);
        // For development, we'll continue without the token
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    this.expoPushToken = token;
    
    // Store token locally
    if (token) {
      await AsyncStorage.setItem('expoPushToken', token);
    }
    
    return token;
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Handle foreground notification display
      this.handleForegroundNotification(notification);
    });

    // Listener for when user taps notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap
      this.handleNotificationResponse(response);
    });
  }

  // Handle notifications received in foreground
  handleForegroundNotification(notification) {
    const { title, body } = notification.request.content;
    
    // You can customize how foreground notifications are displayed
    // For now, they'll use the default handler
    console.log(`Foreground notification: ${title} - ${body}`);
  }

  // Handle notification tap
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    // Navigate to relevant screen based on notification data
    if (data && data.taskId) {
      // Navigate to task details
      console.log('Navigate to task:', data.taskId);
      // You can use navigation here if needed
    }
  }

  // Schedule local notification for task due date
  async scheduleTaskReminder(task, reminderTime = 24) {
    try {
      const dueDate = new Date(task.dueDate);
      const reminderDate = new Date(dueDate.getTime() - (reminderTime * 60 * 60 * 1000)); // reminderTime hours before
      
      // Don't schedule if reminder time has passed
      if (reminderDate <= new Date()) {
        console.log('Reminder time has passed for task:', task.title);
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder 📚',
          body: `"${task.title}" is due ${reminderTime === 24 ? 'tomorrow' : `in ${reminderTime} hours`}!`,
          data: {
            taskId: task._id,
            type: 'task_reminder',
            reminderTime
          },
          sound: true,
        },
        trigger: {
          date: reminderDate,
        },
      });

      console.log(`Scheduled reminder for task "${task.title}" at ${reminderDate.toISOString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling task reminder:', error);
      return null;
    }
  }

  // Schedule notification for task due today
  async scheduleTaskDueNotification(task) {
    try {
      const dueDate = new Date(task.dueDate);
      const dueDateTime = new Date(dueDate.toDateString() + ' ' + (task.dueTime || '09:00'));
      // Schedule notification 2 hours before due time
      const notificationTime = new Date(dueDateTime.getTime() - (2 * 60 * 60 * 1000));

      // Debug logs
      console.log('Scheduling due notification for task:', task.title);
      console.log('task.dueDate:', task.dueDate);
      console.log('task.dueTime:', task.dueTime);
      console.log('dueDate:', dueDate);
      console.log('dueDateTime:', dueDateTime);
      console.log('notificationTime:', notificationTime);

      // Defensive checks
      if (isNaN(notificationTime.getTime()) || notificationTime <= new Date()) {
        console.log('Due notification time is invalid or has passed for task:', task.title, notificationTime);
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Due Soon! ⏰',
          body: `"${task.title}" is due at ${task.dueTime || '23:59'} today!`,
          data: {
            taskId: task._id,
            type: 'task_due',
          },
          sound: true,
        },
        trigger: {
          date: notificationTime,
        },
      });

      console.log(`Scheduled due notification for task "${task.title}" at ${notificationTime.toISOString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling due notification:', error);
      return null;
    }
  }

  // Schedule overdue notification
  async scheduleOverdueNotification(task) {
    try {
      const dueDate = new Date(task.dueDate);
      const overdueTime = new Date(dueDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after due date
      
      // Don't schedule if it's already past overdue time
      if (overdueTime <= new Date()) {
        console.log('Task is already significantly overdue:', task.title);
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Overdue! 🚨',
          body: `"${task.title}" was due yesterday. Don't forget to complete it!`,
          data: {
            taskId: task._id,
            type: 'task_overdue',
          },
          sound: true,
        },
        trigger: {
          date: overdueTime,
        },
      });

      console.log(`Scheduled overdue notification for task "${task.title}" at ${overdueTime.toISOString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling overdue notification:', error);
      return null;
    }
  }

  // Send immediate notification for task completion
  async sendTaskCompletionNotification(task) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Completed! 🎉',
          body: `Great job! You completed "${task.title}".`,
          data: {
            taskId: task._id,
            type: 'task_completed',
          },
          sound: true,
        },
        trigger: null, // Immediate notification
      });

      console.log(`Sent completion notification for task "${task.title}"`);
    } catch (error) {
      console.error('Error sending completion notification:', error);
    }
  }

  // Cancel all notifications for a specific task
  async cancelTaskNotifications(taskId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        const data = notification.content.data;
        if (data && data.taskId === taskId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          console.log(`Cancelled notification ${notification.identifier} for task ${taskId}`);
        }
      }
    } catch (error) {
      console.error('Error cancelling task notifications:', error);
    }
  }

  // Schedule periodic checks for due tasks
  async scheduleDueDateChecks() {
    try {
      // Cancel existing checks
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      // Schedule daily check at 8 AM
      const now = new Date();
      const tomorrow8AM = new Date(now);
      tomorrow8AM.setDate(tomorrow8AM.getDate() + 1);
      tomorrow8AM.setHours(8, 0, 0, 0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Task Check',
          body: 'Checking for due tasks...',
          data: { type: 'daily_check' },
        },
        trigger: {
          date: tomorrow8AM,
          repeats: true,
        },
      });

      console.log('Scheduled daily task checks');
    } catch (error) {
      console.error('Error scheduling due date checks:', error);
    }
  }

  // Send test notification
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SchoolBag Test',
          body: 'Notifications are working! 🎉',
          data: { type: 'test' },
        },
        trigger: { seconds: 1 },
      });
      
      console.log('Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  // Get scheduled notifications count
  async getScheduledNotificationsCount() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications.length;
    } catch (error) {
      console.error('Error getting scheduled notifications count:', error);
      return 0;
    }
  }

  // Clean up
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get push token
  getPushToken() {
    return this.expoPushToken;
  }
}

// Export singleton instance
export default new NotificationService(); 