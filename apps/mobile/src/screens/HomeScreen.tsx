import React, { useState } from 'react';
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
import { DashboardCard } from '../types';
import { DashboardService, ProfileService } from '../services/profileApi';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  route: HomeScreenRouteProp;
  navigation: HomeScreenNavigationProp;
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
}

const ROLE_LABEL: Record<'teacher' | 'student' | 'parent', string> = {
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export default function HomeScreen({ route, navigation }: Props) {
  const { initialRole, userId } = route.params || {};
  const [role, setRole] = useState<'teacher' | 'student' | 'parent'>(initialRole || 'teacher');
  const [accountCards, setAccountCards] = useState<DashboardCard[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [profileLoading, setProfileLoading] = useState(!!userId);

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
        route: 'AssignmentList',
        params: { classId: '1', className: 'Standard - 8 - C' }
      },
      {
        id: '5',
        title: 'Exams',
        emoji: '✍️',
        color: '#FEE4E2',
        section: 'academic',
        emptyLabel: 'No examination records available.',
        route: role === 'teacher' ? 'TeacherMarksEntry' : 'StudentResults'
      },
      {
        id: '6',
        title: 'Marks',
        emoji: '📊',
        color: '#E0F2FE',
        section: 'academic',
        emptyLabel: 'No marks available.',
        route: role === 'teacher' ? 'TeacherMarksEntry' : 'StudentResults'
      },
    ];

    if (role === 'teacher') {
      return [
        { id: 't_attendance', title: 'Attendance', emoji: '📋', color: '#ECFDF5', section: 'academic', emptyLabel: 'No attendance records available.', route: 'AttendanceList' },
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
          route: 'AttendanceHistory',
          params: { classId: '1', className: 'Standard - 8 - C', defaultStudentName: 'Sofia Morales' }
        },
        {
          id: 'p_results',
          title: 'Marks',
          emoji: '📊',
          color: '#E0F2FE',
          section: 'academic',
          emptyLabel: 'No marks available.',
          route: 'StudentResults'
        },
        { id: 'p0', title: 'My Child', emoji: '🧒', color: '#FEF3C7', section: 'services', emptyLabel: 'No linked student record found.' },
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
          route: 'AttendanceHistory',
          params: { classId: '1', className: 'Standard - 8 - C', defaultStudentName: 'Sofia Morales' }
        },
        {
          id: 's_leave',
          title: 'Apply Leave',
          emoji: '✉️',
          color: '#FFF6ED',
          section: 'services',
          emptyLabel: 'No leave requests submitted.',
          route: 'LeaveRequest'
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
            <Text style={styles.cardReadyLabel}>View details</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Text style={styles.dashboardTitle}>{ROLE_LABEL[role]} Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>{ROLE_LABEL[role]} Portal</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.dateText}>{todayLabel}</Text>
          <TouchableOpacity style={styles.bellButton} onPress={() => Alert.alert('Notifications', 'No new notifications.')}>
            <View style={styles.bellOutline}>
              <View style={styles.bellCap} />
              <View style={styles.bellBody} />
              <View style={styles.bellClapper} />
            </View>
            <View style={styles.bellBadge} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
        </View>
      </View>

      {!initialRole && (
        <View style={styles.roleSwitcherContainer}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'teacher' && styles.roleTabActive]}
            onPress={() => setRole('teacher')}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleTabText, role === 'teacher' && styles.roleTabTextActive]}>
              Teacher Panel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'student' && styles.roleTabActive]}
            onPress={() => setRole('student')}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleTabText, role === 'student' && styles.roleTabTextActive]}>
              Student Panel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'parent' && styles.roleTabActive]}
            onPress={() => setRole('parent')}
            activeOpacity={0.8}
          >
            <Text style={[styles.roleTabText, role === 'parent' && styles.roleTabTextActive]}>
              Parent Panel
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                    if (card.route === 'StudentProfile' && userId) {
                      navigation.navigate('StudentProfile', { userId });
                    } else if (card.route === 'TeacherProfile' && userId) {
                      navigation.navigate('TeacherProfile', { userId });
                    } else if (card.route === 'ParentProfile' && userId) {
                      navigation.navigate('ParentProfile', { userId });
                    } else if (card.route === 'Settings') {
                      navigation.navigate('Settings');
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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