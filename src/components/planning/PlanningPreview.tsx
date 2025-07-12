import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanningPreview as PlanningPreviewType, Task } from '../../types';
import { WorkloadIndicator } from './WorkloadIndicator';

interface PlanningPreviewProps {
  preview: PlanningPreviewType;
  onApprove: () => void;
  onReject: () => void;
  onModify?: () => void;
  showActions?: boolean;
}

export const PlanningPreview: React.FC<PlanningPreviewProps> = ({
  preview,
  onApprove,
  onReject,
  onModify,
  showActions = true
}) => {
  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'low': return '#f59e0b';
      case 'medium': return '#ef4444';
      case 'high': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high'): keyof typeof Ionicons.glyphMap => {
    switch (severity) {
      case 'low': return 'information-circle-outline';
      case 'medium': return 'warning-outline';
      case 'high': return 'alert-circle-outline';
      default: return 'help-outline';
    }
  };

  const getSuggestionIcon = (type: 'reschedule' | 'reduce' | 'distribute'): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'reschedule': return 'calendar-outline';
      case 'reduce': return 'remove-circle-outline';
      case 'distribute': return 'shuffle-outline';
      default: return 'bulb-outline';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const groupTasksByDate = (tasks: Task[]): { [date: string]: Task[] } => {
    return tasks.reduce((groups, task) => {
      const date = task.scheduledDate;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
      return groups;
    }, {} as { [date: string]: Task[] });
  };

  const tasksByDate = groupTasksByDate(preview.plannedTasks);
  const sortedDates = Object.keys(tasksByDate).sort();

  const hasHighSeverityConflicts = preview.conflicts.some(c => c.severity === 'high');
  const hasMediumSeverityConflicts = preview.conflicts.some(c => c.severity === 'medium');

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Planning Preview</Text>
        <Text style={styles.subtitle}>
          {formatDate(preview.dateRange.startDate)} - {formatDate(preview.dateRange.endDate)}
        </Text>
        <Text style={styles.taskCount}>
          {preview.plannedTasks.length} tasks planned
        </Text>
      </View>

      {/* Status Overview */}
      <View style={styles.statusSection}>
        <View style={styles.statusGrid}>
          <View style={[styles.statusCard, { borderLeftColor: '#10b981' }]}>
            <Text style={styles.statusNumber}>{preview.plannedTasks.length}</Text>
            <Text style={styles.statusLabel}>Tasks</Text>
          </View>
          <View style={[styles.statusCard, { borderLeftColor: preview.conflicts.length > 0 ? '#ef4444' : '#10b981' }]}>
            <Text style={styles.statusNumber}>{preview.conflicts.length}</Text>
            <Text style={styles.statusLabel}>Conflicts</Text>
          </View>
          <View style={[styles.statusCard, { borderLeftColor: '#3b82f6' }]}>
            <Text style={styles.statusNumber}>{preview.suggestions.length}</Text>
            <Text style={styles.statusLabel}>Suggestions</Text>
          </View>
        </View>

        {/* Overall Status */}
        <View style={[
          styles.overallStatus,
          hasHighSeverityConflicts ? styles.criticalStatus :
          hasMediumSeverityConflicts ? styles.warningStatus : styles.goodStatus
        ]}>
          <Ionicons 
            name={
              hasHighSeverityConflicts ? 'close-circle' :
              hasMediumSeverityConflicts ? 'warning' : 'checkmark-circle'
            } 
            size={20} 
            color="#ffffff" 
          />
          <Text style={styles.overallStatusText}>
            {hasHighSeverityConflicts ? 'Critical Issues' :
             hasMediumSeverityConflicts ? 'Needs Attention' : 'Ready to Apply'}
          </Text>
        </View>
      </View>

      {/* Workload Analysis */}
      <View style={styles.section}>
        <WorkloadIndicator 
          workloadAnalysis={preview.workloadAnalysis} 
          showDetails={false}
          compact={true}
        />
      </View>

      {/* Conflicts */}
      {preview.conflicts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="warning-outline" size={16} color="#ef4444" /> Conflicts
          </Text>
          {preview.conflicts.map((conflict, index) => (
            <View key={index} style={styles.conflictItem}>
              <View style={styles.conflictHeader}>
                <Ionicons 
                  name={getSeverityIcon(conflict.severity)} 
                  size={16} 
                  color={getSeverityColor(conflict.severity)} 
                />
                <Text style={styles.conflictDate}>{formatDate(conflict.date)}</Text>
                <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(conflict.severity) }]}>
                  <Text style={styles.severityText}>{conflict.severity}</Text>
                </View>
              </View>
              <Text style={styles.conflictReason}>{conflict.reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Suggestions */}
      {preview.suggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="bulb-outline" size={16} color="#f59e0b" /> Suggestions
          </Text>
          {preview.suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <View style={styles.suggestionHeader}>
                <Ionicons 
                  name={getSuggestionIcon(suggestion.type)} 
                  size={16} 
                  color="#f59e0b" 
                />
                <Text style={styles.suggestionType}>{suggestion.type}</Text>
              </View>
              <Text style={styles.suggestionMessage}>{suggestion.message}</Text>
              {suggestion.affectedDates.length > 0 && (
                <Text style={styles.affectedDates}>
                  Affects: {suggestion.affectedDates.map(formatDate).join(', ')}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Planned Tasks by Date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar-outline" size={16} color="#3b82f6" /> Planned Schedule
        </Text>
        {sortedDates.map(date => (
          <View key={date} style={styles.dateGroup}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateTitle}>{formatDate(date)}</Text>
              <Text style={styles.dateTaskCount}>
                {tasksByDate[date].length} task{tasksByDate[date].length !== 1 ? 's' : ''}
              </Text>
            </View>
            {tasksByDate[date].map((task, index) => (
              <View key={index} style={styles.taskItem}>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <Text style={styles.taskCategory}>{task.category}</Text>
                    <Text style={styles.taskPriority}>{task.priority}</Text>
                    {task.scheduledTime && (
                      <Text style={styles.taskTime}>{task.scheduledTime}</Text>
                    )}
                    {task.duration && (
                      <Text style={styles.taskDuration}>{task.duration}m</Text>
                    )}
                  </View>
                </View>
                <View style={styles.taskXP}>
                  <Text style={styles.xpText}>{task.xpReward} XP</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
            <Ionicons name="close" size={20} color="#ef4444" />
            <Text style={styles.rejectButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          {onModify && (
            <TouchableOpacity style={styles.modifyButton} onPress={onModify}>
              <Ionicons name="create-outline" size={20} color="#f59e0b" />
              <Text style={styles.modifyButtonText}>Modify</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.approveButton,
              hasHighSeverityConflicts && styles.disabledButton
            ]} 
            onPress={onApprove}
            disabled={hasHighSeverityConflicts}
          >
            <Ionicons name="checkmark" size={20} color="#ffffff" />
            <Text style={styles.approveButtonText}>
              {hasHighSeverityConflicts ? 'Fix Issues First' : 'Apply Plan'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  taskCount: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  statusNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  overallStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  goodStatus: {
    backgroundColor: '#10b981',
  },
  warningStatus: {
    backgroundColor: '#f59e0b',
  },
  criticalStatus: {
    backgroundColor: '#ef4444',
  },
  overallStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conflictItem: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  conflictDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  conflictReason: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  suggestionItem: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  suggestionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textTransform: 'capitalize',
  },
  suggestionMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  affectedDates: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  dateTaskCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 10,
    marginBottom: 6,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  taskCategory: {
    fontSize: 10,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  taskPriority: {
    fontSize: 10,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  taskTime: {
    fontSize: 10,
    color: '#6b7280',
  },
  taskDuration: {
    fontSize: 10,
    color: '#6b7280',
  },
  taskXP: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 6,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  modifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 6,
  },
  modifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  approveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    gap: 6,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});