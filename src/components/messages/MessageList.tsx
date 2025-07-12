import React from 'react';
import {
  View,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { AppMessage } from '../../types';
import { MessageCard } from './MessageCard';
import { MessageBanner } from './MessageBanner';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MessageListProps {
  messages: AppMessage[];
  onDismiss?: (messageId: string) => void;
  onNavigate?: (target: string) => void;
  style?: any;
  maxVisible?: number;
  useBannerForHigh?: boolean;
}

export function MessageList({ 
  messages, 
  onDismiss, 
  onNavigate, 
  style,
  maxVisible = 3,
  useBannerForHigh = true,
}: MessageListProps) {
  const [fadeAnims] = React.useState(() => 
    messages.map(() => new Animated.Value(1))
  );

  React.useEffect(() => {
    // Configure layout animation for smooth transitions
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  }, [messages.length]);

  const handleDismiss = (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex >= 0 && fadeAnims[messageIndex]) {
      // Animate out the message
      Animated.timing(fadeAnims[messageIndex], {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        // Call the dismiss callback after animation
        if (onDismiss) {
          onDismiss(messageId);
        }
      });
    } else if (onDismiss) {
      onDismiss(messageId);
    }
  };

  const visibleMessages = messages.slice(0, maxVisible);

  if (visibleMessages.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {visibleMessages.map((message, index) => {
        const shouldUseBanner = useBannerForHigh && message.priority === 'high';
        const fadeAnim = fadeAnims[index] || new Animated.Value(1);

        return (
          <Animated.View
            key={message.id}
            style={[
              styles.messageContainer,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                }],
              },
            ]}
          >
            {shouldUseBanner ? (
              <MessageBanner
                message={message}
                onDismiss={handleDismiss}
                onNavigate={onNavigate}
              />
            ) : (
              <MessageCard
                message={message}
                onDismiss={handleDismiss}
                onNavigate={onNavigate}
              />
            )}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  messageContainer: {
    marginBottom: 4,
  },
});