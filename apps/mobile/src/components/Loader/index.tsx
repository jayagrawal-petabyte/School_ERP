import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../../theme';

export interface LoaderProps {
  message?: string;
  overlay?: boolean;
  size?: 'small' | 'large';
  color?: string;
  containerStyle?: StyleProp<ViewStyle>;
  messageStyle?: StyleProp<TextStyle>;
}

export const Loader: React.FC<LoaderProps> = ({
  message,
  overlay = false,
  size = 'large',
  color = theme.colors.primary,
  containerStyle,
  messageStyle,
}) => {
  if (overlay) {
    return (
      <View style={[styles.overlayContainer, containerStyle]}>
        <View style={styles.box}>
          <ActivityIndicator size={size} color={color} />
          {message && <Text style={[styles.messageText, styles.overlayMessageText, messageStyle]}>{message}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.inlineContainer, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={[styles.messageText, messageStyle]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  box: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
    minWidth: 120,
  },
  inlineContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  messageText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.fonts.weights.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  overlayMessageText: {
    color: theme.colors.textPrimary,
  },
});
