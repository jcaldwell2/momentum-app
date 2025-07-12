import { Task, TaskTemplate, WorkloadAnalysis, PlanningPeriod, TaskCategory, SmartSchedulingSuggestion, BulkTaskCreation } from '../types';
import { formatDateString, getTasksForDate } from './calendar';

/**
 * Get date range for a planning period
 */
export const getPlanningDateRange = (
  startDate: Date,
  period: PlanningPeriod
): { startDate: Date; endDate: Date } => {
  const start = new Date(startDate);
  const end = new Date(startDate);

  switch (period) {
    case PlanningPeriod.WEEK:
      end.setDate(end.getDate() + 6);
      break;
    case PlanningPeriod.MONTH:
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      break;
    case PlanningPeriod.QUARTER:
      end.setMonth(end.getMonth() + 3);
      end.setDate(end.getDate() - 1);
      break;
  }

  return { startDate: start, endDate: end };
};

/**
 * Calculate workload analysis for a given period
 */
export const calculateWorkloadAnalysis = (
  tasks: Task[],
  startDate: Date,
  endDate: Date,
  period: PlanningPeriod
): WorkloadAnalysis => {
  const dateRange = getDatesInRange(startDate, endDate);
  const totalDays = dateRange.length;
  
  // Calculate basic metrics
  const totalTasks = tasks.length;
  const totalMinutes = tasks.reduce((sum, task) => sum + (task.duration || 30), 0);
  const averageTasksPerDay = totalTasks / totalDays;
  const averageMinutesPerDay = totalMinutes / totalDays;

  // Find peak and light days
  const dailyWorkload = dateRange.map(date => {
    const dayTasks = getTasksForDate(tasks, date);
    const taskCount = dayTasks.length;
    const totalMinutes = dayTasks.reduce((sum, task) => sum + (task.duration || 30), 0);
    
    return {
      date: formatDateString(date),
      taskCount,
      totalMinutes
    };
  });

  const sortedByTasks = [...dailyWorkload].sort((a, b) => b.taskCount - a.taskCount);
  const sortedByMinutes = [...dailyWorkload].sort((a, b) => b.totalMinutes - a.totalMinutes);
  
  const peakDays = sortedByTasks.slice(0, Math.min(3, Math.ceil(totalDays * 0.2)));
  const lightDays = sortedByTasks.slice(-Math.min(3, Math.ceil(totalDays * 0.2))).reverse();

  // Calculate category distribution
  const categoryStats = new Map<TaskCategory, { count: number; minutes: number }>();
  
  tasks.forEach(task => {
    const current = categoryStats.get(task.category) || { count: 0, minutes: 0 };
    categoryStats.set(task.category, {
      count: current.count + 1,
      minutes: current.minutes + (task.duration || 30)
    });
  });

  const categoryDistribution = Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    taskCount: stats.count,
    totalMinutes: stats.minutes,
    percentage: (stats.count / totalTasks) * 100
  }));

  // Determine workload level
  let workloadLevel: 'light' | 'moderate' | 'heavy' | 'overloaded';
  if (averageTasksPerDay <= 2 && averageMinutesPerDay <= 120) {
    workloadLevel = 'light';
  } else if (averageTasksPerDay <= 4 && averageMinutesPerDay <= 240) {
    workloadLevel = 'moderate';
  } else if (averageTasksPerDay <= 6 && averageMinutesPerDay <= 360) {
    workloadLevel = 'heavy';
  } else {
    workloadLevel = 'overloaded';
  }

  // Generate recommendations
  const recommendations = generateWorkloadRecommendations(
    workloadLevel,
    peakDays,
    lightDays,
    categoryDistribution
  );

  return {
    period,
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
    totalTasks,
    totalMinutes,
    averageTasksPerDay,
    averageMinutesPerDay,
    peakDays,
    lightDays,
    categoryDistribution,
    workloadLevel,
    recommendations
  };
};

/**
 * Generate workload recommendations
 */
