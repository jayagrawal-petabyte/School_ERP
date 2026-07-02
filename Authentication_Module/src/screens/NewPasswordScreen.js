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
import { COLORS, SECURITY } from '../constants';
import { getPasswordStrength, validatePassword } from '../utils/security';

const ACCENT = '#4F46E5';

const NewPasswordScreen = ({ navigation, route }) => {
  const { identifier } = route.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPwError, setNewPwError] = useState('');
  const [confirmPwError, setConfirmPwError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(newPassword);

  const passwordsMatch =
    newPassword.length >= SECURITY.MIN_PASSWORD_LENGTH &&
    newPassword === confirmPassword;

  const getConfirmStatus = () => {
    if (!confirmPassword) return {};
    if (passwordsMatch) return { successText: 'Passwords match' };
    return { errorText: "Passwords don't match" };
  };

  const validate = () => {
    setNewPwError('');
    setConfirmPwError('');

    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setNewPwError(errors[0]);
      return false;
    }
    if (!confirmPassword) {
      setConfirmPwError('Please confirm your password');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPwError("Passwords don't match");
      return false;
    }
    return true;
  };

  const handleReset = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      
      await new Promise((res) => setTimeout(res, 1500));
      navigation.navigate('PasswordSuccess');
    } catch {
      Alert.alert('Error', 'Could not reset password. Please try again.');
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
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Set new password</Text>
          <Text style={styles.subheading}>
            Both fields must have the exact same password
          </Text>

          {/* Password rules hint */}
          <View style={styles.rulesBox}>
            <Text style={styles.rulesTitle}>Password must contain:</Text>
            {[
              `At least ${SECURITY.MIN_PASSWORD_LENGTH} characters`,
              'One uppercase letter (A-Z)',
              'One number (0-9)',
              'One special character (!@#$...)',
            ].map((rule, i) => (
              <Text key={i} style={styles.ruleItem}>• {rule}</Text>
            ))}
          </View>

          {/* New password */}
          <SecureInput
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
            showToggle
            errorText={newPwError}
            accentColor={ACCENT}
          />

          {/* Strength bar */}
          {newPassword.length > 0 && (
            <View style={styles.strengthWrap}>
              <View style={styles.strengthBg}>
                <View
                  style={[
                    styles.strengthFill,
                    { width: strength.width, backgroundColor: strength.color },
                  ]}
                />
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          {/* Confirm password */}
          <SecureInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your new password"
            secureTextEntry
            showToggle
            errorText={confirmPwError}
            accentColor={ACCENT}
            style={{ marginTop: 14 }}
            {...getConfirmStatus()}
          />

          <PrimaryButton
            title="Reset password"
            onPress={handleReset}
            loading={loading}
            backgroundColor={ACCENT}
            disabled={!passwordsMatch}
            style={{ marginTop: 10 }}
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
  subheading: { fontSize: 13, color: COLORS.textMuted, marginBottom: 20, lineHeight: 18 },
  rulesBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  rulesTitle: { fontSize: 12, fontWeight: '600', color: '#3730A3', marginBottom: 6 },
  ruleItem: { fontSize: 11, color: '#4338CA', lineHeight: 18 },
  strengthWrap: { marginTop: -8, marginBottom: 4 },
  strengthBg: {
    height: 5,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: { height: 5, borderRadius: 3 },
  strengthLabel: { fontSize: 11, marginTop: 3, fontWeight: '500' },
});

export default NewPasswordScreen;
