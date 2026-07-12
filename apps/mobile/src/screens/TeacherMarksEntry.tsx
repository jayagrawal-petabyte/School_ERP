import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../constants/theme';

import { ExamService } from '../services/examService';

import {
  Student,
  MarksRowState,
} from '../types/exam';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TeacherMarksEntry'
>;

interface Props {
  navigation: NavigationProp;
}

const CLASS_OPTIONS = [
  { id: 'c1', label: 'Class 6 - A' },
  { id: 'c2', label: 'Class 7 - A' },
];

const SUBJECT_OPTIONS = [
  { id: 's1', label: 'Mathematics' },
  { id: 's2', label: 'Science' },
  { id: 's3', label: 'English' },
];

const EXAM_OPTIONS = [
  { id: 'e1', label: 'Mid Term' },
  { id: 'e2', label: 'Final Term' },
];

const MAX_MARKS = 100;
const PASSING_MARKS = 33;

export default function TeacherMarksEntry({
  navigation,
}: Props) {
  const [classes, setClasses] = useState<{ id: string; name: string; section: string }[]>([]);
  const [classId, setClassId] = useState<string>('');

  const [allSubjects, setAllSubjects] = useState<{ id: string; name: string; classId: string }[]>([]);
  const [subjectId, setSubjectId] = useState<string>('');

  const [examId, setExamId] = useState<string>('');

  const [students, setStudents] = useState<Student[]>([]);
  const [rows, setRows] =
    useState<Record<string, MarksRowState>>({});

  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // Filter subjects for selected class
  const subjects = useMemo(() => {
    return allSubjects.filter(sub => sub.classId === classId);
  }, [allSubjects, classId]);

  // Exams matching selected class
  const exams = useMemo(() => {
    if (classId === '00000000-0000-0000-0004-000000000001') {
      return [
        { id: '00000000-0000-0000-0007-000000000001', name: 'Midterm' },
        { id: '00000000-0000-0000-0007-000000000002', name: 'Final' }
      ];
    } else if (classId === '00000000-0000-0000-0004-000000000002') {
      return [
        { id: '00000000-0000-0000-0007-000000000003', name: 'Midterm' },
        { id: '00000000-0000-0000-0007-000000000004', name: 'Final' }
      ];
    } else {
      return [
        { id: '00000000-0000-0000-0007-000000000005', name: 'Midterm' },
        { id: '00000000-0000-0000-0007-000000000006', name: 'Final' }
      ];
    }
  }, [classId]);

  // Load classes and subjects on mount
  useEffect(() => {
    async function initMetadata() {
      try {
        const { AttendanceService } = await import('../services/api');
        const classesList = await AttendanceService.getClasses();
        setClasses(classesList);
        if (classesList.length > 0) {
          setClassId(classesList[0].id);
        }

        const { API_CONFIG, getAuthHeaders } = await import('../config/apiConfig');
        const headers = await getAuthHeaders();
        const subRes = await fetch(`${API_CONFIG.BASE_URL}/api/subjects`, { headers });
        const subResult = await subRes.json();
        setAllSubjects(subResult.data || []);
      } catch (e) {
        console.log(e);
      }
    }
    initMetadata();
  }, []);

  // Update subjectId when subjects list changes
  useEffect(() => {
    if (subjects.length > 0) {
      setSubjectId(subjects[0].id);
    } else {
      setSubjectId('');
    }
  }, [subjects]);

  // Update examId when exams list changes
  useEffect(() => {
    if (exams.length > 0) {
      setExamId(exams[0].id);
    } else {
      setExamId('');
    }
  }, [exams]);

  // Load students and marks when class, subject, or exam selection changes
  useEffect(() => {
    if (classId && subjectId && examId) {
      loadStudentsAndMarks();
    } else {
      setStudents([]);
      setRows({});
      setLoading(false);
    }
  }, [classId, subjectId, examId]);

  async function loadStudentsAndMarks() {
    try {
      setLoading(true);

      const list = await ExamService.getStudentsByClass(classId);
      setStudents(list);

      const classMarks = await ExamService.getResultsByClass(classId);

      const activeSubjectName = allSubjects.find(s => s.id === subjectId)?.name || '';
      const activeExamName = exams.find(e => e.id === examId)?.name || '';

      const initialRows: Record<string, MarksRowState> = {};

      list.forEach((student) => {
        const existing = classMarks.find(
          (m) =>
            m.studentId === student.id &&
            m.subject && activeSubjectName && m.subject.toLowerCase() === activeSubjectName.toLowerCase() &&
            m.examType && activeExamName && m.examType.toLowerCase() === activeExamName.toLowerCase()
        );

        initialRows[student.id] = {
          studentId: student.id,
          marks: existing ? String(existing.marks) : '',
          error: null,
          isExisting: !!existing,
          resultId: existing?.id
        };
      });

      setRows(initialRows);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return students;
    }

    const query = searchQuery.toLowerCase();

    return students.filter(
      (student) =>
        student.name
          .toLowerCase()
          .includes(query) ||
        student.rollNo
          .toLowerCase()
          .includes(query)
    );
  }, [students, searchQuery]);

  const completedCount = useMemo(() => {
    return Object.values(rows).filter(
      (row) => row.marks.trim() !== ''
    ).length;
  }, [rows]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
        <Text style={styles.loadingText}>
          Loading Students...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButton}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Teacher Marks Entry
        </Text>

        <View style={{ width: 32 }} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          Examination Dashboard
        </Text>

        <Text style={styles.summarySubtitle}>
          Enter marks for selected class.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {students.length}
            </Text>

            <Text style={styles.statLabel}>
              Students
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {completedCount}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {MAX_MARKS}
            </Text>

            <Text style={styles.statLabel}>
              Max Marks
            </Text>
          </View>
        </View>
      </View>

      {/* Dynamic Selector Pills */}
      <View style={styles.selectorsCard}>
        {classes.length > 0 && (
          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Class</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
              {classes.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.pill, classId === c.id && styles.activePill]}
                  onPress={() => setClassId(c.id)}
                >
                  <Text style={[styles.pillText, classId === c.id && styles.activePillText]}>
                    {c.name} - {c.section}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {subjects.length > 0 && (
          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Subject</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
              {subjects.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.pill, subjectId === s.id && styles.activePill]}
                  onPress={() => setSubjectId(s.id)}
                >
                  <Text style={[styles.pillText, subjectId === s.id && styles.activePillText]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {exams.length > 0 && (
          <View style={styles.selectorRow}>
            <Text style={styles.selectorLabel}>Exam</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
              {exams.map((e) => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.pill, examId === e.id && styles.activePill]}
                  onPress={() => setExamId(e.id)}
                >
                  <Text style={[styles.pillText, examId === e.id && styles.activePillText]}>
                    {e.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search Student..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          placeholderTextColor={
            COLORS.textSecondary
          }
        />
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const row = rows[item.id];

          return (
            <View style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {item.name}
                </Text>

                <Text style={styles.rollNumber}>
                  Roll No: {item.rollNo}
                </Text>
              </View>

              <View style={styles.marksContainer}>
                <TextInput
                  value={row?.marks ?? ''}
                  keyboardType="numeric"
                  maxLength={3}
                  placeholder="Marks"
                  placeholderTextColor={
                    COLORS.textSecondary
                  }
                  style={[
                    styles.marksInput,
                    row?.error && styles.errorInput,
                  ]}
                  onChangeText={(text) => {
                    let error: string | null = null;

                    if (text.trim() !== '') {
                      const value = Number(text);

                      if (Number.isNaN(value)) {
                        error = 'Invalid';
                      } else if (value < 0) {
                        error = 'Invalid';
                      } else if (value > MAX_MARKS) {
                        error = `>${MAX_MARKS}`;
                      }
                    }

                    setRows((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...prev[item.id],
                        marks: text,
                        error,
                      },
                    }));
                  }}
                />

                {row?.error ? (
                  <Text style={styles.errorText}>
                    {row.error}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  row?.marks.trim() === '' &&
                    styles.disabledButton,
                ]}
                disabled={
                  row?.marks.trim() === '' ||
                  row?.error !== null
                }
                onPress={async () => {
                  try {
                    const payload = {
                      studentId: item.id,
                      classId,
                      subject: subjectId,
                      examType: examId,
                      marks: Number(row.marks),
                      maxMarks: MAX_MARKS,
                      passingMarks: PASSING_MARKS,
                    };

                    let res;
                    if (row.isExisting && row.resultId) {
                      res = await ExamService.updateMarks(row.resultId, payload);
                    } else {
                      res = await ExamService.uploadMarks(payload);
                    }

                    setRows((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...prev[item.id],
                        isExisting: true,
                        resultId: res?.id || prev[item.id].resultId
                      },
                    }));

                    Alert.alert('Success', 'Marks saved successfully!');
                  } catch (error) {
                    console.log(error);
                    Alert.alert('Error', 'Failed to save marks.');
                  }
                }}
              >
                <Text style={styles.saveButtonText}>
                  {row?.isExisting
                    ? 'Update'
                    : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            savingAll &&
              styles.submitButtonDisabled,
          ]}
          disabled={savingAll}
          onPress={async () => {
            setSavingAll(true);

            try {
              let savedCount = 0;
              for (const student of students) {
                const row = rows[student.id];

                if (
                  !row ||
                  row.error ||
                  row.marks.trim() === ''
                ) {
                  continue;
                }

                const payload = {
                  studentId: student.id,
                  classId,
                  subject: subjectId,
                  examType: examId,
                  marks: Number(row.marks),
                  maxMarks: MAX_MARKS,
                  passingMarks: PASSING_MARKS,
                };

                let res;
                if (row.isExisting && row.resultId) {
                  res = await ExamService.updateMarks(row.resultId, payload);
                } else {
                  res = await ExamService.uploadMarks(payload);
                }

                setRows((prev) => ({
                  ...prev,
                  [student.id]: {
                    ...prev[student.id],
                    isExisting: true,
                    resultId: res?.id || prev[student.id].resultId
                  },
                }));
                savedCount++;
              }
              if (savedCount > 0) {
                Alert.alert('Success', `Successfully saved marks for ${savedCount} student(s)!`);
              }
            } catch (error) {
              console.log(error);
              Alert.alert('Error', 'Failed to save marks.');
            } finally {
              setSavingAll(false);
            }
          }}
        >
          {savingAll ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.submitButtonText}>
              Save All Marks
            </Text>
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
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
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

  header: {
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
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },

  headerTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },

  summaryCard: {
    margin: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },

  summaryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },

  summarySubtitle: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  statLabel: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },

  filterContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },

  filterInput: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
  },

  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },

  searchInput: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
  },

  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 120,
  },

  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
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
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },

  marksContainer: {
    width: 90,
    marginHorizontal: SPACING.sm,
  },

  marksInput: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    color: COLORS.textPrimary,
  },

  errorInput: {
    borderColor: COLORS.absent,
  },

  errorText: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.absent,
    textAlign: 'center',
  },

  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },

  disabledButton: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.semibold,
    fontSize: FONT_SIZE.xs,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  selectorsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    ...SHADOWS.sm,
    gap: SPACING.sm,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorLabel: {
    width: 60,
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  selectorScroll: {
    gap: SPACING.xs,
    paddingRight: 20,
  },
  pill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activePill: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  activePillText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
});