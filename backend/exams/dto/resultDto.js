const toResultResponse = (result, role) => {
  const safeRole = String(role || '').toLowerCase();
  const response = {
    id: result.id,
    student_id: result.student_id ?? result.studentId,
    teacher_id: result.teacher_id ?? result.teacherId,
    class_id: result.class_id ?? result.classId,
    exam_id: result.exam_id ?? result.examType,
    subject_id: result.subject_id ?? result.subject,
    marks_obtained: result.marks_obtained ?? result.marks,
    max_marks: result.max_marks ?? 100,
    passing_marks: result.passing_marks ?? 33,
    status: result.status ?? (result.marks_obtained !== undefined ? (Number(result.marks_obtained) >= Number(result.passing_marks || 0) ? 'pass' : 'fail') : 'pending'),
    created_at: result.created_at ?? result.createdAt,
    updated_at: result.updated_at ?? result.updatedAt,
    studentId: result.student_id ?? result.studentId,
    teacherId: result.teacher_id ?? result.teacherId,
    classId: result.class_id ?? result.classId,
    examType: result.exam_id ?? result.examType,
    subject: result.subject_id ?? result.subject,
    marks: result.marks_obtained ?? result.marks,
    createdAt: result.created_at ?? result.createdAt,
    updatedAt: result.updated_at ?? result.updatedAt,
  };

  if (safeRole !== 'student') {
    response.teacherId = result.teacher_id ?? result.teacherId;
    response.teacher_id = result.teacher_id ?? result.teacherId;
  }

  return response;
};

const toResultsResponse = (results, role) => results.map((result) => toResultResponse(result, role));

module.exports = {
  toResultResponse,
  toResultsResponse,
};
