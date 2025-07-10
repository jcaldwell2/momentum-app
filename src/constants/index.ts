import { TaskCategory, TaskPriority } from '../types';

export const TASK_CATEGORIES: { value: TaskCategory; label: string; icon: string; color: string }[] = [
  { value: 'work', label: 'Work', icon: 'briefcase', color: '#3b82f6' },
  { value: 'personal', label: 'Personal', icon: 'person', color: '#8b5cf6' },
  { value: 'health', label: 'Health', icon: 'fitness', color: '#10b981' },
  { value: 'learning', label: 'Learning', icon: 'book', color: '#f59e0b' },
  { value: 'social', label: 'Social', icon: 'people', color: '#ef4444' },
  { value: 'creative', label: 'Creative', icon: 'brush', color: '#ec4899' },
  { value: 'maintenance', label: 'Maintenance', icon: 'construct', color: '#6b7280' },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#6b7280' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export const XP_REWARDS = {
  TASK_COMPLETION: 10,
  STREAK_BONUS: 5,
  LEVEL_UP_BONUS: 50,
};

export const LEVEL_XP_REQUIREMENTS = {
  BASE_XP: 100,
  MULTIPLIER: 1.2,
};

export const DEFAULT_TASK_DURATION = 30; // minutes
export const DEFAULT_REMINDER_TIME = 15; // minutes before task

export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  light: '#f8f9fa',
  dark: '#111827',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};