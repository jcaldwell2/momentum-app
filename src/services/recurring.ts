import { 
  RecurringTaskTemplate, 
  RecurringTaskInstance, 
  RecurrenceException, 
  RecurrencePattern, 
  RecurrenceFrequency,
  Task,
  TaskStatus 
} from '../types';

export class RecurringTaskService {
  /**
   * Generate recurring task instances for a given date range
   */
  generateInstances(
    template: RecurringTaskTemplate,
    startDate: Date,
    endDate: Date,
    exceptions: RecurrenceException[] = []
  ): RecurringTaskInstance[] {
    const instances: RecurringTaskInstance[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    // Get exceptions for this template
    const templateExceptions = exceptions.filter(ex => ex.templateId === template.id);
    const skipDates = new Set(
      templateExceptions
        .filter(ex => ex.type === 'skip')
        .map(ex => ex.date)
    );

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Skip if there's an exception for this date
      if (skipDates.has(dateStr)) {
        this.incrementDate(current, template.recurrencePattern);
        continue;
      }

      // Check if this date matches the recurrence pattern
      if (this.shouldGenerateForDate(current, template.recurrencePattern)) {
        const instance = this.createInstance(template, dateStr);
        
        // Apply any modifications from exceptions
        const modifyException = templateExceptions.find(
          ex => ex.type === 'modify' && ex.date === dateStr
        );
        
        if (modifyException && modifyException.modifiedTask) {
          Object.assign(instance, modifyException.modifiedTask);
          instance.isModified = true;
        }
        
        instances.push(instance);
      }

      this.incrementDate(current, template.recurrencePattern);
    }

    return instances;
  }

  /**
   * Create a single recurring task instance from template
   */
  private createInstance(template: RecurringTaskTemplate, date: string): RecurringTaskInstance {
    const id = `recurring-${template.id}-${date}-${Date.now()}`;
    
    return {
      id,
      templateId: template.id,
      instanceDate: date,
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      status: 'pending' as TaskStatus,
      scheduledDate: date,
      scheduledTime: template.scheduledTime,
      duration: template.duration,
      isRecurring: true,
      recurrencePattern: template.recurrencePattern,
      xpReward: template.xpReward,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isModified: false
    };
  }

  /**
   * Check if an instance should be generated for a specific date
   */
  private shouldGenerateForDate(date: Date, pattern: RecurrencePattern): boolean {
    switch (pattern.type) {
      case RecurrenceFrequency.DAILY:
        return this.shouldGenerateDaily(date, pattern);
      
      case RecurrenceFrequency.WEEKLY:
        return this.shouldGenerateWeekly(date, pattern);
      
      case RecurrenceFrequency.MONTHLY:
        return this.shouldGenerateMonthly(date, pattern);
      
      default:
        return false;
    }
  }

  /**
   * Check if daily recurrence should generate for date
   */
  private shouldGenerateDaily(date: Date, pattern: RecurrencePattern): boolean {
    // For daily recurrence, generate every N days
    // This is a simplified implementation - in a real app you'd track the start date
    const dayOfYear = this.getDayOfYear(date);
    return dayOfYear % pattern.interval === 0;
  }

  /**
   * Check if weekly recurrence should generate for date
   */
  private shouldGenerateWeekly(date: Date, pattern: RecurrencePattern): boolean {
    if (!pattern.weeklyOptions?.daysOfWeek?.length) {
      return false;
    }
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return pattern.weeklyOptions.daysOfWeek.includes(dayOfWeek);
  }

  /**
   * Check if monthly recurrence should generate for date
   */
  private shouldGenerateMonthly(date: Date, pattern: RecurrencePattern): boolean {
    // For monthly recurrence, generate on the same day of month every N months
    // This is a simplified implementation
    const dayOfMonth = date.getDate();
    return dayOfMonth === 1; // Simplified: generate on 1st of every month
  }

  /**
   * Increment date based on recurrence pattern
   */
  private incrementDate(date: Date, pattern: RecurrencePattern): void {
    switch (pattern.type) {
      case RecurrenceFrequency.DAILY:
        date.setDate(date.getDate() + 1);
        break;
      
      case RecurrenceFrequency.WEEKLY:
        date.setDate(date.getDate() + 1);
        break;
      
      case RecurrenceFrequency.MONTHLY:
        date.setDate(date.getDate() + 1);
        break;
    }
  }

  /**
   * Get day of year (1-366)
   */
  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate upcoming instances preview for UI
   */
  generatePreview(
    pattern: RecurrencePattern,
    startDate: Date = new Date(),
    count: number = 5
  ): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    let generated = 0;

    while (generated < count) {
      if (this.shouldGenerateForDate(current, pattern)) {
        dates.push(current.toISOString().split('T')[0]);
        generated++;
      }
      
      this.incrementDate(current, pattern);
      
      // Prevent infinite loop
      if (dates.length === 0 && current.getTime() > startDate.getTime() + (365 * 24 * 60 * 60 * 1000)) {
        break;
      }
    }

    return dates;
  }

  /**
   * Check if a recurrence pattern has ended
   */
  hasRecurrenceEnded(pattern: RecurrencePattern, currentDate: Date): boolean {
    if (pattern.endDate) {
      return currentDate > new Date(pattern.endDate);
    }
    
    // Note: endAfterOccurrences would need tracking of generated instances
    // This is simplified for now
    return false;
  }

  /**
   * Create a recurring task template
   */
  createTemplate(
    title: string,
    description: string | undefined,
    category: any,
    priority: any,
    scheduledTime: string | undefined,
    duration: number | undefined,
    xpReward: number,
    recurrencePattern: RecurrencePattern
  ): RecurringTaskTemplate {
    const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    return {
      id,
      title,
      description,
      category,
      priority,
      scheduledTime,
      duration,
      xpReward,
      recurrencePattern,
      createdAt: now,
      updatedAt: now,
      isActive: true
    };
  }

  /**
   * Clean up old recurring task instances
   */
  cleanupOldInstances(instances: RecurringTaskInstance[], daysToKeep: number = 30): RecurringTaskInstance[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    return instances.filter(instance => {
      // Keep if it's after cutoff date or if it's completed (for history)
      return instance.scheduledDate >= cutoffStr || instance.status === 'completed';
    });
  }
}

export const recurringTaskService = new RecurringTaskService();