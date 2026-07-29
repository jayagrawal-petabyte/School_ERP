/**
 * ERPContext.jsx — School ERP | Shared State Layer
 * Single source of truth for students, teachers, parents, and activities.
 * Uses local state with backend API persistence for all CRUD operations.
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "../api/client";
import { API_ROUTES } from "../api/routes";

// ─── localStorage keys (for fallback/activities only) ────────────────────────
const ACTIVITIES_STORAGE_KEY = "erp_activities_v1";

const activityStorage = {
  get: () => { try { return JSON.parse(localStorage.getItem(ACTIVITIES_STORAGE_KEY)) || []; } catch { return []; } },
  set: (d) => localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(d)),
};

// ─── Activity ID generator ────────────────────────────────────────────────────
const generateActivityId = (existingActivities) => {
  const year = new Date().getFullYear();
  const prefix = `ACT${year}`;
  const taken = existingActivities
    .map((a) => a.id)
    .filter((id) => id && id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = taken.length > 0 ? Math.max(...taken) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
};

// ─── Activity message templates ──────────────────────────────────────────────
const ACTIVITY_MESSAGE_TEMPLATES = {
  "Student Added":        (name, id) => `New student ${name} (${id}) was admitted and added to the system.`,
  "Student Updated":      (name, id) => `Student ${name} (${id}) details were updated.`,
  "Student Deactivated":  (name, id) => `Student ${name} (${id}) was marked inactive.`,
  "Student Restored":     (name, id) => `Student ${name} (${id}) was restored to active status.`,
  "Student Deleted":      (name, id) => `Student ${name} (${id}) was removed from the system.`,

  "Teacher Added":        (name, id) => `New teacher ${name} (${id}) was added to the system.`,
  "Teacher Updated":      (name, id) => `Teacher ${name} (${id}) details were updated.`,
  "Teacher Deactivated":  (name, id) => `Teacher ${name} (${id}) was marked inactive.`,
  "Teacher Restored":     (name, id) => `Teacher ${name} (${id}) was restored to active status.`,

  "Parent Created":       (name, id) => `Parent record for ${name} (${id}) was automatically created from student admission.`,
  "Parent Updated":       (name, id) => `Parent ${name} (${id}) details were synchronized with student records.`,
  "Parent Deactivated":   (name, id) => `Parent ${name} (${id}) was moved to inactive — no active children remain.`,
  "Parent Restored":      (name, id) => `Parent ${name} (${id}) was restored to active status.`,
};

const buildActivityDescription = (type, name, id) => {
  const template = ACTIVITY_MESSAGE_TEMPLATES[type];
  return template ? template(name, id) : `${type}: ${name} (${id})`;
};

// ─── Student ↔ Parent sync helpers ───────────────────────────────────────────
const generateParentId = (allParents) => {
  const year = new Date().getFullYear();
  const prefix = `PAR${year}`;
  const taken = allParents
    .map((p) => p.id)
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = taken.length > 0 ? Math.max(...taken) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
};

// ─── Helper to unwrap API response ───────────────────────────────────────────
const unwrapData = (response) => {
  if (response?.success && response?.data !== undefined) return response.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

// ─── Context ─────────────────────────────────────────────────────────────────
const ERPContext = createContext(undefined);

export function ERPProvider({ children }) {
  const [students, setStudents]             = useState([]);
  const [studentCounter, setStudentCounter] = useState(1);
  const [teachers, setTeachers]             = useState([]);
  const [parents, setParents]               = useState([]);
  const [activities, setActivities]         = useState(() => activityStorage.get());
  const [loading, setLoading]               = useState(true);

  // ── Fetch all data from backend on mount ──────────────────────────────────
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const [studentsRes, teachersRes, parentsRes] = await Promise.allSettled([
          apiClient.get(API_ROUTES.student.list),
          apiClient.get(API_ROUTES.teacher.list),
          apiClient.get(API_ROUTES.parent.list),
        ]);

        if (studentsRes.status === 'fulfilled') {
          const data = unwrapData(studentsRes.value.data);
          setStudents(Array.isArray(data) ? data : []);
          setStudentCounter(data.length + 1);
        }

        if (teachersRes.status === 'fulfilled') {
          const data = unwrapData(teachersRes.value.data);
          setTeachers(Array.isArray(data) ? data.map(t => ({ ...t, active: t.active !== false })) : []);
        }

        if (parentsRes.status === 'fulfilled') {
          const data = unwrapData(parentsRes.value.data);
          setParents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('ERPContext: Failed to fetch initial data from API, using empty state.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ── Persist activities to localStorage ────────────────────────────────────
  useEffect(() => { activityStorage.set(activities); }, [activities]);

  // ── Activity logger ───────────────────────────────────────────────────────
  const addActivity = useCallback((type, name, id) => {
    setActivities((prev) => {
      const newActivity = {
        id: generateActivityId(prev),
        type,
        description: buildActivityDescription(type, name, id),
        date: new Date().toISOString().split("T")[0],
        timestamp: new Date().toISOString(),
        module: type.startsWith("Student") ? "Students" : type.startsWith("Teacher") ? "Teachers" : "Parents",
        recordName: name,
        recordId: id,
        status: "Completed",
      };
      return [newActivity, ...prev];
    });

    // Also post activity to backend notifications
    try {
      apiClient.post(API_ROUTES.notification.list, {
        type,
        description: buildActivityDescription(type, name, id),
        record_name: name,
        record_id: id,
      }).catch(() => {});
    } catch (e) { /* silent */ }
  }, []);

  // ── Student actions ───────────────────────────────────────────────────────

  const addStudent = useCallback(async (studentData, counter) => {
    const year = new Date().getFullYear();
    const seq  = String(counter).padStart(4, "0");
    const newId = `STD${year}${seq}`;
    
    try {
      // Post to backend
      const response = await apiClient.post(API_ROUTES.student.list, {
        ...studentData,
        studentId: newId,
        status: "Active",
      });
      
      const createdStudent = unwrapData(response.data) || response.data;
      
      setStudents((prev) => [...prev, { ...createdStudent, id: createdStudent.id || `internal_${Date.now()}`, studentId: newId, status: "Active" }]);
      setStudentCounter((c) => c + 1);
    } catch (err) {
      // Fallback to local-only if API fails
      const newStudent = {
        id: `internal_${Date.now()}`,
        studentId: newId,
        ...studentData,
        status: "Active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setStudents((prev) => [...prev, newStudent]);
      setStudentCounter((c) => c + 1);
    }

    addActivity("Student Added", studentData.name.trim(), newId);
    return newId;
  }, [addActivity]);

  const updateStudent = useCallback(async (id, updatedData) => {
    let studentName = updatedData.name?.trim() || "";
    
    try {
      await apiClient.patch(API_ROUTES.student.byId(id), updatedData);
    } catch (err) {
      console.warn('Failed to update student on backend, updating locally.', err);
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id || s.studentId === id) {
          studentName = updatedData.name?.trim() || s.name;
          return { ...s, ...updatedData, updatedAt: new Date().toISOString() };
        }
        return s;
      })
    );

    if (studentName) addActivity("Student Updated", studentName, id);
  }, [addActivity]);

  const deleteStudent = useCallback(async (id) => {
    let deletedName = "";
    let deletedId = "";

    try {
      await apiClient.delete(API_ROUTES.student.byId(id));
    } catch (err) {
      console.warn('Failed to delete student on backend, removing locally.', err);
    }

    setStudents((prev) => {
      const found = prev.find((s) => s.id === id || s.studentId === id);
      if (found) { deletedName = found.name; deletedId = found.studentId || id; }
      return prev.filter((s) => s.id !== id && s.studentId !== id);
    });

    if (deletedName && deletedId) addActivity("Student Deleted", deletedName, deletedId);
  }, [addActivity]);

  const toggleStudentStatus = useCallback(async (id) => {
    let name = "";
    let stdId = "";
    let action = "";
    let willBeActive = false;

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id || s.studentId === id) {
          name = s.name;
          stdId = s.studentId || id;
          willBeActive = s.status !== "Active";
          action = s.status === "Active" ? "Student Deactivated" : "Student Restored";
          
          // Also call backend
          try {
            apiClient.patch(API_ROUTES.student.byId(id), { status: willBeActive ? "Active" : "Inactive" });
          } catch (e) {}

          return { ...s, status: willBeActive ? "Active" : "Inactive", updatedAt: new Date().toISOString() };
        }
        return s;
      })
    );

    if (name && stdId) addActivity(action, name, stdId);
  }, [addActivity]);

  // ── Teacher actions ───────────────────────────────────────────────────────

  const addTeacher = useCallback(async (teacherData, newId) => {
    try {
      const response = await apiClient.post(API_ROUTES.teacher.list, {
        ...teacherData,
        active: true,
      });
      const createdTeacher = unwrapData(response.data) || response.data;
      setTeachers((prev) => [...prev, { id: createdTeacher.id || newId, ...teacherData, active: true }]);
    } catch (err) {
      // Fallback: store locally
      setTeachers((prev) => [...prev, { id: newId, ...teacherData, active: true }]);
    }
    addActivity("Teacher Added", teacherData.name, newId);
  }, [addActivity]);

  const updateTeacher = useCallback(async (id, updatedData) => {
    const name = updatedData.name || "";
    
    try {
      await apiClient.patch(API_ROUTES.teacher.byId(id), updatedData);
    } catch (err) {
      console.warn('Failed to update teacher on backend, updating locally.', err);
    }

    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id === id) return { ...t, ...updatedData };
        return t;
      })
    );

    if (name) addActivity("Teacher Updated", name, id);
  }, [addActivity]);

  const deactivateTeacher = useCallback(async (id) => {
    let name = "";
    
    try {
      await apiClient.patch(API_ROUTES.teacher.status(id), { active: false });
    } catch (err) {
      await apiClient.patch(API_ROUTES.teacher.byId(id), { active: false }).catch(() => {});
    }

    setTeachers((prev) =>
      prev.map((t) => { if (t.id === id) { name = t.name; return { ...t, active: false }; } return t; })
    );

    if (name) addActivity("Teacher Deactivated", name, id);
  }, [addActivity]);

  const restoreTeacher = useCallback(async (id) => {
    let name = "";
    
    try {
      await apiClient.patch(API_ROUTES.teacher.status(id), { active: true });
    } catch (err) {
      await apiClient.patch(API_ROUTES.teacher.byId(id), { active: true }).catch(() => {});
    }

    setTeachers((prev) =>
      prev.map((t) => { if (t.id === id) { name = t.name; return { ...t, active: true }; } return t; })
    );

    if (name) addActivity("Teacher Restored", name, id);
  }, [addActivity]);

  // ── Parent actions ────────────────────────────────────────────────────────

  const addParent = useCallback(async (parentData, newId) => {
    try {
      const response = await apiClient.post(API_ROUTES.parent.list, parentData);
      const createdParent = unwrapData(response.data) || response.data;
      setParents((prev) => [...prev, { id: createdParent.id || newId, ...parentData, active: true }]);
    } catch (err) {
      setParents((prev) => [...prev, { id: newId, ...parentData, active: true }]);
    }
    addActivity("Parent Created", parentData.name, newId);
  }, [addActivity]);

  const updateParent = useCallback(async (id, updatedData) => {
    const name = updatedData.name || "";
    
    try {
      await apiClient.patch(API_ROUTES.parent.byId(id), updatedData);
    } catch (err) {
      console.warn('Failed to update parent on backend, updating locally.', err);
    }

    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) return { ...p, ...updatedData };
        return p;
      })
    );

    if (name) addActivity("Parent Updated", name, id);
  }, [addActivity]);

  const deactivateParent = useCallback(async (id) => {
    let name = "";
    
    try {
      await apiClient.patch(API_ROUTES.parent.status(id), { active: false });
    } catch (err) {
      await apiClient.patch(API_ROUTES.parent.byId(id), { active: false }).catch(() => {});
    }

    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) { name = p.name; return { ...p, active: false, parentStatus: "Inactive" }; }
        return p;
      })
    );

    if (name) addActivity("Parent Deactivated", name, id);
  }, [addActivity]);

  const restoreParent = useCallback(async (id) => {
    let name = "";
    
    try {
      await apiClient.patch(API_ROUTES.parent.status(id), { active: true });
    } catch (err) {
      await apiClient.patch(API_ROUTES.parent.byId(id), { active: true }).catch(() => {});
    }

    setParents((prev) =>
      prev.map((p) => {
        if (p.id === id) { name = p.name; return { ...p, active: true, parentStatus: "Active" }; }
        return p;
      })
    );

    if (name) addActivity("Parent Restored", name, id);
  }, [addActivity]);

  const value = {
    students, setStudents,
    studentCounter, setStudentCounter,
    teachers, setTeachers,
    parents, setParents,
    activities,
    loading,

    // Student actions
    addStudent,
    updateStudent,
    deleteStudent,
    toggleStudentStatus,

    // Teacher actions
    addTeacher,
    updateTeacher,
    deactivateTeacher,
    restoreTeacher,

    // Parent actions
    addParent,
    updateParent,
    deactivateParent,
    restoreParent,

    // Utility
    addActivity,
  };

  return <ERPContext.Provider value={value}>{children}</ERPContext.Provider>;
}

export function useERP() {
  const ctx = useContext(ERPContext);
  if (ctx === undefined) throw new Error("useERP must be used within an ERPProvider");
  return ctx;
}

export default ERPContext;
