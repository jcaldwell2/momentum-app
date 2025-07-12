import { Task, CalendarCellData, CalendarGridData } from '../types';

/**
 * Get the start of the month for a given date
 */
export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the end of the month for a given date
 */
export const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Get the start of the calendar grid (includes days from previous month)
 */
export const getCalendarStart = (date: Date): Date => {
  const monthStart = getMonthStart(date);
  const dayOfWeek = monthStart.getDay(); // 0 = Sunday
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(monthStart.getDate() - dayOfWeek);
  return calendarStart;
};

/**
 * Get the end of the calendar grid (includes days from next month)
 */
export const getCalendarEnd = (date: Date): Date => {
  const monthEnd = getMonthEnd(date);
  const dayOfWeek = monthEnd.getDay(); // 0 = Sunday
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(monthEnd.getDate() + (6 - dayOfWeek));
  return calendarEnd;
};

/**
 * Generate array of dates for calendar grid
 */
export const getCalendarDates = (date: Date): Date[] => {
  const start = getCalendarStart(date);
  const end = getCalendarEnd(date);
  const dates: Date[] = [];
  
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if two dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDateString(date1) === formatDateString(date2);
};

/**
 * Check if date is today
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date());
};

/**
 * Check if date is in current month
 */
export const isCurrentMonth = (date: Date, referenceDate: Date): boolean => {
  return date.getMonth() === referenceDate.getMonth() && 
         date.getFullYear() === referenceDate.getFullYear();
};

/**
 * Get tasks for a specific date
 */
export const getTasksForDate = (tasks: Task[], date: Date): Task[] => {
  const dateString = formatDateString(date);
  return tasks.filter(task => task.scheduledDate === dateString);
};

/**
 * Calculate workload level based on task count and duration
 */
export const calculateWorkloadLevel = (tasks: Task[]): 'light' | 'moderate' | 'heavy' => {
  const totalMinutes = tasks.reduce((sum, task) => sum + (task.duration || 30), 0);
  const taskCount = tasks.length;
  
  if (taskCount === 0) return 'light';
  if (taskCount <= 2 && totalMinutes <= 120) return 'light';
  if (taskCount <= 4 && totalMinutes <= 240) return 'moderate';
  return 'heavy';
};

/**
 * Check if tasks contain high priority items
 */
export const hasHighPriorityTasks = (tasks: Task[]): boolean => {
  return tasks.some(task => task.priority === 'high' || task.priority === 'urgent');
};

/**
 * Check if tasks contain overdue items
 */
export const hasOverdueTasks = (tasks: Task[], date: Date): boolean => {
  const now = new Date();
  const dateString = formatDateString(date);
  
  return tasks.some(task => {
    if (task.status === 'completed') return false;
    
    const taskDate = new Date(task.scheduledDate);
    if (task.scheduledTime) {
      const [hours, minutes] = task.scheduledTime.split(':').map(Number);
      taskDate.setHours(hours, minutes);
    } else {
      taskDate.setHours(23, 59); // End of day if no time specified
    }
    
    return taskDate < now;
  });
};

/**
 * Create calendar cell data for a specific date
 */
export const createCalendarCellData = (
  date: Date,
  tasks: Task[],
  referenceDate: Date,
  selectedDate?: Date
): CalendarCellData => {
  const dateTasks = getTasksForDate(tasks, date);
  const completedTasks = dateTasks.filter(task => task.status === 'completed');
  
  return {
    date: formatDateString(date),
    isCurrentMonth: isCurrentMonth(date, referenceDate),
    isToday: isToday(date),
    isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
    tasks: dateTasks,
    taskCount: dateTasks.length,
    completedTaskCount: completedTasks.length,
    hasHighPriorityTasks: hasHighPriorityTasks(dateTasks),
    hasOverdueTasks: hasOverdueTasks(dateTasks, date),
    workloadLevel: calculateWorkloadLevel(dateTasks),
  };
};

/**
 * Generate calendar grid data for a month
 */
export const generateCalendarGrid = (
  date: Date,
  tasks: Task[],
  selectedDate?: Date
): CalendarGridData => {
  const dates = getCalendarDates(date);
  const weeks: CalendarCellData[][] = [];
  
  // Group dates into weeks (7 days each)
  for (let i = 0; i < dates.length; i += 7) {
    const week = dates.slice(i, i + 7).map(weekDate =>
      createCalendarCellData(weekDate, tasks, date, selectedDate)
    );
    weeks.push(week);
  }
  
  return {
    weeks,
    monthName: date.toLocaleDateString('en-US', { month: 'long' }),
    year: date.getFullYear(),
  };
};

/**
 * Navigate to previous month
 */
export const getPreviousMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() - 1);
  return newDate;
};

/**
 * Navigate to next month
 */
export const getNextMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  return newDate;
};

/**
 * Get month and year display string
 */
export const getMonthYearString = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

/**
 * Get tasks for a date range (for calendar view optimization)
 */
export const getTasksForDateRange = (
  tasks: Task[],
  startDate: Date,
  endDate: Date
): Task[] => {
  const startString = formatDateString(startDate);
  const endString = formatDateString(endDate);
  
  return tasks.filter(task => {
    return task.scheduledDate >= startString && task.scheduledDate <= endString;
  });
};

/**
 * Get day names for calendar header
 */
export const getDayNames = (short: boolean = true): string[] => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return short ? days.map(day => day.substring(0, 3)) : days;
};