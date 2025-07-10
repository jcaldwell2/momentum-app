import React from 'react';
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

export function SettingsScreen() {
  const { state } = useApp();

  const handleNotificationSettings = () => {
    Alert.alert('Coming Soon', 'Notification settings will be available in a future update.');
  };

  const handleThemeSettings = () => {
    Alert.alert('Coming Soon', 'Theme settings will be available in a future update.');
  };

  const handleDataExport = () => {
    Alert.alert('Coming Soon', 'Data export will be available in a future update.');
  };

  const handleAbout = () => {
    Alert.alert(
      'About Momentum',
      'Momentum v1.0.0\n\nA productivity app that helps you plan your day, manage tasks, track streaks, and earn XP through gamification.\n\nBuilt with React Native and Expo.',
      [{ text: 'OK' }]
    );
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          title: 'Profile',
          subtitle: state.user?.name || 'Momentum User',
          onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon.'),
        },
        {
          icon: 'stats-chart-outline',
          title: 'Your Progress',
          subtitle: `Level ${state.user?.level || 1} • ${state.user?.totalXP || 0} XP`,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Notifications',
          subtitle: 'Manage your notification preferences',
          onPress: handleNotificationSettings,
        },
        {
          icon: 'color-palette-outline',
          title: 'Theme',
          subtitle: 'Choose your app appearance',
          onPress: handleThemeSettings,
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: 'download-outline',
          title: 'Export Data',
          subtitle: 'Download your tasks and progress',
          onPress: handleDataExport,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Help & FAQ',
          subtitle: 'Get help using Momentum',
          onPress: () => Alert.alert('Coming Soon', 'Help section will be available soon.'),
        },
        {
          icon: 'mail-outline',
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          onPress: () => Alert.alert('Coming Soon', 'Contact support will be available soon.'),
        },
        {
          icon: 'information-circle-outline',
          title: 'About',
          subtitle: 'App version and information',
          onPress: handleAbout,
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(state.user?.name || 'M').charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{state.user?.name || 'Momentum User'}</Text>
            <Text style={styles.userLevel}>Level {state.user?.level || 1}</Text>
          </View>
          
          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{state.user?.totalXP || 0}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {state.tasks.filter(t => t.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Settings Groups */}
      {settingsGroups.map((group, groupIndex) => (
        <View key={groupIndex} style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          
          <Card style={styles.groupCard}>
            {group.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.settingItem,
                  itemIndex < group.items.length - 1 && styles.settingItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#667eea" />
                </View>
                
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      ))}

      {/* App Version */}
      <View style={styles.versionInfo}>
        <Text style={styles.versionText}>Momentum v1.0.0</Text>
        <Text style={styles.versionSubtext}>Built with ❤️ using React Native</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  userCard: {
    margin: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  userStats: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 16,
    marginBottom: 8,
  },
  groupCard: {
    marginHorizontal: 16,
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});