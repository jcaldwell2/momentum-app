export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: string; // ISO date string
  scheduledTime?: string; // HH:MM format
  duration?: number; // minutes
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  xpReward: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  level: number;
  totalXP: number;
  currentLevelXP: number;
  xpToNextLevel: number;
  streaks: Streak[];
  preferences: UserPreferences;
  createdAt: string;
}

export interface XPEntry {
  id: string;
  userId: string;
  taskId: string;
  amount: number;
  reason: string;
  earnedAt: string;
}

export interface Streak {
  id: string;
  category: TaskCategory;
  currentCount: number;
  bestCount: number;
  lastCompletedDate: string;
  isActive: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    reminderMinutes: number;
    dailyPlanningTime: string;
  };
  workingHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  defaultTaskDuration: number; // minutes
}

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'task' | 'xp' | 'user';
  entityId: string;
  data: any;
  timestamp: string;
  synced: boolean;
}

export type TaskCategory = 
  | 'work' 
  | 'personal' 
  | 'health' 
  | 'learning' 
  | 'social' 
  | 'creative' 
  | 'maintenance';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number; // every N days/weeks/months
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  endDate?: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  totalScheduledMinutes: number;
  completedTasks: number;
  totalTasks: number;
}

export interface StatsData {
  totalTasksCompleted: number;
  totalXPEarned: number;
  currentLevel: number;
  activeStreaks: Streak[];
  weeklyProgress: {
    date: string;
    completed: number;
    total: number;
  }[];
  categoryBreakdown: {
    category: TaskCategory;
    completed: number;
    total: number;
  }[];
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  TaskCreation: { editTask?: Task };
  TaskDetail: { taskId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Stats: undefined;
  Settings: undefined;
};