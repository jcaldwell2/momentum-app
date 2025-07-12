import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { PlanningCalendar } from '../components/planning/PlanningCalendar';
import { TaskTemplate } from '../components/planning/TaskTemplate';
import { WorkloadIndicator } from '../components/planning/WorkloadIndicator';
import { BulkTaskCreator } from '../components/planning/BulkTaskCreator';
import { PlanningPreview } from '../components/planning/PlanningPreview';
import { planningService } from '../services/planning';
import {
  TaskTemplate as TaskTemplateType,
  PlanningPeriod,
  WorkloadAnalysis,
  BulkTaskCreation,
  PlanningPreview as PlanningPreviewType
} from '../types';

type PlanningStep = 'calendar' | 'templates' | 'workload' | 'bulk' | 'preview';

export const PlanningScreen: React.FC = () => {
  const { state, createTask } = useApp();
  const { tasks } = state;
  
  // State management
  const [currentStep, setCurrentStep] = useState<PlanningStep>('calendar');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string } | null>(null);
  const [planningPeriod, setPlanningPeriod] = useState<PlanningPeriod>(PlanningPeriod.WEEK);
  const [templates, setTemplates] = useState<TaskTemplateType[]>([]);
  const [workloadAnalysis, setWorkloadAnalysis] = useState<WorkloadAnalysis | null>(null);
  const [bulkCreation, setBulkCreation] = useState<BulkTaskCreation | null>(null);
  const [planningPreview, setPlanningPreview] = useState<PlanningPreviewType | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Update workload analysis when dates or tasks change
  useEffect(() => {
    if (selectedDateRange) {
      updateWorkloadAnalysis();
    }
  }, [selectedDateRange, tasks]);

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await planningService.getTaskTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const updateWorkloadAnalysis = async () => {
    if (!selectedDateRange) return;

    try {
      const analysis = await planningService.analyzeWorkload(
        tasks,
        new Date(selectedDateRange.start),
        planningPeriod
      );
      setWorkloadAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze workload:', error);
    }
  };

  const handleDateSelection = (dates: string[]) => {
    setSelectedDates(dates);
    
    if (dates.length >= 2) {
      const sortedDates = [...dates].sort();
      setSelectedDateRange({
        start: sortedDates[0],
        end: sortedDates[sortedDates.length - 1]
      });
    } else if (dates.length === 1) {
      // Single date selection - create a week range
      const startDate = new Date(dates[0]);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      
      setSelectedDateRange({
        start: dates[0],
        end: endDate.toISOString().split('T')[0]
      });
    } else {
      setSelectedDateRange(null);
    }
  };

  const handleTemplateCreate = async (template: Omit<TaskTemplateType, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    try {
      const newTemplate = await planningService.createTaskTemplate(template);
      setTemplates(prev => [...prev, newTemplate]);
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Failed to create template:', error);
      Alert.alert('Error', 'Failed to create template');
    }
  };

  const handleTemplateUse = (template: TaskTemplateType) => {
    // Handle template usage - could open a modal or add to bulk creation
    Alert.alert('Template Selected', `Using template: ${template.name}`);
  };

  const handleTemplateEdit = async (template: TaskTemplateType) => {
    try {
      await planningService.updateTaskTemplate(template.id, template);
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    } catch (error) {
      console.error('Failed to update template:', error);
      Alert.alert('Error', 'Failed to update template');
    }
  };

  const handleTemplateDelete = async (templateId: string) => {
    try {
      await planningService.deleteTaskTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Failed to delete template:', error);
      Alert.alert('Error', 'Failed to delete template');
    }
  };

  const handleBulkCreation = async (bulkData: BulkTaskCreation) => {
    if (!selectedDateRange) {
      Alert.alert('Error', 'Please select a date range first');
      return;
    }

    try {
      setLoading(true);
      const plannedTasks = await planningService.createBulkTasks(bulkData, tasks);
      const preview = await planningService.generatePlanningPreview(
        plannedTasks,
        tasks,
        {
          startDate: new Date(selectedDateRange.start),
          endDate: new Date(selectedDateRange.end)
        }
      );
      
      setPlanningPreview(preview);
      setBulkCreation(bulkData);
      setShowBulkModal(false);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Failed to create planning preview:', error);
      Alert.alert('Error', 'Failed to create planning preview');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanApproval = async () => {
    if (!planningPreview || !bulkCreation) return;

    try {
      setLoading(true);
      
      // Create all planned tasks
      for (const task of planningPreview.plannedTasks) {
        await createTask(task);
      }

      // Update template usage counts
      if (bulkCreation.templateId) {
        await planningService.incrementTemplateUsage(bulkCreation.templateId);
      }

      setShowPreviewModal(false);
      setPlanningPreview(null);
      setBulkCreation(null);
      setCurrentStep('calendar');
      
      Alert.alert('Success', `${planningPreview.plannedTasks.length} tasks have been scheduled!`);
      
      // Refresh templates and workload analysis
      await loadTemplates();
      await updateWorkloadAnalysis();
      
    } catch (error) {
      console.error('Failed to apply planning:', error);
      Alert.alert('Error', 'Failed to apply planning');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanRejection = () => {
    setShowPreviewModal(false);
    setPlanningPreview(null);
    setBulkCreation(null);
  };

  const getStepIcon = (step: PlanningStep): keyof typeof Ionicons.glyphMap => {
    switch (step) {
      case 'calendar': return 'calendar-outline';
      case 'templates': return 'bookmark-outline';
      case 'workload': return 'analytics-outline';
      case 'bulk': return 'add-circle-outline';
      case 'preview': return 'eye-outline';
      default: return 'help-outline';
    }
  };

  const getStepTitle = (step: PlanningStep): string => {
    switch (step) {
      case 'calendar': return 'Select Dates';
      case 'templates': return 'Manage Templates';
      case 'workload': return 'Analyze Workload';
      case 'bulk': return 'Create Tasks';
      case 'preview': return 'Preview Plan';
      default: return 'Unknown';
    }
  };

  const canProceedToStep = (step: PlanningStep): boolean => {
    switch (step) {
      case 'calendar': return true;
      case 'templates': return true;
      case 'workload': return selectedDateRange !== null;
      case 'bulk': return selectedDateRange !== null && templates.length > 0;
      case 'preview': return planningPreview !== null;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'calendar':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Select dates for your planning period. You can select individual dates or a range.
            </Text>
            <PlanningCalendar
              selectedDates={selectedDates}
              onDateSelect={(date) => handleDateSelection([date])}
              tasks={tasks}
              multiSelect={true}
              rangeSelect={true}
              workloadIndicator={true}
            />
            <View style={styles.periodSelector}>
              <Text style={styles.periodLabel}>Planning Period:</Text>
              <View style={styles.periodButtons}>
                {Object.values(PlanningPeriod).map(period => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.periodButton,
                      planningPeriod === period && styles.periodButtonActive
                    ]}
                    onPress={() => setPlanningPeriod(period)}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      planningPeriod === period && styles.periodButtonTextActive
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'templates':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepDescription}>
                Manage your task templates for efficient planning.
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowTemplateModal(true)}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>New Template</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.templatesList}>
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
        );

      case 'workload':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Analyze your workload for the selected period to identify optimal scheduling opportunities.
            </Text>
            {workloadAnalysis ? (
              <WorkloadIndicator workloadAnalysis={workloadAnalysis} />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="analytics-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>Select dates to analyze workload</Text>
              </View>
            )}
          </View>
        );

      case 'bulk':
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepDescription}>
                Create multiple tasks efficiently using templates or custom definitions.
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowBulkModal(true)}
                disabled={!selectedDateRange || templates.length === 0}
              >
                <Ionicons name="add-circle" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Create Tasks</Text>
              </TouchableOpacity>
            </View>
            {!selectedDateRange && (
              <View style={styles.warningCard}>
                <Ionicons name="warning-outline" size={20} color="#f59e0b" />
                <Text style={styles.warningText}>Please select a date range first</Text>
              </View>
            )}
            {templates.length === 0 && (
              <View style={styles.warningCard}>
                <Ionicons name="bookmark-outline" size={20} color="#f59e0b" />
                <Text style={styles.warningText}>Create some templates first</Text>
              </View>
            )}
          </View>
        );

      case 'preview':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>
              Review your planned schedule before applying changes.
            </Text>
            {planningPreview ? (
              <PlanningPreview
                preview={planningPreview}
                onApprove={handlePlanApproval}
                onReject={handlePlanRejection}
                showActions={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="eye-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateText}>No preview available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create tasks first to see the preview
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Future Planning</Text>
        <Text style={styles.subtitle}>Plan and schedule your upcoming tasks</Text>
      </View>

      {/* Step Navigation */}
      <View style={styles.stepNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['calendar', 'templates', 'workload', 'bulk', 'preview'] as PlanningStep[]).map((step, index) => (
            <TouchableOpacity
              key={step}
              style={[
                styles.stepButton,
                currentStep === step && styles.stepButtonActive,
                !canProceedToStep(step) && styles.stepButtonDisabled
              ]}
              onPress={() => canProceedToStep(step) && setCurrentStep(step)}
              disabled={!canProceedToStep(step)}
            >
              <Ionicons 
                name={getStepIcon(step)} 
                size={16} 
                color={
                  currentStep === step ? '#ffffff' :
                  canProceedToStep(step) ? '#3b82f6' : '#9ca3af'
                } 
              />
              <Text style={[
                styles.stepButtonText,
                currentStep === step && styles.stepButtonTextActive,
                !canProceedToStep(step) && styles.stepButtonTextDisabled
              ]}>
                {getStepTitle(step)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>

      {/* Template Modal */}
      <Modal
        visible={showTemplateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Template</Text>
            <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <TaskTemplate
            template={{
              id: '',
              name: '',
              title: '',
              category: 'work',
              priority: 'medium',
              xpReward: 25,
              tags: [],
              createdAt: '',
              updatedAt: '',
              isActive: true,
              usageCount: 0
            }}
            onUse={handleTemplateCreate}
            showActions={false}
          />
        </View>
      </Modal>

      {/* Bulk Creation Modal */}
      <Modal
        visible={showBulkModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Tasks</Text>
            <TouchableOpacity onPress={() => setShowBulkModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <BulkTaskCreator
            templates={templates}
            defaultDateRange={selectedDateRange ? {
              startDate: selectedDateRange.start,
              endDate: selectedDateRange.end
            } : undefined}
            onCancel={() => setShowBulkModal(false)}
            onCreateTasks={handleBulkCreation}
          />
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Planning Preview</Text>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          {planningPreview && (
            <PlanningPreview
              preview={planningPreview}
              onApprove={handlePlanApproval}
              onReject={handlePlanRejection}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  stepNavigation: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  stepButtonActive: {
    backgroundColor: '#3b82f6',
  },
  stepButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  stepButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  stepButtonTextActive: {
    color: '#ffffff',
  },
  stepButtonTextDisabled: {
    color: '#9ca3af',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 16,
    flex: 1,
    marginRight: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  periodSelector: {
    marginTop: 16,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  periodButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  templatesList: {
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    gap: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
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
});