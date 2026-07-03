import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export interface GradeBadgeProps {
  grade: string;
  status: 'pass' | 'fail';
  size?: 'sm' | 'md';
}

const getBadgeColors = (status: 'pass' | 'fail') => {
  if (status === 'pass') {
    return {
      backgroundColor: '#E8F5E9',
      textColor: '#2E7D32',
    };
  }

  return {
    backgroundColor: '#FDECEA',
    textColor: '#D32F2F',
  };
};

export default function GradeBadge({
  grade,
  status,
  size = 'md',
}: GradeBadgeProps) {
  const colors = getBadgeColors(status);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.backgroundColor,
          paddingHorizontal: size === 'sm' ? 8 : 12,
          paddingVertical: size === 'sm' ? 4 : 6,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.textColor,
            fontSize:
              size === 'sm'
                ? theme.typography.sizes.xs
                : theme.typography.sizes.sm,
          },
        ]}
      >
        {grade}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },

  text: {
    fontWeight: theme.fonts.weights.bold,
  },
});