import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
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
  const [classId, setClassId] = useState('c1');
  const [subject, setSubject] = useState('s1');
  const [examType, setExamType] = useState('e1');

  const [students, setStudents] = useState<Student[]>([]);
  const [rows, setRows] =
    useState<Record<string, MarksRowState>>({});

  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudents();
  }, [classId]);

  async function loadStudents() {
    try {
      setLoading(true);

      const list =
        await ExamService.getStudentsByClass(classId);

      setStudents(list);

      const initialRows: Record<
        string,
        MarksRowState
      > = {};

      list.forEach((student) => {
        initialRows[student.id] = {
          studentId: student.id,
          marks: '',
          error: null,
          isExisting: false,
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

      {/* TODO:
          Replace these temporary text inputs
          with the project's dropdown component
          once Class/Subject/Exam selectors exist.
      */}

      <View style={styles.filterContainer}>
        <TextInput
          style={styles.filterInput}
          value={classId}
          onChangeText={setClassId}
          placeholder="Class"
        />

        <TextInput
          style={styles.filterInput}
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
        />

        <TextInput
          style={styles.filterInput}
          value={examType}
          onChangeText={setExamType}
          placeholder="Exam"
        />
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
                    await ExamService.uploadMarks({
                      studentId: item.id,
                      classId,
                      subject,
                      examType,
                      marks: Number(row.marks),
                      maxMarks: MAX_MARKS,
                      passingMarks: PASSING_MARKS,
                    });

                    setRows((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...prev[item.id],
                        isExisting: true,
                      },
                    }));
                  } catch (error) {
                    console.log(error);
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
              for (const student of students) {
                const row = rows[student.id];

                if (
                  !row ||
                  row.error ||
                  row.marks.trim() === ''
                ) {
                  continue;
                }

                await ExamService.uploadMarks({
                  studentId: student.id,
                  classId,
                  subject,
                  examType,
                  marks: Number(row.marks),
                  maxMarks: MAX_MARKS,
                  passingMarks: PASSING_MARKS,
                });
              }
            } catch (error) {
              console.log(error);
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
});