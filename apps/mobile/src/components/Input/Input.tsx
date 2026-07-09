import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
} from 'react-native';
import styles from './input.styles';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#98A2B3"
        {...props}
      />

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default Input;