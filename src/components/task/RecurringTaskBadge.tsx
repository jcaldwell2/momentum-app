import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecurrencePattern, RecurrenceFrequency } from '../../types';

interface RecurringTaskBadgeProps {
  pattern: RecurrencePattern;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

export function RecurringTaskBadge({ 
  pattern, 
  size = 'small', 
  showIcon = true 
}: RecurringTaskBadgeProps) {
  const getRecurrenceText = (pattern: RecurrencePattern): string => {
    switch (pattern.type) {
      case RecurrenceFrequency.DAILY:
        if (pattern.interval === 1) {
          return 'Daily';
        }
        return `Every ${pattern.interval}d`;
      
      case RecurrenceFrequency.WEEKLY:
        if (pattern.interval === 1) {
          const dayCount = pattern.weeklyOptions?.daysOfWeek?.length || 0;
          if (dayCount === 7) {
            return 'Daily';
          } else if (dayCount === 5 && 
                     pattern.weeklyOptions?.daysOfWeek?.every(d => d >= 1 && d <= 5)) {
            return 'Weekdays';
          } else if (dayCount === 2 && 
                     pattern.weeklyOptions?.daysOfWeek?.includes(0) && 
                     pattern.weeklyOptions?.daysOfWeek?.includes(6)) {
            return 'Weekends';
          } else if (dayCount === 1) {
            return 'Weekly';
          } else {
            return `${dayCount}x/week`;
          }
        }
        return `Every ${pattern.interval}w`;
      
      case RecurrenceFrequency.MONTHLY:
        if (pattern.interval === 1) {
          return 'Monthly';
        }
        return `Every ${pattern.interval}m`;
      
      default:
        return 'Recurring';
    }
  };

  const getRecurrenceColor = (pattern: RecurrencePattern): string => {
    switch (pattern.type) {
      case RecurrenceFrequency.DAILY:
        return '#10b981'; // Green
      case RecurrenceFrequency.WEEKLY:
        return '#3b82f6'; // Blue
      case RecurrenceFrequency.MONTHLY:
        return '#8b5cf6'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  };

  const recurrenceText = getRecurrenceText(pattern);
  const recurrenceColor = getRecurrenceColor(pattern);
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.badge,
      isSmall ? styles.badgeSmall : styles.badgeMedium,
      { borderColor: recurrenceColor }
    ]}>
      {showIcon && (
        <Ionicons 
          name="repeat" 
          size={isSmall ? 10 : 12} 
          color={recurrenceColor} 
        />
      )}
      <Text style={[
        styles.text,
        isSmall ? styles.textSmall : styles.textMedium,
        { color: recurrenceColor }
      ]}>
        {recurrenceText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  badgeMedium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 9,
  },
  textMedium: {
    fontSize: 11,
  },
});