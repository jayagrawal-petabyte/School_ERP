const {
  getClientForUser,
} = require("../services/database.service");

function toDatabase(assignment) {
  return {
    title: assignment.title,
    description: assignment.description,
    subject: assignment.subject,
    class_id: assignment.classId,
    class_name: assignment.className,
    due_date: assignment.dueDate,
    created_by: assignment.createdBy,
  };
}

function toModel(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    classId: row.class_id,
    className: row.class_name,
    dueDate: row.due_date,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function addAssignment(token, data) {
  const supabase = getClientForUser(token);

  const { data: insertedAssignment, error } = await supabase
    .from("assignments")
    .insert(toDatabase(data))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return toModel(insertedAssignment);
}

async function findAssignment(token, id) {
  const supabase = getClientForUser(token);

  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return toModel(data);
}

async function updateAssignment(token, id, changes) {
  const supabase = getClientForUser(token);

  const {
    id: ignoredId,
    createdBy,
    createdAt,
    ...allowedChanges
  } = changes;

  const { data, error } = await supabase
    .from("assignments")
    .update(toDatabase(allowedChanges))
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return toModel(data);
}

async function removeAssignment(token, id) {
  const supabase = getClientForUser(token);

  const { data, error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return toModel(data);
}

/**
 * Look up the class IDs a student is enrolled in via the class_students table.
 * NOTE: class_students migration may be pending (Member 9). If the table does
 * not exist, this will log an error and return [], making assignments invisible
 * to students until the migration is applied.
 */
async function getStudentClassIds(token, studentId) {
  const supabase = getClientForUser(token);
  const { data, error } = await supabase
    .from("class_students")
    .select("class_id")
    .eq("student_id", studentId);

  if (error) {
    console.error(
      "getStudentClassIds failed for student %s: %s",
      studentId,
      error.message || error.code || "unknown error"
    );
    return [];
  }

  return (data || []).map((row) => row.class_id).filter(Boolean);
}

async function listAssignments(token, filters = {}) {
  const supabase = getClientForUser(token);

  let query = supabase
    .from("assignments")
    .select("*");

  if (filters.classIds) {
    if (filters.classIds.length === 0) {
      return [];
    }
    query = query.in("class_id", filters.classIds);
  } else if (filters.classId) {
    query = query.eq("class_id", filters.classId);
  }

  if (filters.subject) {
    query = query.eq("subject", filters.subject);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(toModel);
}

module.exports = {
  addAssignment,
  findAssignment,
  updateAssignment,
  removeAssignment,
  listAssignments,
  getStudentClassIds,
};