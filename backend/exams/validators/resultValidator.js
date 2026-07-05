const { normalizeLegacyField } = require('../utils/resultUtils');

const validateMarks = (req, res, next) => {
  normalizeLegacyField(req.body, 'studentId', 'student_id');
  normalizeLegacyField(req.body, 'teacherId', 'teacher_id');
  normalizeLegacyField(req.body, 'classId', 'class_id');
  normalizeLegacyField(req.body, 'examType', 'exam_id');
  normalizeLegacyField(req.body, 'subject', 'subject_id');
  normalizeLegacyField(req.body, 'marks', 'marks_obtained');
  normalizeLegacyField(req.body, 'maxMarks', 'max_marks');
  normalizeLegacyField(req.body, 'passingMarks', 'passing_marks');

  next();
};

module.exports = { validateMarks };
