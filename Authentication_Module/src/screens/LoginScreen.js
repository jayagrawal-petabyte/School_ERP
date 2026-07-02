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
import RoleTabs from '../components/RoleTabs';
import SecureInput from '../components/SecureInput';
import PrimaryButton from '../components/PrimaryButton';
import { ROLES, COLORS, SECURITY } from '../constants';
import {
  isValidIdentifier,
  isAccountLocked,
  recordFailedAttempt,
  resetLoginAttempts,
  getRemainingAttempts,
  getRemainingLockoutTime,
  storeToken,
} from '../utils/security';

const LoginScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let valid = true;
    setIdentifierError('');
    setPasswordError('');

    if (!identifier) {
      setIdentifierError('Email or mobile number is required');
      valid = false;
    } else if (!isValidIdentifier(identifier)) {
      setIdentifierError('Enter a valid email or 10-digit mobile number');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < SECURITY.MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${SECURITY.MIN_PASSWORD_LENGTH} characters`);
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    // Check account lockout
    if (isAccountLocked(identifier)) {
      const remaining = getRemainingLockoutTime(identifier);
      Alert.alert(
        'Account Locked',
        `Too many failed attempts. Try again in ${Math.ceil(remaining / 60)} minutes.`,
      );
      return;
    }

    setLoading(true);

    try {
      // ── Mock API call (replace with real endpoint) ──────────────────────
      // In production: POST /api/auth/login with { identifier, password, role }
      // Headers must include: Content-Type: application/json
      // Response: { token, refreshToken, user }
      await new Promise((res) => setTimeout(res, 1500));

      
      const mockSuccess = password.length >= 8;

      if (mockSuccess) {
        resetLoginAttempts(identifier);
        
        await storeToken('auth_token', 'mock_jwt_token_here');
        await storeToken('user_role', JSON.stringify(selectedRole));

      
        if (selectedRole.requiresMFA) {
  navigation.navigate('MFA', {
    role: selectedRole,
  });
} else {
  navigation.replace('Dashboard', {
    role: selectedRole,
  });
}
      } else {
        recordFailedAttempt(identifier);
        const remaining = getRemainingAttempts(identifier);
        if (remaining === 0) {
          setPasswordError('Account locked. Too many failed attempts.');
        } else {
          setPasswordError(`Incorrect password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect. Please try again.');
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
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={[styles.logoMark, { backgroundColor: selectedRole.accent }]}>
              <Text style={styles.logoText}>B</Text>
            </View>
          </View>

          {/* Role Tabs */}
          <RoleTabs selectedRole={selectedRole} onSelect={setSelectedRole} />

          {/* Heading */}
          <Text style={styles.heading}>Sign in</Text>
          <Text style={styles.subheading}>{selectedRole.sub}</Text>

          

          {/* Email or Mobile */}
          <SecureInput
            label="Email or mobile number"
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="Enter email or mobile number"
            keyboardType="email-address"
            errorText={identifierError}
            accentColor={selectedRole.accent}
          />

          {/* Password */}
          <SecureInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            showToggle
            errorText={passwordError}
            accentColor={selectedRole.accent}
          />

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotWrap}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={[styles.forgotText, { color: selectedRole.accent }]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <PrimaryButton
            title="Sign in"
            onPress={handleLogin}
            loading={loading}
            backgroundColor={selectedRole.accent}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', paddingTop: 40, paddingBottom: 28 },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  logoText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  heading: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  subheading: { fontSize: 13, color: COLORS.textMuted, marginBottom: 24, lineHeight: 18 },
  mfaNotice: {
    backgroundColor: '#FEF2F2',
    borderWidth: 0.5,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  mfaText: { fontSize: 12, color: '#991B1B', lineHeight: 17 },
  forgotWrap: { alignItems: 'flex-end', marginTop: -4, marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: '500' },
});

export default LoginScreen;
