import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RecurrenceFrequency, RecurrencePattern } from '../../types';
import { Badge } from '../ui/Badge';
import { QuickRecurringTemplates } from './QuickRecurringTemplates';

interface RecurrenceSelectorProps {
  pattern: RecurrencePattern | null;
  onPatternChange: (pattern: RecurrencePattern | null) => void;
  showQuickSetup?: boolean;
  onQuickTemplateSelect?: (template: any) => void;
}

export function RecurrenceSelector({
  pattern,
  onPatternChange,
  showQuickSetup = false,
  onQuickTemplateSelect
}: RecurrenceSelectorProps) {
  const [mode, setMode] = useState<'quick' | 'custom'>('quick');
  const frequencies = [
    { value: null, label: 'None', icon: 'close-circle-outline' },
    { value: RecurrenceFrequency.DAILY, label: 'Daily', icon: 'calendar' },
    { value: RecurrenceFrequency.WEEKLY, label: 'Weekly', icon: 'calendar-outline' },
    { value: RecurrenceFrequency.MONTHLY, label: 'Monthly', icon: 'calendar-clear-outline' },
  ];

  const handleFrequencySelect = (frequency: RecurrenceFrequency | null) => {
    if (frequency === null) {
      onPatternChange(null);
    } else {
      const newPattern: RecurrencePattern = {
        type: frequency,
        interval: 1,
        ...(frequency === RecurrenceFrequency.WEEKLY && {
          weeklyOptions: { daysOfWeek: [1] } // Default to Monday
        })
      };
      onPatternChange(newPattern);
    }
  };

  const handleIntervalChange = (interval: number) => {
    if (pattern) {
      onPatternChange({
        ...pattern,
        interval: Math.max(1, interval)
      });
    }
  };

  const handleQuickTemplateSelect = (template: any) => {
    onPatternChange(template.pattern);
    if (onQuickTemplateSelect) {
      onQuickTemplateSelect(template);
    }
  };

  const handleNoEndDateToggle = () => {
    if (pattern) {
      const newPattern = { ...pattern };
      if (newPattern.endDate || newPattern.endAfterOccurrences) {
        delete newPattern.endDate;
        delete newPattern.endAfterOccurrences;
      } else {
        // Set a default end date if none exists
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        newPattern.endDate = futureDate.toISOString().split('T')[0];
      }
      onPatternChange(newPattern);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recurrence</Text>
        {showQuickSetup && (
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'quick' && styles.modeButtonActive]}
              onPress={() => setMode('quick')}
            >
              <Text style={[styles.modeButtonText, mode === 'quick' && styles.modeButtonTextActive]}>
                Quick
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'custom' && styles.modeButtonActive]}
              onPress={() => setMode('custom')}
            >
              <Text style={[styles.modeButtonText, mode === 'custom' && styles.modeButtonTextActive]}>
                Custom
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showQuickSetup && mode === 'quick' ? (
        <QuickRecurringTemplates onTemplateSelect={handleQuickTemplateSelect} />
      ) : (
        <>
          {/* Frequency Selection */}
          <View style={styles.frequencyGrid}>
            {frequencies.map((freq) => (
              <TouchableOpacity
                key={freq.label}
                style={[
                  styles.frequencyItem,
                  pattern?.type === freq.value && styles.frequencyItemSelected,
                  freq.value === null && !pattern && styles.frequencyItemSelected,
                ]}
                onPress={() => handleFrequencySelect(freq.value)}
              >
                <Ionicons
                  name={freq.icon as any}
                  size={20}
                  color={
                    (pattern?.type === freq.value) || (freq.value === null && !pattern)
                      ? '#667eea'
                      : '#6b7280'
                  }
                />
                <Text
                  style={[
                    styles.frequencyText,
                    (pattern?.type === freq.value) || (freq.value === null && !pattern)
                      ? styles.frequencyTextSelected
                      : null,
                  ]}
                >
                  {freq.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Interval Selection */}
          {pattern && (
            <View style={styles.intervalSection}>
              <Text style={styles.intervalLabel}>
                Repeat every {pattern.interval} {pattern.type}
                {pattern.interval > 1 ? 's' : ''}
              </Text>
              
              <View style={styles.intervalControls}>
                <TouchableOpacity
                  style={styles.intervalButton}
                  onPress={() => handleIntervalChange(pattern.interval - 1)}
                  disabled={pattern.interval <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={pattern.interval <= 1 ? '#d1d5db' : '#667eea'}
                  />
                </TouchableOpacity>
                
                <Text style={styles.intervalValue}>{pattern.interval}</Text>
                
                <TouchableOpacity
                  style={styles.intervalButton}
                  onPress={() => handleIntervalChange(pattern.interval + 1)}
                >
                  <Ionicons name="add" size={20} color="#667eea" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* No End Date Option */}
          {pattern && (
            <TouchableOpacity style={styles.noEndDateOption} onPress={handleNoEndDateToggle}>
              <Ionicons
                name={(!pattern.endDate && !pattern.endAfterOccurrences) ? 'checkbox' : 'square-outline'}
                size={20}
                color="#667eea"
              />
              <Text style={styles.noEndDateText}>No end date (continues forever)</Text>
            </TouchableOpacity>
          )}

          {/* Pattern Summary */}
          {pattern && (
            <View style={styles.summary}>
              <Badge variant="info" size="small">
                {getPatternSummary(pattern)}
                {!pattern.endDate && !pattern.endAfterOccurrences && ' (forever)'}
              </Badge>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function getPatternSummary(pattern: RecurrencePattern): string {
  switch (pattern.type) {
    case RecurrenceFrequency.DAILY:
      return pattern.interval === 1 ? 'Every day' : `Every ${pattern.interval} days`;
    
    case RecurrenceFrequency.WEEKLY:
      const dayCount = pattern.weeklyOptions?.daysOfWeek?.length || 0;
      if (pattern.interval === 1) {
        return dayCount === 1 ? 'Weekly' : `${dayCount} days per week`;
      }
      return `Every ${pattern.interval} weeks`;
    
    case RecurrenceFrequency.MONTHLY:
      return pattern.interval === 1 ? 'Monthly' : `Every ${pattern.interval} months`;
    
    default:
      return 'Custom recurrence';
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 2,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#667eea',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  frequencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 6,
    minWidth: '22%',
  },
  frequencyItemSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  frequencyTextSelected: {
    color: '#667eea',
  },
  intervalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  intervalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  intervalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intervalButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 24,
    textAlign: 'center',
  },
  noEndDateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  noEndDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0369a1',
  },
  summary: {
    alignItems: 'flex-start',
  },
});