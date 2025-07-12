import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CalendarCellData } from '../../types';

interface TaskIndicatorProps {
  cellData: CalendarCellData;
  size?: 'small' | 'medium' | 'large';
}

export function TaskIndicator({ cellData, size = 'medium' }: TaskIndicatorProps) {
  const { taskCount, completedTaskCount, hasHighPriorityTasks, hasOverdueTasks, workloadLevel } = cellData;

  if (taskCount === 0) {
    return null;
  }

  const getWorkloadColor = () => {
    if (hasOverdueTasks) return '#ef4444'; // Red for overdue
    if (hasHighPriorityTasks) return '#f59e0b'; // Orange for high priority
    
    switch (workloadLevel) {
      case 'light': return '#10b981'; // Green
      case 'moderate': return '#3b82f6'; // Blue
      case 'heavy': return '#8b5cf6'; // Purple
      default: return '#6b7280'; // Gray
    }
  };

  const getIndicatorSize = () => {
    switch (size) {
      case 'small': return styles.indicatorSmall;
      case 'large': return styles.indicatorLarge;
      default: return styles.indicatorMedium;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return styles.textSmall;
      case 'large': return styles.textLarge;
      default: return styles.textMedium;
    }
  };

  const isAllCompleted = completedTaskCount === taskCount;
  const backgroundColor = isAllCompleted ? '#10b981' : getWorkloadColor();

  return (
    <View style={styles.container}>
      {/* Main task count indicator */}
      <View style={[
        styles.indicator,
        getIndicatorSize(),
        { backgroundColor }
      ]}>
        <Text style={[styles.indicatorText, getTextSize()]}>
          {taskCount}
        </Text>
      </View>

      {/* Progress dots for partially completed */}
      {taskCount > 1 && completedTaskCount > 0 && !isAllCompleted && (
        <View style={styles.progressDots}>
          {Array.from({ length: Math.min(taskCount, 4) }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index < completedTaskCount ? '#10b981' : '#d1d5db'
                }
              ]}
            />
          ))}
        </View>
      )}

      {/* Priority/status indicators */}
      <View style={styles.statusIndicators}>
        {hasOverdueTasks && (
          <View style={[styles.statusDot, { backgroundColor: '#ef4444' }]} />
        )}
        {hasHighPriorityTasks && !hasOverdueTasks && (
          <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 20,
  },
  indicator: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
  },
  indicatorSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    minWidth: 16,
  },
  indicatorMedium: {
    width: 20,
    height: 20,
    borderRadius: 10,
    minWidth: 20,
  },
  indicatorLarge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    minWidth: 24,
  },
  indicatorText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 14,
  },
  progressDots: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 1,
  },
  progressDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  statusIndicators: {
    flexDirection: 'row',
    marginTop: 1,
    gap: 2,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});