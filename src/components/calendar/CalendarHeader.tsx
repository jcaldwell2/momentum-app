import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMonthYearString, getDayNames } from '../../utils/calendar';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  showDayNames?: boolean;
}

export function CalendarHeader({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth,
  showDayNames = true
}: CalendarHeaderProps) {
  const dayNames = getDayNames(true);

  return (
    <View style={styles.container}>
      {/* Month/Year Navigation */}
      <View style={styles.navigationRow}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={onPreviousMonth}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#667eea" />
        </TouchableOpacity>
        
        <Text style={styles.monthYearText}>
          {getMonthYearString(currentDate)}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={onNextMonth}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      {/* Day Names Row */}
      {showDayNames && (
        <View style={styles.dayNamesRow}>
          {dayNames.map((dayName, index) => (
            <View key={index} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{dayName}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
});