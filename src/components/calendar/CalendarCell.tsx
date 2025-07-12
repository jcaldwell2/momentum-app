import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { CalendarCellData } from '../../types';
import { TaskIndicator } from './TaskIndicator';

interface CalendarCellProps {
  cellData: CalendarCellData;
  onPress: (date: string) => void;
  size?: 'small' | 'medium' | 'large';
}

export function CalendarCell({ cellData, onPress, size = 'medium' }: CalendarCellProps) {
  const { date, isCurrentMonth, isToday, isSelected } = cellData;
  const dayNumber = new Date(date).getDate();

  const getCellStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.cell];
    
    switch (size) {
      case 'small':
        baseStyles.push(styles.cellSmall);
        break;
      case 'large':
        baseStyles.push(styles.cellLarge);
        break;
      default:
        baseStyles.push(styles.cellMedium);
    }

    if (isSelected) {
      baseStyles.push(styles.selectedCell);
    } else if (isToday) {
      baseStyles.push(styles.todayCell);
    }

    return baseStyles;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyles: TextStyle[] = [styles.dayText];
    
    switch (size) {
      case 'small':
        baseStyles.push(styles.dayTextSmall);
        break;
      case 'large':
        baseStyles.push(styles.dayTextLarge);
        break;
      default:
        baseStyles.push(styles.dayTextMedium);
    }

    if (!isCurrentMonth) {
      baseStyles.push(styles.otherMonthText);
    } else if (isSelected) {
      baseStyles.push(styles.selectedText);
    } else if (isToday) {
      baseStyles.push(styles.todayText);
    }

    return baseStyles;
  };

  return (
    <TouchableOpacity
      style={getCellStyle()}
      onPress={() => onPress(date)}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>
        {dayNumber}
      </Text>
      
      {isCurrentMonth && (
        <TaskIndicator 
          cellData={cellData} 
          size={size === 'large' ? 'medium' : 'small'} 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    margin: 1,
  },
  cellSmall: {
    width: 40,
    height: 40,
  },
  cellMedium: {
    width: 48,
    height: 48,
  },
  cellLarge: {
    width: 56,
    height: 56,
  },
  selectedCell: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  todayCell: {
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  dayText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  dayTextSmall: {
    fontSize: 12,
  },
  dayTextMedium: {
    fontSize: 14,
  },
  dayTextLarge: {
    fontSize: 16,
  },
  otherMonthText: {
    color: '#d1d5db',
  },
  selectedText: {
    color: '#ffffff',
  },
  todayText: {
    color: '#667eea',
  },
});