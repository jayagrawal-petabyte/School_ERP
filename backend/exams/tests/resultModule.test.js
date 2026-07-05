const test = require('node:test');
const assert = require('node:assert/strict');

const resultService = require('../service/resultService');
const resultRepository = require('../repository/resultRepository');
const relationshipService = require('../service/relationshipService');
const ROLES = require('../constants/roles');

const makeUser = (overrides = {}) => ({
  id: 'teacher-1',
  role: ROLES.TEACHER,
  ...overrides,
});

test('createResult normalizes legacy input to reporting-friendly fields', async () => {
  const created = await resultService.createResult(
    {
      studentId: 'student-1',
      teacherId: 'teacher-1',
      subject: 'math',
      examType: 'midterm',
      marks: 82,
      classId: 'class-7',
    },
    makeUser()
  );

  assert.equal(created.student_id, 'student-1');
  assert.equal(created.teacher_id, 'teacher-1');
  assert.equal(created.subject_id, 'math');
  assert.equal(created.exam_id, 'midterm');
  assert.equal(created.marks_obtained, 82);
  assert.equal(created.class_id, 'class-7');
  assert.equal(created.max_marks, 100);
  assert.equal(created.passing_marks, 33);
  assert.equal(created.status, 'pass');
});

test('createResult rejects marks that exceed max_marks', async () => {
  await assert.rejects(() =>
    resultService.createResult(
      {
        studentId: 'student-2',
        teacherId: 'teacher-1',
        subject: 'science',
        examType: 'final',
        marks_obtained: 120,
        max_marks: 100,
      },
      makeUser()
    )
  );
});

test('updateResult recomputes status when marks or thresholds change', async () => {
  const created = await resultService.createResult(
    {
      studentId: 'student-3',
      teacherId: 'teacher-1',
      subject: 'history',
      examType: 'quiz',
      marks_obtained: 60,
      max_marks: 100,
      passing_marks: 40,
      classId: 'class-7',
    },
    makeUser()
  );

  const updated = await resultService.updateResult(created.id, {
    marks_obtained: 35,
    passing_marks: 40,
  }, {
    user: makeUser(),
  });

  assert.equal(updated.status, 'fail');
});

test('getAllResults supports pagination, filtering and sorting', async () => {
  const response = await resultService.getAllResults(makeUser(), {
    filters: { classId: 'class-7' },
    sortBy: 'created_at',
    order: 'desc',
    page: 1,
    limit: 5,
  });

  assert.equal(response.page, 1);
  assert.equal(response.limit, 5);
  assert.equal(Array.isArray(response.data), true);
  assert.equal(response.total >= 0, true);
  assert.equal(response.totalPages >= 0, true);
});

test('parent can view only their own children\'s results', async () => {
  const originalFindAll = resultRepository.findAll;
  const originalGetParentStudentIds = relationshipService.getParentStudentIds;

  resultRepository.findAll = async () => ({
    data: [
      { id: 'result-1', student_id: 'student-1', class_id: 'class-7', teacher_id: 'teacher-1', status: 'pass' },
      { id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' },
    ],
  });
  relationshipService.getParentStudentIds = async () => ['student-1'];

  try {
    const response = await resultService.getAllResults({ id: 'parent-1', role: ROLES.PARENT }, { page: 1, limit: 10 });
    assert.equal(response.data.length, 1);
    assert.equal(response.data[0].id, 'result-1');
  } finally {
    resultRepository.findAll = originalFindAll;
    relationshipService.getParentStudentIds = originalGetParentStudentIds;
  }
});

test('parent cannot view another parent\'s child result', async () => {
  const originalFindById = resultRepository.findById;
  const originalGetParentStudentIds = relationshipService.getParentStudentIds;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });
  relationshipService.getParentStudentIds = async () => ['student-1'];

  try {
    await assert.rejects(() => resultService.getResultById('result-2', { user: { id: 'parent-1', role: ROLES.PARENT } }));
  } finally {
    resultRepository.findById = originalFindById;
    relationshipService.getParentStudentIds = originalGetParentStudentIds;
  }
});

