import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Task,
  TaskTemplate,
  WorkloadAnalysis,
  PlanningPeriod,
  BulkTaskCreation,
  PlanningPreview,
  SmartSchedulingSuggestion
} from '../types';
import {
  calculateWorkloadAnalysis,
  generateSmartSchedulingSuggestions,
  generateBulkTaskPlan,
  validatePlanningConflicts,
  getDatesInRange,
  applyTaskTemplate
} from '../utils/planning';
import { formatDateString } from '../utils/calendar';

class PlanningService {
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      console.log('📋 Planning service initializing...');
      this.initialized = true;
      await this.seedInitialTemplates();
      console.log('✅ Planning service initialization complete');
    } catch (error) {
      console.error('❌ Planning service initialization failed:', error);
      throw error;
    }
  }

  private async seedInitialTemplates(): Promise<void> {
    try {
      const existingTemplates = await AsyncStorage.getItem('taskTemplates');
      
      if (!existingTemplates) {
        console.log('🌱 Creating initial task templates...');
        
        const initialTemplates: TaskTemplate[] = [
          {
            id: 'template-1',
            name: 'Daily Standup',
            title: 'Daily Team Standup',
            description: 'Attend daily team standup meeting',
            category: 'work',
            priority: 'medium',
            scheduledTime: '09:00',
            duration: 15,
            xpReward: 10,
            tags: ['meeting', 'team', 'daily'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            usageCount: 0
          },
          {
            id: 'template-2',
            name: 'Morning Workout',
            title: 'Morning Exercise Session',
            description: 'Complete morning workout routine',
            category: 'health',
            priority: 'high',
            scheduledTime: '07:00',
            duration: 45,
            xpReward: 30,
            tags: ['exercise', 'health', 'morning'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            usageCount: 0
          },
          {
            id: 'template-3',
            name: 'Learning Session',
            title: 'Study/Learning Time',
            description: 'Dedicated time for learning new skills',
            category: 'learning',
            priority: 'medium',
            scheduledTime: '19:00',
            duration: 60,
            xpReward: 40,
            tags: ['study', 'learning', 'development'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            usageCount: 0
          },
          {
            id: 'template-4',
            name: 'Weekly Review',
            title: 'Weekly Planning & Review',
            description: 'Review past week and plan upcoming week',
            category: 'personal',
            priority: 'high',
            scheduledTime: '18:00',
            duration: 30,
            xpReward: 25,
            tags: ['planning', 'review', 'weekly'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            usageCount: 0
          },
          {
            id: 'template-5',
            name: 'Creative Time',
            title: 'Creative Project Work',
            description: 'Time for creative projects and hobbies',
            category: 'creative',
            priority: 'medium',
            duration: 90,
            xpReward: 35,
            tags: ['creative', 'project', 'hobby'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            usageCount: 0
          }
        ];

        await AsyncStorage.setItem('taskTemplates', JSON.stringify(initialTemplates));
        console.log('✅ Initial task templates created');
      }
    } catch (error) {
      console.error('❌ Error seeding initial templates:', error);
      throw error;
    }
  }

  // Task Template operations
  async getTaskTemplates(): Promise<TaskTemplate[]> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const templatesData = await AsyncStorage.getItem('taskTemplates');
    const templates: TaskTemplate[] = templatesData ? JSON.parse(templatesData) : [];
    
    return templates
      .filter(template => template.isActive)
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  async createTaskTemplate(
    template: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ): Promise<TaskTemplate> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const newTemplate: TaskTemplate = {
      ...template,
      id,
      createdAt: now,
      updatedAt: now,
      usageCount: 0
    };

    const existingTemplates = await this.getTaskTemplates();
    const updatedTemplates = [...existingTemplates, newTemplate];
    await AsyncStorage.setItem('taskTemplates', JSON.stringify(updatedTemplates));

    return newTemplate;
  }

  async updateTaskTemplate(
    id: string,
    updates: Partial<TaskTemplate>
  ): Promise<void> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const templates = await this.getTaskTemplates();
    const templateIndex = templates.findIndex(t => t.id === id);
    
    if (templateIndex === -1) {
      throw new Error('Task template not found');
    }

    templates[templateIndex] = {
      ...templates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await AsyncStorage.setItem('taskTemplates', JSON.stringify(templates));
  }

  async deleteTaskTemplate(id: string): Promise<void> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const templates = await this.getTaskTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    await AsyncStorage.setItem('taskTemplates', JSON.stringify(filteredTemplates));
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const templates = await this.getTaskTemplates();
    const template = templates.find(t => t.id === id);
    
    if (template) {
      await this.updateTaskTemplate(id, {
        usageCount: template.usageCount + 1
      });
    }
  }

  // Workload Analysis
  async analyzeWorkload(
    tasks: Task[],
    startDate: Date,
    period: PlanningPeriod
  ): Promise<WorkloadAnalysis> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const endDate = new Date(startDate);
    switch (period) {
      case PlanningPeriod.WEEK:
        endDate.setDate(endDate.getDate() + 6);
        break;
      case PlanningPeriod.MONTH:
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case PlanningPeriod.QUARTER:
        endDate.setMonth(endDate.getMonth() + 3);
        endDate.setDate(endDate.getDate() - 1);
        break;
    }

    const periodTasks = tasks.filter(task => {
      const taskDate = task.scheduledDate;
      const startStr = formatDateString(startDate);
      const endStr = formatDateString(endDate);
      return taskDate >= startStr && taskDate <= endStr;
    });

    return calculateWorkloadAnalysis(periodTasks, startDate, endDate, period);
  }

  // Smart Scheduling
  async getSmartSchedulingSuggestions(
    task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    existingTasks: Task[],
    dateRange: { startDate: Date; endDate: Date },
    userPreferences: {
      workingHours: { start: string; end: string };
      maxTasksPerDay?: number;
      maxMinutesPerDay?: number;
    }
  ): Promise<SmartSchedulingSuggestion[]> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    return generateSmartSchedulingSuggestions(
      task,
      existingTasks,
      dateRange,
      userPreferences
    );
  }

  // Bulk Task Creation
  async createBulkTasks(
    bulkCreation: BulkTaskCreation,
    existingTasks: Task[]
  ): Promise<Task[]> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const plannedTasks = generateBulkTaskPlan(bulkCreation, existingTasks);
    
    // If using a template, increment its usage count
    if (bulkCreation.templateId) {
      await this.incrementTemplateUsage(bulkCreation.templateId);
    }

    return plannedTasks;
  }

  // Planning Preview
  async generatePlanningPreview(
    plannedTasks: Task[],
    existingTasks: Task[],
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<PlanningPreview> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const allTasks = [...existingTasks, ...plannedTasks];
    const periodTasks = allTasks.filter(task => {
      const taskDate = task.scheduledDate;
      const startStr = formatDateString(dateRange.startDate);
      const endStr = formatDateString(dateRange.endDate);
      return taskDate >= startStr && taskDate <= endStr;
    });

    const workloadAnalysis = calculateWorkloadAnalysis(
      periodTasks,
      dateRange.startDate,
      dateRange.endDate,
      PlanningPeriod.MONTH // Default to month for preview
    );

    const conflicts = validatePlanningConflicts(plannedTasks, existingTasks);

    // Generate suggestions based on conflicts and workload
    const suggestions = this.generatePlanningPreviewSuggestions(
      workloadAnalysis,
      conflicts
    );

    return {
      dateRange: {
        startDate: formatDateString(dateRange.startDate),
        endDate: formatDateString(dateRange.endDate)
      },
      plannedTasks,
      workloadAnalysis,
      conflicts,
      suggestions
    };
  }

  private generatePlanningPreviewSuggestions(
    workloadAnalysis: WorkloadAnalysis,
    conflicts: { date: string; reason: string; severity: 'low' | 'medium' | 'high' }[]
  ): {
    type: 'reschedule' | 'reduce' | 'distribute';
    message: string;
    affectedDates: string[];
  }[] {
    const suggestions: {
      type: 'reschedule' | 'reduce' | 'distribute';
      message: string;
      affectedDates: string[];
    }[] = [];

    // Handle high-severity conflicts
    const highSeverityConflicts = conflicts.filter(c => c.severity === 'high');
    if (highSeverityConflicts.length > 0) {
      suggestions.push({
        type: 'reschedule',
        message: `${highSeverityConflicts.length} critical conflicts detected. Consider rescheduling tasks.`,
        affectedDates: highSeverityConflicts.map(c => c.date)
      });
    }

    // Handle overloaded workload
    if (workloadAnalysis.workloadLevel === 'overloaded') {
      suggestions.push({
        type: 'reduce',
        message: 'Workload is too high. Consider reducing or postponing some tasks.',
        affectedDates: workloadAnalysis.peakDays.map(d => d.date)
      });
    }

    // Handle uneven distribution
    const peakDayMinutes = workloadAnalysis.peakDays[0]?.totalMinutes || 0;
    const lightDayMinutes = workloadAnalysis.lightDays[0]?.totalMinutes || 0;
    
    if (peakDayMinutes > lightDayMinutes * 3 && workloadAnalysis.peakDays.length > 0) {
      suggestions.push({
        type: 'distribute',
        message: 'Uneven workload distribution. Consider moving tasks from peak days to lighter days.',
        affectedDates: [
          ...workloadAnalysis.peakDays.map(d => d.date),
          ...workloadAnalysis.lightDays.map(d => d.date)
        ]
      });
    }

    return suggestions;
  }

  // Template Application
  async applyTemplateToDateRange(
    templateId: string,
    startDate: Date,
    endDate: Date,
    skipWeekends: boolean = false
  ): Promise<Task[]> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const templates = await this.getTaskTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Task template not found');
    }

    const dates = getDatesInRange(startDate, endDate);
    const availableDates = skipWeekends 
      ? dates.filter(date => {
          const dayOfWeek = date.getDay();
          return dayOfWeek !== 0 && dayOfWeek !== 6;
        })
      : dates;

    const tasks: Task[] = availableDates.map((date, index) => {
      const taskData = applyTaskTemplate(template, formatDateString(date));
      return {
        ...taskData,
        id: `template-task-${templateId}-${Date.now()}-${index}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    // Increment template usage
    await this.incrementTemplateUsage(templateId);

    return tasks;
  }

  // Workload Balancing
  async balanceWorkload(
    tasks: Task[],
    dateRange: { startDate: Date; endDate: Date },
    maxTasksPerDay: number = 6,
    maxMinutesPerDay: number = 480
  ): Promise<Task[]> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const dates = getDatesInRange(dateRange.startDate, dateRange.endDate);
    const tasksByDate = new Map<string, Task[]>();
    
    // Group tasks by date
    tasks.forEach(task => {
      const date = task.scheduledDate;
      if (!tasksByDate.has(date)) {
        tasksByDate.set(date, []);
      }
      tasksByDate.get(date)!.push(task);
    });

    const balancedTasks: Task[] = [];
    const overflowTasks: Task[] = [];

    // Identify overloaded days and collect overflow tasks
    tasksByDate.forEach((dayTasks, date) => {
      const totalMinutes = dayTasks.reduce((sum, task) => sum + (task.duration || 30), 0);
      
      if (dayTasks.length > maxTasksPerDay || totalMinutes > maxMinutesPerDay) {
        // Sort by priority and keep highest priority tasks
        const sortedTasks = dayTasks.sort((a, b) => {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        let keptMinutes = 0;
        let keptCount = 0;
        
        for (const task of sortedTasks) {
          const taskMinutes = task.duration || 30;
          
          if (keptCount < maxTasksPerDay && keptMinutes + taskMinutes <= maxMinutesPerDay) {
            balancedTasks.push(task);
            keptMinutes += taskMinutes;
            keptCount++;
          } else {
            overflowTasks.push(task);
          }
        }
      } else {
        balancedTasks.push(...dayTasks);
      }
    });

    // Redistribute overflow tasks to lighter days
    const lightDates = dates.filter(date => {
      const dateStr = formatDateString(date);
      const dayTasks = balancedTasks.filter(task => task.scheduledDate === dateStr);
      const totalMinutes = dayTasks.reduce((sum, task) => sum + (task.duration || 30), 0);
      
      return dayTasks.length < maxTasksPerDay && totalMinutes < maxMinutesPerDay * 0.7;
    });

    overflowTasks.forEach(task => {
      // Find the best available date
      const bestDate = lightDates.find(date => {
        const dateStr = formatDateString(date);
        const dayTasks = balancedTasks.filter(t => t.scheduledDate === dateStr);
        const totalMinutes = dayTasks.reduce((sum, t) => sum + (t.duration || 30), 0);
        const taskMinutes = task.duration || 30;
        
        return dayTasks.length < maxTasksPerDay && 
               totalMinutes + taskMinutes <= maxMinutesPerDay;
      });

      if (bestDate) {
        balancedTasks.push({
          ...task,
          scheduledDate: formatDateString(bestDate),
          updatedAt: new Date().toISOString()
        });
      } else {
        // If no suitable date found, keep original date but mark as potential conflict
        balancedTasks.push(task);
      }
    });

    return balancedTasks;
  }

  // Get planning statistics
  async getPlanningStatistics(
    tasks: Task[],
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<{
    totalPlannedTasks: number;
    totalPlannedMinutes: number;
    averageTasksPerDay: number;
    mostUsedTemplates: { template: TaskTemplate; usageCount: number }[];
    categoryDistribution: { category: string; count: number; percentage: number }[];
  }> {
    if (!this.initialized) throw new Error('Planning service not initialized');

    const periodTasks = tasks.filter(task => {
      const taskDate = task.scheduledDate;
      const startStr = formatDateString(dateRange.startDate);
      const endStr = formatDateString(dateRange.endDate);
      return taskDate >= startStr && taskDate <= endStr;
    });

    const totalPlannedTasks = periodTasks.length;
    const totalPlannedMinutes = periodTasks.reduce((sum, task) => sum + (task.duration || 30), 0);
    const dayCount = getDatesInRange(dateRange.startDate, dateRange.endDate).length;
    const averageTasksPerDay = totalPlannedTasks / dayCount;

    // Get template usage statistics
    const templates = await this.getTaskTemplates();
    const mostUsedTemplates = templates
      .filter(template => template.usageCount > 0)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map(template => ({
        template,
        usageCount: template.usageCount
      }));

    // Calculate category distribution
    const categoryStats = new Map<string, number>();
    periodTasks.forEach(task => {
      const current = categoryStats.get(task.category) || 0;
      categoryStats.set(task.category, current + 1);
    });

    const categoryDistribution = Array.from(categoryStats.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: (count / totalPlannedTasks) * 100
    }));

    return {
      totalPlannedTasks,
      totalPlannedMinutes,
      averageTasksPerDay,
      mostUsedTemplates,
      categoryDistribution
    };
  }
}

export const planningService = new PlanningService();