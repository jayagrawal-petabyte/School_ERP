import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './header.styles';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBackPress,
  rightComponent,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}

        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && (
            <Text style={styles.subtitle}>{subtitle}</Text>
          )}
        </View>
      </View>

      {rightComponent}
    </View>
  );
};

export default Header;