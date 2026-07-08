
import React from "react";
import { AttendanceOverview } from "../components/AttendanceOverview";
import { SubjectAttendance } from "../components/SubjectAttendance";
import { MonthlyAttendance } from "../components/MonthlyAttendance";
import { AttendanceInsights } from "../components/AttendanceInsights";

// Dummy data
const dummyOverview = {
  overall: 82,
  present: 164,
  absent: 36,
  late: 12,
};

const dummySubjects = [
  { name: "Mathematics", present: 38, absent: 4, percentage: 90 },
  { name: "Science", present: 35, absent: 7, percentage: 83 },
  { name: "English", present: 32, absent: 10, percentage: 76 },
  { name: "History", present: 30, absent: 12, percentage: 71 },
  { name: "Geography", present: 29, absent: 13, percentage: 69 },
];

const dummyMonthly = [
  { month: "Jan", present: 22, absent: 3, percentage: 88 },
  { month: "Feb", present: 20, absent: 5, percentage: 80 },
  { month: "Mar", present: 18, absent: 6, percentage: 75 },
  { month: "Apr", present: 23, absent: 2, percentage: 92 },
  { month: "May", present: 21, absent: 4, percentage: 84 },
  { month: "Jun", present: 20, absent: 4, percentage: 83 },
];

const dummyInsights = [
  {
    icon: "📈",
    title: "Trend Upward",
    description: "Your attendance has improved by 8% compared to last month.",
  },
  {
    icon: "⚠️",
    title: "At Risk Subjects",
    description: "History and Geography need immediate attention.",
  },
  {
    icon: "💯",
    title: "Perfect Streak",
    description: "You had a 15-day perfect attendance streak in April.",
  },
  {
    icon: "⏰",
    title: "Late Arrivals",
    description: "Most late arrivals are on Monday mornings.",
  },
  {
    icon: "🏆",
    title: "Best Subject",
    description: "Mathematics has your highest attendance at 90%.",
  },
  {
    icon: "📅",
    title: "Monthly Goal",
    description: "Aim for 90% attendance in July to cross the 85% threshold.",
  },
];

export const AttendanceReports: React.FC = () => {
  const handleDownload = () => {
    // Dummy function
    alert("Report download initiated (dummy)");
  };

  const handlePrint = () => {
    // Dummy function
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Attendance Reports
          </h1>
          <p className="text-gray-600">
            View your complete attendance summary and insights
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            📥 Download Report
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      <AttendanceOverview
        overall={dummyOverview.overall}
        present={dummyOverview.present}
        absent={dummyOverview.absent}
        late={dummyOverview.late}
      />

      <SubjectAttendance subjects={dummySubjects} />

      <MonthlyAttendance monthlyData={dummyMonthly} />

      <AttendanceInsights insights={dummyInsights} />
    </div>
  );
};
