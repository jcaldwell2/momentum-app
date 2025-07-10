import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Task, TaskPriority, TaskCategory } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onComplete?: () => void;
  onEdit?: () => void;
}

export function TaskCard({ task, onPress, onComplete, onEdit }: TaskCardProps) {
  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete?.();
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'work': return 'briefcase';
      case 'personal': return 'person';
      case 'health': return 'fitness';
      case 'learning': return 'book';
      case 'social': return 'people';
      case 'creative': return 'brush';
      case 'maintenance': return 'construct';
      default: return 'ellipse';
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && new Date() > new Date(`${task.scheduledDate}T${task.scheduledTime || '23:59'}`);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={isCompleted ? [styles.card, styles.completedCard] : styles.card}>
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity
              onPress={handleComplete}
              style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
              disabled={isCompleted}
            >
              {isCompleted && (
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              )}
            </TouchableOpacity>
            
            <View style={styles.taskInfo}>
              <Text style={[styles.title, isCompleted && styles.completedText]}>
                {task.title}
              </Text>
              {task.description && (
                <Text style={[styles.description, isCompleted && styles.completedText]}>
                  {task.description}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.badges}>
            <Badge variant={getPriorityColor(task.priority)} size="small">
              {task.priority.toUpperCase()}
            </Badge>
            
            <View style={styles.categoryBadge}>
              <Ionicons 
                name={getCategoryIcon(task.category) as any} 
                size={12} 
                color="#6b7280" 
              />
              <Text style={styles.categoryText}>
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.timeInfo}>
            {task.scheduledTime && (
              <Text style={[styles.time, isOverdue && styles.overdueTime]}>
                {formatTime(task.scheduledTime)}
              </Text>
            )}
            {task.duration && (
              <Text style={styles.duration}>
                {task.duration}min
              </Text>
            )}
            <View style={styles.xpBadge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
              <Text style={styles.xpText}>{task.xpReward}</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  editButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6b7280',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  overdueTime: {
    color: '#ef4444',
  },
  duration: {
    fontSize: 12,
    color: '#6b7280',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
});