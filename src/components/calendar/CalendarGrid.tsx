import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CalendarGridData } from '../../types';
import { CalendarCell } from './CalendarCell';

interface CalendarGridProps {
  gridData: CalendarGridData;
  onDatePress: (date: string) => void;
  size?: 'small' | 'medium' | 'large';
}

export function CalendarGrid({ gridData, onDatePress, size = 'medium' }: CalendarGridProps) {
  return (
    <View style={styles.container}>
      {gridData.weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map((cellData, dayIndex) => (
            <CalendarCell
              key={`${weekIndex}-${dayIndex}`}
              cellData={cellData}
              onPress={onDatePress}
              size={size}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
});