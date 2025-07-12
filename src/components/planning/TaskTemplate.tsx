import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskTemplate as TaskTemplateType, TaskCategory, TaskPriority } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TaskTemplateProps {
  template: TaskTemplateType;
  onUse: (template: TaskTemplateType) => void;
  onEdit?: (template: TaskTemplateType) => void;
  onDelete?: (templateId: string) => void;
  showActions?: boolean;
}

export const TaskTemplate: React.FC<TaskTemplateProps> = ({
  template,
  onUse,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<TaskTemplateType>(template);

  const getPriorityColor = (priority: TaskPriority): string => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getCategoryColor = (category: TaskCategory): string => {
    const colors = {
      work: '#3b82f6',
      personal: '#10b981',
      health: '#ef4444',
      learning: '#8b5cf6',
      social: '#f59e0b',
      creative: '#ec4899',
      maintenance: '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const handleSaveEdit = () => {
    if (!editedTemplate.title.trim()) {
      Alert.alert('Error', 'Template title is required');
      return;
    }

    onEdit?.(editedTemplate);
    setShowEditModal(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(template.id)
        }
      ]
    );
  };

  const formatDuration = (minutes?: number): string => {
    if (!minutes) return 'No duration';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateTitle}>{template.title}</Text>
          </View>
          
          <View style={styles.usageCount}>
            <Text style={styles.usageText}>{template.usageCount}</Text>
            <Text style={styles.usageLabel}>uses</Text>
          </View>
        </View>

        {template.description && (
          <Text style={styles.description} numberOfLines={2}>
            {template.description}
          </Text>
        )}

        <View style={styles.metadata}>
          <View style={[styles.customBadge, { backgroundColor: getCategoryColor(template.category) }]}>
            <Text style={styles.customBadgeText}>{template.category}</Text>
          </View>
          <View style={[styles.customBadge, { backgroundColor: getPriorityColor(template.priority) }]}>
            <Text style={styles.customBadgeText}>{template.priority}</Text>
          </View>
          {template.scheduledTime && (
            <View style={[styles.customBadge, styles.timeBadge]}>
              <Ionicons name="time-outline" size={10} color="#6b7280" />
              <Text style={[styles.customBadgeText, { color: '#6b7280' }]}>{template.scheduledTime}</Text>
            </View>
          )}
          <View style={[styles.customBadge, styles.timeBadge]}>
            <Ionicons name="hourglass-outline" size={10} color="#6b7280" />
            <Text style={[styles.customBadgeText, { color: '#6b7280' }]}>{formatDuration(template.duration)}</Text>
          </View>
          <View style={[styles.customBadge, { backgroundColor: '#8b5cf6' }]}>
            <Ionicons name="star-outline" size={10} color="#ffffff" />
            <Text style={styles.customBadgeText}>{template.xpReward} XP</Text>
          </View>
        </View>

        {template.tags.length > 0 && (
          <View style={styles.tags}>
            {template.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {template.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{template.tags.length - 3}</Text>
            )}
          </View>
        )}

        {showActions && (
          <View style={styles.actions}>
            <Button
              title="Use Template"
              onPress={() => onUse(template)}
              variant="primary"
              size="small"
              style={styles.useButton}
            />
            
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowEditModal(true)}
              >
                <Ionicons name="create-outline" size={16} color="#6b7280" />
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Template</Text>
            <TouchableOpacity
              onPress={handleSaveEdit}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Template Name</Text>
              <TextInput
                style={styles.input}
                value={editedTemplate.name}
                onChangeText={(text) => setEditedTemplate(prev => ({ ...prev, name: text }))}
                placeholder="Enter template name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Task Title</Text>
              <TextInput
                style={styles.input}
                value={editedTemplate.title}
                onChangeText={(text) => setEditedTemplate(prev => ({ ...prev, title: text }))}
                placeholder="Enter task title"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedTemplate.description || ''}
                onChangeText={(text) => setEditedTemplate(prev => ({ ...prev, description: text }))}
                placeholder="Enter description (optional)"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={editedTemplate.duration?.toString() || ''}
                  onChangeText={(text) => setEditedTemplate(prev => ({ 
                    ...prev, 
                    duration: text ? parseInt(text) || undefined : undefined 
                  }))}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>XP Reward</Text>
                <TextInput
                  style={styles.input}
                  value={editedTemplate.xpReward.toString()}
                  onChangeText={(text) => setEditedTemplate(prev => ({ 
                    ...prev, 
                    xpReward: parseInt(text) || 0 
                  }))}
                  placeholder="25"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Scheduled Time (optional)</Text>
              <TextInput
                style={styles.input}
                value={editedTemplate.scheduledTime || ''}
                onChangeText={(text) => setEditedTemplate(prev => ({ ...prev, scheduledTime: text }))}
                placeholder="09:00"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={editedTemplate.tags.join(', ')}
                onChangeText={(text) => setEditedTemplate(prev => ({ 
                  ...prev, 
                  tags: text.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                }))}
                placeholder="meeting, daily, team"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  templateTitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  usageCount: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  usageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  usageLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    color: '#6b7280',
  },
  moreTagsText: {
    fontSize: 10,
    color: '#9ca3af',
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  useButton: {
    flex: 1,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  modalSaveButton: {
    padding: 4,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  customBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  timeBadge: {
    backgroundColor: '#f3f4f6',
  },
});