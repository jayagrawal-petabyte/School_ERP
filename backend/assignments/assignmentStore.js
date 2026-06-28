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
    className: data.className,
    dueDate: data.dueDate,
    createdBy: data.createdBy,
    createdAt: now(),
    updatedAt: now(),
  };

  assignments.push(assignment);

  return assignment;
}

function findAssignment(id) {
  return assignments.find((item) => item.id === String(id));
}

function updateAssignment(id, changes) {
  const assignment = findAssignment(id);

  if (!assignment) {
    return null;
  }

  Object.assign(assignment, changes, {
    updatedAt: now(),
  });

  return assignment;
}

function removeAssignment(id) {
  const index = assignments.findIndex(
    (item) => item.id === String(id)
  );

  if (index === -1) {
    return null;
  }

  const [removed] = assignments.splice(index, 1);

  return removed;
}

function listAssignments() {
  return assignments;
}

module.exports = {
  addAssignment,
  findAssignment,
  updateAssignment,
  removeAssignment,
  listAssignments,
};