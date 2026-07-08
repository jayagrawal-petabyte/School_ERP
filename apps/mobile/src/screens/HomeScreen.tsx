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

interface AcademicItem {
  id: string;
  title: string;
  emoji: string;
  color: string;
  route?: keyof RootStackParamList;
  params?: any;
}

export default function HomeScreen({ route, navigation }: Props) {
  const { initialRole } = route.params || {};
  const [role, setRole] = useState<'teacher' | 'student' | 'parent'>(initialRole || 'teacher');
  const [accountCards, setAccountCards] = useState<DashboardCard[]>([]);

  React.useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  React.useEffect(() => {
    DashboardService.getDashboardCards(role).then(setAccountCards);
  }, [role]);

  const getAcademicItems = (): AcademicItem[] => {
    const baseItems: AcademicItem[] = [
      { id: '1', title: 'Teachers', emoji: '👩‍🏫', color: '#FCE7F3' },
      { id: '2', title: 'Syllabus', emoji: '📖', color: '#F3F4F6' },
      { id: '3', title: 'Time Table', emoji: '🗓️', color: '#EFF6FF' },
      { 
        id: '4', 
        title: 'Assignments', 
        emoji: '📝', 
        color: '#FFF9E6',
        route: 'AssignmentList',
        params: { classId: '1', className: 'Standard - 8 - C' }
      },
      { 
        id: '5', 
        title: 'Exams', 
        emoji: '✍️', 
        color: '#FEE4E2',
        route: role === 'teacher' ? 'TeacherMarksEntry' : 'StudentResults'
      },
      { 
        id: '6', 
        title: 'Results', 
        emoji: '📊', 
        color: '#E0F2FE',
        route: role === 'teacher' ? 'TeacherMarksEntry' : 'StudentResults'
      },
      { id: '7', title: 'Fees', emoji: '💵', color: '#ECFDF5' },
      { id: '8', title: 'Events', emoji: '📅', color: '#FFF6ED' },
      { id: '9', title: 'Inbox', emoji: '✉️', color: '#FFF9E6' },
      { id: '10', title: 'Ask Doubt', emoji: '🙋', color: '#F3F4F6' },
    ];

    if (role === 'teacher') {
      // Teacher panel items
      return [
        { id: 't0', title: 'Students', emoji: '🧑‍🎓', color: '#E0F2FE' },
        { 
          id: 't_attendance', 
          title: 'Attendance', 
          emoji: '📋', 
          color: '#ECFDF5',
          route: 'AttendanceList'
        },
        ...baseItems
      ];
    } else if (role === 'parent') {
      // Parent panel items
      return [
        { id: 'p0', title: 'My Child', emoji: '🧒', color: '#FEF3C7' },
        {
          id: 'p_attendance',
          title: 'Attendance',
          emoji: '📋',
          color: '#ECFDF5',
          route: 'AttendanceHistory',
          params: { classId: '1', className: 'Standard - 8 - C', defaultStudentName: 'Sofia Morales' }
        },
        {
          id: 'p_results',
          title: 'Results',
          emoji: '📊',
          color: '#E0F2FE',
          route: 'StudentResults'
        },
        ...baseItems.filter((item) => item.id !== '5' && item.id !== '6')
      ];
    } else {
      // Student panel items
      return [
        { 
          id: 's_leave', 
          title: 'Apply Leave', 
          emoji: '✉️', 
          color: '#FFF6ED',
          route: 'LeaveRequest'
        },
        { 
          id: 's_attendance', 
          title: 'Attendance', 
          emoji: '📋', 
          color: '#ECFDF5',
          route: 'AttendanceHistory',
          params: { classId: '1', className: 'Standard - 8 - C', defaultStudentName: 'Sofia Morales' }
        },
        ...baseItems
      ];
    }
  };

  const { userId } = route.params || {};
  const [displayName, setDisplayName] = useState('');

  React.useEffect(() => {
    if (!userId) return;

    if (role === 'teacher') {
      ProfileService.getTeacherProfile(userId).then((profile) => {
        if (profile) setDisplayName(profile.full_name);
      });
    } else if (role === 'parent') {
      ProfileService.getParentProfile(userId).then((profile) => {
        if (profile) setDisplayName(profile.full_name);
      });
    } else {
      ProfileService.getStudentProfile(userId).then((profile) => {
        if (profile) setDisplayName(profile.full_name);
      });
    }
  }, [role, userId]);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Profile Info */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Text style={styles.greeting}>Hello</Text>
          <Text style={styles.userName}>
            {displayName || (role === 'teacher' ? 'Mrs. Shradha Sen' : role === 'parent' ? 'Mr. Carlos Morales' : 'Sofia Morales')}
          </Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={() => Alert.alert('Notifications', 'No new notifications.')}>
          <View style={styles.bellOutline}>
            <View style={styles.bellCap} />
            <View style={styles.bellBody} />
            <View style={styles.bellClapper} />
          </View>
        </TouchableOpacity>
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
        {/* Search Input bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchPlaceholder}>Search</Text>
          </View>
        </View>

        {/* Academics Grid Section */}
        <View style={styles.academicsSection}>
          <Text style={styles.sectionTitle}>Academics</Text>
          
          <View style={styles.grid}>
            {getAcademicItems().map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridItem}
                activeOpacity={0.7}
                onPress={() => handlePressItem(item)}
              >
                <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                  <Text style={styles.gridEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.gridLabel}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Account Section — Profile & Settings, from ProfileService/DashboardService */}
        <View style={styles.academicsSection}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <View style={styles.grid}>
            {accountCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.gridItem}
                activeOpacity={0.7}
                onPress={() => Alert.alert(
                  'Screen Placeholder',
                  `The "${card.title}" screen is being built next.`,
                  [{ text: 'OK' }]
                )}
              >
                <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                  <Text style={styles.gridEmoji}>{card.emoji}</Text>
                </View>
                <Text style={styles.gridLabel}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* E-Learning Section */}
        
        <View style={styles.elearningSection}>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginTop: 1,
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
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 44,
    ...SHADOWS.sm,
  },
  searchIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  searchPlaceholder: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  academicsSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.md,
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  gridEmoji: {
    fontSize: 22,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  elearningSection: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
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
