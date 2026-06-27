import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AttendanceService } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type AttendanceReportsScreenRouteProp = RouteProp<RootStackParamList, 'AttendanceReports'>;
type AttendanceReportsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AttendanceReports'
>;

interface Props {
  route: AttendanceReportsScreenRouteProp;
  navigation: AttendanceReportsScreenNavigationProp;
}

type ReportData = Awaited<ReturnType<typeof AttendanceService.getAttendanceReport>>;

export default function AttendanceReportsScreen({ route, navigation }: Props) {
  const { classId } = route.params;

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await AttendanceService.getAttendanceReport(classId);
        setReport(data);
      } catch (error) {
        console.error('Error generating report:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [classId]);

  const criticalStudents = useMemo(() => {
    if (!report) return [];
    return report.studentSummaries.filter((s) => s.percentage < 75);
  }, [report]);

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return COLORS.present;
    if (percentage >= 75) return COLORS.late;
    return COLORS.absent;
  };

  const renderStudentRow = ({ item }: { item: ReportData['studentSummaries'][number] }) => {
    const color = getPercentageColor(item.percentage);

    return (
      <View style={styles.studentRow}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentNameText}>{item.studentName}</Text>
          <Text style={styles.rollText}>Roll No: {item.rollNumber}</Text>
          <Text style={styles.statsText}>
            P: {item.presentCount} | L: {item.lateCount} | A: {item.absentCount} | E: {item.earlyOffCount} | F: {item.festivalCount}
          </Text>
        </View>
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentageText, { color }]}>{item.percentage}%</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Compiling Analytics...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load analytics.</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.scrollContainer}>
      {/* Summary Score Card */}
      <View style={styles.overviewSection}>
        <View style={styles.mainRateCard}>
          <Text style={styles.rateSubtitle}>Average Class Attendance</Text>
          <Text style={styles.rateTitle}>{report.averageAttendanceRate}%</Text>
          <View style={styles.rateProgressBarContainer}>
            <View
              style={[
                styles.rateProgressBarFill,
                { width: `${report.averageAttendanceRate}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.statsCountRow}>
          <View style={styles.countCard}>
            <Text style={styles.countNum}>{report.totalStudents}</Text>
            <Text style={styles.countLabel}>Students Registered</Text>
          </View>
          <View style={styles.countCard}>
            <Text style={styles.countNum}>{report.totalSessions}</Text>
            <Text style={styles.countLabel}>Total Active Days</Text>
          </View>
        </View>
      </View>

      {/* Distribution visual representation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Division Summary</Text>
        
        {/* Present Bar */}
        <View style={styles.chartBarWrapper}>
          <View style={styles.chartLabelRow}>
            <Text style={styles.chartBarLabel}>Present</Text>
            <Text style={styles.chartBarValue}>{report.presentRate}%</Text>
          </View>
          <View style={styles.chartBarBackground}>
            <View
              style={[styles.chartBarFill, { width: `${report.presentRate}%`, backgroundColor: COLORS.present }]}
            />
          </View>
        </View>

        {/* Late Bar */}
        <View style={styles.chartBarWrapper}>
          <View style={styles.chartLabelRow}>
            <Text style={styles.chartBarLabel}>Late</Text>
            <Text style={styles.chartBarValue}>{report.lateRate}%</Text>
          </View>
          <View style={styles.chartBarBackground}>
            <View
              style={[styles.chartBarFill, { width: `${report.lateRate}%`, backgroundColor: COLORS.late }]}
            />
          </View>
        </View>

        {/* Absent Bar */}
        <View style={styles.chartBarWrapper}>
          <View style={styles.chartLabelRow}>
            <Text style={styles.chartBarLabel}>Absent</Text>
            <Text style={styles.chartBarValue}>{report.absentRate}%</Text>
          </View>
          <View style={styles.chartBarBackground}>
            <View
              style={[styles.chartBarFill, { width: `${report.absentRate}%`, backgroundColor: COLORS.absent }]}
            />
          </View>
        </View>

        {/* Early Off Bar */}
        <View style={styles.chartBarWrapper}>
          <View style={styles.chartLabelRow}>
            <Text style={styles.chartBarLabel}>Early Off</Text>
            <Text style={styles.chartBarValue}>{report.earlyOffRate}%</Text>
          </View>
          <View style={styles.chartBarBackground}>
            <View
              style={[styles.chartBarFill, { width: `${report.earlyOffRate}%`, backgroundColor: COLORS.earlyOff }]}
            />
          </View>
        </View>

        {/* Festival Bar */}
        <View style={styles.chartBarWrapper}>
          <View style={styles.chartLabelRow}>
            <Text style={styles.chartBarLabel}>Festival / Holidays</Text>
            <Text style={styles.chartBarValue}>{report.festivalRate}%</Text>
          </View>
          <View style={styles.chartBarBackground}>
            <View
              style={[styles.chartBarFill, { width: `${report.festivalRate}%`, backgroundColor: COLORS.festival }]}
            />
          </View>
        </View>
      </View>

      {/* Critical Attendance */}
      {criticalStudents.length > 0 && (
        <View style={[styles.section, styles.criticalSection]}>
          <Text style={[styles.sectionTitle, { color: COLORS.absent }]}>
            ⚠️ Critical Low Attendance (&lt;75%)
          </Text>
          <View style={styles.criticalContainer}>
            {criticalStudents.map((std) => (
              <View key={std.studentId} style={styles.criticalCard}>
                <Text style={styles.criticalName}>{std.studentName}</Text>
                <Text style={styles.criticalPct}>{std.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.rosterHeader}>
        <Text style={styles.sectionTitle}>Roster Breakdown</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Roster</Text>
        <TouchableOpacity style={styles.bellButton}>
          <View style={styles.bellOutline}>
            <View style={styles.bellCap} />
            <View style={styles.bellBody} />
            <View style={styles.bellClapper} />
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={report.studentSummaries}
        keyExtractor={(item) => item.studentId}
        renderItem={renderStudentRow}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  scrollContainer: {
    paddingBottom: SPACING.sm,
  },
  overviewSection: {
    marginBottom: SPACING.md,
  },
  mainRateCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.md,
    marginBottom: SPACING.sm,
  },
  rateTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textLight,
    marginVertical: SPACING.xs,
  },
  rateSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: FONT_WEIGHT.medium,
  },
  rateProgressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    width: '100%',
    marginTop: SPACING.md,
  },
  rateProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  statsCountRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  countCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  countNum: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  countLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: FONT_WEIGHT.medium,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  chartBarWrapper: {
    marginBottom: SPACING.sm,
  },
  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartBarLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  chartBarValue: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  chartBarBackground: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  criticalSection: {
    borderColor: 'rgba(240, 68, 56, 0.2)',
  },
  criticalContainer: {
    gap: SPACING.xs,
  },
  criticalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.absentLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(240, 68, 56, 0.1)',
  },
  criticalName: {
    fontSize: 12,
    color: COLORS.absent,
    fontWeight: FONT_WEIGHT.semibold,
  },
  criticalPct: {
    fontSize: 12,
    color: COLORS.absent,
    fontWeight: FONT_WEIGHT.bold,
  },
  rosterHeader: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  listContent: {
    padding: SPACING.lg,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: 10,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  studentInfo: {
    flex: 1,
  },
  studentNameText: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  rollText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  percentageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  percentageText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  errorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.absent,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
