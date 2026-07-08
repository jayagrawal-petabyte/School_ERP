const assignments = [];

let nextId = 1;

function now() {
  return new Date().toISOString();
}

function addAssignment(data) {
  const assignment = {
    id: String(nextId++),

    title: data.title,
    description: data.description,
    subject: data.subject,

    // Transition support
    classId: data.classId || null,
    className: data.className || null,

    dueDate: data.dueDate,

    createdBy: data.createdBy,

    createdAt: now(),
    updatedAt: now(),
  };

  assignments.push(assignment);

  return assignment;
}

function findAssignment(id) {
  return assignments.find(
    (assignment) => assignment.id === String(id)
  );
}

function updateAssignment(id, changes) {
  const assignment = findAssignment(id);

  if (!assignment) {
    return null;
  }

  // Never allow these fields to be overwritten
  const {
    id: ignoredId,
    createdBy,
    createdAt,
    ...allowedChanges
  } = changes;

  Object.assign(assignment, allowedChanges, {
    updatedAt: now(),
  });

  return assignment;
}

function removeAssignment(id) {
  const index = assignments.findIndex(
    (assignment) => assignment.id === String(id)
  );

  if (index === -1) {
    return null;
  }

  const [removedAssignment] = assignments.splice(index, 1);

  return removedAssignment;
}

function listAssignments(filters = {}) {
  let result = [...assignments];

  if (filters.classId) {
    result = result.filter(
      (assignment) => assignment.classId === filters.classId
    );
  }

  if (filters.subject) {
    result = result.filter(
      (assignment) => assignment.subject === filters.subject
    );
  }

  return result;
}

module.exports = {
  addAssignment,
  findAssignment,
  updateAssignment,
  removeAssignment,
  listAssignments,
};