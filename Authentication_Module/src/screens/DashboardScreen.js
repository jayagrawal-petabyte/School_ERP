import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSession } from '../hooks/useSession';
import { clearAllTokens } from '../utils/security';
import { COLORS } from '../constants';

const DashboardScreen = ({ navigation, route }) => {
  const { role } = route.params || {};

  const handleLogout = async () => {
    await clearAllTokens();
    navigation.replace('Login');
  };

  
  useSession(() => {
    Alert.alert(
      'Session Expired',
      'You have been logged out due to inactivity.',
      [{ text: 'OK', onPress: handleLogout }],
    );
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={[styles.roleIcon, { backgroundColor: role?.accent + '20' }]}>
          <Text style={styles.roleEmoji}>{role?.icon}</Text>
        </View>
        <Text style={styles.heading}>Welcome!</Text>
        <Text style={styles.sub}>
          Signed in as <Text style={{ color: role?.accent, fontWeight: '600' }}>{role?.label}</Text>
        </Text>
        <Text style={styles.note}>
          Dashboard screens coming next...{'\n'}
          (Students, Attendance, Fees, Timetable etc.)
        </Text>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: role?.accent }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: role?.accent }]}>
            Sign out
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  roleEmoji: { fontSize: 40 },
  heading: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  sub: { fontSize: 15, color: COLORS.textMuted, marginTop: 6, marginBottom: 20 },
  note: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  logoutBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  logoutText: { fontSize: 14, fontWeight: '600' },
});

export default DashboardScreen;
