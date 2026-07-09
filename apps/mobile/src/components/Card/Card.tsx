import React from 'react';
import { View, ViewProps } from 'react-native';
import styles from './card.styles';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <View
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </View>
  );
};

export default Card;