const generateWorkloadRecommendations = (
  workloadLevel: 'light' | 'moderate' | 'heavy' | 'overloaded',
  peakDays: any[],
  lightDays: any[],
  categoryDistribution: any[]
): string[] => {
  const recommendations: string[] = [];

  switch (workloadLevel) {
    case 'light':
      recommendations.push('You have capacity for additional tasks');
      if (lightDays.length > 0) {
        recommendations.push('Consider scheduling more important tasks on lighter days');
      }
      break;
    
    case 'moderate':
      recommendations.push('Good workload balance');
      recommendations.push('Monitor peak days to avoid overcommitment');
      break;
    
    case 'heavy':
      recommendations.push('High workload detected');
      recommendations.push('Consider redistributing tasks from peak days');
      if (peakDays.length > 0) {
        recommendations.push(`Peak workload on ${peakDays[0].date} - consider rescheduling some tasks`);
      }
      break;
    
    case 'overloaded':
      recommendations.push('Workload may be too high');
      recommendations.push('Strongly consider reducing or rescheduling tasks');
      recommendations.push('Focus on high-priority tasks only');
      break;
  }

  // Category-specific recommendations
  const dominantCategory = categoryDistribution.reduce((max, current) => 
    current.percentage > max.percentage ? current : max
  );
  
  if (dominantCategory.percentage > 50) {
    recommendations.push(`${dominantCategory.category} tasks dominate your schedule - consider diversifying`);
  }

  return recommendations;
};

/**
 * Get all dates in a range
 */
export const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

/**
 * Apply task template to create new task
 */
export const applyTaskTemplate = (
  template: TaskTemplate,
  scheduledDate: string,
  scheduledTime?: string
): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    title: template.title,
    description: template.description,
    category: template.category,
    priority: template.priority,
    status: 'pending',
    scheduledDate,
    scheduledTime: scheduledTime || template.scheduledTime,
    duration: template.duration,
    isRecurring: false,
    xpReward: template.xpReward
  };
};

/**
 * Generate smart scheduling suggestions
 */
export const generateSmartSchedulingSuggestions = (
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  existingTasks: Task[],
  dateRange: { startDate: Date; endDate: Date },
  userPreferences: {
    workingHours: { start: string; end: string };
    maxTasksPerDay?: number;
    maxMinutesPerDay?: number;
  }
): SmartSchedulingSuggestion[] => {
  const suggestions: SmartSchedulingSuggestion[] = [];
  const dates = getDatesInRange(dateRange.startDate, dateRange.endDate);
  
  // Skip weekends for work tasks
  const availableDates = dates.filter(date => {
    if (task.category === 'work') {
      const dayOfWeek = date.getDay();
      return dayOfWeek !== 0 && dayOfWeek !== 6; // Not Sunday or Saturday
    }
    return true;
  });

  for (const date of availableDates) {
    const dayTasks = getTasksForDate(existingTasks, date);
    const dayTaskCount = dayTasks.length;
    const dayMinutes = dayTasks.reduce((sum, t) => sum + (t.duration || 30), 0);
    
    // Calculate confidence based on workload
    let confidence = 1.0;
    const maxTasks = userPreferences.maxTasksPerDay || 6;
    const maxMinutes = userPreferences.maxMinutesPerDay || 480; // 8 hours
    
    if (dayTaskCount >= maxTasks) {
      confidence *= 0.3;
    } else if (dayTaskCount >= maxTasks * 0.8) {
      confidence *= 0.6;
    }
    
    if (dayMinutes >= maxMinutes) {
      confidence *= 0.2;
    } else if (dayMinutes >= maxMinutes * 0.8) {
      confidence *= 0.7;
    }
    
    // Boost confidence for matching categories
    const sameCategoryTasks = dayTasks.filter(t => t.category === task.category);
    if (sameCategoryTasks.length > 0 && sameCategoryTasks.length < 3) {
      confidence *= 1.2;
    }
    
    // Determine workload impact
    let workloadImpact: 'minimal' | 'moderate' | 'significant';
    const newTotalMinutes = dayMinutes + (task.duration || 30);
    
    if (newTotalMinutes <= maxMinutes * 0.5) {
      workloadImpact = 'minimal';
    } else if (newTotalMinutes <= maxMinutes * 0.8) {
      workloadImpact = 'moderate';
    } else {
      workloadImpact = 'significant';
    }
    
    // Generate reason
    let reason = '';
    if (dayTaskCount === 0) {
      reason = 'Free day - ideal for scheduling';
    } else if (dayTaskCount <= 2) {
      reason = 'Light workload day';
    } else if (sameCategoryTasks.length > 0) {
      reason = `Good fit with existing ${task.category} tasks`;
    } else {
      reason = 'Available slot';
    }
    
    if (confidence > 0.3) {
      suggestions.push({
        suggestedDate: formatDateString(date),
        suggestedTime: findBestTimeSlot(dayTasks, task, userPreferences.workingHours),
        confidence: Math.min(confidence, 1.0),
        reason,
        workloadImpact,
        alternatives: []
      });
    }
  }
  
  // Sort by confidence and return top suggestions
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
    .map(suggestion => ({
      ...suggestion,
      alternatives: suggestions
        .filter(s => s.suggestedDate !== suggestion.suggestedDate)
        .slice(0, 3)
        .map(alt => ({
          date: alt.suggestedDate,
          time: alt.suggestedTime,
          confidence: alt.confidence,
          reason: alt.reason
        }))
    }));
};

