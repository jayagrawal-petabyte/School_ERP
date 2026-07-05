import React, { useState, useMemo, useCallback } from "react";

// Mock Data
const initialParents = [
  { id: "PAR2023001", name: "Rajesh Kumar", studentId: "STU2023015", studentName: "Aarav Kumar", phone: "9876543210", email: "rajesh.k@example.com", occupation: "Software Engineer", status: "Active" },
  { id: "PAR2023002", name: "Priya Sharma", studentId: "STU2023022", studentName: "Diya Sharma", phone: "9876543211", email: "priya.s@example.com", occupation: "Doctor", status: "Active" },
];

const EMPTY_FORM = { name: "", studentId: "", phone: "", email: "", occupation: "" };

export default function Parents() {
  const [parents, setParents] = useState(initialParents);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleEdit = (p) => {
    setForm(p);
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this parent?")) {
      setParents((prev) => prev.filter((p) => p.id !== id));
      showToast("Parent deleted successfully", "error");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setParents((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...form } : p)));
      showToast("Parent updated successfully");
    } else {
      const newId = `PAR${new Date().getFullYear()}${String(parents.length + 1).padStart(3, '0')}`;
      setParents((prev) => [{ ...form, id: newId, status: "Active", studentName: "Pending Link" }, ...prev]);
      showToast("Parent added successfully");
    }
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const filteredParents = parents.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-lg shadow-lg font-semibold text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Parent Management</h1>
          <p className="text-gray-500 text-sm">Manage student guardians and contacts</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
            + Add Parent
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-bold text-[#1a1f36] mb-4">{editingId ? 'Edit Parent' : 'Add New Parent'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] focus:ring-1 focus:ring-[#3949ab] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Linked Student ID *</label>
              <input required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] focus:ring-1 focus:ring-[#3949ab] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] focus:ring-1 focus:ring-[#3949ab] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] focus:ring-1 focus:ring-[#3949ab] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Occupation</label>
              <input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:border-[#3949ab] focus:ring-1 focus:ring-[#3949ab] outline-none" />
            </div>
            <div className="md:col-span-2 flex gap-3 mt-2">
              <button type="submit" className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">Save Parent</button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditingId(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg font-semibold transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center">
          <input 
            placeholder="Search parents by name or student ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-200">Parent ID</th>
                <th className="p-4 font-bold border-b border-gray-200">Name</th>
                <th className="p-4 font-bold border-b border-gray-200">Linked Student</th>
                <th className="p-4 font-bold border-b border-gray-200">Phone</th>
                <th className="p-4 font-bold border-b border-gray-200">Status</th>
                <th className="p-4 font-bold border-b border-gray-200 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredParents.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="p-4"><span className="font-mono text-[#3949ab] bg-[#e8eaf6] px-2 py-1 rounded font-bold">{p.id}</span></td>
                  <td className="p-4 font-semibold text-gray-800">{p.name}<div className="text-xs text-gray-500 font-normal">{p.email}</div></td>
                  <td className="p-4">{p.studentName} <span className="text-xs text-gray-400">({p.studentId})</span></td>
                  <td className="p-4">{p.phone}</td>
                  <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{p.status}</span></td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleEdit(p)} className="text-[#3949ab] bg-[#e8eaf6] hover:bg-[#c5cae9] px-3 py-1.5 rounded font-semibold mr-2 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded font-semibold transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
              {filteredParents.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 italic">No parents found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
