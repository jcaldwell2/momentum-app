import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function CalendarLegend() {
  const legendItems = [
    { color: '#10b981', label: 'Light workload', description: '1-2 tasks' },
    { color: '#3b82f6', label: 'Moderate workload', description: '3-4 tasks' },
    { color: '#8b5cf6', label: 'Heavy workload', description: '5+ tasks' },
    { color: '#f59e0b', label: 'High priority', description: 'Contains urgent/high priority tasks' },
    { color: '#ef4444', label: 'Overdue', description: 'Contains overdue tasks' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task Indicators</Text>
      <View style={styles.legendGrid}>
        {legendItems.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.additionalInfo}>
        <Text style={styles.infoText}>
          • Numbers show total tasks for the day
        </Text>
        <Text style={styles.infoText}>
          • Dots below indicate completion progress
        </Text>
        <Text style={styles.infoText}>
          • Tap any date to view daily tasks
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  legendGrid: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  additionalInfo: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
});