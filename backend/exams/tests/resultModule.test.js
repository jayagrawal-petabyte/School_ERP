const test = require('node:test');
const assert = require('node:assert/strict');

const resultService = require('../service/resultService');

const makeUser = (overrides = {}) => ({
  id: 'teacher-1',
  role: 'teacher',
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
  await assert.rejects(
    () =>
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
      ),
    
  );
});
