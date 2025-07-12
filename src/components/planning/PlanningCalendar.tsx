import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, CalendarCellData } from '../../types';
import {
  generateCalendarGrid,
  getNextMonth,
  getPreviousMonth,
  getMonthYearString,
  getDayNames
} from '../../utils/calendar';

interface PlanningCalendarProps {
  tasks: Task[];
  selectedDates: string[];
  onDateSelect: (date: string) => void;
  onDateRangeSelect?: (startDate: string, endDate: string) => void;
  multiSelect?: boolean;
  rangeSelect?: boolean;
  minDate?: Date;
  maxDate?: Date;
  highlightedDates?: string[];
  workloadIndicator?: boolean;
}

export const PlanningCalendar: React.FC<PlanningCalendarProps> = ({
  tasks,
  selectedDates,
  onDateSelect,
  onDateRangeSelect,
  multiSelect = false,
  rangeSelect = false,
  minDate,
  maxDate,
  highlightedDates = [],
  workloadIndicator = true
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<string | null>(null);

  const calendarData = generateCalendarGrid(currentDate, tasks);
  const dayNames = getDayNames(true);

  const handleDatePress = (cellData: CalendarCellData) => {
    const date = cellData.date;
    
    // Check date constraints
    if (minDate && new Date(date) < minDate) return;
    if (maxDate && new Date(date) > maxDate) return;

    if (rangeSelect) {
      if (!rangeStart) {
        setRangeStart(date);
        onDateSelect(date);
      } else {
        const start = new Date(rangeStart);
        const end = new Date(date);
        
        if (start <= end) {
          onDateRangeSelect?.(rangeStart, date);
        } else {
          onDateRangeSelect?.(date, rangeStart);
        }
        setRangeStart(null);
      }
    } else {
      onDateSelect(date);
    }
  };

  const isDateSelected = (date: string): boolean => {
    return selectedDates.includes(date);
  };

  const isDateInRange = (date: string): boolean => {
    if (!rangeSelect || !rangeStart || selectedDates.length < 2) return false;
    
    const dateObj = new Date(date);
    const startDate = new Date(Math.min(...selectedDates.map(d => new Date(d).getTime())));
    const endDate = new Date(Math.max(...selectedDates.map(d => new Date(d).getTime())));
    
    return dateObj >= startDate && dateObj <= endDate;
  };

  const isDateHighlighted = (date: string): boolean => {
    return highlightedDates.includes(date);
  };

  const getWorkloadColor = (workloadLevel: 'light' | 'moderate' | 'heavy'): string => {
    switch (workloadLevel) {
      case 'light': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'heavy': return '#ef4444';
      default: return '#e5e7eb';
    }
  };

  const renderCalendarCell = (cellData: CalendarCellData) => {
    const isSelected = isDateSelected(cellData.date);
    const isInRange = isDateInRange(cellData.date);
    const isHighlighted = isDateHighlighted(cellData.date);
    const isDisabled = 
      (minDate && new Date(cellData.date) < minDate) ||
      (maxDate && new Date(cellData.date) > maxDate);

    return (
      <TouchableOpacity
        key={cellData.date}
        style={[
          styles.calendarCell,
          !cellData.isCurrentMonth && styles.otherMonthCell,
          cellData.isToday && styles.todayCell,
          isSelected && styles.selectedCell,
          isInRange && styles.rangeCell,
          isHighlighted && styles.highlightedCell,
          isDisabled && styles.disabledCell
        ]}
        onPress={() => !isDisabled && handleDatePress(cellData)}
        disabled={isDisabled}
      >
        <Text
          style={[
            styles.cellText,
            !cellData.isCurrentMonth && styles.otherMonthText,
            cellData.isToday && styles.todayText,
            isSelected && styles.selectedText,
            isDisabled && styles.disabledText
          ]}
        >
          {new Date(cellData.date).getDate()}
        </Text>
        
        {workloadIndicator && cellData.taskCount > 0 && (
          <View style={styles.workloadIndicators}>
            <View
              style={[
                styles.workloadDot,
                { backgroundColor: getWorkloadColor(cellData.workloadLevel) }
              ]}
            />
            {cellData.taskCount > 1 && (
              <Text style={styles.taskCountText}>
                {cellData.taskCount > 9 ? '9+' : cellData.taskCount}
              </Text>
            )}
          </View>
        )}

        {cellData.hasHighPriorityTasks && (
          <View style={styles.priorityIndicator}>
            <Ionicons name="alert-circle" size={8} color="#ef4444" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentDate(getPreviousMonth(currentDate))}
        >
          <Ionicons name="chevron-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.monthYear}>
          {getMonthYearString(currentDate)}
        </Text>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentDate(getNextMonth(currentDate))}
        >
          <Ionicons name="chevron-forward" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Day Names Header */}
      <View style={styles.dayNamesRow}>
        {dayNames.map(dayName => (
          <View key={dayName} style={styles.dayNameCell}>
            <Text style={styles.dayNameText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarContainer}>
        {calendarData.weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map(cellData => renderCalendarCell(cellData))}
          </View>
        ))}
      </ScrollView>

      {/* Selection Info */}
      {selectedDates.length > 0 && (
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {rangeSelect && selectedDates.length === 2
              ? `Selected: ${selectedDates[0]} to ${selectedDates[1]}`
              : `Selected: ${selectedDates.length} date${selectedDates.length > 1 ? 's' : ''}`
            }
          </Text>
        </View>
      )}

      {/* Legend */}
      {workloadIndicator && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Light</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Moderate</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Heavy</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');
const cellSize = (width - 40) / 7; // 7 days per week, 20px padding on each side

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    width: cellSize,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  calendarContainer: {
    maxHeight: 300,
  },
  weekRow: {
    flexDirection: 'row',
  },
  calendarCell: {
    width: cellSize,
    height: cellSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 1,
    position: 'relative',
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  todayCell: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  selectedCell: {
    backgroundColor: '#667eea',
  },
  rangeCell: {
    backgroundColor: '#e0e7ff',
  },
  highlightedCell: {
    backgroundColor: '#fef3c7',
  },
  disabledCell: {
    opacity: 0.3,
  },
  cellText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  otherMonthText: {
    color: '#9ca3af',
  },
  todayText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledText: {
    color: '#d1d5db',
  },
  workloadIndicators: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workloadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  taskCountText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 2,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  selectionInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  selectionText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280',
  },
});