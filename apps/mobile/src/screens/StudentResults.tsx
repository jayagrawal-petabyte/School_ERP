import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
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
  SubjectResult,
} from '../types/exam';

import StudentInfo from '../components/StudentInfo';
import ResultSummaryCard from '../components/ResultSummaryCard';
import GradeBadge from '../components/GradeBadge';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StudentResults'
>;

interface Props {
  navigation: NavigationProp;
}

export default function StudentResults({
  navigation,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [student, setStudent] =
    useState<Student | null>(null);

  const [results, setResults] =
    useState<StudentResult | null>(null);

  async function loadResults() {
    try {
      setLoading(true);

      /*
       TODO:
       Replace hardcoded student id
       after authentication module
       is integrated.
      */

      const response =
        await ExamService.getStudentResults(
          '101'
        );

      setResults(response);

      if (response.student) {
        setStudent(response.student);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  const totalObtained = useMemo(() => {
    if (!results) return 0;

    return results.subjects.reduce(
      (sum, subject) =>
        sum + subject.marksObtained,
      0
    );
  }, [results]);

  const totalMarks = useMemo(() => {
    if (!results) return 0;

    return results.subjects.reduce(
      (sum, subject) =>
        sum + subject.maxMarks,
      0
    );
  }, [results]);

  const percentage = useMemo(() => {
    if (totalMarks === 0) return 0;

    return Number(
      (
        (totalObtained / totalMarks) *
        100
      ).toFixed(2)
    );
  }, [totalObtained, totalMarks]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Loading Results...
        </Text>
      </View>
    );
  }

  if (!results || !student) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No Results Found
          </Text>

          <Text style={styles.emptySub}>
            Your examination results
            are not available yet.
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
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButton}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Student Results
        </Text>

        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={results.subjects}
        keyExtractor={(item) => item.subjectId}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadResults();
            }}
            colors={[COLORS.primary]}
          />
        }
                ListHeaderComponent={
          <>
            <StudentInfo
              student={student}
              exam={results.exam}
            />

            <ResultSummaryCard
              obtainedMarks={totalObtained}
              totalMarks={totalMarks}
              percentage={percentage}
              grade={results.grade}
            />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Subject Results
              </Text>

              <Text style={styles.sectionSubtitle}>
                Performance in each subject
              </Text>
            </View>
          </>
        }
        renderItem={({
          item,
        }: {
          item: SubjectResult;
        }) => (
          <View style={styles.subjectCard}>
            <View style={styles.subjectTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subjectName}>
                  {item.subjectName}
                </Text>

                <Text style={styles.marksText}>
                  {item.marksObtained} /{' '}
                  {item.maxMarks}
                </Text>
              </View>

              <GradeBadge
                grade={item.grade}
                status={item.status}
              />
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>
                  Passing Marks
                </Text>

                <Text style={styles.infoValue}>
                  {item.passingMarks}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>
                  Status
                </Text>

                <Text
                  style={[
                    styles.statusText,
                    item.status === 'pass'
                      ? styles.passText
                      : styles.failText,
                  ]}
                >
                  {item.status === 'pass'
                    ? 'PASS'
                    : 'FAIL'}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>
                  Percentage
                </Text>

                <Text style={styles.infoValue}>
                  {(
                    (item.marksObtained /
                      item.maxMarks) *
                    100
                  ).toFixed(1)}
                  %
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              No Subject Results
            </Text>

            <Text style={styles.emptySub}>
              Results have not been
              published yet.
            </Text>
          </View>
        }
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
      />
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
    fontWeight:
      FONT_WEIGHT.medium,
  },

  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    paddingHorizontal:
      SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  backButton: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight:
      FONT_WEIGHT.bold,
  },

  headerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight:
      FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  sectionHeader: {
    marginHorizontal:
      SPACING.lg,
    marginTop: SPACING.md,
    marginBottom:
      SPACING.sm,
  },

  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight:
      FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    color:
      COLORS.textSecondary,
  },

  listContent: {
    paddingBottom: 40,
  },

  subjectCard: {
    backgroundColor:
      '#FFFFFF',
    marginHorizontal:
      SPACING.lg,
    marginBottom:
      SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },

  subjectTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectName: {
    fontSize: FONT_SIZE.md,
    fontWeight:
      FONT_WEIGHT.bold,
    color:
      COLORS.textPrimary,
  },

  marksText: {
    marginTop: 3,
    fontSize: FONT_SIZE.sm,
    color:
      COLORS.textSecondary,
  },
    bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },

  infoBox: {
    flex: 1,
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  infoValue: {
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },

  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  emptySub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});