/**
 * Find best time slot for a task
 */
const findBestTimeSlot = (
  existingTasks: Task[],
  newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  workingHours: { start: string; end: string }
): string | undefined => {
  if (newTask.scheduledTime) {
    return newTask.scheduledTime;
  }
  
  // Get scheduled tasks with times
  const scheduledTasks = existingTasks
    .filter(task => task.scheduledTime)
    .sort((a, b) => a.scheduledTime!.localeCompare(b.scheduledTime!));
  
  const [workStart] = workingHours.start.split(':').map(Number);
  const [workEnd] = workingHours.end.split(':').map(Number);
  
  // Try to find gaps in the schedule
  if (scheduledTasks.length === 0) {
    // No scheduled tasks, suggest morning time
    return `${workStart.toString().padStart(2, '0')}:00`;
  }
  
  // Check for gaps between tasks
  for (let i = 0; i < scheduledTasks.length - 1; i++) {
    const currentTask = scheduledTasks[i];
    const nextTask = scheduledTasks[i + 1];
    
    const currentEnd = addMinutesToTime(
      currentTask.scheduledTime!,
      currentTask.duration || 30
    );
    
    const gapMinutes = getTimeDifferenceMinutes(currentEnd, nextTask.scheduledTime!);
    
    if (gapMinutes >= (newTask.duration || 30) + 15) { // 15 min buffer
      return addMinutesToTime(currentEnd, 15);
    }
  }
  
  // If no gaps, suggest after last task or at start of day
  const lastTask = scheduledTasks[scheduledTasks.length - 1];
  const afterLastTask = addMinutesToTime(
    lastTask.scheduledTime!,
    (lastTask.duration || 30) + 15
  );
  
  const [afterHour] = afterLastTask.split(':').map(Number);
  
  if (afterHour < workEnd) {
    return afterLastTask;
  }
  
  // Default to start of working hours
  return `${workStart.toString().padStart(2, '0')}:00`;
};

/**
 * Add minutes to a time string
 */
