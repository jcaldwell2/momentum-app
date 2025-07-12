import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkloadAnalysis, PlanningPeriod } from '../../types';

interface WorkloadIndicatorProps {
  workloadAnalysis: WorkloadAnalysis;
  showDetails?: boolean;
  compact?: boolean;
}

export const WorkloadIndicator: React.FC<WorkloadIndicatorProps> = ({
  workloadAnalysis,
  showDetails = true,
  compact = false
}) => {
  const getWorkloadColor = (level: 'light' | 'moderate' | 'heavy' | 'overloaded'): string => {
    switch (level) {
      case 'light': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'heavy': return '#ef4444';
      case 'overloaded': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getWorkloadIcon = (level: 'light' | 'moderate' | 'heavy' | 'overloaded'): keyof typeof Ionicons.glyphMap => {
    switch (level) {
      case 'light': return 'leaf-outline';
      case 'moderate': return 'speedometer-outline';
      case 'heavy': return 'flame-outline';
      case 'overloaded': return 'warning-outline';
      default: return 'help-outline';
    }
  };

  const getWorkloadDescription = (level: 'light' | 'moderate' | 'heavy' | 'overloaded'): string => {
    switch (level) {
      case 'light': return 'Light workload - good capacity for more tasks';
      case 'moderate': return 'Moderate workload - well balanced schedule';
      case 'heavy': return 'Heavy workload - consider redistributing tasks';
      case 'overloaded': return 'Overloaded - strongly consider reducing tasks';
      default: return 'Unknown workload level';
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatPeriod = (period: PlanningPeriod): string => {
    switch (period) {
      case PlanningPeriod.WEEK: return 'Week';
      case PlanningPeriod.MONTH: return 'Month';
      case PlanningPeriod.QUARTER: return 'Quarter';
      default: return 'Period';
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={[styles.compactIndicator, { backgroundColor: getWorkloadColor(workloadAnalysis.workloadLevel) }]}>
          <Ionicons 
            name={getWorkloadIcon(workloadAnalysis.workloadLevel)} 
            size={16} 
            color="#ffffff" 
          />
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactLevel}>{workloadAnalysis.workloadLevel}</Text>
          <Text style={styles.compactStats}>
            {workloadAnalysis.totalTasks} tasks • {formatDuration(workloadAnalysis.totalMinutes)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Workload Analysis</Text>
          <Text style={styles.subtitle}>
            {formatPeriod(workloadAnalysis.period)} • {workloadAnalysis.startDate} to {workloadAnalysis.endDate}
          </Text>
        </View>
        <View style={[styles.levelIndicator, { backgroundColor: getWorkloadColor(workloadAnalysis.workloadLevel) }]}>
          <Ionicons 
            name={getWorkloadIcon(workloadAnalysis.workloadLevel)} 
            size={20} 
            color="#ffffff" 
          />
        </View>
      </View>

      {/* Workload Level */}
      <View style={styles.workloadSection}>
        <Text style={[styles.workloadLevel, { color: getWorkloadColor(workloadAnalysis.workloadLevel) }]}>
          {workloadAnalysis.workloadLevel.toUpperCase()}
        </Text>
        <Text style={styles.workloadDescription}>
          {getWorkloadDescription(workloadAnalysis.workloadLevel)}
        </Text>
      </View>

      {/* Statistics */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workloadAnalysis.totalTasks}</Text>
          <Text style={styles.statLabel}>Total Tasks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(workloadAnalysis.totalMinutes)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workloadAnalysis.averageTasksPerDay.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg Tasks/Day</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(Math.round(workloadAnalysis.averageMinutesPerDay))}</Text>
          <Text style={styles.statLabel}>Avg Time/Day</Text>
        </View>
      </View>

      {showDetails && (
        <>
          {/* Peak Days */}
          {workloadAnalysis.peakDays.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Peak Days</Text>
              {workloadAnalysis.peakDays.slice(0, 3).map((day, index) => (
                <View key={index} style={styles.dayItem}>
                  <Text style={styles.dayDate}>{day.date}</Text>
                  <View style={styles.dayStats}>
                    <Text style={styles.dayTaskCount}>{day.taskCount} tasks</Text>
                    <Text style={styles.dayDuration}>{formatDuration(day.totalMinutes)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Category Distribution */}
          {workloadAnalysis.categoryDistribution.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Distribution</Text>
              <View style={styles.categoryList}>
                {workloadAnalysis.categoryDistribution
                  .sort((a, b) => b.percentage - a.percentage)
                  .slice(0, 5)
                  .map((category, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{category.category}</Text>
                        <Text style={styles.categoryStats}>
                          {category.taskCount} tasks • {formatDuration(category.totalMinutes)}
                        </Text>
                      </View>
                      <View style={styles.categoryPercentage}>
                        <Text style={styles.percentageText}>{category.percentage.toFixed(0)}%</Text>
                        <View style={styles.percentageBar}>
                          <View 
                            style={[
                              styles.percentageFill, 
                              { width: `${category.percentage}%` }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Recommendations */}
          {workloadAnalysis.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              {workloadAnalysis.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Ionicons name="bulb-outline" size={16} color="#f59e0b" />
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
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
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  levelIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  compactStats: {
    fontSize: 12,
    color: '#6b7280',
  },
  workloadSection: {
    marginBottom: 20,
  },
  workloadLevel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  workloadDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: (width - 80) / 2,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  dayStats: {
    flexDirection: 'row',
    gap: 8,
  },
  dayTaskCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  dayDuration: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  categoryStats: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryPercentage: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  percentageBar: {
    width: 50,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  percentageFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});