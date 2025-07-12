import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { QuickRecurringTemplates } from '../task/QuickRecurringTemplates';
import { BulkTaskCreator } from '../planning/BulkTaskCreator';
import { TaskTemplate } from '../planning/TaskTemplate';
import { WorkloadIndicator } from '../planning/WorkloadIndicator';
import { planningService } from '../../services/planning';
import {
  TaskTemplate as TaskTemplateType,
  BulkTaskCreation,
  WorkloadAnalysis,
  PlanningPeriod,
  Task,
  TaskCategory,
  TaskPriority,
  RecurrencePattern,
} from '../../types';

interface PlanningIntegrationProps {
  selectedDate?: Date;
  onTaskCreated?: () => void;
}

export function PlanningIntegration({ selectedDate, onTaskCreated }: PlanningIntegrationProps) {
  const { state, createTask } = useApp();
  const [showQuickRecurring, setShowQuickRecurring] = useState(false);
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showWorkload, setShowWorkload] = useState(false);
  const [templates, setTemplates] = useState<TaskTemplateType[]>([]);
  const [workloadAnalysis, setWorkloadAnalysis] = useState<WorkloadAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await planningService.getTaskTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadWorkloadAnalysis = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const analysis = await planningService.analyzeWorkload(
        state.tasks,
        selectedDate,
        PlanningPeriod.WEEK
      );
      setWorkloadAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze workload:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTemplateSelect = async (template: any) => {
    try {
      const startDate = selectedDate || new Date();
      const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: template.defaultTitle,
        description: `Created from ${template.name} template`,
        category: template.defaultCategory,
        priority: template.defaultPriority,
        status: 'pending',
        scheduledDate: startDate.toISOString().split('T')[0],
        scheduledTime: template.defaultTime,
        duration: template.defaultDuration,
        isRecurring: true,
        recurrencePattern: template.pattern,
        xpReward: template.xpReward,
        completedAt: undefined,
      };

      await createTask(task);
      setShowQuickRecurring(false);
      onTaskCreated?.();
      Alert.alert('Success', `${template.name} recurring task created!`);
    } catch (error) {
      console.error('Failed to create recurring task:', error);
      Alert.alert('Error', 'Failed to create recurring task');
    }
  };

  const handleBulkCreation = async (bulkData: BulkTaskCreation) => {
    try {
      setLoading(true);
      const plannedTasks = await planningService.createBulkTasks(bulkData, state.tasks);
      
      for (const task of plannedTasks) {
        await createTask(task);
      }

      setShowBulkCreator(false);
      onTaskCreated?.();
      Alert.alert('Success', `${plannedTasks.length} tasks have been scheduled!`);
    } catch (error) {
      console.error('Failed to create bulk tasks:', error);
      Alert.alert('Error', 'Failed to create bulk tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateCreate = async (template: Omit<TaskTemplateType, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    try {
      const newTemplate = await planningService.createTaskTemplate(template);
      setTemplates(prev => [...prev, newTemplate]);
      Alert.alert('Success', 'Template created successfully!');
    } catch (error) {
      console.error('Failed to create template:', error);
      Alert.alert('Error', 'Failed to create template');
    }
  };

  const handleTemplateUse = async (template: TaskTemplateType) => {
    try {
      const startDate = selectedDate || new Date();
      const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: template.title,
        description: template.description,
        category: template.category,
        priority: template.priority,
        status: 'pending',
        scheduledDate: startDate.toISOString().split('T')[0],
        scheduledTime: template.scheduledTime,
        duration: template.duration,
        isRecurring: false,
        xpReward: template.xpReward,
        completedAt: undefined,
      };

      await createTask(task);
      await planningService.incrementTemplateUsage(template.id);
      onTaskCreated?.();
      Alert.alert('Success', 'Task created from template!');
    } catch (error) {
      console.error('Failed to create task from template:', error);
      Alert.alert('Error', 'Failed to create task from template');
    }
  };

  const handleTemplateEdit = async (template: TaskTemplateType) => {
    try {
      await planningService.updateTaskTemplate(template.id, template);
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
      Alert.alert('Success', 'Template updated successfully!');
    } catch (error) {
      console.error('Failed to update template:', error);
      Alert.alert('Error', 'Failed to update template');
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    try {
      await planningService.deleteTaskTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      Alert.alert('Success', 'Template deleted successfully!');
    } catch (error) {
      console.error('Failed to delete template:', error);
      Alert.alert('Error', 'Failed to delete template');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan Tasks</Text>
      <Text style={styles.subtitle}>Quickly create and schedule tasks</Text>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => setShowQuickRecurring(true)}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="repeat" size={24} color="#667eea" />
          </View>
          <Text style={styles.actionTitle}>Quick Recurring</Text>
          <Text style={styles.actionDescription}>Work hours, habits, workouts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            loadTemplates();
            setShowBulkCreator(true);
          }}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="add-circle" size={24} color="#10b981" />
          </View>
          <Text style={styles.actionTitle}>Bulk Create</Text>
          <Text style={styles.actionDescription}>Multiple tasks at once</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            loadTemplates();
            setShowTemplates(true);
          }}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="bookmark" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.actionTitle}>Templates</Text>
          <Text style={styles.actionDescription}>Manage task templates</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            loadWorkloadAnalysis();
            setShowWorkload(true);
          }}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="analytics" size={24} color="#ef4444" />
          </View>
          <Text style={styles.actionTitle}>Workload</Text>
          <Text style={styles.actionDescription}>Analyze schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Recurring Modal */}
      <Modal
        visible={showQuickRecurring}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quick Recurring Tasks</Text>
            <TouchableOpacity onPress={() => setShowQuickRecurring(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <QuickRecurringTemplates onTemplateSelect={handleQuickTemplateSelect} />
          </ScrollView>
        </View>
      </Modal>

      {/* Bulk Creator Modal */}
      <Modal
        visible={showBulkCreator}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bulk Task Creator</Text>
            <TouchableOpacity onPress={() => setShowBulkCreator(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <BulkTaskCreator
              templates={templates}
              defaultDateRange={selectedDate ? {
                startDate: selectedDate.toISOString().split('T')[0],
                endDate: new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              } : undefined}
              onCancel={() => setShowBulkCreator(false)}
              onCreateTasks={handleBulkCreation}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Task Templates</Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {templates.map(template => (
              <TaskTemplate
                key={template.id}
                template={template}
                onUse={handleTemplateUse}
                onEdit={handleTemplateEdit}
                onDelete={handleTemplateDelete}
              />
            ))}
            {templates.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>No templates yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create templates to quickly schedule recurring tasks
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Workload Modal */}
      <Modal
        visible={showWorkload}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Workload Analysis</Text>
            <TouchableOpacity onPress={() => setShowWorkload(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {workloadAnalysis ? (
              <WorkloadIndicator workloadAnalysis={workloadAnalysis} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>
                  {loading ? 'Analyzing workload...' : 'No workload data available'}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  modalContent: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});