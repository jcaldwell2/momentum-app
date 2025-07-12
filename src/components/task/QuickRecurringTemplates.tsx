import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecurrenceFrequency, RecurrencePattern, TaskCategory, TaskPriority } from '../../types';

interface QuickTemplate {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  pattern: RecurrencePattern;
  defaultTitle: string;
  defaultCategory: TaskCategory;
  defaultPriority: TaskPriority;
  defaultDuration: number;
  defaultTime?: string;
  xpReward: number;
}

interface QuickRecurringTemplatesProps {
  onTemplateSelect: (template: QuickTemplate) => void;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'work-hours',
    name: 'Work Hours',
    description: '9-5 weekdays, no end date',
    icon: 'briefcase',
    pattern: {
      type: RecurrenceFrequency.WEEKLY,
      interval: 1,
      weeklyOptions: { daysOfWeek: [1, 2, 3, 4, 5] }, // Mon-Fri
    },
    defaultTitle: 'Work',
    defaultCategory: 'work',
    defaultPriority: 'medium',
    defaultDuration: 480, // 8 hours
    defaultTime: '09:00',
    xpReward: 100,
  },
  {
    id: 'daily-habit',
    name: 'Daily Habit',
    description: 'Same time every day, no end date',
    icon: 'checkmark-circle',
    pattern: {
      type: RecurrenceFrequency.DAILY,
      interval: 1,
    },
    defaultTitle: 'Daily Habit',
    defaultCategory: 'personal',
    defaultPriority: 'medium',
    defaultDuration: 30,
    defaultTime: '08:00',
    xpReward: 25,
  },
  {
    id: 'workout',
    name: 'Workout',
    description: 'Mon/Wed/Fri, no end date',
    icon: 'fitness',
    pattern: {
      type: RecurrenceFrequency.WEEKLY,
      interval: 1,
      weeklyOptions: { daysOfWeek: [1, 3, 5] }, // Mon, Wed, Fri
    },
    defaultTitle: 'Workout',
    defaultCategory: 'health',
    defaultPriority: 'high',
    defaultDuration: 60,
    defaultTime: '07:00',
    xpReward: 50,
  },
  {
    id: 'weekly-meeting',
    name: 'Weekly Meeting',
    description: 'Same time every week, no end date',
    icon: 'people',
    pattern: {
      type: RecurrenceFrequency.WEEKLY,
      interval: 1,
      weeklyOptions: { daysOfWeek: [1] }, // Monday
    },
    defaultTitle: 'Weekly Meeting',
    defaultCategory: 'work',
    defaultPriority: 'medium',
    defaultDuration: 60,
    defaultTime: '10:00',
    xpReward: 30,
  },
  {
    id: 'learning-session',
    name: 'Learning Session',
    description: 'Daily learning, no end date',
    icon: 'book',
    pattern: {
      type: RecurrenceFrequency.DAILY,
      interval: 1,
    },
    defaultTitle: 'Learning Session',
    defaultCategory: 'learning',
    defaultPriority: 'medium',
    defaultDuration: 45,
    defaultTime: '19:00',
    xpReward: 40,
  },
  {
    id: 'weekend-project',
    name: 'Weekend Project',
    description: 'Saturdays and Sundays, no end date',
    icon: 'construct',
    pattern: {
      type: RecurrenceFrequency.WEEKLY,
      interval: 1,
      weeklyOptions: { daysOfWeek: [0, 6] }, // Sun, Sat
    },
    defaultTitle: 'Weekend Project',
    defaultCategory: 'creative',
    defaultPriority: 'low',
    defaultDuration: 120,
    defaultTime: '14:00',
    xpReward: 75,
  },
];

export function QuickRecurringTemplates({ onTemplateSelect }: QuickRecurringTemplatesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Recurring Tasks</Text>
      <Text style={styles.subtitle}>Create common recurring tasks with one tap</Text>
      
      <View style={styles.templatesGrid}>
        {QUICK_TEMPLATES.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.templateCard}
            onPress={() => onTemplateSelect(template)}
          >
            <View style={styles.templateIcon}>
              <Ionicons name={template.icon} size={24} color="#667eea" />
            </View>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});