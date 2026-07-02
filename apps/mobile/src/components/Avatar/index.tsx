import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../../theme';

export interface AvatarProps {
  source?: string; // Image URL
  initials?: string; // Fallback initials
  size?: 'small' | 'medium' | 'large';
  customSize?: number;
  style?: StyleProp<ViewStyle>;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  initials,
  size = 'medium',
  customSize,
  style,
}) => {
  const getDimensions = () => {
    if (customSize) {
      return { width: customSize, height: customSize, borderRadius: customSize / 2 };
    }

    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'large':
        return { width: 64, height: 64, borderRadius: 32 };
      case 'medium':
      default:
        return { width: 48, height: 48, borderRadius: 24 };
    }
  };

  const dims = getDimensions();
  const avatarStyle = [styles.avatarContainer, dims, style] as StyleProp<ViewStyle>;

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={avatarStyle as any}
        resizeMode="cover"
      />
    );
  }

  // Get font size based on avatar size
  const getFontSize = () => {
    if (customSize) return customSize * 0.4;
    switch (size) {
      case 'small':
        return theme.typography.sizes.xs;
      case 'large':
        return theme.typography.sizes.xl;
      case 'medium':
      default:
        return theme.typography.sizes.md;
    }
  };

  return (
    <View style={[avatarStyle, styles.initialsContainer]}>
      <Text style={[styles.initialsText, { fontSize: getFontSize() }]}>
        {initials ? initials.substring(0, 2).toUpperCase() : '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  initialsContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  initialsText: {
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.primary,
  },
});
