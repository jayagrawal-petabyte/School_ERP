// // import React, { useState } from "react";

// // // Helper to generate initial dummy attendance status
// // const getInitialStatus = (day: number) => {
// //   if (day % 7 === 0) return "holiday";
// //   if (day % 5 === 0) return "absent";
// //   return "present";
// // };

// // const TeacherAttendanceCalendar: React.FC = () => {
// //   const today = new Date();
// //   const year = today.getFullYear();
// //   const month = today.getMonth();
// //   const monthName = today.toLocaleString("default", { month: "long" });

// //   const daysInMonth = new Date(year, month + 1, 0).getDate();

// //   // State to manage attendance statuses for the teacher to edit
// //   const [dayStatuses, setDayStatuses] = useState(
// //     Array.from({ length: daysInMonth }, (_, i) => ({
// //       day: i + 1,
// //       status: getInitialStatus(i + 1),
// //     }))
// //   );

// //   const toggleStatus = (index: number) => {
// //     setDayStatuses((prev) =>
// //       prev.map((item, i) => {
// //         if (i !== index) return item;
// //         const newStatus = 
// //           item.status === "present" ? "absent" : 
// //           item.status === "absent" ? "holiday" : "present";
// //         return { ...item, status: newStatus };
// //       })
// //     );
// //   };

// //   const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

// //   return (
// //     <div className="p-4 bg-white rounded-lg shadow">
// //       <h2 className="text-xl font-semibold mb-4">Edit Attendance – {monthName} {year}</h2>
      
// //       <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
// //         {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
// //           <div key={d}>{d}</div>
// //         ))}
// //       </div>
      
// //       <div className="grid grid-cols-7 gap-2">
// //         {Array.from({ length: firstWeekday }).map((_, i) => (
// //           <div key={`empty-${i}`} />
// //         ))}
        
// //         {dayStatuses.map(({ day, status }, index) => {
// //           const isToday =
// //             day === today.getDate() &&
// //             month === today.getMonth() &&
// //             year === today.getFullYear();
            
// //           const dotColor =
// //             status === "present" ? "bg-green-500" : 
// //             status === "absent" ? "bg-red-500" : "bg-gray-400";

// //           return (
// //             <button
// //               key={day}
// //               onClick={() => toggleStatus(index)}
// //               className={`flex flex-col items-center p-1 border rounded hover:bg-indigo-50 transition-colors ${
// //                 isToday ? "border-blue-500" : "border-transparent"
// //               }`}
// //             >
// //               <span className="text-sm mb-1">{day}</span>
// //               <span className={`w-3 h-3 rounded-full ${dotColor}`} />
// //             </button>
// //           );
// //         })}
// //       </div>
// //       <p className="mt-4 text-xs text-gray-500 italic">Click on a day to toggle status (Present / Absent / Holiday)</p>
// //     </div>
// //   );
// // };

// // export default TeacherAttendanceCalendar;


// import React, { useState } from "react";

// interface CalendarProps {
//   initialHistory: any[];
//   onUpdate: (newStatus: string, oldStatus: string) => void;
// }

// const TeacherAttendanceCalendar: React.FC<CalendarProps> = ({ initialHistory, onUpdate }) => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();
//   const monthName = today.toLocaleString("default", { month: "long" });

//   // Initialize state with the provided history
//   const [dayStatuses, setDayStatuses] = useState(initialHistory);

//   const toggleStatus = (index: number) => {
//     const oldStatus = dayStatuses[index].status;
//     // Toggle logic: Present -> Absent -> Holiday -> Present
//     const newStatus = 
//       oldStatus === "Present" ? "Absent" : 
//       oldStatus === "Absent" ? "Holiday" : "Present";

//     // Update local state
//     const newStatuses = [...dayStatuses];
//     newStatuses[index].status = newStatus;
//     setDayStatuses(newStatuses);

//     // Notify parent to update summary cards
//     onUpdate(newStatus, oldStatus);
//   };

//   const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

//   return (
//     <div className="p-4 bg-white rounded-lg shadow">
//       <h2 className="text-xl font-semibold mb-4">Edit Attendance – {monthName} {year}</h2>
      
//       <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
//         {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
//           <div key={d}>{d}</div>
//         ))}
//       </div>
      
//       <div className="grid grid-cols-7 gap-2">
//         {Array.from({ length: firstWeekday }).map((_, i) => (
//           <div key={`empty-${i}`} />
//         ))}
        
//         {dayStatuses.map(({ day, status }, index) => {
//           const isToday =
//             day === today.getDate() &&
//             month === today.getMonth() &&
//             year === today.getFullYear();
            
//           const dotColor =
//             status === "Present" ? "bg-green-500" : 
//             status === "Absent" ? "bg-red-500" : "bg-gray-400";

//           return (
//             <button
//               key={index}
//               onClick={() => toggleStatus(index)}
//               className={`flex flex-col items-center p-1 border rounded hover:bg-indigo-50 transition-colors ${
//                 isToday ? "border-blue-500" : "border-transparent"
//               }`}
//             >
//               <span className="text-sm mb-1">{day}</span>
//               <span className={`w-3 h-3 rounded-full ${dotColor}`} />
//             </button>
//           );
//         })}
//       </div>
//       <p className="mt-4 text-xs text-gray-500 italic">Click on a day to toggle status (Present / Absent / Holiday)</p>
//     </div>
//   );
// };

// export default TeacherAttendanceCalendar;


// import React, { useState } from "react";

// interface CalendarProps {
//   initialHistory: any[];
//   onUpdate: (newStatus: string, oldStatus: string) => void;
// }

// const TeacherAttendanceCalendar: React.FC<CalendarProps> = ({ initialHistory, onUpdate }) => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();
//   const monthName = today.toLocaleString("default", { month: "long" });