test('student cannot access another student\'s result', async () => {
  const originalFindById = resultRepository.findById;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });

  try {
    await assert.rejects(() => resultService.getResultById('result-2', { user: { id: 'student-1', role: ROLES.STUDENT } }));
  } finally {
    resultRepository.findById = originalFindById;
  }
});

test('teacher cannot modify results outside assigned classes', async () => {
  const originalFindById = resultRepository.findById;
  const originalGetTeacherClassIds = relationshipService.getTeacherClassIds;
  const originalUpdate = resultRepository.update;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });
  relationshipService.getTeacherClassIds = async () => ['class-7'];
  resultRepository.update = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });

  try {
    await assert.rejects(() => resultService.updateResult('result-2', { marks_obtained: 55 }, { user: { id: 'teacher-1', role: ROLES.TEACHER } }));
  } finally {
    resultRepository.findById = originalFindById;
    relationshipService.getTeacherClassIds = originalGetTeacherClassIds;
    resultRepository.update = originalUpdate;
  }
});

test('admin can access any result', async () => {
  const originalFindById = resultRepository.findById;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });

  try {
    const result = await resultService.getResultById('result-2', { user: { id: 'admin-1', role: ROLES.ADMIN } });
    assert.equal(result.id, 'result-2');
  } finally {
    resultRepository.findById = originalFindById;
  }
});

test('principal can access any result', async () => {
  const originalFindById = resultRepository.findById;

  resultRepository.findById = async () => ({ id: 'result-2', student_id: 'student-2', class_id: 'class-8', teacher_id: 'teacher-2', status: 'fail' });

  try {
    const result = await resultService.getResultById('result-2', { user: { id: 'principal-1', role: ROLES.PRINCIPAL } });
    assert.equal(result.id, 'result-2');
  } finally {
    resultRepository.findById = originalFindById;
  }
});

// exams/middleware/authorize.js
const AppError = require('../errors/AppError');
const relationshipService = require('../service/relationshipService');
const AUTH_MESSAGES = require('../../auth/constants/authMessages');
const ROLES = require('../constants/roles');

const normalizeRole = (role) => (role == null ? '' : String(role).trim().toLowerCase());

const checkOwnership = async (user, resourceContext) => {
  if (!resourceContext) {
    return false;
  }

  const role = normalizeRole(user.role);
  const studentId = resourceContext.student_id || resourceContext.studentId;
  const teacherId = resourceContext.teacher_id || resourceContext.teacherId;
  const classId = resourceContext.class_id || resourceContext.classId;

  // Admin and principal bypass ownership checks entirely and retain full access.
  if (role === ROLES.ADMIN || role === ROLES.PRINCIPAL) {
    return true;
  }

  if (role === ROLES.STUDENT) {
    return String(studentId) === String(user.id);
  }

  if (role === ROLES.TEACHER) {
    if (String(teacherId) === String(user.id)) {
      return true;
    }

    if (Array.isArray(resourceContext.assignedTeacherIds)) {
      return resourceContext.assignedTeacherIds.map((id) => String(id)).includes(String(user.id));
    }

    if (classId) {
      return relationshipService.isTeacherAssignedToClass(user.id, classId);
    }

    return false;
  }

  if (role === ROLES.PARENT) {
    if (!studentId) {
      return false;
    }

    return relationshipService.isParentOfStudent(user.id, studentId);
  }

  return false;
};

const authorize = ({ ownership, requireOwnership = false } = {}) => {
  const ownershipConfig = ownership === true
    ? { enabled: true }
    : (ownership || (requireOwnership ? { enabled: true } : {}));

  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.UNAUTHORIZED,
      });
    }

    if (ownershipConfig.enabled) {
      try {
        const resourceContext = ownershipConfig.resolver
          ? await ownershipConfig.resolver(req)
          : (ownershipConfig.param ? req.params?.[ownershipConfig.param] : null);

        if (!resourceContext) {
          return next(new AppError('Resource not found.', 404));
        }

        // Reuse the fetched result context in the service layer to avoid duplicate lookups.
        req.resourceOwner = resourceContext;

        const isOwner = await checkOwnership(req.user, resourceContext);
        if (!isOwner) {
          return next(new AppError(AUTH_MESSAGES.FORBIDDEN, 403));
        }
      } catch (error) {
        return next(error);
      }
    }

    return next();
  };
};

module.exports = authorize;
