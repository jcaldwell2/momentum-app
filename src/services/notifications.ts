import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#667eea',
        });

        await Notifications.setNotificationChannelAsync('task-reminders', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#667eea',
          description: 'Notifications for upcoming tasks',
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  async scheduleTaskReminder(task: Task, reminderMinutes: number = 15): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const taskDateTime = new Date(`${task.scheduledDate}T${task.scheduledTime || '09:00'}:00`);
      const reminderTime = new Date(taskDateTime.getTime() - reminderMinutes * 60 * 1000);

      // Don't schedule if reminder time is in the past
      if (reminderTime <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: `"${task.title}" is starting in ${reminderMinutes} minutes`,
          data: {
            taskId: task.id,
            type: 'task-reminder',
          },
          categoryIdentifier: 'task-reminder',
        },
        trigger: { seconds: Math.floor((reminderTime.getTime() - Date.now()) / 1000) } as any,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule task reminder:', error);
      return null;
    }
  }

  async scheduleTaskStart(task: Task): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const taskDateTime = new Date(`${task.scheduledDate}T${task.scheduledTime || '09:00'}:00`);

      // Don't schedule if task time is in the past
      if (taskDateTime <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time to Start!',
          body: `"${task.title}" is scheduled to start now`,
          data: {
            taskId: task.id,
            type: 'task-start',
          },
          categoryIdentifier: 'task-start',
        },
        trigger: { seconds: Math.floor((taskDateTime.getTime() - Date.now()) / 1000) } as any,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule task start notification:', error);
      return null;
    }
  }

  async scheduleDailyPlanningReminder(time: string = '09:00'): Promise<string | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const [hours, minutes] = time.split(':').map(Number);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Plan Your Day',
          body: 'Take a moment to review and plan your tasks for today',
          data: {
            type: 'daily-planning',
          },
          categoryIdentifier: 'daily-planning',
        },
        trigger: {
          type: 'calendar',
          hour: hours,
          minute: minutes,
          repeats: true,
        } as any,
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to schedule daily planning reminder:', error);
      return null;
    }
  }

  async sendTaskCompletionCelebration(task: Task, xpEarned: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Task Completed!',
          body: `Great job! You earned ${xpEarned} XP for completing "${task.title}"`,
          data: {
            taskId: task.id,
            type: 'task-completion',
            xpEarned,
          },
          categoryIdentifier: 'celebration',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send completion celebration:', error);
    }
  }

  async sendLevelUpCelebration(newLevel: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚀 Level Up!',
          body: `Congratulations! You've reached Level ${newLevel}!`,
          data: {
            type: 'level-up',
            newLevel,
          },
          categoryIdentifier: 'celebration',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send level up celebration:', error);
    }
  }

  async sendStreakMilestone(category: string, streakCount: number): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const milestones = [7, 14, 30, 50, 100];
      if (!milestones.includes(streakCount)) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Streak Milestone!',
          body: `Amazing! You've maintained a ${streakCount}-day streak in ${category}!`,
          data: {
            type: 'streak-milestone',
            category,
            streakCount,
          },
          categoryIdentifier: 'celebration',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Failed to send streak milestone:', error);
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Set up notification categories for interactive notifications
  async setupNotificationCategories(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await Notifications.setNotificationCategoryAsync('task-reminder', [
          {
            identifier: 'start-task',
            buttonTitle: 'Start Now',
            options: {
              opensAppToForeground: true,
            },
          },
          {
            identifier: 'snooze',
            buttonTitle: 'Snooze 5min',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);

        await Notifications.setNotificationCategoryAsync('task-start', [
          {
            identifier: 'mark-complete',
            buttonTitle: 'Mark Complete',
            options: {
              opensAppToForeground: false,
            },
          },
        ]);
      } catch (error) {
        console.error('Failed to setup notification categories:', error);
      }
    }
  }

  // Handle notification responses
  setupNotificationResponseHandler(): void {
    Notifications.addNotificationResponseReceivedListener(response => {
      const { actionIdentifier, notification } = response;
      const { data } = notification.request.content;

      switch (actionIdentifier) {
        case 'start-task':
          // Handle start task action
          console.log('Start task action triggered for task:', data.taskId);
          break;
        case 'snooze':
          // Handle snooze action
          this.snoozeNotification(notification.request.identifier, 5);
          break;
        case 'mark-complete':
          // Handle mark complete action
          console.log('Mark complete action triggered for task:', data.taskId);
          break;
        default:
          // Handle default tap
          console.log('Notification tapped:', data);
      }
    });
  }

  private async snoozeNotification(originalId: string, minutes: number): Promise<void> {
    try {
      // Cancel original notification
      await this.cancelNotification(originalId);

      // Schedule new notification after snooze period
      const snoozeTime = new Date(Date.now() + minutes * 60 * 1000);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder (Snoozed)',
          body: 'Your snoozed task reminder',
          data: {
            type: 'snoozed-reminder',
          },
        },
        trigger: { seconds: Math.floor((snoozeTime.getTime() - Date.now()) / 1000) } as any,
      });
    } catch (error) {
      console.error('Failed to snooze notification:', error);
    }
  }
}

export const notificationService = new NotificationService();