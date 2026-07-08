"use strict";

const deriveStatus = (marksObtained, passingMarks) => {
  console.log('[Utils] deriveStatus - Marks:', marksObtained, 'Passing:', passingMarks);
  if (marksObtained === undefined || marksObtained === null || marksObtained === '') {
    return 'pending';
  }

  const status = Number(marksObtained) >= Number(passingMarks || 0) ? 'pass' : 'fail';
  console.log('[Utils] deriveStatus - Result status:', status);
  return status;
};

const normalizeIds = (ids = []) => [...new Set(
  (Array.isArray(ids) ? ids : [ids])
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map((value) => String(value))
)];

const normalizeLegacyField = (source, sourceKey, targetKey) => {
  if (source[sourceKey] !== undefined && source[targetKey] === undefined) {
    source[targetKey] = source[sourceKey];
  }
};

const normalizeResultShape = (result) => {
  console.log('[Utils] normalizeResultShape - Input:', result);
  if (!result) {
    console.log('[Utils] normalizeResultShape - Result is null/undefined');
    return null;
  }

  const createdAt = result.created_at || result.createdAt || new Date().toISOString();
  const updatedAt = result.updated_at || result.updatedAt || createdAt;

  const normalized = {
    ...result,
    id: String(result.id),
    student_id: result.student_id ?? result.studentId ?? null,
    teacher_id: result.teacher_id ?? result.teacherId ?? null,
    class_id: result.class_id ?? result.classId ?? null,
    exam_id: result.exam_id ?? null,
    subject_id: result.subject_id ?? result.subject ?? null,
    marks_obtained: result.marks_obtained ?? result.marks ?? null,
    max_marks: result.max_marks ?? result.maxMarks ?? 100,
    passing_marks: result.passing_marks ?? result.passingMarks ?? 33,
    status: result.status ?? deriveStatus(result.marks_obtained ?? result.marks, result.passing_marks ?? result.passingMarks ?? 33),
    created_at: createdAt,
    updated_at: updatedAt,
    studentId: result.student_id ?? result.studentId ?? null,
    teacherId: result.teacher_id ?? result.teacherId ?? null,
    classId: result.class_id ?? result.classId ?? null,
    examType: result.exam_id ?? null,
    subject: result.subject_id ?? result.subject ?? null,
    marks: result.marks_obtained ?? result.marks ?? null,
    createdAt,
    updatedAt,
  };
  console.log('[Utils] normalizeResultShape - Normalized result:', normalized);
  return normalized;
};

module.exports = {
  deriveStatus,
  normalizeIds,
  normalizeLegacyField,
  normalizeResultShape,
};
