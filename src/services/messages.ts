import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppMessage, MessageDisplaySettings, DismissedMessage, MessageTargetingRules, User } from '../types';

const MESSAGES_STORAGE_KEY = '@momentum_app_messages';
const DISMISSED_MESSAGES_KEY = '@momentum_dismissed_messages';
const MESSAGE_SETTINGS_KEY = '@momentum_message_settings';

class MessagesService {
  private messages: AppMessage[] = [];
  private dismissedMessages: DismissedMessage[] = [];
  private settings: MessageDisplaySettings = {
    showWelcomeMessages: true,
    showFeatureAnnouncements: true,
    showTips: true,
    maxMessagesPerScreen: 3,
    autoHideAfterSeconds: 10,
  };

  async initialize(): Promise<void> {
    try {
      await this.loadMessages();
      await this.loadDismissedMessages();
      await this.loadSettings();
      
      // Initialize with sample messages if none exist
      if (this.messages.length === 0) {
        await this.initializeSampleMessages();
      }
    } catch (error) {
      console.error('Failed to initialize messages service:', error);
    }
  }

  private async loadMessages(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) {
        this.messages = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  private async saveMessages(): Promise<void> {
    try {
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(this.messages));
    } catch (error) {
      console.error('Failed to save messages:', error);
    }
  }

  private async loadDismissedMessages(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(DISMISSED_MESSAGES_KEY);
      if (stored) {
        this.dismissedMessages = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load dismissed messages:', error);
    }
  }

  private async saveDismissedMessages(): Promise<void> {
    try {
      await AsyncStorage.setItem(DISMISSED_MESSAGES_KEY, JSON.stringify(this.dismissedMessages));
    } catch (error) {
      console.error('Failed to save dismissed messages:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(MESSAGE_SETTINGS_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load message settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(MESSAGE_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save message settings:', error);
    }
  }

