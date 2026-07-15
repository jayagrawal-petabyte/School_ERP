import React, { useEffect, useState } from 'react';
import AppHeader from '../components/Header/AppHeader';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';
import { Avatar, Loader, EmptyState } from '../components';
import { ProfileService } from '../services/profileApi';
import { ParentProfileView } from '../types';

type ParentProfileRouteProp = RouteProp<RootStackParamList, 'ParentProfile'>;
type ParentProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ParentProfile'>;

interface Props {
  route: ParentProfileRouteProp;
  navigation: ParentProfileNavigationProp;
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2);
  return parts[0][0] + parts[parts.length - 1][0];
};

const formatDate = (iso: string | null) => {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ParentProfileScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const [profile, setProfile] = useState<ParentProfileView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ProfileService.getParentProfile(userId).then((result) => {
      setProfile(result);
      setLoading(false);
    });
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
     <AppHeader
  title="My Profile"
  showBackButton
/>

      {loading ? (
        <Loader />
      ) : !profile ? (
        <EmptyState message="Profile not found." />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <Avatar initials={getInitials(profile.full_name)} size="large" />
            </View>
            <Text style={styles.name}>{profile.full_name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>👨‍👩‍👧  PARENT</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Account Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🆔</Text>
              <Text style={styles.infoLabel}>Parent ID</Text>
              <Text style={styles.infoValue}>{profile.id}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>{profile.account_status === 'active' ? '🟢' : '🔴'}</Text>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: profile.account_status === 'active' ? COLORS.success : COLORS.error }]}>
                {profile.account_status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>

            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{formatDate(profile.created_at)}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>My Children</Text>
            {profile.children.length === 0 ? (
              <Text style={styles.emptyText}>No linked children yet</Text>
            ) : (
              profile.children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.childRow}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('StudentProfile', { userId: child.id, title: `${child.full_name}'s Profile` })}
                >
                  <Avatar initials={getInitials(child.full_name)} size="small" />
                  <Text style={styles.childName}>{child.full_name}</Text>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile', { userId: profile.id, role: 'parent', currentName: profile.full_name })}
          >
            <Text style={styles.editButtonText}>✏️  Edit Profile</Text>
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
},
  
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  avatarSection: { alignItems: 'center', backgroundColor: COLORS.primary, paddingBottom: SPACING.lg, marginHorizontal: -SPACING.lg, paddingTop: SPACING.md, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: SPACING.lg },
  avatarRing: { borderWidth: 3, borderColor: '#FFFFFF', borderRadius: 40, ...SHADOWS.md },
  name: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: '#FFFFFF', marginTop: SPACING.sm },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingHorizontal: SPACING.md, paddingVertical: 4, marginTop: SPACING.xs },
  roleBadgeText: { fontSize: 11, fontWeight: FONT_WEIGHT.bold, color: '#FFFFFF', letterSpacing: 0.5 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md, ...SHADOWS.sm },
  cardTitle: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
  infoIcon: { fontSize: 14, width: 26 },
  infoLabel: { flex: 1, fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  infoValue: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.borderLight },
  emptyText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontStyle: 'italic' },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, gap: SPACING.sm },
  childName: { flex: 1, fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textPrimary },
  chevron: { fontSize: 18, color: COLORS.textMuted },
  editButton: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.xs, ...SHADOWS.sm },
  editButtonText: { color: COLORS.textLight, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold },
});