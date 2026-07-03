import React, { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { sanitizeInput } from '../utils/security';
import { COLORS } from '../constants';

interface SecureInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  errorText?: string;
  successText?: string;
  editable?: boolean;
  accentColor?: string;
  showToggle?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SecureInput: React.FC<SecureInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  errorText,
  successText,
  editable = true,
  accentColor = '#4F46E5',
  showToggle = false,
  style,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (text: string) => {
    const clean = sanitizeInput(text);
    onChangeText(clean);
  };

  const borderColor = errorText
    ? COLORS.error
    : successText
    ? COLORS.success
    : COLORS.border;

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={[styles.inputWrap, { borderColor }]}>
        <TextInput
          style={[styles.input, showToggle && styles.inputWithToggle]}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          editable={editable}
          selectionColor={accentColor}
          autoCorrect={false}
          spellCheck={false}
        />
        {showToggle && (
          <TouchableOpacity
  style={styles.toggleBtn}
  onPress={() => setIsPasswordVisible((v) => !v)}
  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
>
  <Ionicons
    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
    size={22}
    color={COLORS.textMuted}
  />
</TouchableOpacity>
        )}
      </View>

      {errorText ? (
        <Text style={styles.errorText}>⚠ {errorText}</Text>
      ) : successText ? (
        <Text style={styles.successText}>✓ {successText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 0.8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  inputWithToggle: { paddingRight: 44 },
  toggleBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },

  errorText: {
    fontSize: 11,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 2,
  },
  successText: {
    fontSize: 11,
    color: COLORS.success,
    marginTop: 4,
    marginLeft: 2,
  },
});

export default SecureInput;
