import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WeeklyRecurrenceOptions } from '../../types';

interface WeeklyDaySelectorProps {
  weeklyOptions: WeeklyRecurrenceOptions;
  onOptionsChange: (options: WeeklyRecurrenceOptions) => void;
}

export function WeeklyDaySelector({ weeklyOptions, onOptionsChange }: WeeklyDaySelectorProps) {
  const days = [
    { value: 0, label: 'Sun', fullName: 'Sunday' },
    { value: 1, label: 'Mon', fullName: 'Monday' },
    { value: 2, label: 'Tue', fullName: 'Tuesday' },
    { value: 3, label: 'Wed', fullName: 'Wednesday' },
    { value: 4, label: 'Thu', fullName: 'Thursday' },
    { value: 5, label: 'Fri', fullName: 'Friday' },
    { value: 6, label: 'Sat', fullName: 'Saturday' },
  ];

  const toggleDay = (dayValue: number) => {
    const currentDays = weeklyOptions.daysOfWeek || [];
    let newDays: number[];

    if (currentDays.includes(dayValue)) {
      // Remove the day
      newDays = currentDays.filter(day => day !== dayValue);
    } else {
      // Add the day and sort
      newDays = [...currentDays, dayValue].sort();
    }

    // Ensure at least one day is selected
    if (newDays.length === 0) {
      return;
    }

    onOptionsChange({
      ...weeklyOptions,
      daysOfWeek: newDays
    });
  };

  const selectPreset = (preset: 'weekdays' | 'weekends' | 'all') => {
    let newDays: number[];
    
    switch (preset) {
      case 'weekdays':
        newDays = [1, 2, 3, 4, 5]; // Mon-Fri
        break;
      case 'weekends':
        newDays = [0, 6]; // Sun, Sat
        break;
      case 'all':
        newDays = [0, 1, 2, 3, 4, 5, 6]; // All days
        break;
      default:
        return;
    }

    onOptionsChange({
      ...weeklyOptions,
      daysOfWeek: newDays
    });
  };

  const selectedDays = weeklyOptions.daysOfWeek || [];
  const selectedDayNames = selectedDays
    .map(dayValue => days.find(d => d.value === dayValue)?.fullName)
    .filter(Boolean)
    .join(', ');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Days of Week</Text>
      
      {/* Day Selection Grid */}
      <View style={styles.dayGrid}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.dayButton,
              selectedDays.includes(day.value) && styles.dayButtonSelected,
            ]}
            onPress={() => toggleDay(day.value)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDays.includes(day.value) && styles.dayTextSelected,
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Presets */}
      <View style={styles.presetSection}>
        <Text style={styles.presetTitle}>Quick Select:</Text>
        <View style={styles.presetButtons}>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => selectPreset('weekdays')}
          >
            <Text style={styles.presetButtonText}>Weekdays</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => selectPreset('weekends')}
          >
            <Text style={styles.presetButtonText}>Weekends</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => selectPreset('all')}
          >
            <Text style={styles.presetButtonText}>Every Day</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Days Summary */}
      {selectedDays.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Selected:</Text>
          <Text style={styles.summaryText}>{selectedDayNames}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dayGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    borderColor: '#667eea',
    backgroundColor: '#667eea',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  presetSection: {
    marginBottom: 16,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  presetButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  summary: {
    padding: 12,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338ca',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#4338ca',
    lineHeight: 20,
  },
});