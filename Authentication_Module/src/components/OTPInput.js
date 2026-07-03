import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const OTPInput = ({ otp, setOtp, accentColor = '#4F46E5', length = 6 }) => {
  const refs = useRef([]);

  const handleChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => (refs.current[i] = r)}
          style={[
            styles.box,
            otp[i] ? { borderColor: accentColor } : { borderColor: COLORS.border },
          ]}
          value={otp[i]}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
          selectionColor={accentColor}
          caretHidden
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  box: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.surface,
    borderWidth: 0.8,
    borderRadius: 10,
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});

export default OTPInput;
