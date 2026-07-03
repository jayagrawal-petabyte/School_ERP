import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';

import OTPInput from '../components/OTPInput';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS } from '../constants';

const MFAScreen = ({ navigation, route }) => {
  const { role } = route.params;

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);

  const verifyOTP = async () => {
  const otpCode = otp.join('');

  if (otpCode.length !== 6) {
    Alert.alert(
      'Invalid OTP',
      'Please enter a valid 6-digit OTP.'
    );
    return;
  }

  setLoading(true);

  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    navigation.replace('Dashboard', {
      role,
    });
  } catch (error) {
    Alert.alert('Error', 'OTP verification failed.');
  } finally {
    setLoading(false);
  }
};

  const handleResendOTP = () => {
    Alert.alert(
      'OTP Sent',
      'A new verification code has been sent.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.icon}>🛡️</Text>

      <Text style={styles.title}>
        Multi-Factor Authentication
      </Text>

      <Text style={styles.subtitle}>
        For administrator security, enter the 6-digit verification code to continue.
      </Text>

      <OTPInput
  otp={otp}
  setOtp={setOtp}
  accentColor={role.accent}
/>

      <TouchableOpacity
        onPress={handleResendOTP}
        style={styles.resendContainer}
      >
        <Text
          style={[
            styles.resendText,
            { color: role.accent }
          ]}
        >
          Resend Code
        </Text>
      </TouchableOpacity>

      <PrimaryButton
        title="Verify"
        onPress={verifyOTP}
        loading={loading}
        backgroundColor={role.accent}
      />

      <TouchableOpacity
        onPress={() => navigation.replace('Login')}
        style={styles.backContainer}
      >
        <Text style={styles.backText}>
          ← Back to Login
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
};

export default MFAScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  icon: {
    fontSize: 60,
    textAlign: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 40,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },

  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  resendText: {
    fontSize: 15,
    fontWeight: '600',
  },

  backContainer: {
    alignItems: 'center',
    marginTop: 20,
  },

  backText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
});