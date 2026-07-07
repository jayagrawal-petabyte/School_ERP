export function calculatePercentage(
  obtainedMarks: number,
  totalMarks: number
): number {
  if (totalMarks <= 0) return 0;

  return Number(
    ((obtainedMarks / totalMarks) * 100).toFixed(2)
  );
}

export function calculateGrade(
  percentage: number
): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

export function calculateResultStatus(
  obtainedMarks: number,
  passingMarks: number
): 'pass' | 'fail' {
  return obtainedMarks >= passingMarks
    ? 'pass'
    : 'fail';
}

export function calculateTotalMarks(
  marks: number[]
): number {
  return marks.reduce(
    (total, mark) => total + mark,
    0
  );
}

export function calculateAverage(
  marks: number[]
): number {
  if (marks.length === 0) return 0;

  return Number(
    (
      calculateTotalMarks(marks) /
      marks.length
    ).toFixed(2)
  );
}