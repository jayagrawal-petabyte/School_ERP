import { useEffect, useMemo, useRef, useState } from "react";
import MarksTable from "../components/MarksTable";
import type { MarksRowState } from "../components/MarksTable";
import ResultFilters from "../components/ResultFilters";
import examService from "../services/examService";
import type { Student } from "../types/exam";

// TODO: Replace with backend API — classService.getClasses()
const CLASS_OPTIONS = [
  { id: "c1", label: "Class 6 - A" },
  { id: "c2", label: "Class 7 - A" },
];

// TODO: Replace with backend API — subjectService.getSubjects()
const SUBJECT_OPTIONS = [
  { id: "s1", label: "Mathematics" },
  { id: "s2", label: "Science" },
  { id: "s3", label: "English" },
];

// TODO: Replace with backend API — examService.getExams()
const EXAM_OPTIONS = [
  { id: "e1", label: "Mid Term" },
  { id: "e2", label: "Final Term" },
];

// TODO: Replace with backend API — studentService.getStudentsByClass(classId)
async function fetchStudentsByClass(_classId: string): Promise<Student[]> {
  return [
    {
      id: "1",
      name: "Rahul Sharma",
      rollNo: "101",
    },
    {
      id: "2",
      name: "Priya Singh",
      rollNo: "102",
    },
    {
      id: "3",
      name: "Amit Kumar",
      rollNo: "103",
    },
    {
      id: "4",
      name: "Neha Gupta",
      rollNo: "104",
    },
  ];
}

const MAX_MARKS_DEFAULT = 100;
const PASSING_MARKS_DEFAULT = 33;

// Validates a raw input string against backend rules:
// required, numeric, >= 0, <= maxMarks
function validateMarks(value: string, maxMarks: number): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null; // empty = not yet entered, not an error
  const num = Number(trimmed);
  if (Number.isNaN(num)) return "Enter a valid number";
  if (num < 0) return "Marks cannot be negative";
  if (num > maxMarks) return `Marks cannot exceed ${maxMarks}`;
  return null;
}

export default function TeacherMarksEntry() {
  const [classId, setClassId] = useState("");
  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [rows, setRows] = useState<Record<string, MarksRowState>>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Used inside handleSaveAll to suppress per-row success toasts during a batch save
  const isBatchSaving = useRef(false);

  const filtersComplete = Boolean(classId && subject && examType);

  // Auto-dismiss toast after 3.5 s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Reload students whenever all three filters are selected
  useEffect(() => {
    if (!classId || !subject || !examType) {
      setStudents([]);
      setRows({});
      return;
    }

    let isMounted = true;
    setLoadingStudents(true);

    fetchStudentsByClass(classId)
      .then((list) => {
        if (!isMounted) return;
        setStudents(list);
        setRows(
          Object.fromEntries(
            list.map((s) => [
              s.id,
              { studentId: s.id, marks: "", error: null, isExisting: false },
            ])
          )
        );
      })
      .catch(() => {
        if (isMounted) setToast({ type: "error", text: "Failed to load students" });
      })
      .finally(() => {
        if (isMounted) setLoadingStudents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [classId, subject, examType]);

  function handleMarksChange(studentId: string, value: string) {
    const error = validateMarks(value, MAX_MARKS_DEFAULT);
    setRows((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], marks: value, error },
    }));
  }

  // Returns true on success, false on failure — used by handleSaveAll to tally results
  async function handleSaveRow(studentId: string): Promise<boolean> {
    const row = rows[studentId];
    if (!row || row.error || row.marks.trim() === "") return false;

    setSavingStudentId(studentId);
    try {
      const payload = {
        studentId,
        subject,
        examType,
        classId,
        marks: Number(row.marks),
        maxMarks: MAX_MARKS_DEFAULT,
        passingMarks: PASSING_MARKS_DEFAULT,
      };

      if (row.isExisting && row.resultId) {
        await examService.updateMarks(row.resultId, payload);
        if (!isBatchSaving.current) {
          setToast({ type: "success", text: "Marks updated successfully" });
        }
      } else {
        const created = await examService.uploadMarks(payload);
        setRows((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            isExisting: true,
            resultId: created?.id ?? prev[studentId]?.resultId,
          },
        }));
        if (!isBatchSaving.current) {
          setToast({ type: "success", text: "Marks saved successfully" });
        }
      }

      return true;
    } catch {
      if (!isBatchSaving.current) {
        setToast({ type: "error", text: "Failed to save marks. Please try again." });
      }
      return false;
    } finally {
      setSavingStudentId(null);
    }
  }

  async function handleSaveAll() {
    const validStudentIds = students
      .map((s) => s.id)
      .filter((id) => rows[id]?.marks.trim() !== "" && !rows[id]?.error);

    if (validStudentIds.length === 0) {
      setToast({ type: "error", text: "Enter valid marks before saving" });
      return;
    }

    setSavingAll(true);
    isBatchSaving.current = true;

    let failCount = 0;

    for (const studentId of validStudentIds) {
      // eslint-disable-next-line no-await-in-loop
      const succeeded = await handleSaveRow(studentId);
      if (!succeeded) failCount += 1;
    }

    isBatchSaving.current = false;
    setSavingAll(false);

    if (failCount === 0) {
      setToast({ type: "success", text: "All marks saved successfully" });
    } else if (failCount < validStudentIds.length) {
      setToast({
        type: "error",
        text: `${failCount} student(s) could not be saved. Please review and try again.`,
      });
    } else {
      setToast({ type: "error", text: "Failed to save marks. Please try again." });
    }
  }

  function handleReset() {
    setRows(
      Object.fromEntries(
        students.map((s) => [
          s.id,
          { studentId: s.id, marks: "", error: null, isExisting: false },
        ])
      )
    );
  }

  const hasAnyExisting = useMemo(
    () => Object.values(rows).some((r) => r.isExisting),
    [rows]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Marks Entry</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select class, subject and exam to enter or update student marks.
        </p>
      </div>

      {toast && (
        <div
          className={`rounded-lg px-4 py-3 text-sm font-medium text-white ${
            toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          {toast.text}
        </div>
      )}

      <ResultFilters
        classes={CLASS_OPTIONS}
        subjects={SUBJECT_OPTIONS}
        exams={EXAM_OPTIONS}
        classId={classId}
        subject={subject}
        examType={examType}
        onClassChange={setClassId}
        onSubjectChange={setSubject}
        onExamChange={setExamType}
      />

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        {!filtersComplete ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-sm text-gray-500">
            Select class, subject and exam to load the student list.
          </div>
        ) : loadingStudents ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12 text-center text-sm text-gray-500">
            No students found for this class.
            <br />
            <span className="text-xs text-gray-400">
              (Student list API is not wired up yet — see TODO in this file.)
            </span>
          </div>
        ) : (
          <>
            <MarksTable
              students={students}
              rows={rows}
              maxMarks={MAX_MARKS_DEFAULT}
              passingMarks={PASSING_MARKS_DEFAULT}
              onMarksChange={handleMarksChange}
              onSaveRow={handleSaveRow}
              savingStudentId={savingStudentId}
              disabled={savingAll}
            />

            <div className="mt-4 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={savingAll}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={savingAll}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {savingAll ? "Saving..." : hasAnyExisting ? "Update Marks" : "Save Marks"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
