import React from "react";
import AttendanceSummary from "../components/AttendanceSummary";
import AttendanceCalendar from "../components/AttendanceCalendar";
import AttendanceTrend from "../components/AttendanceTrend";
import AttendanceTable from "../components/AttendanceTable";

// Static attendance data – same dummy data as before
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
    { date: "2023-05-01", status: "Present" },
    { date: "2023-04-30", status: "Present" },
    { date: "2023-04-29", status: "Absent" },
    { date: "2023-04-28", status: "Present" },
    { date: "2023-04-27", status: "Present" },
  ],
};

const Attendance: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100 space-y-6">
    <AttendanceSummary />
    <AttendanceCalendar />
    <AttendanceTrend />
    <AttendanceTable recent={attendanceData.recent} />
  </div>
);

export default Attendance;
