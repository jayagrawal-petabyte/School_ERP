const { getClientForUser } = require("../services/database.service");

const submissions = [];

let nextId = 1;

function now() {
    return new Date().toISOString();
}

function getSupabaseClient(authHeader) {
    if (!authHeader) {
        throw new Error("Authorization header is required.");
    }

    const token = authHeader.split(" ")[1];

    return getClientForUser(token);
}

function addSubmission(data, authHeader) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase insert query
    void supabase;

    const submission = {
        id: String(nextId++),
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        file_url: data.file_url,
        file_name: data.file_name,
        file_type: data.file_type,
        file_size: data.file_size,
        status: data.status,
        submitted_at: data.submitted_at,
        created_at: now(),
        updated_at: now()
    };

    submissions.push(submission);

    return submission;
}

function findSubmission(id, authHeader) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase select query
    void supabase;

    return submissions.find(
        (submission) => submission.id === String(id)
    );
}

function findSubmissionByAssignmentAndStudent(
    assignmentId,
    studentId,
    authHeader
) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase select query
    void supabase;

    return submissions.find(
        (submission) =>
            submission.assignment_id === String(assignmentId) &&
            submission.student_id === String(studentId)
    );
}

function findStudentSubmissions(studentId, authHeader) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase select query
    void supabase;

    return submissions.filter(
        (submission) =>
            submission.student_id === String(studentId)
    );
}

function findAssignmentSubmissions(
    assignmentId,
    authHeader
) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase select query
    void supabase;

    return submissions.filter(
        (submission) =>
            submission.assignment_id === String(assignmentId)
    );
}

function updateSubmission(
    id,
    changes,
    authHeader
) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase update query
    void supabase;

    const submission = findSubmission(id, authHeader);

    if (!submission) {
        return null;
    }

    Object.assign(submission, changes, {
        updated_at: now()
    });

    return submission;
}

function removeSubmission(id, authHeader) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase delete query
    void supabase;

    const index = submissions.findIndex(
        (submission) => submission.id === String(id)
    );

    if (index === -1) {
        return null;
    }

    const [removed] = submissions.splice(index, 1);

    return removed;
}

function listSubmissions(authHeader) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase select query
    void supabase;

    return submissions;
}

function findSubmissionStatus(
    assignmentId,
    studentId,
    authHeader
) {

    const supabase = getSupabaseClient(authHeader);

    // TODO: Replace with Supabase select query
    void supabase;

    return submissions.find(
        (submission) =>
            submission.assignment_id === String(assignmentId) &&
            submission.student_id === String(studentId)
    );
}

module.exports = {
    addSubmission,
    findSubmission,
    findSubmissionByAssignmentAndStudent,
    findStudentSubmissions,
    findAssignmentSubmissions,
    updateSubmission,
    removeSubmission,
    listSubmissions,
    findSubmissionStatus
};