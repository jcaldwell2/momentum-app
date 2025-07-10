import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, User, XPEntry, Streak, SyncQueueItem, TaskCategory, TaskPriority, TaskStatus } from '../types';

class DatabaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      console.log('🗄️ Database service initializing...');
      this.initialized = true;
      await this.seedInitialData();
      console.log('✅ Database service initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  private async seedInitialData(): Promise<void> {
    try {
      console.log('🌱 Checking for existing user data...');
      // Check if user exists
      const userExists = await AsyncStorage.getItem('user');
      console.log('👤 User exists:', !!userExists);
      
      if (!userExists) {
        console.log('🆕 Creating initial user and data...');
      // Create default user
      const userId = 'user-1';
      const now = new Date().toISOString();
      
      const defaultUser: User = {
        id: userId,
        name: 'Momentum User',
        level: 1,
        totalXP: 0,
        currentLevelXP: 0,
        xpToNextLevel: 100,
        preferences: {
          theme: 'system',
          notifications: {
            enabled: true,
            reminderMinutes: 15,
            dailyPlanningTime: '09:00'
          },
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          defaultTaskDuration: 30
        },
        streaks: [],
        createdAt: now
      };

      await AsyncStorage.setItem('user', JSON.stringify(defaultUser));

      // Create initial streaks for all categories
      const categories: TaskCategory[] = ['work', 'personal', 'health', 'learning', 'social', 'creative', 'maintenance'];
      const streaks: Streak[] = categories.map(category => ({
        id: `streak-${category}`,
        category,
        currentCount: 0,
        bestCount: 0,
        lastCompletedDate: '',
        isActive: true
      }));

      await AsyncStorage.setItem('streaks', JSON.stringify(streaks));

      // Add some sample tasks
      await this.addSampleTasks();

      // Initialize empty arrays for other data
      await AsyncStorage.setItem('xpEntries', JSON.stringify([]));
      console.log('✅ Initial data seeded successfully');
    } else {
      console.log('✅ Using existing user data');
    }
    } catch (error) {
      console.error('❌ Error seeding initial data:', error);
      throw error;
    }
  }

  private async addSampleTasks(): Promise<void> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sampleTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Morning Workout',
        description: 'Complete 30-minute cardio session',
        category: 'health',
        priority: 'high',
        status: 'pending',
        scheduledDate: today.toISOString().split('T')[0],
        scheduledTime: '07:00',
        duration: 30,
        isRecurring: false,
        xpReward: 25,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-2',
        title: 'Review Project Proposal',
        description: 'Go through the Q1 project proposal and provide feedback',
        category: 'work',
        priority: 'urgent',
        status: 'pending',
        scheduledDate: today.toISOString().split('T')[0],
        scheduledTime: '10:00',
        duration: 60,
        isRecurring: false,
        xpReward: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-3',
        title: 'Learn React Native',
        description: 'Complete chapter 3 of React Native course',
        category: 'learning',
        priority: 'medium',
        status: 'pending',
        scheduledDate: today.toISOString().split('T')[0],
        scheduledTime: '19:00',
        duration: 45,
        isRecurring: false,
        xpReward: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'task-4',
        title: 'Call Mom',
        description: 'Weekly check-in call with family',
        category: 'social',
        priority: 'medium',
        status: 'pending',
        scheduledDate: tomorrow.toISOString().split('T')[0],
        scheduledTime: '18:00',
        duration: 20,
        isRecurring: false,
        xpReward: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await AsyncStorage.setItem('tasks', JSON.stringify(sampleTasks));
  }

  // Task operations
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    if (!this.initialized) throw new Error('Database not initialized');

    const id = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newTask: Task = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now
    };

    const existingTasks = await this.getTasks();
    const updatedTasks = [...existingTasks, newTask];
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));

    return newTask;
  }

  async getTasks(date?: string): Promise<Task[]> {
    if (!this.initialized) throw new Error('Database not initialized');

    const tasksData = await AsyncStorage.getItem('tasks');
    const tasks: Task[] = tasksData ? JSON.parse(tasksData) : [];

    if (date) {
      return tasks.filter(task => task.scheduledDate === date);
    }

    return tasks.sort((a, b) => {
      // Sort by scheduled time, then by creation time
      if (a.scheduledTime && b.scheduledTime) {
        return a.scheduledTime.localeCompare(b.scheduledTime);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    if (!this.initialized) throw new Error('Database not initialized');

    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  }

  async completeTask(taskId: string): Promise<void> {
    if (!this.initialized) throw new Error('Database not initialized');

    const completedAt = new Date().toISOString();
    
    // Update task status
    await this.updateTask(taskId, {
      status: 'completed',
      completedAt
    });

    // Get task details for XP calculation
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      // Award XP
      await this.awardXP('user-1', taskId, task.xpReward, `Completed task: ${task.title}`);
      
      // Update streak
      await this.updateStreak(task.category);
    }
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.initialized) throw new Error('Database not initialized');
    
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    await AsyncStorage.setItem('tasks', JSON.stringify(filteredTasks));
  }

  // XP operations
  async awardXP(userId: string, taskId: string, amount: number, reason: string): Promise<void> {
    if (!this.initialized) throw new Error('Database not initialized');

    const xpId = `xp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const earnedAt = new Date().toISOString();

    // Add XP entry
    const xpEntriesData = await AsyncStorage.getItem('xpEntries');
    const xpEntries: XPEntry[] = xpEntriesData ? JSON.parse(xpEntriesData) : [];
    
    const newXPEntry: XPEntry = {
      id: xpId,
      userId,
      taskId,
      amount,
      reason,
      earnedAt
    };
    
    xpEntries.push(newXPEntry);
    await AsyncStorage.setItem('xpEntries', JSON.stringify(xpEntries));

    // Update user XP
    const user = await this.getUser();
    
    if (user) {
      const newTotalXP = user.totalXP + amount;
      let newLevel = user.level;
      let newCurrentLevelXP = user.currentLevelXP + amount;
      let newXPToNextLevel = user.xpToNextLevel;

      // Check for level up
      while (newCurrentLevelXP >= newXPToNextLevel) {
        newCurrentLevelXP -= newXPToNextLevel;
        newLevel++;
        newXPToNextLevel = this.calculateXPForLevel(newLevel + 1) - this.calculateXPForLevel(newLevel);
      }

      const updatedUser: User = {
        ...user,
        totalXP: newTotalXP,
        level: newLevel,
        currentLevelXP: newCurrentLevelXP,
        xpToNextLevel: newXPToNextLevel
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  private calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }

  // Streak operations
  async updateStreak(category: TaskCategory): Promise<void> {
    if (!this.initialized) throw new Error('Database not initialized');

    const today = new Date().toISOString().split('T')[0];
    const streaks = await this.getStreaks();
    const streakIndex = streaks.findIndex(s => s.category === category);

    if (streakIndex !== -1) {
      const streak = streaks[streakIndex];
      const lastCompleted = streak.lastCompletedDate;
      let newCurrentCount = streak.currentCount;
      let newBestCount = streak.bestCount;

      if (lastCompleted !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastCompleted === yesterdayStr) {
          // Continue streak
          newCurrentCount++;
        } else {
          // Reset streak
          newCurrentCount = 1;
        }

        if (newCurrentCount > newBestCount) {
          newBestCount = newCurrentCount;
        }

        streaks[streakIndex] = {
          ...streak,
          currentCount: newCurrentCount,
          bestCount: newBestCount,
          lastCompletedDate: today
        };

        await AsyncStorage.setItem('streaks', JSON.stringify(streaks));
      }
    }
  }

  async getStreaks(): Promise<Streak[]> {
    if (!this.initialized) throw new Error('Database not initialized');
    
    const streaksData = await AsyncStorage.getItem('streaks');
    const streaks: Streak[] = streaksData ? JSON.parse(streaksData) : [];
    
    return streaks.sort((a, b) => b.currentCount - a.currentCount);
  }

  async getUser(): Promise<User | null> {
    if (!this.initialized) throw new Error('Database not initialized');
    
    const userData = await AsyncStorage.getItem('user');
    
    if (userData) {
      const user: User = JSON.parse(userData);
      const streaks = await this.getStreaks();
      return {
        ...user,
        streaks
      };
    }
    
    return null;
  }

  async getXPEntries(limit: number = 10): Promise<XPEntry[]> {
    if (!this.initialized) throw new Error('Database not initialized');
    
    const xpEntriesData = await AsyncStorage.getItem('xpEntries');
    const xpEntries: XPEntry[] = xpEntriesData ? JSON.parse(xpEntriesData) : [];
    
    return xpEntries
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, limit);
  }
}

export const databaseService = new DatabaseService();