import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AttendanceService, Student, AttendanceRecord } from '../services/api';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, SHADOWS } from '../constants/theme';

type MarkAttendanceScreenRouteProp = RouteProp<RootStackParamList, 'MarkAttendance'>;
type MarkAttendanceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MarkAttendance'
>;

interface Props {
  route: MarkAttendanceScreenRouteProp;
  navigation: MarkAttendanceScreenNavigationProp;
}

type LocalRecord = {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused' | null;
};

export default function MarkAttendanceScreen({ route, navigation }: Props) {
  const { classId, className } = route.params;

  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, 'present' | 'absent' | 'late' | 'excused'>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const studentList = await AttendanceService.getStudents(classId);
        setStudents(studentList);

        // Fetch existing attendance for this class and date
        const existingRecords = await AttendanceService.getAttendanceByDate(classId, selectedDate);
        
        const initialRecords: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
        if (existingRecords) {
          existingRecords.forEach((rec) => {
            initialRecords[rec.studentId] = rec.status;
          });
        } else {
          // Default all to null (requires marking)
          studentList.forEach((std) => {
            // Alternatively, we can default all to null or let them remain empty
          });
        }
        setRecords(initialRecords);
      } catch (error) {
        console.error('Error loading roster:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [classId, selectedDate]);

  // Set all students to present (shortcut)
  const handleMarkAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'late' | 'excused'> = {};
    students.forEach((std) => {
      updated[std.id] = 'present';
    });
    setRecords(updated);
  };

  // Toggle single student status
  const handleMarkStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Calculate live statistics
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    let unmarked = 0;

    students.forEach((std) => {
      const status = records[std.id];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
      else unmarked++;
    });

    return { present, absent, late, excused, unmarked, total: students.length };
  }, [students, records]);

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (std) =>
        std.name.toLowerCase().includes(query) ||
        std.rollNumber.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  // Handle Submission
  const handleSubmit = async () => {
    if (stats.unmarked > 0) {
      Alert.alert(
        'Incomplete Roster',
        `You have left ${stats.unmarked} student(s) unmarked. Please mark all students before submitting.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSubmitting(true);
    try {
      const submissionRecords: AttendanceRecord[] = students.map((std) => ({
        studentId: std.id,
        status: records[std.id],
      }));

      const response = await AttendanceService.submitAttendance(
        classId,
        selectedDate,
        submissionRecords
      );

      if (response.success) {
        Alert.alert('Success', 'Attendance saved successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      Alert.alert('Error', 'Failed to save attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const currentStatus = records[item.id] || null;

    return (
      <View style={styles.studentCard}>
        {/* Profile Avatar / Initials */}
        <View
          style={[
            styles.avatar,
            item.gender === 'F' ? styles.avatarFemale : styles.avatarMale,
          ]}
        >
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>

        {/* Student Information */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.rollNumber}>Roll No: {item.rollNumber}</Text>
        </View>

        {/* Action Toggles */}
        <View style={styles.statusButtonsContainer}>
          {/* Present Button */}
          <TouchableOpacity
            style={[
              styles.statusButton,
              currentStatus === 'present' ? styles.btnPresentActive : styles.btnInactive,
            ]}
            onPress={() => handleMarkStatus(item.id, 'present')}
          >
            <Text
              style={[
                styles.statusBtnText,
                currentStatus === 'present' ? styles.textActive : styles.textInactivePresent,
              ]}
            >
              P
            </Text>
          </TouchableOpacity>

          {/* Late Button */}
          <TouchableOpacity
            style={[
              styles.statusButton,
              currentStatus === 'late' ? styles.btnLateActive : styles.btnInactive,
            ]}
            onPress={() => handleMarkStatus(item.id, 'late')}
          >
            <Text
              style={[
                styles.statusBtnText,
                currentStatus === 'late' ? styles.textActive : styles.textInactiveLate,
              ]}
            >
              L
            </Text>
          </TouchableOpacity>

          {/* Absent Button */}
          <TouchableOpacity
            style={[
              styles.statusButton,
              currentStatus === 'absent' ? styles.btnAbsentActive : styles.btnInactive,
            ]}
            onPress={() => handleMarkStatus(item.id, 'absent')}
          >
            <Text
              style={[
                styles.statusBtnText,
                currentStatus === 'absent' ? styles.textActive : styles.textInactiveAbsent,
              ]}
            >
              A
            </Text>
          </TouchableOpacity>

          {/* Excused Button */}
          <TouchableOpacity
            style={[
              styles.statusButton,
              currentStatus === 'excused' ? styles.btnExcusedActive : styles.btnInactive,
            ]}
            onPress={() => handleMarkStatus(item.id, 'excused')}
          >
            <Text
              style={[
                styles.statusBtnText,
                currentStatus === 'excused' ? styles.textActive : styles.textInactiveExcused,
              ]}
            >
              E
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching class roster...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Real-time stats board */}
      <View style={styles.statsBoard}>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Date: {selectedDate}</Text>
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllPresent}>
            <Text style={styles.markAllBtnText}>Mark All Present</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { borderLeftColor: COLORS.present }]}>
            <Text style={styles.statVal}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: COLORS.late }]}>
            <Text style={styles.statVal}>{stats.late}</Text>
            <Text style={styles.statLabel}>Late</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: COLORS.absent }]}>
            <Text style={styles.statVal}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: COLORS.excused }]}>
            <Text style={styles.statVal}>{stats.excused}</Text>
            <Text style={styles.statLabel}>Excused</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: COLORS.textMuted }]}>
            <Text style={styles.statVal}>{stats.unmarked}</Text>
            <Text style={styles.statLabel}>Unmarked</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search student by name or roll no..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* Roster List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        renderItem={renderStudentItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No students match your search.</Text>
          </View>
        }
      />

      {/* Submit Button Bar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <Text style={styles.submitBtnText}>Submit Attendance</Text>
          )}
        </TouchableOpacity>
      </View>
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
  statsBoard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  markAllBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  markAllBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statVal: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: FONT_WEIGHT.medium,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarMale: {
    backgroundColor: '#DBEAFE', // Soft blue
  },
  avatarFemale: {
    backgroundColor: '#FCE7F3', // Soft pink
  },
  avatarText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  rollNumber: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  btnInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  btnPresentActive: {
    backgroundColor: COLORS.present,
    borderColor: COLORS.present,
  },
  btnAbsentActive: {
    backgroundColor: COLORS.absent,
    borderColor: COLORS.absent,
  },
  btnLateActive: {
    backgroundColor: COLORS.late,
    borderColor: COLORS.late,
  },
  btnExcusedActive: {
    backgroundColor: COLORS.excused,
    borderColor: COLORS.excused,
  },
  statusBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  textActive: {
    color: COLORS.textLight,
  },
  textInactivePresent: {
    color: COLORS.present,
  },
  textInactiveAbsent: {
    color: COLORS.absent,
  },
  textInactiveLate: {
    color: COLORS.late,
  },
  textInactiveExcused: {
    color: COLORS.excused,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitBtnText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
});
