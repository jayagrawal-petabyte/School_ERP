let results = [];
let nextId = 1;

const deriveStatus = (marksObtained, passingMarks) => {
  if (marksObtained === undefined || marksObtained === null || marksObtained === '') {
    return 'pending';
  }

  return Number(marksObtained) >= Number(passingMarks || 0) ? 'pass' : 'fail';
};

const normalizeResult = (result) => {
  const createdAt = result.created_at || result.createdAt || new Date().toISOString();
  const updatedAt = result.updated_at || result.updatedAt || createdAt;

  return {
    ...result,
    id: String(result.id),
    student_id: result.student_id ?? result.studentId ?? null,
    teacher_id: result.teacher_id ?? result.teacherId ?? null,
    class_id: result.class_id ?? result.classId ?? null,
    exam_id: result.exam_id ?? result.examType ?? null,
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
    examType: result.exam_id ?? result.examType ?? null,
    subject: result.subject_id ?? result.subject ?? null,
    marks: result.marks_obtained ?? result.marks ?? null,
    createdAt,
    updatedAt,
  };
};

const create = async (resultData) => {
  const result = normalizeResult({
    id: String(nextId++),
    ...resultData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  results.push(result);
  return result;
};

const update = async (id, updates) => {
  const index = results.findIndex((result) => result.id === String(id));
  if (index === -1) {
    return null;
  }

  const existingResult = results[index];
  const updatedResult = normalizeResult({
    ...existingResult,
    ...updates,
    updated_at: new Date().toISOString(),
  });

  results[index] = updatedResult;
  return updatedResult;
};

const findById = async (id) => {
  const result = results.find((item) => item.id === String(id));
  return result ? normalizeResult(result) : null;
};

const findAll = async () => results.map((result) => normalizeResult(result));

module.exports = {
  create,
  update,
  findById,
  findAll,
};
