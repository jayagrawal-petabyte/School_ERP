import React, { useState, useEffect } from 'react';
import { getToken } from '../utils/security';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';
import { DashboardCard, AppUser } from '../types';
import { DashboardService, ProfileService } from '../services/profileApi';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  route?: any;
  navigation?: any;
}

type Section = 'academic' | 'services';

interface AcademicItem {
  id: string;
  title: string;
  emoji: string;
  color: string;
  section: Section;
  emptyLabel: string;
  route?: keyof RootStackParamList;
  params?: any;
  subtitle?: string;
}

const ROLE_LABEL: Record<'teacher' | 'student' | 'parent', string> = {
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export default function HomeScreen({ route, navigation }: Props) {
  const { initialRole, userId } = route?.params || {};

  const [role, setRole] = useState<'teacher' | 'student' | 'parent'>(
    initialRole || 'teacher'
  );

  const [accountCards, setAccountCards] = useState<DashboardCard[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [profileLoading, setProfileLoading] = useState(!!userId);
  const [children, setChildren] = useState<AppUser[]>([]);

  useEffect(() => {
    const loadRole = async () => {
      const savedRole = await getToken('user_role');

      if (
        savedRole === 'teacher' ||
        savedRole === 'student' ||
        savedRole === 'parent'
      ) {
        setRole(savedRole);
      }
    };

    loadRole();
  }, []);

  React.useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  React.useEffect(() => {
    DashboardService.getDashboardCards(role).then(setAccountCards);
  }, [role]);

  React.useEffect(() => {
    if (!userId) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const fetchProfile =
      role === 'teacher'
        ? ProfileService.getTeacherProfile(userId)
        : role === 'parent'
        ? ProfileService.getParentProfile(userId)
        : ProfileService.getStudentProfile(userId);

  fetchProfile.then((profile) => {
      if (profile) setDisplayName(profile.full_name);
      if (profile && role === 'parent' && 'children' in profile) {
        setChildren(profile.children || []);
      }
      setProfileLoading(false);
    });
  }, [role, userId]);

  const getAcademicItems = (): AcademicItem[] => {
    const baseItems: AcademicItem[] = [
      { id: '1', title: 'Teachers', emoji: '👩‍🏫', color: '#FCE7F3', section: 'services', emptyLabel: 'No teacher directory available.' },
      { id: '2', title: 'Syllabus', emoji: '📖', color: '#F3F4F6', section: 'academic', emptyLabel: 'No syllabus available.' },
      { id: '3', title: 'Time Table', emoji: '🗓️', color: '#EFF6FF', section: 'services', emptyLabel: 'No timetable available.' },
      {
        id: '4',
        title: 'Assignments',
        emoji: '📝',
        color: '#FFF9E6',
        section: 'academic',
        emptyLabel: 'No assignments available.',
        route: 'Assignments'
      },
      {
        id: '5',
        title: 'Exams',
        emoji: '✍️',
        color: '#FEE4E2',
        section: 'academic',
        emptyLabel: 'No examination records available.',
        route: role === 'teacher' ? 'TeacherMarksEntry' : 'Results'
      },
      {
        id: '6',
        title: 'Marks',
        emoji: '📊',
        color: '#E0F2FE',
        section: 'academic',
        emptyLabel: 'No marks available.',
        route: role === 'teacher' ? 'TeacherMarksEntry' : 'Results'
      },
    ];

    if (role === 'teacher') {
      return [
        { id: 't_attendance', title: 'Attendance', emoji: '📋', color: '#ECFDF5', section: 'academic', emptyLabel: 'No attendance records available.', route: 'Attendance' },
        { id: 't0', title: 'Students', emoji: '🧑‍🎓', color: '#E0F2FE', section: 'services', emptyLabel: 'No student directory available.' },
        ...baseItems
      ];
    } else if (role === 'parent') {
      return [
        {
          id: 'p_attendance',
          title: 'Attendance',
          emoji: '📋',
          color: '#ECFDF5',
          section: 'academic',
          emptyLabel: 'No attendance records available.',
          route: 'Attendance'
        },
        {
          id: 'p_results',
          title: 'Marks',
          emoji: '📊',
          color: '#E0F2FE',
          section: 'academic',
          emptyLabel: 'No marks available.',
          route: 'Results'
        },
        {
          id: 'p0',
          title: 'My Child',
          emoji: '🧒',
          color: '#FEF3C7',
          section: 'services',
          emptyLabel: 'No linked student record found.',
          ...(children[0]
            ? {
                route: 'StudentProfile',
                params: { userId: children[0].id, title: `${children[0].full_name}'s Profile` },
                subtitle: children[0].full_name,
              }
            : {}),
        },
        ...baseItems.filter((item) => item.id !== '5' && item.id !== '6')
      ];
    } else {
      return [
        {
          id: 's_attendance',
          title: 'Attendance',
          emoji: '📋',
          color: '#ECFDF5',
          section: 'academic',
          emptyLabel: 'No attendance records available.',
          route: 'Attendance'
        },
        {
          id: 's_leave',
          title: 'Apply Leave',
          emoji: '✉️',
          color: '#FFF6ED',
          section: 'services',
          emptyLabel: 'No leave requests submitted.',
          route: 'Leave'
        },
        ...baseItems
      ];
    }
  };

  const handlePressItem = (item: AcademicItem) => {
    if (item.route) {
      navigation.navigate(item.route as any, item.params);
    } else {
      Alert.alert(
        'Module Placeholder',
        `The "${item.title}" screen will be integrated by the assigned team member.`,
        [{ text: 'OK' }]
      );
    }
  };

  const allItems = getAcademicItems();
  const academicItems = allItems.filter((item) => item.section === 'academic');
  const serviceItems = allItems.filter((item) => item.section === 'services');

  const showLinkBanner =
    role !== 'teacher' && !profileLoading && (!userId || !displayName);

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const nameForAvatar = displayName || ROLE_LABEL[role];
  const avatarLetter = nameForAvatar.trim().charAt(0).toUpperCase() || 'U';

  // Effective userId — used for profile navigation
  const effectiveUserId = userId || undefined;

  const renderCard = (item: AcademicItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handlePressItem(item)}
    >
      <View style={[styles.cardTopBar, { backgroundColor: item.color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.cardIconCircle, { backgroundColor: item.color }]}>
            <Text style={styles.cardEmoji}>{item.emoji}</Text>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        {item.route ? (
          <View style={styles.cardEmptyState}>
            <Text style={styles.cardReadyLabel}>{item.subtitle || 'View details'}</Text>
            <Text style={styles.cardArrow}>→</Text>
          </View>
        ) : (
          <View style={styles.cardEmptyState}>
            <Text style={styles.cardEmptyEmoji}>{item.emoji}</Text>
            <Text style={styles.cardEmptyLabel}>{item.emptyLabel}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    // SafeAreaView wraps the entire screen so the notch/camera area gets the blue header color
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#2D2C72" />

      {/* Header sits directly at the top inside SafeAreaView */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitleText}>Dashboard</Text>

        <TouchableOpacity
          style={styles.headerBellButton}
          onPress={() => Alert.alert('Notifications', 'No new notifications.')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          <View style={styles.headerBellBadge} />
        </TouchableOpacity>
      </View>

      {/* Content area with white background */}
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Welcome Card Banner */}
          <View style={styles.welcomeBanner}>
            <View style={styles.welcomeInfo}>
              <Text style={styles.welcomeLabel}>Welcome back,</Text>
              <Text style={styles.welcomeName}>{displayName || `${ROLE_LABEL[role]} User`}</Text>
              <Text style={styles.welcomeDate}>{todayLabel}</Text>
            </View>
            <View style={styles.welcomeAvatarCircle}>
              <Text style={styles.welcomeAvatarText}>{avatarLetter}</Text>
            </View>
          </View>

          {/* Linked record banner */}
          {showLinkBanner && (
            <View style={styles.linkBanner}>
              <Text style={styles.linkBannerEmoji}>👨‍👩‍👧</Text>
              <Text style={styles.linkBannerTitle}>
                {role === 'parent' ? 'No linked student record found.' : 'No linked profile found.'}
              </Text>
              <Text style={styles.linkBannerSubtitle}>
                {role === 'parent'
                  ? "This parent account isn't linked to any student yet."
                  : "This account isn't linked to a profile yet."}
              </Text>
            </View>
          )}

          {/* Academic Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Overview</Text>
            <Text style={styles.sectionSubtitle}>Attendance, marks, assignments, and exams at a glance</Text>
            <View style={styles.cardGrid}>
              {academicItems.map(renderCard)}
            </View>
          </View>

          {/* School Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>School Services</Text>
            <Text style={styles.sectionSubtitle}>Fees, timetable, remarks, and communication from school</Text>
            <View style={styles.cardGrid}>
              {serviceItems.map(renderCard)}
            </View>
          </View>

          {/* My Account */}
          {accountCards.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Account</Text>
              <View style={styles.cardGrid}>
                {accountCards.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (card.route === 'Settings') {
                        navigation.navigate('Settings');
                      } else if (
                        card.route === 'StudentProfile' ||
                        card.route === 'TeacherProfile' ||
                        card.route === 'ParentProfile'
                      ) {
                        if (effectiveUserId) {
                          navigation.navigate(card.route, { userId: effectiveUserId });
                        } else {
                          Alert.alert('Profile Unavailable', 'Could not find your profile. Please log in again.');
                        }
                      } else {
                        Alert.alert(
                          'Screen Placeholder',
                          `The "${card.title}" screen is being built next.`,
                          [{ text: 'OK' }]
                        );
                      }
                    }}
                  >
                    <View style={[styles.cardTopBar, { backgroundColor: card.color }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardHeaderRow}>
                        <View style={[styles.cardIconCircle, { backgroundColor: card.color }]}>
                          <Text style={styles.cardEmoji}>{card.emoji}</Text>
                        </View>
                        <Text style={styles.cardTitle}>{card.title}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* E-Learning Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>E-Learning</Text>
            <View style={styles.elearningBanner}>
              <Text style={styles.bannerTitle}>Virtual Classroom Live</Text>
              <Text style={styles.bannerDesc}>Connect with your subject teachers in video conferences.</Text>
              <TouchableOpacity style={styles.bannerBtn} onPress={() => Alert.alert('E-Learning', 'E-learning sessions are not scheduled today.')}>
                <Text style={styles.bannerBtnText}>Join Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SafeAreaView takes blue color so notch/camera area matches the header
  safeContainer: {
    flex: 1,
    backgroundColor: '#2D2C72',
  },
  // Content container below the header — white background
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: '#2D2C72',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    height: 56,
  },
  headerTitleText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  headerBellButton: {
    padding: SPACING.xs,
    position: 'relative',
  },
  headerBellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
  },
  welcomeName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  welcomeDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  welcomeAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  welcomeAvatarText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#4F46E5',
  },

  profileContainer: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  dashboardSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bellOutline: {
    width: 16,
    height: 18,
    alignItems: 'center',
  },
  bellCap: {
    width: 4,
    height: 2,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  bellBody: {
    width: 14,
    height: 10,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginTop: 1,
  },
  bellClapper: {
    width: 6,
    height: 3,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    marginTop: 1,
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FEE4E2',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  roleSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  roleTabActive: {
    backgroundColor: COLORS.primary,
  },
  roleTabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  roleTabTextActive: {
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHT.bold,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  linkBanner: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    borderTopColor: '#EFF6FF',
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  linkBannerEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  linkBannerTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  linkBannerSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.md,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardTopBar: {
    height: 4,
    width: '100%',
  },
  cardBody: {
    padding: SPACING.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  cardEmoji: {
    fontSize: 15,
  },
  cardTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  cardEmptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  cardEmptyEmoji: {
    fontSize: 22,
    marginBottom: SPACING.xs,
    opacity: 0.5,
  },
  cardEmptyLabel: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  cardEmptySubLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  cardReadyLabel: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  cardArrow: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 2,
  },
  elearningBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  bannerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  bannerBtnText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
  },
});