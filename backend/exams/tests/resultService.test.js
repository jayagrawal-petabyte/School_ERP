const test = require('node:test');
const assert = require('node:assert/strict');

const resultService = require('../service/resultService');
const resultRepository = require('../repository/resultRepository');
const relationshipService = require('../service/relationshipService');
const AppError = require('../errors/AppError');

// Keep originals to restore after tests
const origRepo = { ...resultRepository };
const origRel = { ...relationshipService };

test('createResult normalizes legacy input and returns enriched record', async () => {
  // stub relationship checks
  relationshipService.examExists = async () => true;
  relationshipService.subjectExists = async () => true;

  // stub repository create and findById
  const createdRow = {
    id: 'res-1',
    student_id: 'student-1',
    teacher_id: 'teacher-1',
    subject_id: 'math',
    exam_id: 'midterm',
    marks_obtained: 82,
    max_marks: 100,
    passing_marks: 33,
    status: 'pass',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  resultRepository.create = async (payload) => ({ ...createdRow });
  resultRepository.findById = async (id) => ({ ...createdRow });

  const user = { id: 'teacher-1', role: 'teacher' };
  const input = {
    studentId: 'student-1',
    teacherId: 'teacher-1',
    subject: 'math',
    examType: 'midterm',
    marks: 82,
    classId: 'class-7',
  };

  const created = await resultService.createResult(input, user);
  assert.equal(created.student_id, 'student-1');
  assert.equal(created.teacher_id, 'teacher-1');
  assert.equal(created.subject_id, 'math');
  assert.equal(created.exam_id, 'midterm');
  assert.equal(created.marks_obtained, 82);
  assert.equal(created.max_marks, 100);
  assert.equal(created.passing_marks, 33);
  assert.equal(created.status, 'pass');
});

test('updateResult honors optimistic locking conflict', async () => {
  // prepare existing result
  const existing = {
    id: 'res-2',
    student_id: 'student-2',
    teacher_id: 'teacher-1',
    marks_obtained: 50,
    max_marks: 100,
    passing_marks: 33,
    status: 'pass',
    created_at: new Date().toISOString(),
    updated_at: '2020-01-01T00:00:00.000Z',
  };

  resultRepository.findById = async (id) => ({ ...existing });

  // simulate repository update throwing a 409 when expectedUpdatedAt mismatches
  resultRepository.update = async (id, updates, expectedUpdatedAt) => {
    if (expectedUpdatedAt && expectedUpdatedAt !== existing.updated_at) {
      throw new AppError('Result was modified by another process', 409);
    }
    return { ...existing, ...updates };
  };

  // attempt update with stale token
  await assert.rejects(
    () => resultService.updateResult('res-2', { marks_obtained: 60, updated_at: '2019-01-01T00:00:00.000Z' }, { id: 'teacher-1', role: 'teacher' }),
    (err) => err instanceof AppError && err.statusCode === 409
  );
});

test('createResult without marks stores pending status and null marks', async () => {
  relationshipService.examExists = async () => true;
  relationshipService.subjectExists = async () => true;
  relationshipService.getTeacherClassIds = async () => ['class-7'];

  const createdRow = {
    id: 'res-3',
    student_id: 'student-3',
    teacher_id: 'teacher-2',
    subject_id: 'math',
    exam_id: 'midterm',
    marks_obtained: null,
    max_marks: 100,
    passing_marks: 33,
    status: 'pending',
    class_id: 'class-7',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  resultRepository.create = async (payload) => {
    assert.equal(payload.marks_obtained, undefined);
    assert.equal(payload.status, 'pending');
    return { ...createdRow };
  };
  resultRepository.findById = async (id) => ({ ...createdRow });

  const user = { id: 'teacher-2', role: 'teacher' };
  const input = {
    studentId: 'student-3',
    subject: 'math',
    examType: 'midterm',
    classId: 'class-7',
  };

  const created = await resultService.createResult(input, user);
  assert.equal(created.status, 'pending');
  assert.equal(created.marks_obtained, null);
});

test('createResult forbids teacher for unassigned class', async () => {
  relationshipService.examExists = async () => true;
  relationshipService.subjectExists = async () => true;
  relationshipService.getTeacherClassIds = async () => [];

  const user = { id: 'teacher-3', role: 'teacher' };
  const input = {
    studentId: 'student-4',
    subject: 'math',
    examType: 'midterm',
    classId: 'class-99',
  };

  await assert.rejects(
    () => resultService.createResult(input, user),
    (err) => err instanceof AppError && err.statusCode === 403
  );
});

test('getAllResults returns pagination for admin', async () => {
  // stub repository.findFiltered
  const rows = [
    { id: 'r1', student_id: 's1', exam_id: 'e1', subject_id: 'sub1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'r2', student_id: 's2', exam_id: 'e2', subject_id: 'sub2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
  resultRepository.findFiltered = async (filters, options) => ({ data: rows, pagination: { total: 2, limit: options.limit || 20, offset: options.offset || 0 } });

  // stub metadata batch fetch
  relationshipService.fetchExamsByIds = async (ids) => {
    const map = {};
    for (const id of ids) map[id] = { id, name: `Exam ${id}`, term: 'T1', academic_year: '2026', class_id: 'class-1' };
    return map;
  };
  relationshipService.fetchSubjectsByIds = async (ids) => {
    const map = {};
    for (const id of ids) map[id] = { id, name: `Sub ${id}`, class_id: 'class-1', sub_code: 'SC' };
    return map;
  };

  const admin = { id: 'admin-1', role: 'admin' };
  const res = await resultService.getAllResults(admin, { page: 1, limit: 2 });
  assert.ok(res.pagination);
  assert.equal(res.pagination.page, 1);
  assert.equal(res.pagination.limit, 2);
  assert.equal(res.data.length, 2);
  // metadata should be attached
  assert.ok(res.data[0].exam_meta);
});

// restore originals
test('cleanup', () => {
  Object.assign(resultRepository, origRepo);
  Object.assign(relationshipService, origRel);
});