const addMinutesToTime = (timeString: string, minutes: number): string => {
  const [hours, mins] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

/**
 * Get time difference in minutes
 */
const getTimeDifferenceMinutes = (time1: string, time2: string): number => {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  
  return minutes2 - minutes1;
};

/**
 * Generate bulk task creation plan
 */
export const generateBulkTaskPlan = (
  bulkCreation: BulkTaskCreation,
  existingTasks: Task[]
): Task[] => {
  const { tasks, dateRange, distribution, skipWeekends, skipHolidays } = bulkCreation;
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  const availableDates = getDatesInRange(startDate, endDate);
  
  // Filter dates based on preferences
  const filteredDates = availableDates.filter(date => {
    if (skipWeekends) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    }
    
    // TODO: Add holiday filtering if needed
    
    return true;
  });
  
  const plannedTasks: Task[] = [];
  
  switch (distribution) {
    case 'daily':
      // Distribute tasks evenly across available dates
      tasks.forEach((task, index) => {
        const dateIndex = index % filteredDates.length;
        const scheduledDate = formatDateString(filteredDates[dateIndex]);
        
        plannedTasks.push({
          ...task,
          id: `bulk-${Date.now()}-${index}`,
          scheduledDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      break;
      
    case 'weekly':
      // Distribute tasks weekly
      let weekIndex = 0;
      tasks.forEach((task, index) => {
        const weeksAvailable = Math.ceil(filteredDates.length / 7);
        const dateIndex = (weekIndex * 7) % filteredDates.length;
        const scheduledDate = formatDateString(filteredDates[dateIndex]);
        
        plannedTasks.push({
          ...task,
          id: `bulk-${Date.now()}-${index}`,
          scheduledDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        weekIndex = (weekIndex + 1) % weeksAvailable;
      });
      break;
      
    case 'custom':
      // Custom distribution - spread evenly
      tasks.forEach((task, index) => {
        const dateIndex = Math.floor((index / tasks.length) * filteredDates.length);
        const scheduledDate = formatDateString(filteredDates[dateIndex]);
        
        plannedTasks.push({
          ...task,
          id: `bulk-${Date.now()}-${index}`,
          scheduledDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      break;
  }
  
  return plannedTasks;
};

/**
 * Validate planning conflicts
 */
export const validatePlanningConflicts = (
  plannedTasks: Task[],
  existingTasks: Task[]
): { date: string; reason: string; severity: 'low' | 'medium' | 'high' }[] => {
  const conflicts: { date: string; reason: string; severity: 'low' | 'medium' | 'high' }[] = [];
  const allTasks = [...existingTasks, ...plannedTasks];
  
  // Group tasks by date
  const tasksByDate = new Map<string, Task[]>();
  allTasks.forEach(task => {
    const date = task.scheduledDate;
    if (!tasksByDate.has(date)) {
      tasksByDate.set(date, []);
    }
    tasksByDate.get(date)!.push(task);
  });
  
  // Check each date for conflicts
  tasksByDate.forEach((dayTasks, date) => {
    const totalMinutes = dayTasks.reduce((sum, task) => sum + (task.duration || 30), 0);
    const taskCount = dayTasks.length;
    
    // Check for overloading
    if (totalMinutes > 480) { // More than 8 hours
      conflicts.push({
        date,
        reason: `Overloaded day: ${Math.round(totalMinutes / 60)} hours of tasks`,
        severity: 'high'
      });
    } else if (totalMinutes > 360) { // More than 6 hours
      conflicts.push({
        date,
        reason: `Heavy workload: ${Math.round(totalMinutes / 60)} hours of tasks`,
        severity: 'medium'
      });
    }
    
    // Check for too many tasks
    if (taskCount > 8) {
      conflicts.push({
        date,
        reason: `Too many tasks: ${taskCount} tasks scheduled`,
        severity: 'high'
      });
    } else if (taskCount > 6) {
      conflicts.push({
        date,
        reason: `Many tasks: ${taskCount} tasks scheduled`,
        severity: 'medium'
      });
    }
    
    // Check for time conflicts
    const scheduledTasks = dayTasks.filter(task => task.scheduledTime);
    for (let i = 0; i < scheduledTasks.length - 1; i++) {
      for (let j = i + 1; j < scheduledTasks.length; j++) {
        const task1 = scheduledTasks[i];
        const task2 = scheduledTasks[j];
        
        if (hasTimeConflict(task1, task2)) {
          conflicts.push({
            date,
            reason: `Time conflict between "${task1.title}" and "${task2.title}"`,
            severity: 'high'
          });
        }
      }
    }
  });
  
  return conflicts;
};

/**
 * Check if two tasks have time conflicts
 */
const hasTimeConflict = (task1: Task, task2: Task): boolean => {
  if (!task1.scheduledTime || !task2.scheduledTime) return false;
  
  const start1 = timeToMinutes(task1.scheduledTime);
  const end1 = start1 + (task1.duration || 30);
  const start2 = timeToMinutes(task2.scheduledTime);
  const end2 = start2 + (task2.duration || 30);
  
  return (start1 < end2 && start2 < end1);
};

/**
 * Convert time string to minutes since midnight
 */
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};