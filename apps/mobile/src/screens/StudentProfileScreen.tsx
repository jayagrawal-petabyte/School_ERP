import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';
import { Avatar, Loader, EmptyState } from '../components';
import { ProfileService } from '../services/profileApi';
import { StudentProfileView } from '../types';

type StudentProfileRouteProp = RouteProp<RootStackParamList, 'StudentProfile'>;
type StudentProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StudentProfile'>;

interface Props {
  route: StudentProfileRouteProp;
  navigation: StudentProfileNavigationProp;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
};

const formatDate = (iso: string | null) => {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function StudentProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const [profile, setProfile] = useState<StudentProfileView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ProfileService.getStudentProfile(userId).then((result) => {
      setProfile(result);
      setLoading(false);
    });
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <Loader />
      ) : !profile ? (
        <EmptyState message="Profile not found." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <Avatar initials={getInitials(profile.full_name)} size="large" />
            <Text style={styles.name}>{profile.full_name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>Student</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>{profile.id}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Status</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: profile.account_status === 'active' ? COLORS.success : COLORS.error },
                ]}
              >
                {profile.account_status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Login</Text>
              <Text style={styles.infoValue}>{formatDate(profile.last_login_at)}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionLabel}>Class</Text>
            {profile.classes.length === 0 ? (
              <Text style={styles.emptyText}>Not linked to a class yet</Text>
            ) : (
              profile.classes.map((c) => (
                <Text key={c.id} style={styles.infoValue}>
                  {c.class_name} - {c.section}
                </Text>
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('EditProfile', { userId: profile.id, role: 'student', currentName: profile.full_name })}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  customHeader: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  headerSpacer: {
    width: 38,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  editButtonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});