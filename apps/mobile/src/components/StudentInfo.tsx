import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './Card';
import { theme } from '../theme';
import type { Student, ExamInfo } from '../types/exam';

interface StudentInfoProps {
  student: Student;
  exam: ExamInfo;
}

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default function StudentInfo({
  student,
  exam,
}: StudentInfoProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Student Information</Text>

      <View style={styles.section}>
        <InfoRow
          label="Student Name"
          value={student.name}
        />

        <InfoRow
          label="Roll No"
          value={student.rollNo}
        />

        <InfoRow
          label="Class"
          value={student.classId}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <InfoRow
          label="Exam"
          value={exam.name}
        />

        <InfoRow
          label="Academic Year"
          value={exam.academicYear}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
  },

  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  section: {
    gap: theme.spacing.sm,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium,
  },

  value: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fonts.weights.semibold,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
});