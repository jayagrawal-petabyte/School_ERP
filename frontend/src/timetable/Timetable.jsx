import React, { useState } from "react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = ["P1 (8:00 - 8:45)", "P2 (8:45 - 9:30)", "Break (9:30 - 10:00)", "P3 (10:00 - 10:45)", "P4 (10:45 - 11:30)"];

export default function Timetable() {
  const [selectedClass, setSelectedClass] = useState("10-A");

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Timetable Management</h1>
          <p className="text-gray-500 text-sm">Manage class schedules and teacher allocations</p>
        </div>
        <button className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
          + Add Entry
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border-t border-l border-r border-gray-200 flex gap-4 items-center">
        <label className="text-sm font-semibold text-gray-700">Select Class:</label>
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none min-w-[150px]">
          <option value="10-A">Class 10-A</option>
          <option value="10-B">Class 10-B</option>
          <option value="9-A">Class 9-A</option>
        </select>
      </div>

      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-[#f8f9fc]">
                <th className="p-4 border border-gray-200 text-gray-500 font-bold uppercase text-xs w-[12%]">Day / Time</th>
                {periods.map(p => <th key={p} className="p-4 border border-gray-200 text-gray-500 font-bold uppercase text-xs w-[17%]">{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day}>
                  <td className="p-4 border border-gray-200 font-bold text-gray-700 bg-gray-50">{day}</td>
                  {periods.map((p, idx) => (
                    <td key={idx} className={`border border-gray-200 p-2 ${p.includes('Break') ? 'bg-gray-100' : 'hover:bg-blue-50 cursor-pointer group'}`}>
                      {p.includes('Break') ? (
                        <span className="text-gray-400 font-semibold text-sm">BREAK</span>
                      ) : (
                        <div className="h-full w-full min-h-[60px] rounded-lg flex flex-col justify-center relative">
                          <div className="font-semibold text-[#3949ab] text-sm">Mathematics</div>
                          <div className="text-xs text-gray-500">Mr. Sharma</div>
                          <div className="text-xs text-gray-400">Room 101</div>
                          
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button className="bg-white border border-gray-300 rounded p-1 text-xs hover:bg-gray-100 text-gray-600">✎</button>
                          </div>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
