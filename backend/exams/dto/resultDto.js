const toResultResponse = (result, role) => {
  const safeRole = String(role || '').toLowerCase();
  const response = {
    id: result.id,
    studentId: result.studentId,
    subject: result.subject,
    examType: result.examType,
    marks: result.marks,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };

  if (safeRole !== 'student') {
    response.teacherId = result.teacherId;
  }

  return response;
};

const toResultsResponse = (results, role) => results.map((result) => toResultResponse(result, role));

module.exports = {
  toResultResponse,
  toResultsResponse,
};
