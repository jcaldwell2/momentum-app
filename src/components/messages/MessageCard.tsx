import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppMessage } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface MessageCardProps {
  message: AppMessage;
  onDismiss?: (messageId: string) => void;
  onNavigate?: (target: string) => void;
  style?: any;
}

export function MessageCard({ message, onDismiss, onNavigate, style }: MessageCardProps) {
  const getMessageIcon = () => {
    switch (message.type) {
      case 'welcome':
        return 'hand-right-outline';
      case 'feature':
        return 'sparkles-outline';
      case 'update':
        return 'rocket-outline';
      case 'tip':
        return 'bulb-outline';
      case 'announcement':
        return 'megaphone-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getMessageColor = () => {
    switch (message.priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getTypeColor = () => {
    switch (message.type) {
      case 'welcome':
        return '#8b5cf6';
      case 'feature':
        return '#06b6d4';
      case 'update':
        return '#f59e0b';
      case 'tip':
        return '#10b981';
      case 'announcement':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleActionPress = async () => {
    if (!message.actionButton) return;

    switch (message.actionButton.action) {
      case 'navigate':
        if (onNavigate && message.actionButton.target) {
          onNavigate(message.actionButton.target);
        }
        break;
      case 'external':
        if (message.actionButton.target) {
          try {
            await Linking.openURL(message.actionButton.target);
          } catch (error) {
            Alert.alert('Error', 'Could not open link');
          }
        }
        break;
      case 'dismiss':
        if (onDismiss) {
          onDismiss(message.id);
        }
        break;
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(message.id);
    }
  };

  return (
    <Card style={[styles.container, style]} padding={0}>
      <View style={[styles.header, { borderLeftColor: getTypeColor() }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getTypeColor() + '20' }]}>
            <Ionicons 
              name={getMessageIcon() as any} 
              size={20} 
              color={getTypeColor()} 
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{message.title}</Text>
            <View style={styles.metaRow}>
              <Text style={[styles.typeLabel, { color: getTypeColor() }]}>
                {message.type.toUpperCase()}
              </Text>
              {message.priority !== 'low' && (
                <>
                  <View style={styles.separator} />
                  <View style={[styles.priorityDot, { backgroundColor: getMessageColor() }]} />
                  <Text style={[styles.priorityLabel, { color: getMessageColor() }]}>
                    {message.priority.toUpperCase()}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
        
        {message.isDismissible && (
          <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>{message.content}</Text>
        
        {message.actionButton && (
          <Button
            title={message.actionButton.text}
            onPress={handleActionPress}
            style={styles.actionButton}
            variant="outline"
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
    borderLeftWidth: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
  },
  actionButton: {
    alignSelf: 'flex-start',
    minWidth: 120,
  },
});