//   const [dayStatuses, setDayStatuses] = useState(initialHistory);

//   const toggleStatus = (index: number) => {
//     const oldStatus = dayStatuses[index].status;
//     const newStatus = 
//       oldStatus === "Present" ? "Absent" : 
//       oldStatus === "Absent" ? "Holiday" : "Present";

//     const newStatuses = [...dayStatuses];
//     newStatuses[index] = { ...newStatuses[index], status: newStatus };
//     setDayStatuses(newStatuses);

//     onUpdate(newStatus, oldStatus);
//   };

//   const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

//   return (
//     <div className="p-4 bg-white rounded-lg shadow">
//       <h2 className="text-xl font-semibold mb-4">Edit Attendance – {monthName} {year}</h2>
      
//       <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
//         {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
//           <div key={d}>{d}</div>
//         ))}
//       </div>
      
//       <div className="grid grid-cols-7 gap-2">
//         {Array.from({ length: firstWeekday }).map((_, i) => (
//           <div key={`empty-${i}`} />
//         ))}
        
//         {dayStatuses.map(({ day, status }, index) => {
//           const isToday =
//             day === today.getDate() &&
//             month === today.getMonth() &&
//             year === today.getFullYear();
            
//           const dotColor =
//             status === "Present" ? "bg-green-500" : 
//             status === "Absent" ? "bg-red-500" : "bg-gray-400";

//           return (
//             <button
//               key={index}
//               onClick={() => toggleStatus(index)}
//               className={`flex flex-col items-center p-1 border rounded hover:bg-indigo-50 transition-colors ${
//                 isToday ? "border-blue-500" : "border-transparent"
//               }`}
//             >
//               <span className="text-sm mb-1">{day}</span>
//               <span className={`w-3 h-3 rounded-full ${dotColor}`} />
//             </button>
//           );
//         })}
//       </div>
//       <p className="mt-4 text-xs text-gray-500 italic">Click on a day to toggle status (Present / Absent / Holiday)</p>
//     </div>
//   );
// };

// export default TeacherAttendanceCalendar;



// import React, { useState } from "react";

// interface CalendarProps {
//   initialHistory: any[];
//   onUpdate: (newStatus: string, oldStatus: string) => void;
// }

// const TeacherAttendanceCalendar: React.FC<CalendarProps> = ({ initialHistory, onUpdate }) => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = today.getMonth();
//   const monthName = today.toLocaleString("default", { month: "long" });

//   // Fallback to empty array if history is undefined
//   const [dayStatuses, setDayStatuses] = useState(initialHistory || []);

//   const toggleStatus = (index: number) => {
//     const oldStatus = dayStatuses[index].status;
//     const newStatus = 
//       oldStatus === "Present" ? "Absent" : 
//       oldStatus === "Absent" ? "Holiday" : "Present";

//     const newStatuses = [...dayStatuses];
//     newStatuses[index] = { ...newStatuses[index], status: newStatus };
//     setDayStatuses(newStatuses);

//     onUpdate(newStatus, oldStatus);
//   };

//   const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

//   return (
//     <div className="p-4 bg-white rounded-lg shadow">
//       <h2 className="text-xl font-semibold mb-4">Edit Attendance – {monthName} {year}</h2>
      
//       <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
//         {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
//           <div key={d}>{d}</div>
//         ))}
//       </div>
      
//       <div className="grid grid-cols-7 gap-2">
//         {Array.from({ length: firstWeekday }).map((_, i) => (
//           <div key={`empty-${i}`} />
//         ))}
        
//         {/* ADDED A CHECK: If dayStatuses is empty, this won't crash */}
//         {dayStatuses && dayStatuses.length > 0 ? (
//           dayStatuses.map((item, index) => {
//             // Safely extract day from date string (e.g., '2026-05-01') or fallback to index
//             const dayNum = item.date ? parseInt(item.date.split('-')[2]) : index + 1;
//             const dotColor =
//               item.status === "Present" ? "bg-green-500" : 
//               item.status === "Absent" ? "bg-red-500" : "bg-gray-400";

//             return (
//               <button
//                 key={index}
//                 onClick={() => toggleStatus(index)}
//                 className="flex flex-col items-center p-1 border rounded hover:bg-indigo-50 transition-colors"
//               >
//                 <span className="text-sm mb-1">{dayNum}</span>
//                 <span className={`w-3 h-3 rounded-full ${dotColor}`} />
//               </button>
//             );
//           })
//         ) : (
//           <p className="col-span-7 text-center p-4 text-gray-400">No attendance data available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TeacherAttendanceCalendar;


import React, { useState } from "react";

const TeacherAttendanceCalendar: React.FC = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthName = today.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;

  // Initialize status for every day of the month
  const [dayStatuses, setDayStatuses] = useState(
    Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      status: "Present", // Default status
    }))
  );

  const toggleStatus = (index: number) => {
    setDayStatuses((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newStatus = 
          item.status === "Present" ? "Absent" : 
          item.status === "Absent" ? "Holiday" : "Present";
        return { ...item, status: newStatus };
      })
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Attendance – {monthName} {year}</h2>
      
      <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
        {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => <div key={d}>{d}</div>)}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstWeekday }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {dayStatuses.map(({ day, status }, index) => {
          const dotColor = status === "Present" ? "bg-green-500" : status === "Absent" ? "bg-red-500" : "bg-gray-400";
          return (
            <button
              key={day}
              onClick={() => toggleStatus(index)}
              className="flex flex-col items-center p-1 border rounded hover:bg-indigo-50 transition-colors"
            >
              <span className="text-sm mb-1">{day}</span>
              <span className={`w-3 h-3 rounded-full ${dotColor}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherAttendanceCalendar;