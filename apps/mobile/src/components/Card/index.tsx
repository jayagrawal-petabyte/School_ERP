import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '../../theme';

export interface CardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: (event: GestureResponderEvent) => void;
  shadow?: 'none' | 'sm' | 'md';
  bordered?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  activeOpacity?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  shadow = 'sm',
  bordered = true,
  padding = 'medium',
  activeOpacity = 0.8,
}) => {
  const isClickable = typeof onPress === 'function';
  const Component = isClickable ? TouchableOpacity : View;

  // Compile classes based on props
  const cardStyles = [
    styles.card,
    bordered && styles.bordered,
    styles[`${padding}Padding` as keyof typeof styles],
    shadow !== 'none' && theme.shadows[shadow],
    style,
  ] as StyleProp<ViewStyle>;

  return (
    <Component
      style={cardStyles}
      {...(isClickable ? { onPress, activeOpacity } : {})}
    >
      {children}
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  // Padding variants
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: theme.spacing.sm,
  },
  mediumPadding: {
    padding: theme.spacing.md,
  },
  largePadding: {
    padding: theme.spacing.lg,
  },
});
