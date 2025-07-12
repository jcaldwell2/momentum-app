import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecurrencePattern } from '../../types';
import { recurringTaskService } from '../../services/recurring';

interface RecurrencePreviewProps {
  pattern: RecurrencePattern;
  startDate?: Date;
  previewCount?: number;
}

export function RecurrencePreview({ 
  pattern, 
  startDate = new Date(), 
  previewCount = 5 
}: RecurrencePreviewProps) {
  const upcomingDates = recurringTaskService.generatePreview(
    pattern, 
    startDate, 
    previewCount
  );

  const formatPreviewDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today or tomorrow
    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    }

    // Format as day of week and date
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRelativeDays = (dateStr: string): number => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (upcomingDates.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="calendar-outline" size={16} color="#6b7280" />
          <Text style={styles.title}>Upcoming Occurrences</Text>
        </View>
        <Text style={styles.noPreview}>No upcoming occurrences found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={16} color="#667eea" />
        <Text style={styles.title}>Next {upcomingDates.length} Occurrences</Text>
      </View>
      
      <ScrollView 
        style={styles.previewList}
        showsVerticalScrollIndicator={false}
      >
        {upcomingDates.map((dateStr, index) => {
          const relativeDays = getRelativeDays(dateStr);
          
          return (
            <View key={dateStr} style={styles.previewItem}>
              <View style={styles.previewDot}>
                <View style={[
                  styles.dot,
                  index === 0 && styles.dotFirst,
                  relativeDays === 0 && styles.dotToday
                ]} />
              </View>
              
              <View style={styles.previewContent}>
                <Text style={[
                  styles.previewDate,
                  relativeDays === 0 && styles.previewDateToday
                ]}>
                  {formatPreviewDate(dateStr)}
                </Text>
                
                {relativeDays > 0 && (
                  <Text style={styles.previewRelative}>
                    in {relativeDays} day{relativeDays !== 1 ? 's' : ''}
                  </Text>
                )}
                
                {relativeDays === 0 && (
                  <Text style={styles.previewToday}>Today</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      <Text style={styles.previewNote}>
        This task will repeat according to your selected pattern
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  previewList: {
    maxHeight: 200,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewDot: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  dotFirst: {
    backgroundColor: '#667eea',
  },
  dotToday: {
    backgroundColor: '#10b981',
  },
  previewContent: {
    flex: 1,
  },
  previewDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  previewDateToday: {
    color: '#10b981',
    fontWeight: '600',
  },
  previewRelative: {
    fontSize: 12,
    color: '#6b7280',
  },
  previewToday: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  previewNote: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  noPreview: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});