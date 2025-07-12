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

interface MessageBannerProps {
  message: AppMessage;
  onDismiss?: (messageId: string) => void;
  onNavigate?: (target: string) => void;
  style?: any;
}

export function MessageBanner({ message, onDismiss, onNavigate, style }: MessageBannerProps) {
  const getBannerColor = () => {
    switch (message.type) {
      case 'welcome':
        return '#8b5cf6';
      case 'feature':
        return '#06b6d4';
      case 'update':
        return '#f59e0b';
      case 'announcement':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'welcome':
        return 'hand-right';
      case 'feature':
        return 'sparkles';
      case 'update':
        return 'rocket';
      case 'announcement':
        return 'megaphone';
      default:
        return 'information-circle';
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

  const bannerColor = getBannerColor();

  return (
    <View style={[styles.container, { backgroundColor: bannerColor }, style]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getMessageIcon() as any} 
            size={20} 
            color="#ffffff" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{message.title}</Text>
          <Text style={styles.content} numberOfLines={2}>
            {message.content}
          </Text>
        </View>

        <View style={styles.actions}>
          {message.actionButton && (
            <TouchableOpacity onPress={handleActionPress} style={styles.actionButton}>
              <Text style={styles.actionText}>{message.actionButton.text}</Text>
              <Ionicons name="chevron-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          )}
          
          {message.isDismissible && (
            <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
              <Ionicons name="close" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  contentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 4,
  },
  dismissButton: {
    padding: 4,
  },
});