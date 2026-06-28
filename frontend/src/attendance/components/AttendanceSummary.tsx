import React from "react";

// Dummy summary data – will be replaced by API later
const summary = {
  overall: 92,
  present: 180,
  absent: 10,
  late: 5,
};

const AttendanceSummary: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {/* Overall Attendance */}
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100 text-center">
      <p className="text-sm text-gray-500">Overall Attendance</p>
      <p className="text-3xl font-bold text-blue-800">{summary.overall}%</p>
    </div>
    {/* Present Days */}
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100 text-center">
      <p className="text-sm text-gray-500">Present Days</p>
      <p className="text-3xl font-bold text-green-800">{summary.present}</p>
    </div>
    {/* Absent Days */}
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100 text-center">
      <p className="text-sm text-gray-500">Absent Days</p>
      <p className="text-3xl font-bold text-red-800">{summary.absent}</p>
    </div>
    {/* Late Arrivals */}
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100 text-center">
      <p className="text-sm text-gray-500">Late Arrivals</p>
      <p className="text-3xl font-bold text-yellow-800">{summary.late}</p>
    </div>
  </div>
);

export default AttendanceSummary;
