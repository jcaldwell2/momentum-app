import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Task, TaskPriority, TaskCategory } from '../types';

interface TaskDetailScreenProps {
  navigation: any;
  route: {
    params: {
      taskId: string;
    };
  };
}

export function TaskDetailScreen({ navigation, route }: TaskDetailScreenProps) {
  const { state, completeTask, deleteTask } = useApp();
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    const foundTask = state.tasks.find(t => t.id === taskId);
    setTask(foundTask || null);
    
    if (foundTask) {
      navigation.setOptions({
        title: foundTask.title,
        headerRight: () => (
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color="#667eea" />
          </TouchableOpacity>
        ),
      });
    }
  }, [taskId, state.tasks]);

  const handleEdit = () => {
    if (task) {
      navigation.navigate('TaskCreation', { editTask: task });
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    
    try {
      await completeTask(task.id);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const handleDelete = () => {
    if (!task) return;

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(task.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task');
            }
          },
        },
      ]
    );
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return 'No time set';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!task) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Task Not Found</Text>
        <Text style={styles.errorDescription}>
          The task you're looking for doesn't exist or has been deleted.
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.errorButton}
        />
      </View>
    );
  }

  const isCompleted = task.status === 'completed';
  const isOverdue = !isCompleted && new Date() > new Date(`${task.scheduledDate}T${task.scheduledTime || '23:59'}`);

  return (
    <ScrollView style={styles.container}>
      {/* Task Header */}
      <Card style={styles.headerCard}>
        <View style={styles.taskHeader}>
          <View style={styles.statusIndicator}>
            <View style={[
              styles.statusDot,
              isCompleted && styles.completedDot,
              isOverdue && styles.overdueDot,
            ]} />
            <Text style={[
              styles.statusText,
              isCompleted && styles.completedText,
              isOverdue && styles.overdueText,
            ]}>
              {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
            </Text>
          </View>
          
          <View style={styles.badges}>
            <Badge variant={getPriorityColor(task.priority)} size="small">
              {task.priority.toUpperCase()}
            </Badge>
          </View>
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>
        
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}
      </Card>

      {/* Task Details */}
      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.detailsList}>
          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons 
                name={getCategoryIcon(task.category) as any} 
                size={20} 
                color="#667eea" 
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color="#667eea" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Scheduled Date</Text>
              <Text style={styles.detailValue}>{formatDate(task.scheduledDate)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color="#667eea" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{formatTime(task.scheduledTime)}</Text>
            </View>
          </View>

          {task.duration && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="hourglass-outline" size={20} color="#667eea" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{task.duration} minutes</Text>
              </View>
            </View>
          )}

          <View style={styles.detailItem}>
            <View style={styles.detailIcon}>
              <Ionicons name="star-outline" size={20} color="#f59e0b" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>XP Reward</Text>
              <Text style={styles.detailValue}>{task.xpReward} XP</Text>
            </View>
          </View>

          {task.isRecurring && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="repeat-outline" size={20} color="#667eea" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Recurring</Text>
                <Text style={styles.detailValue}>Yes</Text>
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Timestamps */}
      <Card style={styles.timestampsCard}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        
        <View style={styles.timestampsList}>
          <View style={styles.timestampItem}>
            <Text style={styles.timestampLabel}>Created</Text>
            <Text style={styles.timestampValue}>
              {new Date(task.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.timestampItem}>
            <Text style={styles.timestampLabel}>Last Updated</Text>
            <Text style={styles.timestampValue}>
              {new Date(task.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {task.completedAt && (
            <View style={styles.timestampItem}>
              <Text style={styles.timestampLabel}>Completed</Text>
              <Text style={styles.timestampValue}>
                {new Date(task.completedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        {!isCompleted && (
          <Button
            title="Mark Complete"
            onPress={handleComplete}
            style={styles.actionButton}
          />
        )}
        
        <Button
          title="Edit Task"
          variant="outline"
          onPress={handleEdit}
          style={styles.actionButton}
        />
        
        <Button
          title="Delete Task"
          variant="danger"
          onPress={handleDelete}
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 120,
  },
  headerButton: {
    padding: 8,
  },
  headerCard: {
    margin: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
  },
  completedDot: {
    backgroundColor: '#10b981',
  },
  overdueDot: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  completedText: {
    color: '#10b981',
  },
  overdueText: {
    color: '#ef4444',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailsList: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  timestampsCard: {
    margin: 16,
    marginTop: 0,
  },
  timestampsList: {
    gap: 12,
  },
  timestampItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestampLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  timestampValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  actions: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  actionButton: {
    width: '100%',
  },
});