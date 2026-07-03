import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import OTPInput from '../components/OTPInput';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS, SECURITY } from '../constants';

const ACCENT = '#4F46E5';

const OTPVerificationScreen = ({ navigation, route }) => {
  const { identifier, type } = route.params || {};
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(SECURITY.OTP_RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend) return;
    setCountdown(SECURITY.OTP_RESEND_COOLDOWN);
    setCanResend(false);
    setOtp(Array(6).fill(''));
   
    Alert.alert('Code sent', `A new code has been sent to your ${type}.`);
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete', 'Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    try {
      
      await new Promise((res) => setTimeout(res, 1200));
      
      navigation.navigate('NewPassword', { identifier });
    } catch {
      Alert.alert('Invalid code', 'The code you entered is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maskedIdentifier =
    type === 'email'
      ? identifier?.replace(/(.{2})(.*)(@.*)/, '$1***$3')
      : identifier?.replace(/(\d{2})(\d{6})(\d{2})/, '$1******$3');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Enter OTP</Text>
          <Text style={styles.subheading}>
            We've sent a 6-digit code to{'\n'}
            <Text style={styles.identifier}>{maskedIdentifier}</Text>
          </Text>

          <OTPInput otp={otp} setOtp={setOtp} accentColor={ACCENT} />

          {/* Countdown / Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendLabel}>Didn't get the code? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.resendLink, { color: ACCENT }]}>Resend now</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdown}>
                Resend in 0:{String(countdown).padStart(2, '0')}
              </Text>
            )}
          </View>

          <PrimaryButton
            title="Verify code →"
            onPress={handleVerify}
            loading={loading}
            backgroundColor={ACCENT}
            disabled={otp.join('').length < 6}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 },
  backBtn: { marginBottom: 24, marginTop: 8 },
  backText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
  heading: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 13, color: COLORS.textMuted, marginBottom: 28, lineHeight: 20 },
  identifier: { color: COLORS.textPrimary, fontWeight: '600' },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resendLabel: { fontSize: 13, color: COLORS.textMuted },
  resendLink: { fontSize: 13, fontWeight: '600' },
  countdown: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
});

export default OTPVerificationScreen;
