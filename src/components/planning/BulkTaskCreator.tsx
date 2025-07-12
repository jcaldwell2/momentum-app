import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  TaskTemplate, 
  BulkTaskCreation, 
  TaskCategory, 
  TaskPriority,
  Task 
} from '../../types';
import { Button } from '../ui/Button';
import { formatDateString } from '../../utils/calendar';

interface BulkTaskCreatorProps {
  templates: TaskTemplate[];
  onCreateTasks: (bulkCreation: BulkTaskCreation) => void;
  onCancel: () => void;
  defaultDateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const BulkTaskCreator: React.FC<BulkTaskCreatorProps> = ({
  templates,
  onCreateTasks,
  onCancel,
  defaultDateRange
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [customTasks, setCustomTasks] = useState<Array<{
    title: string;
    description: string;
    category: TaskCategory;
    priority: TaskPriority;
    duration: number;
    xpReward: number;
  }>>([]);
  const [dateRange, setDateRange] = useState({
    startDate: defaultDateRange?.startDate || formatDateString(new Date()),
    endDate: defaultDateRange?.endDate || formatDateString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  });
  const [distribution, setDistribution] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [skipWeekends, setSkipWeekends] = useState(false);
  const [taskCount, setTaskCount] = useState(1);

  const addCustomTask = () => {
    setCustomTasks(prev => [...prev, {
      title: '',
      description: '',
      category: 'work',
      priority: 'medium',
      duration: 30,
      xpReward: 25
    }]);
  };

  const updateCustomTask = (index: number, updates: Partial<typeof customTasks[0]>) => {
    setCustomTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, ...updates } : task
    ));
  };

  const removeCustomTask = (index: number) => {
    setCustomTasks(prev => prev.filter((_, i) => i !== index));
  };

  const generateTasksFromTemplate = (template: TaskTemplate, count: number): Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] => {
    return Array.from({ length: count }, (_, index) => ({
      title: `${template.title} ${count > 1 ? `#${index + 1}` : ''}`.trim(),
      description: template.description,
      category: template.category,
      priority: template.priority,
      status: 'pending' as const,
      scheduledDate: dateRange.startDate,
      scheduledTime: template.scheduledTime,
      duration: template.duration,
      isRecurring: false,
      xpReward: template.xpReward
    }));
  };

  const handleCreateTasks = () => {
    let tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    if (selectedTemplate) {
      tasks = generateTasksFromTemplate(selectedTemplate, taskCount);
    } else if (customTasks.length > 0) {
      tasks = customTasks
        .filter(task => task.title.trim())
        .map(task => ({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: 'pending' as const,
          scheduledDate: dateRange.startDate,
          duration: task.duration,
          isRecurring: false,
          xpReward: task.xpReward
        }));
    }

    if (tasks.length === 0) {
      Alert.alert('Error', 'Please select a template or add custom tasks');
      return;
    }

    const bulkCreation: BulkTaskCreation = {
      templateId: selectedTemplate?.id,
      tasks,
      dateRange,
      distribution,
      skipWeekends
    };

    onCreateTasks(bulkCreation);
  };

  const categories: TaskCategory[] = ['work', 'personal', 'health', 'learning', 'social', 'creative', 'maintenance'];
  const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bulk Task Creator</Text>
        <Text style={styles.subtitle}>Create multiple tasks at once</Text>
      </View>

      {/* Template Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Use Template</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
          <TouchableOpacity
            style={[styles.templateCard, !selectedTemplate && styles.selectedTemplateCard]}
            onPress={() => setSelectedTemplate(null)}
          >
            <Ionicons name="add-outline" size={24} color={!selectedTemplate ? '#ffffff' : '#6b7280'} />
            <Text style={[styles.templateName, !selectedTemplate && styles.selectedTemplateName]}>
              Custom Tasks
            </Text>
          </TouchableOpacity>
          
          {templates.map(template => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateCard, selectedTemplate?.id === template.id && styles.selectedTemplateCard]}
              onPress={() => setSelectedTemplate(template)}
            >
              <Text style={[styles.templateName, selectedTemplate?.id === template.id && styles.selectedTemplateName]}>
                {template.name}
              </Text>
              <Text style={[styles.templateTitle, selectedTemplate?.id === template.id && styles.selectedTemplateTitle]}>
                {template.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Template Task Count */}
      {selectedTemplate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Tasks</Text>
          <View style={styles.countControls}>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => setTaskCount(Math.max(1, taskCount - 1))}
            >
              <Ionicons name="remove" size={20} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.countText}>{taskCount}</Text>
            <TouchableOpacity
              style={styles.countButton}
              onPress={() => setTaskCount(Math.min(50, taskCount + 1))}
            >
              <Ionicons name="add" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Custom Tasks */}
      {!selectedTemplate && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Custom Tasks</Text>
            <TouchableOpacity style={styles.addButton} onPress={addCustomTask}>
              <Ionicons name="add" size={16} color="#667eea" />
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>
          </View>

          {customTasks.map((task, index) => (
            <View key={index} style={styles.customTaskCard}>
              <View style={styles.customTaskHeader}>
                <Text style={styles.customTaskNumber}>Task {index + 1}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeCustomTask(index)}
                >
                  <Ionicons name="close" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Task title"
                value={task.title}
                onChangeText={(text) => updateCustomTask(index, { title: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={task.description}
                onChangeText={(text) => updateCustomTask(index, { description: text })}
                multiline
                numberOfLines={2}
              />

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Category</Text>
                  <View style={styles.pickerContainer}>
                    {categories.map(category => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.pickerOption,
                          task.category === category && styles.selectedPickerOption
                        ]}
                        onPress={() => updateCustomTask(index, { category })}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          task.category === category && styles.selectedPickerOptionText
                        ]}>
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Priority</Text>
                  <View style={styles.pickerContainer}>
                    {priorities.map(priority => (
                      <TouchableOpacity
                        key={priority}
                        style={[
                          styles.pickerOption,
                          task.priority === priority && styles.selectedPickerOption
                        ]}
                        onPress={() => updateCustomTask(index, { priority })}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          task.priority === priority && styles.selectedPickerOptionText
                        ]}>
                          {priority}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Duration (min)</Text>
                  <TextInput
                    style={styles.input}
                    value={task.duration.toString()}
                    onChangeText={(text) => updateCustomTask(index, { duration: parseInt(text) || 30 })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>XP Reward</Text>
                  <TextInput
                    style={styles.input}
                    value={task.xpReward.toString()}
                    onChangeText={(text) => updateCustomTask(index, { xpReward: parseInt(text) || 25 })}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          ))}

          {customTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>No custom tasks added</Text>
              <Text style={styles.emptyStateSubtext}>Tap "Add Task" to create custom tasks</Text>
            </View>
          )}
        </View>
      )}

      {/* Date Range */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date Range</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateGroup}>
            <Text style={styles.label}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={dateRange.startDate}
              onChangeText={(text) => setDateRange(prev => ({ ...prev, startDate: text }))}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.dateGroup}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              value={dateRange.endDate}
              onChangeText={(text) => setDateRange(prev => ({ ...prev, endDate: text }))}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
      </View>

      {/* Distribution Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribution</Text>
        <View style={styles.distributionOptions}>
          {(['daily', 'weekly', 'custom'] as const).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.distributionOption,
                distribution === option && styles.selectedDistributionOption
              ]}
              onPress={() => setDistribution(option)}
            >
              <Text style={[
                styles.distributionOptionText,
                distribution === option && styles.selectedDistributionOptionText
              ]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setSkipWeekends(!skipWeekends)}
        >
          <View style={[styles.checkbox, skipWeekends && styles.checkedCheckbox]}>
            {skipWeekends && <Ionicons name="checkmark" size={16} color="#ffffff" />}
          </View>
          <Text style={styles.checkboxLabel}>Skip weekends</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="secondary"
          style={styles.cancelButton}
        />
        <Button
          title="Create Tasks"
          onPress={handleCreateTasks}
          variant="primary"
          style={styles.createButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  templateScroll: {
    flexDirection: 'row',
  },
  templateCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTemplateCard: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  templateName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedTemplateName: {
    color: '#ffffff',
  },
  templateTitle: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  selectedTemplateTitle: {
    color: '#e0e7ff',
  },
  countControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  countButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    minWidth: 40,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#667eea',
  },
  customTaskCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  customTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customTaskNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  removeButton: {
    padding: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroup: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pickerOption: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  selectedPickerOption: {
    backgroundColor: '#667eea',
  },
  pickerOptionText: {
    fontSize: 10,
    color: '#374151',
    textTransform: 'capitalize',
  },
  selectedPickerOptionText: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateGroup: {
    flex: 1,
  },
  distributionOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  distributionOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  selectedDistributionOption: {
    backgroundColor: '#667eea',
  },
  distributionOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedDistributionOptionText: {
    color: '#ffffff',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 2,
  },
});