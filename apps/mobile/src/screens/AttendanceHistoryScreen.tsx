import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../components/Header/AppHeader';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AttendanceService, DailyAttendance, Student, StudentHistoryRecord, AttendanceStatus } from '../services/api';
import { API_CONFIG } from '../config/apiConfig';
import attendanceApi from '../services/attendanceApi';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type AttendanceHistoryScreenRouteProp = RouteProp<RootStackParamList, 'AttendanceHistory'>;
type AttendanceHistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttendanceHistory'
>;

interface Props {
  route: AttendanceHistoryScreenRouteProp;
  navigation: AttendanceHistoryScreenNavigationProp;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function AttendanceHistoryScreen({ route, navigation }: Props) {
  const classId = route?.params?.classId;
  const defaultStudentName = route?.params?.defaultStudentName;

  // Search Filter States
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [searchQuery, setSearchQuery] = useState<string>(defaultStudentName || ''); // Default empty or student name
  const [activeSearch, setActiveSearch] = useState<string>(defaultStudentName || ''); // Confirmed search query
  const [standard] = useState<string>('Standard - 8');
  const [division] = useState<string>('Division - C');

  // Class History mode states
  const [classHistory, setClassHistory] = useState<DailyAttendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Student Calendar mode states
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [studentRecords, setStudentRecords] = useState<StudentHistoryRecord[]>([]);
  const [targetStudent, setTargetStudent] = useState<Student | null>(null);

  // Loading state
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch initial class-wide history
  const loadClassLogs = async () => {
    setLoading(true);
    try {
      const [historyLogs, studentList] = await Promise.all([
        attendanceApi.viewAttendance(classId),
        attendanceApi.getStudents(classId),
      ]);
      setClassHistory(historyLogs);
      setStudents(studentList);
      setTargetStudent(null);
    } catch (error) {
      console.error('Error fetching class history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial user setup
  useEffect(() => {
    const initUser = async () => {
      const { getToken } = await import('../utils/security');
      const savedRole = await getToken('user_role');
      if (savedRole === 'student' || savedRole === 'teacher' || savedRole === 'parent') {
        setRole(savedRole as any);
      }
      
      if (!activeSearch) {
        if (savedRole === 'student') {
          const userId = await getToken('user_id');
          if (userId) {
            const { ProfileService } = await import('../services/profileApi');
            const profile = await ProfileService.getStudentProfile(userId);
            if (profile) {
              setSearchQuery(profile.full_name);
              setActiveSearch(profile.full_name);
              return;
            }
          }
        } else if (savedRole === 'parent') {
      const userId = await getToken('user_id');
          if (userId) {
            const { ProfileService } = await import('../services/profileApi');
            const profile = await ProfileService.getParentProfile(userId);
            if (profile && profile.children && profile.children.length > 0) {
              // Default to first child for calendar view
              setSearchQuery(profile.children[0].full_name);
              setActiveSearch(profile.children[0].full_name);
              return;
            }
          }
        }
        loadClassLogs();
      } else {
        loadStudentCalendar();
      }
    };
    initUser();
  }, [classId, activeSearch, currentYear, currentMonth]);

  // Load calendar records for a specific student search
  const loadStudentCalendar = async () => {
    setLoading(true);
    try {
      const { getToken } = await import('../utils/security');
      const savedRole = await getToken('user_role');
      const userId = await getToken('user_id');
      
      let foundStudent: Student | undefined;
const id = String(userId);
      if (savedRole === 'student' && userId) {
        foundStudent = {
          id,
          name: activeSearch,
          rollNumber: id.split('-').pop()?.toUpperCase().replace(/^0+/, '') ??
    id.substring(0, 6),
          gender: 'M'
        };
      } else if (savedRole === 'parent' && userId) {
        const { ProfileService } = await import('../services/profileApi');
        const profile = await ProfileService.getParentProfile(userId);
       const child = profile?.children?.find(
  (c: any) =>
    c.full_name.toLowerCase().includes(activeSearch.toLowerCase())
);

if (child) {
  const childId = String(child.id);

  foundStudent = {
    id: childId,
    name: child.full_name,
    rollNumber:
      childId.split('-').pop()?.toUpperCase().replace(/^0+/, '') ??
      childId.substring(0, 6),
    gender: 'M',
  };
}
      } else {
        const studentList = await attendanceApi.getStudents(classId);
        setStudents(studentList);
        foundStudent = studentList.find((s) =>
          s.name.toLowerCase().includes(activeSearch.toLowerCase())
        );
      }

      if (foundStudent) {
        setTargetStudent(foundStudent);
        
        let records: StudentHistoryRecord[] = [];
        if (API_CONFIG.BASE_URL) {
          const responseData = await attendanceApi.viewAttendance(classId);
          records = responseData
            .map((daily: any) => {
              const itemDate = new Date(daily.date);
              if (
                itemDate.getFullYear() === currentYear &&
                (itemDate.getMonth() + 1) === currentMonth
              ) {
                const stdRecord = daily.records?.find((r: any) => r.studentId === foundStudent.id);
                if (stdRecord) {
                  return { date: daily.date, status: stdRecord.status as AttendanceStatus };
                }
              }
              return null;
            })
            .filter(Boolean) as StudentHistoryRecord[];
        } else {
          records = await AttendanceService.getStudentMonthlyAttendance(
            foundStudent.name,
            classId,
            currentYear,
            currentMonth
          );
        }
        setStudentRecords(records);
      } else {
        setTargetStudent(null);
        setStudentRecords([]);
      }
    } catch (error) {
      console.error('Error loading student calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  const toggleExpand = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  const getStudentInfo = (studentId: string) => {
    return students.find((s) => s.id === studentId);
  };

  const getDayStats = (records: any[]) => {
    let present = 0;
    let absent = 0;
    let late = 0;

    records.forEach((r) => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
    });

    const total = records.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { present, absent, late, earlyOff: 0, festival: 0, rate };
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'present':
        return { bg: COLORS.presentLight, text: COLORS.present, border: COLORS.present };
      case 'absent':
        return { bg: COLORS.absentLight, text: COLORS.absent, border: COLORS.absent };
      case 'late':
        return { bg: COLORS.lateLight, text: COLORS.late, border: COLORS.late };
      case 'earlyOff':
        return { bg: COLORS.earlyOffLight, text: COLORS.earlyOff, border: COLORS.earlyOff };
      case 'festival':
        return { bg: COLORS.festivalLight, text: COLORS.festival, border: COLORS.festival };
      default:
        return { bg: COLORS.background, text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  // Calendar Day Generation
  const calendarDays = useMemo(() => {
    const year = currentYear;
    const monthIndex = currentMonth - 1;

    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

    const days: { dayNumber: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Pad prev month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = monthIndex === 0 ? 12 : monthIndex;
      const prevYear = monthIndex === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
      days.push({ dayNumber: dayNum, isCurrentMonth: false, dateStr });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${currentMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({ dayNumber: i, isCurrentMonth: true, dateStr });
    }

    // Pad next month
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextMonth = monthIndex === 11 ? 1 : currentMonth + 1;
      const nextYear = monthIndex === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({ dayNumber: i, isCurrentMonth: false, dateStr });
    }

    return days;
  }, [currentYear, currentMonth]);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return COLORS.present;
      case 'absent': return COLORS.absent;
      case 'late': return COLORS.late;
      case 'earlyOff': return COLORS.earlyOff;
      case 'festival': return COLORS.festival;
      default: return 'transparent';
    }
  };

  const getStudentDateStatus = (dateStr: string): AttendanceStatus | null => {
    const record = studentRecords.find((r) => r.date === dateStr);
    return record ? record.status : null;
  };

  // Class History Item Renderer
  const renderClassHistoryItem = ({ item }: { item: DailyAttendance }) => {
    const isExpanded = expandedDate === item.date;
    const stats = getDayStats(item.records);

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => toggleExpand(item.date)}
          activeOpacity={0.7}
        >
          <View style={styles.titleRow}>
            <Text style={styles.dateText}>{item.date}</Text>
            <View style={styles.rateBadge}>
              <Text style={styles.rateText}>{stats.rate}% Attendance</Text>
            </View>
          </View>

          <View style={styles.statsSummaryBar}>
            <Text style={[styles.summaryItem, { color: COLORS.present }]}>P: {stats.present}</Text>
            <Text style={[styles.summaryItem, { color: COLORS.late }]}>L: {stats.late}</Text>
            <Text style={[styles.summaryItem, { color: COLORS.absent }]}>A: {stats.absent}</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${stats.rate}%`,
                  backgroundColor: stats.rate >= 90 ? COLORS.present : COLORS.late,
                },
              ]}
            />
          </View>

          <Text style={styles.expandLabel}>
            {isExpanded ? 'Hide Details' : 'Tap to view student list'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.detailsContainer}>
            <View style={styles.divider} />
            <Text style={styles.detailsTitle}>Student Status list</Text>
            {item.records.map((rec) => {
              const std = getStudentInfo(rec.studentId);
              const statusStyles = getStatusStyle(rec.status);

              return (
                <View key={rec.studentId} style={styles.rosterRow}>
                  <View style={styles.rosterLeft}>
                    <Text style={styles.studentNameText}>{std?.name || 'Unknown Student'}</Text>
                    <Text style={styles.rollNumberText}>Roll No: {std?.rollNumber || '-'}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusIndicatorBadge,
                      { backgroundColor: statusStyles.bg, borderColor: statusStyles.border },
                    ]}
                  >
                    <Text style={[styles.statusIndicatorText, { color: statusStyles.text }]}>
                      {rec.status === 'earlyOff' ? 'EARLY OFF' : rec.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
     <StatusBar barStyle="light-content" />

<AppHeader
  title="Attendance History"
  showBackButton
/>

      <View style={styles.container}>
      {/* Top Search Controls (Visible only for Teachers/Admin) */}
      {role === 'teacher' && (
        <View style={styles.filterSection}>

          <View style={styles.formContainer}>
            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search student name (e.g. Lucas Henry)..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={COLORS.textMuted}
              />
              {activeSearch.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} style={styles.clearSearchBtn}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.dropdownsRow}>
              <View style={styles.dropdownField}>
                <Text style={styles.dropdownText}>{standard}</Text>
                <Text style={styles.chevronIcon}>▼</Text>
              </View>

              <View style={styles.dropdownField}>
                <Text style={styles.dropdownText}>{division}</Text>
                <Text style={styles.chevronIcon}>▼</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching logs...</Text>
        </View>
      ) : activeSearch ? (
        /* MODE 2: Individual Student Monthly Calendar View */
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {targetStudent ? (
            <View style={styles.studentProfileSummary}>
              <Text style={styles.studentProfileName}>{targetStudent.name}</Text>
              {targetStudent.rollNumber && targetStudent.rollNumber !== 'N/A' ? (
                <Text style={styles.studentProfileRoll}>Roll Number: {targetStudent.rollNumber}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.studentProfileSummary}>
              <Text style={styles.notFoundText}>No student found matching "{activeSearch}"</Text>
            </View>
          )}

          {targetStudent && (
            <View style={styles.calendarCard}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity style={styles.navArrow} onPress={() => {
                  if (currentMonth === 5 && currentYear === 2023) {
                    // Quick alert if shifting away from May 2023 to explain dynamic mock
                  }
                  if (currentMonth === 1) {
                    setCurrentMonth(12);
                    setCurrentYear((prev) => prev - 1);
                  } else {
                    setCurrentMonth((prev) => prev - 1);
                  }
                }}>
                  <Text style={styles.navArrowText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthLabel}>
                  {MONTH_NAMES[currentMonth - 1]} {currentYear}
                </Text>
                <TouchableOpacity style={styles.navArrow} onPress={() => {
                  if (currentMonth === 12) {
                    setCurrentMonth(1);
                    setCurrentYear((prev) => prev + 1);
                  } else {
                    setCurrentMonth((prev) => prev + 1);
                  }
                }}>
                  <Text style={styles.navArrowText}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((day) => (
                  <Text key={day} style={styles.weekdayText}>{day}</Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((item, index) => {
                  const status = getStudentDateStatus(item.dateStr);
                  const statusColor = status ? getStatusColor(status) : 'transparent';
                  const isToday = item.dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <View key={index} style={styles.dayCell}>
                      <View
                        style={[
                          styles.dayCircle,
                          status && { backgroundColor: statusColor },
                          isToday && !status && styles.todayCircleBorder,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumberText,
                            !item.isCurrentMonth && styles.mutedDayNumberText,
                            status && styles.markedDayNumberText,
                          ]}
                        >
                          {item.dayNumber}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.legendsContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: COLORS.present }]} />
                  <Text style={styles.legendLabel}>Present</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: COLORS.absent }]} />
                  <Text style={styles.legendLabel}>Absent</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: COLORS.late }]} />
                  <Text style={styles.legendLabel}>Late</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        /* MODE 1: Default Class-Wide History Log List */
        <FlatList
          data={classHistory}
          keyExtractor={(item) => item.date}
          renderItem={renderClassHistoryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No class logs found. Please mark attendance first.</Text>
            </View>
          }
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#2D2C72',
  },
  
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  radioContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.xl,
  },
  radioButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  radioCircleChecked: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  radioLabelActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  formContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 42,
  },
  searchIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  dropdownsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dropdownField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 42,
  },
  dropdownText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  chevronIcon: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  searchBtnText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.semibold,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  studentProfileSummary: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  studentProfileName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  studentProfileRoll: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  notFoundText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.absent,
    fontWeight: FONT_WEIGHT.medium,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  rateBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rateText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  statsSummaryBar: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semibold,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    marginBottom: 6,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  expandLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: FONT_WEIGHT.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  detailsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: '#FAFBFC',
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginVertical: SPACING.sm,
  },
  rosterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  rosterLeft: {
    flex: 1,
  },
  studentNameText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
  },
  rollNumberText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  statusIndicatorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    width: 90,
    alignItems: 'center',
  },
  statusIndicatorText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowText: {
    fontSize: 24,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  monthLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircleBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayNumberText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
  },
  mutedDayNumberText: {
    color: COLORS.textMuted,
  },
  markedDayNumberText: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.bold,
  },
  legendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
});
