import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
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

import ExamService from '../services/examService';

import {
  Student,
  StudentResult,
} from '../types/exam';

import StudentInfo from '../components/StudentInfo';
import GradeBadge from '../components/GradeBadge';
import ResultSummaryCard from '../components/ResultSummaryCard';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReportCard'
>;

interface Props {
  navigation: NavigationProp;
}

export default function ReportCard({
  navigation,
}: Props) {
  const [loading, setLoading] = useState(true);

  const [student, setStudent] =
    useState<Student | null>(null);

  const [resultsList, setResultsList] =
    useState<StudentResult[]>([]);
  const [selectedExamIndex, setSelectedExamIndex] =
    useState<number>(0);

  const result = resultsList[selectedExamIndex] || null;

  async function loadReportCard() {
    try {
      setLoading(true);

      const { getToken } = await import('../utils/security');
      const savedRole = await getToken('user_role');
      const userId = await getToken('user_id');

      let targetStudentId = userId || '';

      if (savedRole === 'parent' && userId) {
        const { ProfileService } = await import('../services/profileApi');
        const parentProfile = await ProfileService.getParentProfile(userId);
        if (parentProfile && parentProfile.children && parentProfile.children.length > 0) {
          targetStudentId = parentProfile.children[0].id;
        }
      }

      const response =
        await ExamService.getStudentResults(
          targetStudentId
        );

      if (response && response.length > 0) {
        setResultsList(response);
        setStudent(response[0].student);
      } else {
        setResultsList([]);
        setStudent(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReportCard();
  }, []);

  const totalMarks = useMemo(() => {
    if (!result) return 0;

    return result.subjects.reduce(
      (sum, item) => sum + item.maxMarks,
      0
    );
  }, [result]);

  const obtainedMarks = useMemo(() => {
    if (!result) return 0;

    return result.subjects.reduce(
      (sum, item) =>
        sum + item.marksObtained,
      0
    );
  }, [result]);

  const percentage = useMemo(() => {
    if (totalMarks === 0) return 0;

    return Number(
      (
        (obtainedMarks / totalMarks) *
        100
      ).toFixed(2)
    );
  }, [obtainedMarks, totalMarks]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading Report Card...
        </Text>
      </View>
    );
  }

  if (!result || !student) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No Results Found
          </Text>

          <Text style={styles.emptySub}>
            Your examination report card
            is not available yet.
          </Text>
        </View>
      </SafeAreaView>
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
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text style={styles.backButton}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Report Card
        </Text>

        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {resultsList.length > 1 && (
          <View style={styles.tabContainer}>
            {resultsList.map((res, index) => (
              <TouchableOpacity
                key={res.exam.id}
                style={[
                  styles.tabButton,
                  selectedExamIndex === index && styles.activeTabButton
                ]}
                onPress={() => setSelectedExamIndex(index)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedExamIndex === index && styles.activeTabText
                  ]}
                >
                  {res.exam.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.schoolCard}>
          <Text style={styles.schoolName}>
            SCHOOL ERP
          </Text>

          <Text style={styles.schoolSub}>
            Examination Report Card
          </Text>
        </View>

        <StudentInfo
          student={student}
          exam={result.exam}
        />

        <ResultSummaryCard
          obtainedMarks={obtainedMarks}
          totalMarks={totalMarks}
          percentage={percentage}
          grade={result.grade}
        />
                <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Subject-wise Performance
          </Text>
        </View>

        {result.subjects.map((subject) => (
          <View
            key={subject.subjectId}
            style={styles.subjectCard}
          >
            <View style={styles.subjectHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subjectName}>
                  {subject.subjectName}
                </Text>

                <Text style={styles.subjectMarks}>
                  {subject.marksObtained} / {subject.maxMarks}
                </Text>
              </View>

              <GradeBadge
                grade={subject.grade}
                status={subject.status}
              />
            </View>

            <View style={styles.subjectFooter}>
              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>
                  Passing
                </Text>

                <Text style={styles.footerValue}>
                  {subject.passingMarks}
                </Text>
              </View>

              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>
                  Percentage
                </Text>

                <Text style={styles.footerValue}>
                  {(
                    (subject.marksObtained /
                      subject.maxMarks) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>

              <View style={styles.footerItem}>
                <Text style={styles.footerLabel}>
                  Status
                </Text>

                <Text
                  style={[
                    styles.statusText,
                    subject.status === 'pass'
                      ? styles.passText
                      : styles.failText,
                  ]}
                >
                  {subject.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.remarksCard}>
          <Text style={styles.remarksTitle}>
            Teacher's Remarks
          </Text>

          <Text style={styles.remarksText}>
            {
              result.remarks ??
              'Good overall performance. Keep practicing regularly and continue improving in all subjects.'
            }
          </Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />

            <Text style={styles.signatureLabel}>
              Class Teacher
            </Text>
          </View>

          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />

            <Text style={styles.signatureLabel}>
              Principal
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },

  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },

  emptySubtitle: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  schoolCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    ...SHADOWS.sm,
  },

  schoolName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  schoolSub: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },

  sectionHeader: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },

  subjectCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
    subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },

  subjectMarks: {
    marginTop: 4,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },

  subjectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerItem: {
    flex: 1,
    alignItems: 'center',
  },

  footerLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  footerValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },

  statusText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  passText: {
    color: COLORS.present,
  },

  failText: {
    color: COLORS.absent,
  },

  remarksCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    ...SHADOWS.sm,
  },

  remarksTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  remarksText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },

  signatureBox: {
    width: '42%',
    alignItems: 'center',
  },

  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  signatureLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
});