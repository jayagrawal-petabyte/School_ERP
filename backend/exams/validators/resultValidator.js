const AppError = require('../errors/AppError');

const normalizeLegacyField = (req, sourceKey, targetKey) => {
  if (req.body[sourceKey] !== undefined && req.body[targetKey] === undefined) {
    req.body[targetKey] = req.body[sourceKey];
  }
};

const validateMarks = (req, res, next) => {
  normalizeLegacyField(req, 'studentId', 'student_id');
  normalizeLegacyField(req, 'teacherId', 'teacher_id');
  normalizeLegacyField(req, 'classId', 'class_id');
  normalizeLegacyField(req, 'examType', 'exam_id');
  normalizeLegacyField(req, 'subject', 'subject_id');
  normalizeLegacyField(req, 'marks', 'marks_obtained');
  normalizeLegacyField(req, 'maxMarks', 'max_marks');
  normalizeLegacyField(req, 'passingMarks', 'passing_marks');

  const marks = req.body.marks_obtained ?? req.body.marks;
  const maxMarks = req.body.max_marks ?? req.body.maxMarks ?? 100;
  const passingMarks = req.body.passing_marks ?? req.body.passingMarks ?? Math.min(33, Number(maxMarks) || 100);

  if (req.method === 'POST' && (marks === undefined || marks === null || marks === '')) {
    return next(new AppError('Marks are required', 400));
  }

  if (marks !== undefined && marks !== null && marks !== '') {
    const marksNum = Number(marks);

    if (Number.isNaN(marksNum) || typeof marks === 'boolean') {
      return next(new AppError('Marks must be a number', 400));
    }

    if (marksNum < 0) {
      return next(new AppError('marks_obtained must be greater than or equal to 0', 400));
    }

    req.body.marks_obtained = marksNum;
    delete req.body.marks;
  }

  if (maxMarks !== undefined && maxMarks !== null && maxMarks !== '') {
    const maxMarksNum = Number(maxMarks);
    if (Number.isNaN(maxMarksNum) || typeof maxMarks === 'boolean' || maxMarksNum <= 0) {
      return next(new AppError('max_marks must be greater than 0', 400));
    }
    req.body.max_marks = maxMarksNum;
    delete req.body.maxMarks;
  }

  if (passingMarks !== undefined && passingMarks !== null && passingMarks !== '') {
    const passingMarksNum = Number(passingMarks);
    if (Number.isNaN(passingMarksNum) || typeof passingMarks === 'boolean') {
      return next(new AppError('passing_marks must be a number', 400));
    }
    if (passingMarksNum < 0 || passingMarksNum > (Number(req.body.max_marks) || 100)) {
      return next(new AppError('passing_marks must be between 0 and max_marks', 400));
    }
    req.body.passing_marks = passingMarksNum;
    delete req.body.passingMarks;
  }

  next();
};

module.exports = { validateMarks };
