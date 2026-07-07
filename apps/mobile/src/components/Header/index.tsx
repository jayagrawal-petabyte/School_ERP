import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
} from 'react-native';
import { theme } from '../../theme';

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightAction,
  containerStyle,
  titleStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            {/* Custom SVG/Vector Back Arrow Representation */}
            <View style={styles.backArrow}>
              <View style={styles.backArrowStem} />
              <View style={styles.backArrowHeadTop} />
              <View style={styles.backArrowHeadBottom} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.title, titleStyle]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {rightAction || null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 44 : 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowStem: {
    width: 16,
    height: 2,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
  },
  backArrowHeadTop: {
    width: 8,
    height: 2,
    backgroundColor: theme.colors.primary,
    transform: [{ rotate: '-45deg' }, { translateX: -3 }, { translateY: -3 }],
    position: 'absolute',
  },
  backArrowHeadBottom: {
    width: 8,
    height: 2,
    backgroundColor: theme.colors.primary,
    transform: [{ rotate: '45deg' }, { translateX: -3 }, { translateY: 3 }],
    position: 'absolute',
  },
});
