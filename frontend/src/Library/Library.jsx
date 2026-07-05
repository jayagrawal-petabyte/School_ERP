import React, { useState } from "react";

const mockBooks = [
  { id: "LIB001", title: "Advanced Mathematics", author: "R.D. Sharma", isbn: "978-81938", category: "Mathematics", copies: 5, available: 3, status: "Available" },
  { id: "LIB002", title: "Physics Concepts", author: "H.C. Verma", isbn: "978-93821", category: "Physics", copies: 3, available: 0, status: "Out of Stock" },
  { id: "LIB003", title: "History of India", author: "Romila Thapar", isbn: "978-01434", category: "History", copies: 2, available: 2, status: "Available" },
];

export default function Library() {
  const [search, setSearch] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);

  const filteredBooks = mockBooks.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Library Management</h1>
          <p className="text-gray-500 text-sm">Manage books catalog, issues, and returns</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowIssueModal(true)} className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
            Issue Book
          </button>
          <button className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
            + Add New Book
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Books", val: "1,250", color: "border-l-[#3949ab]" },
          { label: "Books Issued", val: "185", color: "border-l-yellow-500" },
          { label: "Overdue Returns", val: "12", color: "border-l-red-500" },
          { label: "Available", val: "1,053", color: "border-l-green-500" },
        ].map(s => (
          <div key={s.label} className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 ${s.color}`}>
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{s.label}</h3>
            <p className="text-2xl font-bold text-gray-800">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center">
          <input 
            placeholder="Search books by title, author, or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-200">Book ID</th>
                <th className="p-4 font-bold border-b border-gray-200">Title & Author</th>
                <th className="p-4 font-bold border-b border-gray-200">Category</th>
                <th className="p-4 font-bold border-b border-gray-200 text-center">Copies (Total/Avail)</th>
                <th className="p-4 font-bold border-b border-gray-200 text-center">Status</th>
                <th className="p-4 font-bold border-b border-gray-200 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredBooks.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="p-4"><span className="font-mono text-[#3949ab] bg-[#e8eaf6] px-2 py-1 rounded font-bold">{b.id}</span></td>
                  <td className="p-4 font-semibold text-gray-800">{b.title}<div className="text-xs text-gray-500 font-normal mt-0.5">by {b.author}</div></td>
                  <td className="p-4 text-gray-600">{b.category}</td>
                  <td className="p-4 text-center font-semibold">{b.copies} / {b.available}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      b.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-[#3949ab] bg-[#e8eaf6] hover:bg-[#c5cae9] px-3 py-1.5 rounded font-semibold transition-colors text-xs">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Issue Book</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID</label>
                <input placeholder="e.g. STU2023015" className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Book ID</label>
                <input placeholder="e.g. LIB001" className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowIssueModal(false)} className="flex-1 bg-[#3949ab] hover:bg-[#283593] text-white px-4 py-2.5 rounded-lg font-semibold transition-colors">Issue</button>
              <button onClick={() => setShowIssueModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
