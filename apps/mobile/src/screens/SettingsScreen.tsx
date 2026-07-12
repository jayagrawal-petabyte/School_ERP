import React, { useState } from 'react';
import AppHeader from '../components/Header/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  
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
  const [savedMessage, setSavedMessage] = useState(false);

  const flashSaved = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
    <AppHeader
  title="Settings"
  showBackButton
/>

      <View style={styles.content}>
        {savedMessage && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedBannerText}>✓ Preferences saved</Text>
          </View>
        )}

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextWrap}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Get alerts for attendance, assignments and leave status</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                flashSaved();
              }}
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
              onValueChange={(value) => {
                setEmailAlerts(value);
                flashSaved();
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: COLORS.background,
},
  
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  savedBanner: { backgroundColor: COLORS.presentLight ?? '#ECFDF3', borderRadius: 8, paddingVertical: SPACING.sm, alignItems: 'center', marginBottom: SPACING.md },
  savedBannerText: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.success },
  settingsCard: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md },
  settingTextWrap: { flex: 1, paddingRight: SPACING.md },
  settingLabel: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
  settingDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, lineHeight: 15 },
  divider: { height: 1, backgroundColor: COLORS.borderLight },
  footnote: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md },
});