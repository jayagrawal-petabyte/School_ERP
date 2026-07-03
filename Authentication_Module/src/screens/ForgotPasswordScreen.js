import React, { useState } from 'react';
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
import SecureInput from '../components/SecureInput';
import PrimaryButton from '../components/PrimaryButton';
import { COLORS } from '../constants';
import { isValidEmail, isValidPhone } from '../utils/security';

const ACCENT = '#4F46E5';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = false;
    setEmailError('');
    setPhoneError('');

    const hasEmail = email.trim().length > 0;
    const hasPhone = phone.trim().length > 0;

    if (!hasEmail && !hasPhone) {
      setEmailError('Enter your registered email');
      setPhoneError('or your registered phone number');
      return false;
    }

    if (hasEmail) {
      if (!isValidEmail(email)) {
        setEmailError('Enter a valid email address');
        return false;
      }
      valid = true;
    }

    if (hasPhone) {
      if (!isValidPhone(phone)) {
        setPhoneError('Enter a valid 10-digit mobile number');
        return false;
      }
      valid = true;
    }

    return valid;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // ── Mock API: POST /api/auth/forgot-password ─────────────────────────
      await new Promise((res) => setTimeout(res, 1500));
      navigation.navigate('OTPVerification', {
        identifier: email || phone,
        type: email ? 'email' : 'phone',
      });
    } catch {
      Alert.alert('Error', 'Could not send reset code. Try again.');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back to sign in</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Reset password</Text>
          <Text style={styles.subheading}>
            Enter your registered email or phone number to receive a reset code
          </Text>

          {/* Email */}
          <SecureInput
            label="Registered email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            errorText={emailError}
            accentColor={ACCENT}
          />

          {/* OR divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or use phone</Text>
            <View style={styles.orLine} />
          </View>

          {/* Phone */}
          <SecureInput
            label="Phone number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your 10-digit phone number"
            keyboardType="phone-pad"
            errorText={phoneError}
            accentColor={ACCENT}
          />

          <PrimaryButton
            title="Send reset code →"
            onPress={handleSend}
            loading={loading}
            backgroundColor={ACCENT}
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
  subheading: { fontSize: 13, color: COLORS.textMuted, marginBottom: 28, lineHeight: 18 },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6, marginBottom: 14 },
  orLine: { flex: 1, height: 0.8, backgroundColor: COLORS.borderLight },
  orText: { fontSize: 11, color: COLORS.textMuted },
});

export default ForgotPasswordScreen;
