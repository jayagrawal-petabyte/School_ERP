import React from "react";
import AttendanceCalendar from "../../attendance/components/AttendanceCalendar";
import AttendanceSummary from "../../attendance/components/AttendanceSummary";
import AttendanceTable from "../../attendance/components/AttendanceTable";
import AttendanceTrend from "../../attendance/components/AttendanceTrend";


// Static attendance data – replace with API later
const attendanceData = {
  percentage: 92,
  monthly: [
    { month: "January", percent: 95 },
    { month: "February", percent: 90 },
    { month: "March", percent: 93 },
    { month: "April", percent: 91 },
    { month: "May", percent: 94 },
  ],
  recent: [
    { date: "2026-05-01", status: "Present" as const },
    { date: "2026-04-30", status: "Present" as const },
    { date: "2026-04-29", status: "Absent" as const },
    { date: "2026-04-28", status: "Present" as const },
    { date: "2026-04-27", status: "Present" as const },
  ],
};

const Attendance: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100 space-y-6">
      <AttendanceSummary />
      <AttendanceCalendar />
      <AttendanceTrend />
      {/* Recent Attendance Table */}
      <AttendanceTable recent={attendanceData.recent} />
    </div>
  );
};

export default Attendance;
