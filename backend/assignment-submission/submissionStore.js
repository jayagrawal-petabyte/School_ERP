const submissions = [];

let nextId = 1;

function now() {
    return new Date().toISOString();
}

function addSubmission(data) {

    const submission = {
        id: String(nextId++),
        assignmentId: String(data.assignmentId),
        studentId: String(data.studentId),
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        fileUrl: data.fileUrl || null,
        status: data.status || "submitted",
        submittedAt: now(),
        createdAt: now(),
        updatedAt: now()
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
            submission.assignmentId === String(assignmentId) &&
            submission.studentId === String(studentId)
    );
}

function findStudentSubmissions(studentId) {
    return submissions.filter(
        (submission) =>
            submission.studentId === String(studentId)
    );
}

function findAssignmentSubmissions(assignmentId) {
    return submissions.filter(
        (submission) =>
            submission.assignmentId === String(assignmentId)
    );
}

function updateSubmission(id, changes) {

    const submission = findSubmission(id);

    if (!submission) {
        return null;
    }

    Object.assign(submission, changes, {
        updatedAt: now()
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

module.exports = {
    addSubmission,
    findSubmission,
    findSubmissionByAssignmentAndStudent,
    findStudentSubmissions,
    findAssignmentSubmissions,
    updateSubmission,
    removeSubmission,
    listSubmissions
};