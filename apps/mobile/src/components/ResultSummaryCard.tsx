import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
} from '../constants/theme';

interface ResultSummaryCardProps {
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  grade: string;
}

const SummaryItem = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => (
  <View style={styles.summaryItem}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{title}</Text>
  </View>
);

export default function ResultSummaryCard({
  obtainedMarks,
  totalMarks,
  percentage,
  grade,
}: ResultSummaryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Result Summary
      </Text>

      <View style={styles.row}>
        <SummaryItem
          title="Obtained"
          value={obtainedMarks}
        />

        <SummaryItem
          title="Total"
          value={totalMarks}
        />
      </View>

      <View style={styles.row}>
        <SummaryItem
          title="Percentage"
          value={`${percentage.toFixed(2)}%`}
        />

        <SummaryItem
          title="Grade"
          value={grade}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...SHADOWS.sm,
  },

  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },

  value: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },

  label: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
});