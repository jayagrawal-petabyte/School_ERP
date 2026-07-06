const submissions = [];

let nextId = 1;

function now() {
    return new Date().toISOString();
}

function addSubmission(data) {

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

function findSubmission(id) {
    return submissions.find(
        (submission) => submission.id === String(id)
    );
}

function findSubmissionByAssignmentAndStudent(
    assignmentId,
    studentId
) {
    return submissions.find(
        (submission) =>
            submission.assignment_id === String(assignmentId) &&
            submission.student_id === String(studentId)
    );
}

function findStudentSubmissions(studentId) {
    return submissions.filter(
        (submission) =>
            submission.student_id === String(studentId)
    );
}

function findAssignmentSubmissions(assignmentId) {
    return submissions.filter(
        (submission) =>
            submission.assignment_id === String(assignmentId)
    );
}

function updateSubmission(id, changes) {

    const submission = findSubmission(id);

    if (!submission) {
        return null;
    }

    Object.assign(submission, changes, {
        updated_at: now()
    });

    return submission;
}

function removeSubmission(id) {

    const index = submissions.findIndex(
        (submission) => submission.id === String(id)
    );

    if (index === -1) {
        return null;
    }

    const [removed] = submissions.splice(index, 1);

    return removed;
}

function listSubmissions() {
    return submissions;
}
function findSubmissionStatus(assignmentId, studentId) {

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