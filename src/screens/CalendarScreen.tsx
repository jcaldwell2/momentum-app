import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import { CalendarHeader, CalendarGrid, CalendarLegend, PlanningIntegration } from '../components/calendar';
import { generateCalendarGrid, getTasksForDateRange, getCalendarStart, getCalendarEnd, getPreviousMonth, getNextMonth } from '../utils/calendar';

export function CalendarScreen({ navigation }: any) {
  const { state, loadTasks } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [showPlanning, setShowPlanning] = useState(false);

  // Load tasks for the current month when screen focuses or date changes
  useFocusEffect(
    React.useCallback(() => {
      loadTasksForMonth(currentDate);
    }, [currentDate])
  );

  const loadTasksForMonth = async (date: Date) => {
    try {
      // Load tasks for the entire calendar view (including adjacent month days)
      const calendarStart = getCalendarStart(date);
      const calendarEnd = getCalendarEnd(date);
      
      // Load tasks for the date range
      await loadTasks(); // Load all tasks for now, can optimize later with date range
    } catch (error) {
      console.error('Failed to load tasks for month:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasksForMonth(currentDate);
    setRefreshing(false);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(getPreviousMonth(currentDate));
  };

  const handleNextMonth = () => {
    setCurrentDate(getNextMonth(currentDate));
  };

  const handleDatePress = (dateString: string) => {
    const selectedDateObj = new Date(dateString);
    setSelectedDate(selectedDateObj);
    
    // Navigate to daily view (HomeScreen) with the selected date
    navigation.navigate('Home', { selectedDate: dateString });
  };

  const handleTaskCreated = async () => {
    // Refresh tasks after creating new ones
    await loadTasksForMonth(currentDate);
  };

  const togglePlanning = () => {
    setShowPlanning(!showPlanning);
  };

  // Generate calendar grid data
  const calendarGridData = generateCalendarGrid(currentDate, state.tasks, selectedDate);

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Loading state can be enhanced with a proper loading component */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Planning Integration */}
        {showPlanning && (
          <PlanningIntegration
            selectedDate={selectedDate}
            onTaskCreated={handleTaskCreated}
          />
        )}

        {/* Calendar Header with Month Navigation */}
        <CalendarHeader
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          showDayNames={true}
        />

        {/* Calendar Grid */}
        <CalendarGrid
          gridData={calendarGridData}
          onDatePress={handleDatePress}
          size="medium"
        />

        {/* Calendar Legend */}
        <CalendarLegend />
      </ScrollView>

      {/* Floating Action Button for Planning */}
      <TouchableOpacity
        style={styles.planningFab}
        onPress={togglePlanning}
      >
        <Ionicons
          name={showPlanning ? "close" : "add"}
          size={24}
          color="#ffffff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  planningFab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
});