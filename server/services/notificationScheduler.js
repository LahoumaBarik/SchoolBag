const cron = require('node-cron');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// --- Scheduled Jobs ---

// Job to check for tasks due soon (e.g., within the next 2 hours)
// Runs every 30 minutes
const scheduleDueSoonNotifications = () => {
  // TEMPORARY: Changed to every minute for testing. Original: '*/30 * * * *'
  cron.schedule('* * * * *', async () => {
    console.log('Running a job to check for tasks due soon and reminders...');
    try {
      // --- TEMPORARY HACK for testing date discrepancy ---
      // Forcing the year to 2025 to match the user's system time.
      const realNow = new Date();
      const now = new Date(
        2025, // Force year to 2025
        realNow.getMonth(),
        realNow.getDate(),
        realNow.getHours(),
        realNow.getMinutes(),
        realNow.getSeconds()
      );
      console.log(`Scheduler is running with a faked date of: ${now.toString()}`);
      // --- END HACK ---
      
      // --- 3 days and 1 day reminders ---
      const intervals = [
        { label: '3_days', ms: 3 * 24 * 60 * 60 * 1000, title: 'Task Reminder (3 days left)', message: (task) => `Your task "${task.title}" is due in 3 days.`, type: 'task_reminder' },
        { label: '1_day', ms: 1 * 24 * 60 * 60 * 1000, title: 'Task Reminder (1 day left)', message: (task) => `Your task "${task.title}" is due tomorrow.`, type: 'task_reminder' },
        { label: '2_hours', ms: 2 * 60 * 60 * 1000, title: 'Task Due Soon! ⏰', message: (task) => `Your task "${task.title}" is due in less than 2 hours.`, type: 'task_due_soon' }
      ];

      for (const interval of intervals) {
        const from = new Date(now.getTime() + interval.ms);
        const to = new Date(from.getTime() + 60 * 1000); // 1 minute window for the cron
        // Find tasks due at this interval
        const tasks = await Task.find({
          dueDate: { $gte: from, $lt: to },
          status: { $ne: 'completed' },
        }).populate('user', 'id type');

        for (const task of tasks) {
          // For exams, send 'exam_reminder' instead
          const notifType = (task.type === 'exam' && interval.type === 'task_reminder') ? 'exam_reminder' : interval.type;
          const notifTitle = (task.type === 'exam' && interval.type === 'task_reminder') ? `Exam Reminder (${interval.label.replace('_', ' ')})` : interval.title;
          const notifMessage = (task.type === 'exam' && interval.type === 'task_reminder') ? `Your exam "${task.title}" is coming up in ${interval.label === '3_days' ? '3 days' : '1 day'}!` : interval.message(task);

          // Check if this notification already exists
          const existingNotification = await Notification.findOne({
            'data.taskId': task._id,
            type: notifType,
            'data.reminderInterval': interval.label
          });

          if (!existingNotification) {
            await Notification.create({
              user: task.user.id,
              title: notifTitle,
              message: notifMessage,
              type: notifType,
              data: {
                taskId: task._id,
                reminderInterval: interval.label
              },
              relatedTask: task._id
            });
            console.log(`Created '${notifType}' notification for task: ${task.title} (${interval.label})`);
          }
        }
      }

      // --- Existing 2-hour due soon logic is now handled above ---
    } catch (error) {
      console.error('Error in due soon/reminder notification job:', error);
    }
  });
};


// --- Start All Schedulers ---

const initializeSchedulers = () => {
  scheduleDueSoonNotifications();
  // Add other cron jobs here if needed in the future
  console.log('Notification schedulers have been initialized.');
};

module.exports = { initializeSchedulers }; 