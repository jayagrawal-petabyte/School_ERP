const validateAttendanceDate = (dateString) => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    inputDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (inputDate > currentDate) {
        return { valid: false, message: "Attendance date cannot be in the future." };
    }
    return { valid: true };
};

const validateAttendanceStatus = (status) => {
    const allowedStatuses = ['present', 'absent', 'late'];
    if (!allowedStatuses.includes(status?.toLowerCase())) {
        return { valid: false, message: "Status must be 'present', 'absent', or 'late'." };
    }
    return { valid: true };
};

module.exports = { validateAttendanceDate, validateAttendanceStatus };