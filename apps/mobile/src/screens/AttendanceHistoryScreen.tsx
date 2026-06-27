import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AttendanceService, StudentHistoryRecord, AttendanceStatus } from '../services/api';
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
  const { classId } = route.params;

  // Filter States (matching dribbble layout)
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [searchQuery, setSearchQuery] = useState<string>('Lucas Henry');
  const [standard, setStandard] = useState<string>('Standard - 8');
  const [division, setDivision] = useState<string>('Division - C');

  // Calendar States
  const [currentYear, setCurrentYear] = useState<number>(2023);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // Default to May (from screenshot)
  const [attendanceRecords, setAttendanceRecords] = useState<StudentHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchedName, setSearchedName] = useState<string>('Lucas Henry');

  // Load records from the service
  const fetchMonthlyRecords = async (name: string, mYear: number, mMonth: number) => {
    setLoading(true);
    try {
      const records = await AttendanceService.getStudentMonthlyAttendance(
        name,
        classId,
        mYear,
        mMonth
      );
      setAttendanceRecords(records);
      setSearchedName(name);
    } catch (error) {
      console.error('Error fetching student calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyRecords(searchQuery, currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handleSearch = () => {
    fetchMonthlyRecords(searchQuery, currentYear, currentMonth);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentYear;
    const monthIndex = currentMonth - 1; // 0-indexed

    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // Day of week (0-6)
    const daysInMonth = new Date(year, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

    const days: { dayNumber: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Pad previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = monthIndex === 0 ? 12 : monthIndex;
      const prevYear = monthIndex === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
      
      days.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateStr,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${currentMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      days.push({
        dayNumber: i,
        isCurrentMonth: true,
        dateStr,
      });
    }

    // Pad next month days to fit exactly 42 slots (6 rows)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const nextMonth = monthIndex === 11 ? 1 : currentMonth + 1;
      const nextYear = monthIndex === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      
      days.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateStr,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Map status to visual config
  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return COLORS.present;
      case 'absent':
        return COLORS.absent;
      case 'late':
        return COLORS.late;
      case 'earlyOff':
        return COLORS.earlyOff;
      case 'festival':
        return COLORS.festival;
      default:
        return 'transparent';
    }
  };

  // Check status for a specific date string
  const getDateStatus = (dateStr: string): AttendanceStatus | null => {
    const record = attendanceRecords.find((r) => r.date === dateStr);
    return record ? record.status : null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Visual Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <TouchableOpacity style={styles.bellButton}>
          <View style={styles.bellOutline}>
            <View style={styles.bellCap} />
            <View style={styles.bellBody} />
            <View style={styles.bellClapper} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Role Selector Radio Buttons */}
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButtonWrapper}
            onPress={() => setRole('student')}
          >
            <View style={[styles.radioCircle, role === 'student' && styles.radioCircleChecked]}>
              {role === 'student' && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.radioLabel, role === 'student' && styles.radioLabelActive]}>Student</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButtonWrapper}
            onPress={() => setRole('teacher')}
          >
            <View style={[styles.radioCircle, role === 'teacher' && styles.radioCircleChecked]}>
              {role === 'teacher' && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.radioLabel, role === 'teacher' && styles.radioLabelActive]}>Teachers</Text>
          </TouchableOpacity>
        </View>

        {/* Filters Form */}
        <View style={styles.formContainer}>
          {/* Search Box */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search student name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          {/* Side-by-side Dropdowns */}
          <View style={styles.dropdownsRow}>
            <TouchableOpacity style={styles.dropdownField} activeOpacity={0.8}>
              <Text style={styles.dropdownText}>{standard}</Text>
              <Text style={styles.chevronIcon}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dropdownField} activeOpacity={0.8}>
              <Text style={styles.dropdownText}>{division}</Text>
              <Text style={styles.chevronIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Search button */}
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Month Navigator Header */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity style={styles.navArrow} onPress={handlePrevMonth}>
              <Text style={styles.navArrowText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </Text>
            <TouchableOpacity style={styles.navArrow} onPress={handleNextMonth}>
              <Text style={styles.navArrowText}>›</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.calendarLoadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              {/* Weekday Labels */}
              <View style={styles.weekdaysRow}>
                {WEEKDAYS.map((day) => (
                  <Text key={day} style={styles.weekdayText}>
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {calendarDays.map((item, index) => {
                  const status = getDateStatus(item.dateStr);
                  const statusColor = status ? getStatusColor(status) : 'transparent';
                  const isToday =
                    item.dateStr === new Date().toISOString().split('T')[0];

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

              {/* Legends Row */}
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
                  <View style={[styles.legendBox, { backgroundColor: COLORS.festival }]} />
                  <Text style={styles.legendLabel}>Festival</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: COLORS.earlyOff }]} />
                  <Text style={styles.legendLabel}>Early Off</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendBox, { backgroundColor: COLORS.late }]} />
                  <Text style={styles.legendLabel}>Late</Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
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
  radioContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.xl,
  },
  radioButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  radioCircleChecked: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioLabel: {
    fontSize: FONT_SIZE.sm,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  dropdownText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  chevronIcon: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  searchBtnText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
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
  calendarLoadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
