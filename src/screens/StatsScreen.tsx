import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexts/AppContext';
import { Card } from '../components/ui/Card';
import { Progress } from '../components/ui/Progress';
import { Badge } from '../components/ui/Badge';
import { TaskCategory } from '../types';

const { width } = Dimensions.get('window');

export function StatsScreen() {
  const { state, getStatsData } = useApp();
  const statsData = getStatsData();

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

  const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
      case 'work': return '#3b82f6';
      case 'personal': return '#8b5cf6';
      case 'health': return '#10b981';
      case 'learning': return '#f59e0b';
      case 'social': return '#ef4444';
      case 'creative': return '#ec4899';
      case 'maintenance': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const calculateLevelProgress = () => {
    if (!state.user) return 0;
    return (state.user.currentLevelXP / state.user.xpToNextLevel) * 100;
  };

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Level & XP Card */}
      <Card style={styles.levelCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelGradient}
        >
          <View style={styles.levelContent}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>Level {state.user?.level || 1}</Text>
              <View style={styles.xpBadge}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.xpText}>{state.user?.totalXP || 0} XP</Text>
              </View>
            </View>
            
            <Text style={styles.levelSubtitle}>
              {state.user?.currentLevelXP || 0} / {state.user?.xpToNextLevel || 100} XP to next level
            </Text>
            
            <Progress
              value={calculateLevelProgress()}
              showPercentage={false}
              height={12}
              colors={['#ffffff', '#f3f4f6']}
              style={styles.levelProgress}
            />
          </View>
        </LinearGradient>
      </Card>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            <Text style={styles.statNumber}>{statsData.totalTasksCompleted}</Text>
            <Text style={styles.statLabel}>Tasks Completed</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="flame" size={32} color="#ef4444" />
            <Text style={styles.statNumber}>
              {statsData.activeStreaks.reduce((max, streak) => 
                Math.max(max, streak.currentCount), 0
              )}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </Card>
      </View>

      {/* Active Streaks */}
      <Card style={styles.streaksCard}>
        <Text style={styles.sectionTitle}>Active Streaks</Text>
        
        {statsData.activeStreaks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flame-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No active streaks</Text>
            <Text style={styles.emptyDescription}>
              Complete tasks to start building streaks!
            </Text>
          </View>
        ) : (
          <View style={styles.streaksList}>
            {statsData.activeStreaks.map((streak) => (
              <View key={streak.id} style={styles.streakItem}>
                <View style={styles.streakIcon}>
                  <Ionicons
                    name={getCategoryIcon(streak.category) as any}
                    size={20}
                    color={getCategoryColor(streak.category)}
                  />
                </View>
                
                <View style={styles.streakInfo}>
                  <Text style={styles.streakCategory}>
                    {streak.category.charAt(0).toUpperCase() + streak.category.slice(1)}
                  </Text>
                  <Text style={styles.streakDays}>
                    {streak.currentCount} day{streak.currentCount !== 1 ? 's' : ''}
                  </Text>
                </View>
                
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={16} color="#ef4444" />
                  <Text style={styles.streakCount}>{streak.currentCount}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Weekly Progress */}
      <Card style={styles.weeklyCard}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        
        <View style={styles.weeklyChart}>
          {statsData.weeklyProgress.map((day, index) => {
            const completionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0;
            const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            
            return (
              <View key={day.date} style={styles.dayColumn}>
                <View style={styles.dayBar}>
                  <View 
                    style={[
                      styles.dayProgress, 
                      { 
                        height: `${Math.max(completionRate, 5)}%`,
                        backgroundColor: completionRate === 100 ? '#10b981' : '#667eea'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.dayLabel}>{dayName}</Text>
                <Text style={styles.dayStats}>{day.completed}/{day.total}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Category Breakdown */}
      <Card style={styles.categoryCard}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        
        <View style={styles.categoryList}>
          {statsData.categoryBreakdown
            .filter(cat => cat.total > 0)
            .sort((a, b) => b.completed - a.completed)
            .map((category) => {
              const completionRate = (category.completed / category.total) * 100;
              
              return (
                <View key={category.category} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <Ionicons
                        name={getCategoryIcon(category.category) as any}
                        size={20}
                        color={getCategoryColor(category.category)}
                      />
                      <Text style={styles.categoryName}>
                        {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                      </Text>
                    </View>
                    
                    <Text style={styles.categoryStats}>
                      {category.completed}/{category.total}
                    </Text>
                  </View>
                  
                  <Progress
                    value={completionRate}
                    showPercentage={false}
                    height={6}
                    colors={[getCategoryColor(category.category), getCategoryColor(category.category)]}
                  />
                </View>
              );
            })}
        </View>
      </Card>

      {/* Recent XP Entries */}
      {state.xpEntries.length > 0 && (
        <Card style={styles.xpCard}>
          <Text style={styles.sectionTitle}>Recent XP Earned</Text>
          
          <View style={styles.xpList}>
            {state.xpEntries.slice(0, 5).map((entry) => (
              <View key={entry.id} style={styles.xpItem}>
                <View style={styles.xpIcon}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                </View>
                
                <View style={styles.xpInfo}>
                  <Text style={styles.xpReason}>{entry.reason}</Text>
                  <Text style={styles.xpDate}>
                    {new Date(entry.earnedAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <Text style={styles.xpAmount}>+{entry.amount}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
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
  levelCard: {
    margin: 16,
    padding: 0,
    overflow: 'hidden',
  },
  levelGradient: {
    padding: 20,
  },
  levelContent: {
    alignItems: 'center',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  levelSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  levelProgress: {
    width: '100%',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  streaksCard: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  streaksList: {
    gap: 12,
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  streakDays: {
    fontSize: 14,
    color: '#6b7280',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  weeklyCard: {
    margin: 16,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayBar: {
    width: 24,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  dayProgress: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  dayStats: {
    fontSize: 10,
    color: '#6b7280',
  },
  categoryCard: {
    margin: 16,
  },
  categoryList: {
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  categoryStats: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  xpCard: {
    margin: 16,
    marginBottom: 32,
  },
  xpList: {
    gap: 12,
  },
  xpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  xpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  xpInfo: {
    flex: 1,
  },
  xpReason: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  xpDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  xpAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
});