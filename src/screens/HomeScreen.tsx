import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import { TaskCard } from '../components/task/TaskCard';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Button } from '../components/ui/Button';
import { MessageList } from '../components/messages';
import { Task } from '../types';

export function HomeScreen({ navigation, route }: any) {
  const { state, loadTasks, completeTask, dismissMessage, loadMessages } = useApp();
  const [selectedDate, setSelectedDate] = useState(
    route?.params?.selectedDate || new Date().toISOString().split('T')[0]
  );
  const [refreshing, setRefreshing] = useState(false);

  // Update selectedDate when route params change (from calendar navigation)
  useEffect(() => {
    if (route?.params?.selectedDate) {
      setSelectedDate(route.params.selectedDate);
    }
  }, [route?.params?.selectedDate]);

  // Load tasks when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadTasks(selectedDate);
    }, [selectedDate])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadTasks(selectedDate),
      loadMessages(),
    ]);
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleTaskComplete = async (task: Task) => {
    try {
      await completeTask(task.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const handleTaskEdit = (task: Task) => {
    navigation.navigate('TaskCreation', { editTask: task });
  };

  const handleCreateTask = () => {
    navigation.navigate('TaskCreation');
  };

  const handleMessageDismiss = async (messageId: string) => {
    try {
      await dismissMessage(messageId);
    } catch (error) {
      Alert.alert('Error', 'Failed to dismiss message');
    }
  };

  const handleMessageNavigate = (target: string) => {
    // Handle navigation based on target
    if (target === 'TaskCreation') {
      navigation.navigate('TaskCreation');
    } else if (target.startsWith('http')) {
      // External links are handled by the MessageCard component
      return;
    } else {
      // Handle other internal navigation
      navigation.navigate(target);
    }
  };

  const todayTasks = state.tasks.filter(task => task.scheduledDate === selectedDate);
  const completedTasks = todayTasks.filter(task => task.status === 'completed');
  const pendingTasks = todayTasks.filter(task => task.status === 'pending');
  const inProgressTasks = todayTasks.filter(task => task.status === 'in-progress');

  const completionPercentage = todayTasks.length > 0 
    ? (completedTasks.length / todayTasks.length) * 100 
    : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your tasks...</Text>
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
      >
        {/* App Messages */}
        {state.messages.length > 0 && (
          <MessageList
            messages={state.messages}
            onDismiss={handleMessageDismiss}
            onNavigate={handleMessageNavigate}
            style={styles.messagesSection}
            maxVisible={state.messageSettings.maxMessagesPerScreen}
            useBannerForHigh={true}
          />
        )}

        {/* Date Navigation */}
        <Card style={styles.dateCard}>
          <View style={styles.dateHeader}>
            <TouchableOpacity onPress={() => navigateDate('prev')}>
              <Ionicons name="chevron-back" size={24} color="#667eea" />
            </TouchableOpacity>
            
            <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
            
            <TouchableOpacity onPress={() => navigateDate('next')}>
              <Ionicons name="chevron-forward" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.dateSubtitle}>
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </Card>

        {/* Progress Overview */}
        {todayTasks.length > 0 && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Daily Progress</Text>
              <Text style={styles.progressStats}>
                {completedTasks.length} of {todayTasks.length} completed
              </Text>
            </View>
            
            <Progress 
              value={completionPercentage} 
              showPercentage={true}
              style={styles.progressBar}
            />
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{pendingTasks.length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{inProgressTasks.length}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{completedTasks.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Tasks List */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {todayTasks.length === 0 ? 'No tasks scheduled' : 'Your Tasks'}
            </Text>
            <TouchableOpacity onPress={handleCreateTask} style={styles.addButton}>
              <Ionicons name="add" size={24} color="#667eea" />
            </TouchableOpacity>
          </View>

          {todayTasks.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No tasks for this day</Text>
                <Text style={styles.emptyDescription}>
                  Tap the + button to add your first task
                </Text>
                <Button
                  title="Add Task"
                  onPress={handleCreateTask}
                  style={styles.emptyButton}
                />
              </View>
            </Card>
          ) : (
            <View style={styles.tasksList}>
              {/* In Progress Tasks */}
              {inProgressTasks.length > 0 && (
                <View style={styles.taskGroup}>
                  <Text style={styles.groupTitle}>In Progress</Text>
                  {inProgressTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPress={() => handleTaskPress(task)}
                      onComplete={() => handleTaskComplete(task)}
                      onEdit={() => handleTaskEdit(task)}
                    />
                  ))}
                </View>
              )}

              {/* Pending Tasks */}
              {pendingTasks.length > 0 && (
                <View style={styles.taskGroup}>
                  <Text style={styles.groupTitle}>Upcoming</Text>
                  {pendingTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPress={() => handleTaskPress(task)}
                      onComplete={() => handleTaskComplete(task)}
                      onEdit={() => handleTaskEdit(task)}
                    />
                  ))}
                </View>
              )}

              {/* Completed Tasks */}
              {completedTasks.length > 0 && (
                <View style={styles.taskGroup}>
                  <Text style={styles.groupTitle}>Completed</Text>
                  {completedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPress={() => handleTaskPress(task)}
                      onComplete={() => handleTaskComplete(task)}
                      onEdit={() => handleTaskEdit(task)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateTask}>
        <Ionicons name="add" size={28} color="#ffffff" />
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
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  messagesSection: {
    marginTop: 8,
  },
  dateCard: {
    margin: 16,
    marginBottom: 8,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  dateSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  progressStats: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tasksSection: {
    flex: 1,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    padding: 8,
  },
  emptyCard: {
    margin: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 120,
  },
  tasksList: {
    paddingBottom: 100,
  },
  taskGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 16,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});