import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AttendanceService, DailyAttendance, Student, AttendanceRecord } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type AttendanceHistoryScreenRouteProp = RouteProp<RootStackParamList, 'AttendanceHistory'>;

interface Props {
  route: AttendanceHistoryScreenRouteProp;
}

export default function AttendanceHistoryScreen({ route }: Props) {
  const { classId } = route.params;

  const [history, setHistory] = useState<DailyAttendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [historyLogs, studentList] = await Promise.all([
          AttendanceService.getClassAttendanceHistory(classId),
          AttendanceService.getStudents(classId),
        ]);
        setHistory(historyLogs);
        setStudents(studentList);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [classId]);

  const toggleExpand = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  // Helper to get student details by ID
  const getStudentInfo = (studentId: string) => {
    return students.find((s) => s.id === studentId);
  };

  // Calculate day-specific statistics
  const getDayStats = (records: AttendanceRecord[]) => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    records.forEach((r) => {
      if (r.status === 'present') present++;
      else if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') excused++;
    });

    const total = records.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { present, absent, late, excused, rate };
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'present':
        return { bg: COLORS.presentLight, text: COLORS.present, border: COLORS.present };
      case 'absent':
        return { bg: COLORS.absentLight, text: COLORS.absent, border: COLORS.absent };
      case 'late':
        return { bg: COLORS.lateLight, text: COLORS.late, border: COLORS.late };
      case 'excused':
        return { bg: COLORS.excusedLight, text: COLORS.excused, border: COLORS.excused };
      default:
        return { bg: COLORS.background, text: COLORS.textSecondary, border: COLORS.border };
    }
  };

  const renderHistoryItem = ({ item }: { item: DailyAttendance }) => {
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
              <Text style={styles.rateText}>{stats.rate}% Present</Text>
            </View>
          </View>

          {/* Quick Stat Summary Bar */}
          <View style={styles.statsSummaryBar}>
            <Text style={[styles.summaryItem, { color: COLORS.present }]}>
              P: {stats.present}
            </Text>
            <Text style={[styles.summaryItem, { color: COLORS.late }]}>
              L: {stats.late}
            </Text>
            <Text style={[styles.summaryItem, { color: COLORS.absent }]}>
              A: {stats.absent}
            </Text>
            <Text style={[styles.summaryItem, { color: COLORS.excused }]}>
              E: {stats.excused}
            </Text>
          </View>

          {/* Inline progress bar */}
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
            {isExpanded ? 'Hide Details' : 'Tap to View Student List'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.detailsContainer}>
            <View style={styles.divider} />
            <Text style={styles.detailsTitle}>Roster Breakdown</Text>
            {item.records.map((rec) => {
              const std = getStudentInfo(rec.studentId);
              const statusStyles = getStatusStyle(rec.status);

              return (
                <View key={rec.studentId} style={styles.rosterRow}>
                  <View style={styles.rosterLeft}>
                    <Text style={styles.studentNameText}>{std?.name || 'Unknown Student'}</Text>
                    <Text style={styles.rollNumberText}>Roll: {std?.rollNumber || '-'}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusIndicatorBadge,
                      { backgroundColor: statusStyles.bg, borderColor: statusStyles.border },
                    ]}
                  >
                    <Text style={[styles.statusIndicatorText, { color: statusStyles.text }]}>
                      {rec.status.toUpperCase()}
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching history logs...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.date}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No historical logs available for this class.</Text>
          </View>
        }
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
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
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
    marginBottom: SPACING.sm,
  },
  dateText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  rateBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  statsSummaryBar: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryItem: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: 3,
    marginBottom: SPACING.sm,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  expandLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: FONT_WEIGHT.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  detailsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: '#FAFBFC',
  },
  detailsTitle: {
    fontSize: FONT_SIZE.sm,
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
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.medium,
  },
  rollNumberText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusIndicatorBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    width: 80,
    alignItems: 'center',
  },
  statusIndicatorText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
