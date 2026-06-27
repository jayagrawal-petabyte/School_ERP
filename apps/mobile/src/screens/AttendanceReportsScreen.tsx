import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  FlatList,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AttendanceService } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type AttendanceReportsScreenRouteProp = RouteProp<RootStackParamList, 'AttendanceReports'>;

interface Props {
  route: AttendanceReportsScreenRouteProp;
}

type ReportData = Awaited<ReturnType<typeof AttendanceService.getAttendanceReport>>;

export default function AttendanceReportsScreen({ route }: Props) {
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

  // Extract critical students (attendance < 75%)
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
          <Text style={styles.rollText}>Roll: {item.rollNumber}</Text>
          <Text style={styles.statsText}>
            P: {item.presentCount} | L: {item.lateCount} | A: {item.absentCount} | E: {item.excusedCount}
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
        <Text style={styles.loadingText}>Compiling reports & analytics...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to generate report.</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.scrollContainer}>
      {/* Overview Cards */}
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
            <Text style={styles.countLabel}>Students</Text>
          </View>
          <View style={styles.countCard}>
            <Text style={styles.countNum}>{report.totalSessions}</Text>
            <Text style={styles.countLabel}>Sessions</Text>
          </View>
        </View>
      </View>

      {/* Visual Chart / Distribution Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Distribution</Text>
        
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

        {/* Excused Bar */}
        <View style={styles.chartBarWrapper}>
          <View style={styles.chartLabelRow}>
            <Text style={styles.chartBarLabel}>Excused</Text>
            <Text style={styles.chartBarValue}>{report.excusedRate}%</Text>
          </View>
          <View style={styles.chartBarBackground}>
            <View
              style={[styles.chartBarFill, { width: `${report.excusedRate}%`, backgroundColor: COLORS.excused }]}
            />
          </View>
        </View>
      </View>

      {/* Critical Students Alert */}
      {criticalStudents.length > 0 && (
        <View style={[styles.section, styles.criticalSection]}>
          <Text style={[styles.sectionTitle, { color: COLORS.absent }]}>
            ⚠️ Critical Attendance (&lt;75%)
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

      {/* Roster Section Title */}
      <View style={styles.rosterHeader}>
        <Text style={styles.sectionTitle}>Student Attendance Breakdown</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
  scrollContainer: {
    paddingBottom: SPACING.sm,
  },
  overviewSection: {
    marginBottom: SPACING.md,
  },
  mainRateCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
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
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    width: '100%',
    marginTop: SPACING.md,
  },
  rateProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.textLight,
    borderRadius: 4,
  },
  statsCountRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  countCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  countNum: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  countLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: FONT_WEIGHT.medium,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  chartBarWrapper: {
    marginBottom: SPACING.md,
  },
  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chartBarLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  chartBarValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  chartBarBackground: {
    height: 10,
    backgroundColor: COLORS.borderLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  criticalSection: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  criticalContainer: {
    gap: SPACING.sm,
  },
  criticalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.absentLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  criticalName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.absent,
    fontWeight: FONT_WEIGHT.semibold,
  },
  criticalPct: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.absent,
    fontWeight: FONT_WEIGHT.bold,
  },
  rosterHeader: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  studentInfo: {
    flex: 1,
  },
  studentNameText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  rollText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsText: {
    fontSize: 11,
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
    fontSize: FONT_SIZE.md,
    color: COLORS.absent,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
