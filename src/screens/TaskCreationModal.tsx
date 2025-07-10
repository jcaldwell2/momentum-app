import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useApp } from '../contexts/AppContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Task, TaskCategory, TaskPriority } from '../types';

interface TaskCreationModalProps {
  navigation: any;
  route: {
    params?: {
      editTask?: Task;
    };
  };
}

export function TaskCreationModal({ navigation, route }: TaskCreationModalProps) {
  const { createTask, updateTask } = useApp();
  const editTask = route.params?.editTask;
  const isEditing = !!editTask;

  // Form state
  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [category, setCategory] = useState<TaskCategory>(editTask?.category || 'personal');
  const [priority, setPriority] = useState<TaskPriority>(editTask?.priority || 'medium');
  const [scheduledDate, setScheduledDate] = useState(
    editTask ? new Date(editTask.scheduledDate) : new Date()
  );
  const [scheduledTime, setScheduledTime] = useState(
    editTask?.scheduledTime 
      ? new Date(`2000-01-01T${editTask.scheduledTime}:00`)
      : new Date()
  );
  const [duration, setDuration] = useState(editTask?.duration?.toString() || '30');
  const [xpReward, setXpReward] = useState(editTask?.xpReward?.toString() || '10');
  const [isRecurring, setIsRecurring] = useState(editTask?.isRecurring || false);

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: { value: TaskCategory; label: string; icon: string }[] = [
    { value: 'work', label: 'Work', icon: 'briefcase' },
    { value: 'personal', label: 'Personal', icon: 'person' },
    { value: 'health', label: 'Health', icon: 'fitness' },
    { value: 'learning', label: 'Learning', icon: 'book' },
    { value: 'social', label: 'Social', icon: 'people' },
    { value: 'creative', label: 'Creative', icon: 'brush' },
    { value: 'maintenance', label: 'Maintenance', icon: 'construct' },
  ];

  const priorities: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: '#6b7280' },
    { value: 'medium', label: 'Medium', color: '#3b82f6' },
    { value: 'high', label: 'High', color: '#f59e0b' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' },
  ];

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Task' : 'New Task',
      headerLeft: () => (
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <Text style={[styles.saveText, !title.trim() && styles.disabledText]}>
            {isEditing ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [title, isEditing]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (duration && (isNaN(Number(duration)) || Number(duration) <= 0)) {
      newErrors.duration = 'Duration must be a positive number';
    }

    if (xpReward && (isNaN(Number(xpReward)) || Number(xpReward) <= 0)) {
      newErrors.xpReward = 'XP reward must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        status: editTask?.status || 'pending' as const,
        scheduledDate: scheduledDate.toISOString().split('T')[0],
        scheduledTime: scheduledTime.toTimeString().slice(0, 5),
        duration: duration ? Number(duration) : undefined,
        isRecurring,
        xpReward: Number(xpReward),
      };

      if (isEditing && editTask) {
        await updateTask(editTask.id, taskData);
      } else {
        await createTask(taskData);
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setScheduledTime(selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Task Title"
            value={title}
            onChangeText={setTitle}
            placeholder="What do you need to do?"
            error={errors.title}
          />

          <Input
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Add more details..."
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryItem,
                  category === cat.value && styles.categoryItemSelected,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={category === cat.value ? '#667eea' : '#6b7280'}
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.value && styles.categoryTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority</Text>
          <View style={styles.priorityRow}>
            {priorities.map((prio) => (
              <TouchableOpacity
                key={prio.value}
                style={[
                  styles.priorityItem,
                  priority === prio.value && { borderColor: prio.color },
                ]}
                onPress={() => setPriority(prio.value)}
              >
                <Badge
                  variant={priority === prio.value ? 'primary' : 'secondary'}
                  size="small"
                >
                  {prio.label}
                </Badge>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          
          <View style={styles.scheduleRow}>
            <TouchableOpacity
              style={styles.scheduleItem}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.scheduleLabel}>Date</Text>
              <View style={styles.scheduleValue}>
                <Ionicons name="calendar-outline" size={16} color="#667eea" />
                <Text style={styles.scheduleText}>{formatDate(scheduledDate)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scheduleItem}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.scheduleLabel}>Time</Text>
              <View style={styles.scheduleValue}>
                <Ionicons name="time-outline" size={16} color="#667eea" />
                <Text style={styles.scheduleText}>{formatTime(scheduledTime)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={scheduledDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={scheduledTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          
          <View style={styles.inputRow}>
            <Input
              label="Duration (minutes)"
              value={duration}
              onChangeText={setDuration}
              placeholder="30"
              keyboardType="numeric"
              containerStyle={styles.halfInput}
              error={errors.duration}
            />

            <Input
              label="XP Reward"
              value={xpReward}
              onChangeText={setXpReward}
              placeholder="10"
              keyboardType="numeric"
              containerStyle={styles.halfInput}
              error={errors.xpReward}
            />
          </View>

          <TouchableOpacity
            style={styles.recurringToggle}
            onPress={() => setIsRecurring(!isRecurring)}
          >
            <View style={styles.recurringInfo}>
              <Ionicons name="repeat" size={20} color="#667eea" />
              <Text style={styles.recurringText}>Recurring Task</Text>
            </View>
            <View style={[styles.toggle, isRecurring && styles.toggleActive]}>
              <View style={[styles.toggleThumb, isRecurring && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={handleCancel}
          style={styles.actionButton}
        />
        <Button
          title={isEditing ? 'Update Task' : 'Create Task'}
          onPress={handleSave}
          disabled={!title.trim() || isLoading}
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
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  disabledText: {
    color: '#9ca3af',
  },
  formCard: {
    margin: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 8,
    minWidth: '45%',
  },
  categoryItemSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextSelected: {
    color: '#667eea',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduleItem: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  scheduleValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  recurringToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  recurringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recurringText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#667eea',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
});