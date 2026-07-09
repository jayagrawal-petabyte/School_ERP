import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type SettingsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsNavigationProp;
}

// Local device preferences only — no backend table for settings (confirmed, not an oversight).
// Resets on app restart, same as the rest of the app's in-memory session state for now.
export default function SettingsScreen({ navigation }: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Get alerts for attendance, assignments and leave status</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>Email Alerts</Text>
              <Text style={styles.settingDesc}>Receive a copy of important updates by email</Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDesc}>Coming soon</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
        </View>

        <Text style={styles.footnote}>
          These preferences are stored on this device only for now.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  customHeader: { height: 56, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  headerTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  headerSpacer: { width: 38 },
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md },
  settingTextWrap: { flex: 1, paddingRight: SPACING.md },
  settingLabel: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
  settingDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, lineHeight: 15 },
  divider: { height: 1, backgroundColor: COLORS.borderLight },
  footnote: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md },
});