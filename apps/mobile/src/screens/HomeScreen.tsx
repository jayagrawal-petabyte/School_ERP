import React from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AttendanceList'>;

interface Props {
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

export default function HomeScreen({ navigation }: Props) {
  const academicItems: AcademicItem[] = [
    { id: '1', title: 'Students', emoji: '🧑‍🎓', color: '#E0F2FE' },
    { id: '2', title: 'Teachers', emoji: '👩‍🏫', color: '#FCE7F3' },
    { 
      id: '3', 
      title: 'Attendance', 
      emoji: '📋', 
      color: '#ECFDF5',
      route: 'AttendanceList'
    },
    { id: '4', title: 'Syllabus', emoji: '📖', color: '#F3F4F6' },
    { id: '5', title: 'Time Table', emoji: '🗓️', color: '#EFF6FF' },
    { 
      id: '6', 
      title: 'Assignments', 
      emoji: '📝', 
      color: '#FFF9E6',
      route: 'AssignmentList',
      params: { classId: '1', className: 'Standard - 8 - C' }
    },
    { id: '7', title: 'Exams', emoji: '✍️', color: '#FEE4E2' },
    { id: '8', title: 'Results', emoji: '📊', color: '#E0F2FE' },
    { id: '9', title: 'Fees', emoji: '💵', color: '#ECFDF5' },
    { id: '10', title: 'Events', emoji: '📅', color: '#FFF6ED' },
    { id: '11', title: 'Inbox', emoji: '✉️', color: '#FFF9E6' },
    { id: '12', title: 'Ask Doubt', emoji: '🙋', color: '#F3F4F6' },
  ];

  const handlePressItem = (item: AcademicItem) => {
    if (item.route) {
      // Navigate to the module
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

      {/* Header Profile Info (Michael Smith / Sofia Morales) */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Text style={styles.greeting}>Hello</Text>
          <Text style={styles.userName}>Sofia Morales</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={() => Alert.alert('Notifications', 'No new notifications.')}>
          <View style={styles.bellOutline}>
            <View style={styles.bellCap} />
            <View style={styles.bellBody} />
            <View style={styles.bellClapper} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Input block */}
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
            {academicItems.map((item) => (
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

        {/* E-Learning Section Header */}
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
    marginTop: SPACING.sm,
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
