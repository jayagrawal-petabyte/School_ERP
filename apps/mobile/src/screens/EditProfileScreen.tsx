import React, { useState } from 'react';
import AppHeader from '../components/Header/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  
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
     <AppHeader
  title="Edit Profile"
  showBackButton
/>

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
  container: {
  flex: 1,
  backgroundColor: COLORS.background,
},
  
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  note: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: SPACING.xs, marginBottom: SPACING.lg, lineHeight: 16 },
  saveButton: { marginTop: SPACING.sm },
});