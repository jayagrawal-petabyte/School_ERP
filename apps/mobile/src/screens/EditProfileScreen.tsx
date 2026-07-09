import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/theme';
import { Input, Button } from '../components';
import { ProfileService } from '../services/profileApi';

type EditProfileRouteProp = RouteProp<RootStackParamList, 'EditProfile'>;
type EditProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

interface Props {
  route: EditProfileRouteProp;
  navigation: EditProfileNavigationProp;
}

export default function EditProfileScreen({ route, navigation }: Props) {
  const { userId, currentName } = route.params;
  const [fullName, setFullName] = useState(currentName);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    if (fullName.trim().length === 0) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    const result = await ProfileService.updateFullName(userId, fullName);
    setSaving(false);

    if (result.success) {
      Alert.alert('Saved', result.message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } else {
      setError(result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Input
          label="Full Name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          error={error}
        />

        <Text style={styles.note}>
          Only your name can be edited here. Other details are managed by the school.
        </Text>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
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
  note: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: SPACING.xs, marginBottom: SPACING.lg, lineHeight: 16 },
  saveButton: { marginTop: SPACING.sm },
});