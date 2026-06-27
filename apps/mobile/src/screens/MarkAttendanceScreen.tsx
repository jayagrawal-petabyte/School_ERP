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
  StatusBar,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AttendanceService, Student, AttendanceRecord, AttendanceStatus } from '../services/api';
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

export default function MarkAttendanceScreen({ route, navigation }: Props) {
  const { classId, className } = route.params;

  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const studentList = await AttendanceService.getStudents(classId);
        setStudents(studentList);

        const existingRecords = await AttendanceService.getAttendanceByDate(classId, selectedDate);
        
        const initialRecords: Record<string, AttendanceStatus> = {};
        if (existingRecords) {
          existingRecords.forEach((rec) => {
            initialRecords[rec.studentId] = rec.status;
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

  const handleMarkAllPresent = () => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach((std) => {
      updated[std.id] = 'present';
    });
    setRecords(updated);
  };

  const handleMarkStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let earlyOff = 0;
    let unmarked = 0;

    students.forEach((std) => {
      const status = records[std.id];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'earlyOff') earlyOff++;
      else unmarked++;
    });

    return { present, absent, late, earlyOff, unmarked, total: students.length };
  }, [students, records]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (std) =>
        std.name.toLowerCase().includes(query) ||
        std.rollNumber.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const handleSubmit = async () => {
    if (stats.unmarked > 0) {
      Alert.alert(
        'Roster Incomplete',
        `Please mark all ${stats.unmarked} student(s) before submitting.`,
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
      console.error('Error saving attendance:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
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
        {/* Profile initials circle */}
        <View
          style={[
            styles.avatar,
            item.gender === 'F' ? styles.avatarFemale : styles.avatarMale,
          ]}
        >
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>

        {/* Info */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.rollNumber}>Roll No: {item.rollNumber}</Text>
        </View>

        {/* Circle status pills */}
        <View style={styles.statusButtonsContainer}>
          {/* Present (P) */}
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

          {/* Late (L) */}
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

          {/* Absent (A) */}
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

          {/* Early Off (E) */}
          <TouchableOpacity
            style={[
              styles.statusButton,
              currentStatus === 'earlyOff' ? styles.btnEarlyActive : styles.btnInactive,
            ]}
            onPress={() => handleMarkStatus(item.id, 'earlyOff')}
          >
            <Text
              style={[
                styles.statusBtnText,
                currentStatus === 'earlyOff' ? styles.textActive : styles.textInactiveEarly,
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
        <Text style={styles.loadingText}>Fetching Roster...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{className}</Text>
        <TouchableOpacity style={styles.bellButton}>
          <View style={styles.bellOutline}>
            <View style={styles.bellCap} />
            <View style={styles.bellBody} />
            <View style={styles.bellClapper} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Top dashboard values */}
      <View style={styles.statsBoard}>
        <View style={styles.dateRow}>
          <Text style={styles.dateLabel}>Session Date: {selectedDate}</Text>
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
          <View style={[styles.statBox, { borderLeftColor: COLORS.earlyOff }]}>
            <Text style={styles.statVal}>{stats.earlyOff}</Text>
            <Text style={styles.statLabel}>Early Off</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: COLORS.textMuted }]}>
            <Text style={styles.statVal}>{stats.unmarked}</Text>
            <Text style={styles.statLabel}>Unmarked</Text>
          </View>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        renderItem={renderStudentItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Roster is empty.</Text>
          </View>
        }
      />

      {/* Fixed bottom footer */}
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
  statsBoard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  markAllBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  markAllBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: FONT_WEIGHT.semibold,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: SPACING.xs,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: SPACING.sm,
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  statVal: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: FONT_WEIGHT.medium,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    height: 40,
  },
  searchIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl * 3,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarMale: {
    backgroundColor: '#E0F2FE',
  },
  avatarFemale: {
    backgroundColor: '#FCE7F3',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  rollNumber: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  statusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  btnInactive: {
    backgroundColor: '#FFFFFF',
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
  btnEarlyActive: {
    backgroundColor: COLORS.earlyOff,
    borderColor: COLORS.earlyOff,
  },
  statusBtnText: {
    fontSize: 11,
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
  textInactiveEarly: {
    color: COLORS.earlyOff,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  submitBtnText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
});
