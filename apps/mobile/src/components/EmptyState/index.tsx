import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../../theme';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Visual placeholder box matching Dribbble style layout */}
      <View style={styles.iconContainer}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle} />
        </View>
      </View>

      <Text style={[styles.title, titleStyle]}>{title}</Text>
      
      {description && (
        <Text style={[styles.description, descriptionStyle]}>{description}</Text>
      )}

      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },
  actionContainer: {
    marginTop: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
});