  private async initializeSampleMessages(): Promise<void> {
    const sampleMessages: AppMessage[] = [
      {
        id: 'welcome-001',
        type: 'welcome',
        title: 'Welcome to Momentum! 🎉',
        content: 'Start building productive habits by creating your first task. Track your progress and earn XP as you complete your daily goals.',
        priority: 'high',
        targetingRules: {
          userLevel: { min: 1, max: 10 }, // Allow for levels 1-10
        },
        createdAt: new Date().toISOString(),
        isDismissible: true,
        actionButton: {
          text: 'Create First Task',
          action: 'navigate',
          target: 'TaskCreation',
        },
      },
      {
        id: 'feature-xp-system',
        type: 'feature',
        title: 'XP System Explained ⭐',
        content: 'Complete tasks to earn XP and level up! Higher priority tasks give more XP. Build streaks to maximize your rewards.',
        priority: 'medium',
        targetingRules: {
          userLevel: { min: 1, max: 3 },
          showAfterDays: 1,
        },
        createdAt: new Date().toISOString(),
        isDismissible: true,
      },
      {
        id: 'tip-daily-planning',
        type: 'tip',
        title: 'Daily Planning Tip 💡',
        content: 'Plan your day the night before or first thing in the morning. This helps you start with clear priorities and better focus.',
        priority: 'low',
        targetingRules: {
          userLevel: { min: 2 },
          dateRange: {
            start: new Date().toISOString().split('T')[0],
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
        },
        createdAt: new Date().toISOString(),
        isDismissible: true,
      },
      {
        id: 'update-v1-0',
        type: 'update',
        title: 'App Update Available 🚀',
        content: 'New features: Enhanced statistics, better task organization, and improved performance. Update now for the best experience!',
        priority: 'medium',
        targetingRules: {
          dateRange: {
            start: new Date().toISOString().split('T')[0],
            end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          },
        },
        createdAt: new Date().toISOString(),
        isDismissible: true,
        actionButton: {
          text: 'Learn More',
          action: 'external',
          target: 'https://momentum-app.com/updates',
        },
      },
      {
        id: 'test-message',
        type: 'announcement',
        title: 'Test Message 📢',
        content: 'This is a test message to verify the app messages system is working correctly.',
        priority: 'high',
        targetingRules: {}, // No targeting rules - should always show
        createdAt: new Date().toISOString(),
        isDismissible: true,
      },
    ];

    this.messages = sampleMessages;
    await this.saveMessages();
  }

  async getMessagesForUser(user: User | null): Promise<AppMessage[]> {
    console.log('📨 Getting messages for user:', user?.id, 'level:', user?.level);
    console.log('📨 Available messages:', this.messages.length);
    
    if (!user) return [];

    const now = new Date();
    const userCreatedAt = new Date(user.createdAt);
    const daysSinceCreated = Math.floor((now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24));

    console.log('📨 User created:', userCreatedAt, 'Days since created:', daysSinceCreated);

    // Filter messages based on targeting rules and dismissal status
    const filteredMessages = this.messages.filter(message => {
      console.log('📨 Checking message:', message.id, message.title);
      // Check if message is expired
      if (message.expiresAt && new Date(message.expiresAt) < now) {
        console.log('📨 Message expired:', message.id);
        return false;
      }

      // Check if message was dismissed
      const isDismissed = this.dismissedMessages.some(
        dismissed => dismissed.messageId === message.id && dismissed.userId === user.id
      );
      if (isDismissed && message.targetingRules.showOnce) {
        console.log('📨 Message dismissed:', message.id);
        return false;
      }

      // Check user level targeting
      if (message.targetingRules.userLevel) {
        const { min, max } = message.targetingRules.userLevel;
        console.log('📨 Checking user level:', user.level, 'min:', min, 'max:', max);
        if (min && user.level < min) {
          console.log('📨 User level too low:', message.id);
          return false;
        }
        if (max && user.level > max) {
          console.log('📨 User level too high:', message.id);
          return false;
        }
      }

      // Check date range targeting
      if (message.targetingRules.dateRange) {
        const { start, end } = message.targetingRules.dateRange;
        const startDate = new Date(start);
        const endDate = new Date(end);
        console.log('📨 Checking date range:', now, 'start:', startDate, 'end:', endDate);
        if (now < startDate || now > endDate) {
          console.log('📨 Outside date range:', message.id);
          return false;
        }
      }

      // Check show after days
      if (message.targetingRules.showAfterDays) {
        console.log('📨 Checking show after days:', daysSinceCreated, 'required:', message.targetingRules.showAfterDays);
        if (daysSinceCreated < message.targetingRules.showAfterDays) {
          console.log('📨 Too early to show:', message.id);
          return false;
        }
      }

      // Check message type settings
      let typeAllowed = false;
      switch (message.type) {
        case 'welcome':
          typeAllowed = this.settings.showWelcomeMessages;
          break;
        case 'feature':
        case 'update':
        case 'announcement':
          typeAllowed = this.settings.showFeatureAnnouncements;
          break;
        case 'tip':
          typeAllowed = this.settings.showTips;
          break;
        default:
          typeAllowed = true;
      }
      
      console.log('📨 Message type allowed:', message.type, typeAllowed);
      console.log('📨 Message passed all filters:', message.id);
      return typeAllowed;
    });

    // Sort by priority and creation date
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    filteredMessages.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Limit to max messages per screen
    const finalMessages = filteredMessages.slice(0, this.settings.maxMessagesPerScreen);
    console.log('📨 Final filtered messages:', finalMessages.length, finalMessages.map(m => m.id));
    return finalMessages;
  }

  async dismissMessage(messageId: string, userId: string): Promise<void> {
    const dismissedMessage: DismissedMessage = {
      messageId,
      dismissedAt: new Date().toISOString(),
      userId,
    };

    this.dismissedMessages.push(dismissedMessage);
    await this.saveDismissedMessages();
  }

  async addMessage(message: Omit<AppMessage, 'id' | 'createdAt'>): Promise<AppMessage> {
    const newMessage: AppMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    this.messages.push(newMessage);
    await this.saveMessages();
    return newMessage;
  }

  async updateSettings(newSettings: Partial<MessageDisplaySettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  getSettings(): MessageDisplaySettings {
    return { ...this.settings };
  }

  async clearDismissedMessages(userId: string): Promise<void> {
    this.dismissedMessages = this.dismissedMessages.filter(
      dismissed => dismissed.userId !== userId
    );
    await this.saveDismissedMessages();
  }

  async removeExpiredMessages(): Promise<void> {
    const now = new Date();
    const activeMessages = this.messages.filter(message => {
      return !message.expiresAt || new Date(message.expiresAt) >= now;
    });

    if (activeMessages.length !== this.messages.length) {
      this.messages = activeMessages;
      await this.saveMessages();
    }
  }
}

export const messagesService = new MessagesService();