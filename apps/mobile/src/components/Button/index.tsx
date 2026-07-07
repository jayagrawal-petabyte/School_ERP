import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '../../theme';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  activeOpacity = 0.7,
  ...props
}) => {
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isText = variant === 'text';

  // Get corresponding loading indicator color
  const getLoaderColor = () => {
    if (isSecondary || isOutline || isText) {
      return theme.colors.primary;
    }
    return theme.colors.textLight;
  };

  // Build styles
  const buttonStyles = [
    styles.baseButton,
    styles[`${size}Button` as keyof typeof styles],
    styles[`${variant}Button` as keyof typeof styles],
    disabled && styles.disabledButton,
    style,
  ] as StyleProp<ViewStyle>;

  const labelStyles = [
    styles.baseText,
    styles[`${size}Text` as keyof typeof styles],
    styles[`${variant}Text` as keyof typeof styles],
    disabled && styles.disabledText,
    textStyle,
  ] as StyleProp<TextStyle>;

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      disabled={disabled || loading}
      style={buttonStyles}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : (
        <Text style={labelStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  // Variant styles
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryLight,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
  },
  textButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  // Size styles
  smallButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  mediumButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  largeButton: {
    paddingVertical: theme.spacing.md + 4,
    paddingHorizontal: theme.spacing.xl,
  },
  // Disabled styles
  disabledButton: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
  },
  // Text base
  baseText: {
    fontWeight: theme.fonts.weights.semibold,
    textAlign: 'center',
  },
  // Variant text styles
  primaryText: {
    color: theme.colors.textLight,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  textText: {
    color: theme.colors.primary,
  },
  // Size text styles
  smallText: {
    fontSize: theme.typography.sizes.sm,
  },
  mediumText: {
    fontSize: theme.typography.sizes.md,
  },
  largeText: {
    fontSize: theme.typography.sizes.lg,
  },
  // Disabled text
  disabledText: {
    color: theme.colors.textMuted,
  },
});
