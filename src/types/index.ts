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

export enum RecurrenceFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface WeeklyRecurrenceOptions {
  daysOfWeek: number[]; // 0-6, Sunday = 0
}

export interface RecurrencePattern {
  type: RecurrenceFrequency;
  interval: number; // every N days/weeks/months
  weeklyOptions?: WeeklyRecurrenceOptions;
  endDate?: string;
  endAfterOccurrences?: number;
}

export interface RecurringTaskTemplate {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  scheduledTime?: string; // HH:MM format
  duration?: number; // minutes
  xpReward: number;
  recurrencePattern: RecurrencePattern;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastGeneratedDate?: string; // Last date instances were generated up to
}

export interface RecurringTaskInstance extends Task {
  templateId: string;
  instanceDate: string; // YYYY-MM-DD - the specific date this instance is for
  isModified: boolean; // true if this instance was edited individually
}

export interface RecurrenceException {
  id: string;
  templateId: string;
  date: string; // YYYY-MM-DD
  type: 'skip' | 'modify';
  modifiedTask?: Partial<Task>;
  createdAt: string;
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
  Calendar: undefined;
  Stats: undefined;
  Settings: undefined;
};

// Calendar types
export type CalendarViewType = 'month' | 'week' | 'day';

export interface CalendarCellData {
  date: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  tasks: Task[];
  taskCount: number;
  completedTaskCount: number;
  hasHighPriorityTasks: boolean;
  hasOverdueTasks: boolean;
  workloadLevel: 'light' | 'moderate' | 'heavy';
}

export interface CalendarNavigationProps {
  currentDate: Date;
  viewType: CalendarViewType;
  onDateChange: (date: Date) => void;
  onViewTypeChange: (viewType: CalendarViewType) => void;
}

export interface CalendarGridData {
  weeks: CalendarCellData[][];
  monthName: string;
  year: number;
}

// App Messages System
export interface AppMessage {
  id: string;
  type: 'welcome' | 'feature' | 'update' | 'tip' | 'announcement';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  targetingRules: MessageTargetingRules;
  createdAt: string;
  expiresAt?: string;
  isDismissible: boolean;
  actionButton?: {
    text: string;
    action: 'navigate' | 'external' | 'dismiss';
    target?: string;
  };
}

export interface MessageTargetingRules {
  userLevel?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
  showOnce?: boolean;
  showAfterDays?: number;
}

export interface MessageDisplaySettings {
  showWelcomeMessages: boolean;
  showFeatureAnnouncements: boolean;
  showTips: boolean;
  maxMessagesPerScreen: number;
  autoHideAfterSeconds?: number;
}

export interface DismissedMessage {
  messageId: string;
  dismissedAt: string;
  userId: string;
}

// Planning System Types
export interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  scheduledTime?: string; // HH:MM format
  duration?: number; // minutes
  xpReward: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  usageCount: number;
}

export enum PlanningPeriod {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter'
}

export interface WorkloadAnalysis {
  period: PlanningPeriod;
  startDate: string;
  endDate: string;
  totalTasks: number;
  totalMinutes: number;
  averageTasksPerDay: number;
  averageMinutesPerDay: number;
  peakDays: {
    date: string;
    taskCount: number;
    totalMinutes: number;
  }[];
  lightDays: {
    date: string;
    taskCount: number;
    totalMinutes: number;
  }[];
  categoryDistribution: {
    category: TaskCategory;
    taskCount: number;
    totalMinutes: number;
    percentage: number;
  }[];
  workloadLevel: 'light' | 'moderate' | 'heavy' | 'overloaded';
  recommendations: string[];
}

export interface BulkTaskCreation {
  templateId?: string;
  tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  distribution: 'daily' | 'weekly' | 'custom';
  skipWeekends?: boolean;
  skipHolidays?: boolean;
}

export interface PlanningPreview {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  plannedTasks: Task[];
  workloadAnalysis: WorkloadAnalysis;
  conflicts: {
    date: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  suggestions: {
    type: 'reschedule' | 'reduce' | 'distribute';
    message: string;
    affectedDates: string[];
  }[];
}

export interface SmartSchedulingSuggestion {
  suggestedDate: string;
  suggestedTime?: string;
  confidence: number; // 0-1
  reason: string;
  workloadImpact: 'minimal' | 'moderate' | 'significant';
  alternatives: {
    date: string;
    time?: string;
    confidence: number;
    reason: string;
  }[];
}