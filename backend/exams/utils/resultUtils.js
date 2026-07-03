const deriveStatus = (marksObtained, passingMarks) => {
  if (marksObtained === undefined || marksObtained === null || marksObtained === '') return 'pending';
  return Number(marksObtained) >= Number(passingMarks || 0) ? 'pass' : 'fail';
};

const pickExam = (e) => {
  if (!e) return null;
  return {
    id: e.id,
    name: e.name,
    term: e.term,
    academic_year: e.academic_year,
    class_id: e.class_id,
  };
};

const pickSubject = (s) => {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    class_id: s.class_id,
    sub_code: s.sub_code,
  };
};

module.exports = {
  deriveStatus,
  pickExam,
  pickSubject,
};
