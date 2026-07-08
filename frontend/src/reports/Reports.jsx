import React from "react";

export default function Reports() {
  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm">Comprehensive school performance and operational reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Student Reports", desc: "Admission trends, demographics, and active student lists.", icon: "🎓", color: "bg-blue-50 text-blue-600" },
          { title: "Teacher Reports", desc: "Staff allocation, attendance, and performance metrics.", icon: "👨‍🏫", color: "bg-indigo-50 text-indigo-600" },
          { title: "Attendance Reports", desc: "Daily, weekly, and monthly attendance summaries.", icon: "📅", color: "bg-green-50 text-green-600" },
          { title: "Examination Reports", desc: "Class-wise academic performance and grade distributions.", icon: "📑", color: "bg-yellow-50 text-yellow-600" },
          { title: "Fee Reports", desc: "Collection summaries, pending dues, and financial health.", icon: "💳", color: "bg-red-50 text-red-600" },
          { title: "Library Reports", desc: "Book issuance, overdue returns, and inventory status.", icon: "📚", color: "bg-purple-50 text-purple-600" },
        ].map(r => (
          <div key={r.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 ${r.color}`}>
              {r.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{r.title}</h3>
            <p className="text-sm text-gray-500 mb-6 min-h-[40px]">{r.desc}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                <span>📄</span> Export PDF
              </button>
              <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
                <span>📊</span> Export Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Analytics Overview</h3>
        <div className="h-64 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 italic">
          [Charts & Graphs Dashboard Area]
        </div>
      </div>
    </div>
  );
}
