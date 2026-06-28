import React from "react";

// Helper to generate dummy attendance status for each day
const getDummyStatus = (day: number) => {
  // Deterministic dummy data: every 7th day is holiday, every 5th day absent, otherwise present
  if (day % 7 === 0) return "holiday";
  if (day % 5 === 0) return "absent";
  return "present";
};

const AttendanceCalendar: React.FC = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0‑based index
  const monthName = today.toLocaleString("default", { month: "long" });

  // Number of days in the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build an array of days with dummy status
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    status: getDummyStatus(i + 1),
  }));

  // Weekday of the first of the month (Monday = 0, Sunday = 6)
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Roll No. 21 – {monthName} {year}</h2>
      {/* Header row with weekdays */}
      <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
        {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before the first day */}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {/* Actual day cells */}
        {days.map(({ day, status }) => {
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const dotColor =
            status === "present"
              ? "bg-green-500"
              : status === "absent"
              ? "bg-red-500"
              : "bg-gray-400";
          return (
            <div
              key={day}
              className={`flex flex-col items-center p-1 border rounded ${isToday ? "border-blue-500" : "border-transparent"}`}
            >
              <span className="text-sm mb-1">{day}</span>
              <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
