import { TaskCategory, TaskPriority } from '../types';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time?: string): string => {
  if (!time) return 'No time set';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateString = date.toISOString().split('T')[0];
  const todayString = today.toISOString().split('T')[0];
  const tomorrowString = tomorrow.toISOString().split('T')[0];
  const yesterdayString = yesterday.toISOString().split('T')[0];

  if (dateString === todayString) {
    return 'Today';
  } else if (dateString === tomorrowString) {
    return 'Tomorrow';
  } else if (dateString === yesterdayString) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const getCategoryIcon = (category: TaskCategory): string => {
  switch (category) {
    case 'work': return 'briefcase';
    case 'personal': return 'person';
    case 'health': return 'fitness';
    case 'learning': return 'book';
    case 'social': return 'people';
    case 'creative': return 'brush';
    case 'maintenance': return 'construct';
    default: return 'ellipse';
  }
};

export const getCategoryColor = (category: TaskCategory): string => {
  switch (category) {
    case 'work': return '#3b82f6';
    case 'personal': return '#8b5cf6';
    case 'health': return '#10b981';
    case 'learning': return '#f59e0b';
    case 'social': return '#ef4444';
    case 'creative': return '#ec4899';
    case 'maintenance': return '#6b7280';
    default: return '#9ca3af';
  }
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'urgent': return '#ef4444';
    case 'high': return '#f59e0b';
    case 'medium': return '#3b82f6';
    case 'low': return '#6b7280';
    default: return '#6b7280';
  }
};

export const getPriorityBadgeVariant = (priority: TaskPriority): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' => {
  switch (priority) {
    case 'urgent': return 'danger';
    case 'high': return 'warning';
    case 'medium': return 'info';
    case 'low': return 'secondary';
    default: return 'secondary';
  }
};

export const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.2, level - 1));
};

export const calculateLevelFromXP = (totalXP: number): { level: number; currentLevelXP: number; xpToNextLevel: number } => {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = calculateXPForLevel(2);

  while (totalXP >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel = calculateXPForLevel(level + 1);
  }

  return {
    level,
    currentLevelXP: totalXP - xpForCurrentLevel,
    xpToNextLevel: xpForNextLevel - xpForCurrentLevel,
  };
};

export const isTaskOverdue = (scheduledDate: string, scheduledTime?: string): boolean => {
  const now = new Date();
  const taskDateTime = new Date(`${scheduledDate}T${scheduledTime || '23:59'}:00`);
  return now > taskDateTime;
};

export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};