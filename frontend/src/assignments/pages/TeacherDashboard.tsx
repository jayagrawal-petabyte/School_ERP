import React, { useEffect, useMemo, useState } from 'react';
import { AssignmentCard } from '../components/AssignmentCard';
import { getAssignments } from '../../api/assignmentService';
import { getAssignmentSubmissions } from '../../api/submissionService';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  submissionCount: number;
}

const normalizeAssignments = (payload: any): Array<Record<string, any>> => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.assignments)) return data.assignments;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const TeacherDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAssignments();
        const assignmentList = normalizeAssignments(response);

        const enrichedAssignments = await Promise.all(
          assignmentList.map(async (assignment: any) => {
            let submissionCount = Number(assignment.submissionCount ?? assignment.submissionsCount ?? 0);

            if (!submissionCount && assignment.id) {
              try {
                const submissionsResponse = await getAssignmentSubmissions(String(assignment.id));
                const submissionsData = submissionsResponse?.data ?? submissionsResponse;
                submissionCount = Array.isArray(submissionsData)
                  ? submissionsData.length
                  : Array.isArray(submissionsData?.submissions)
                    ? submissionsData.submissions.length
                    : 0;
              } catch {
                submissionCount = 0;
              }
            }

            return {
              id: String(assignment.id),
              title: assignment.title ?? assignment.name ?? 'Assignment',
              description: assignment.description ?? assignment.details ?? 'No description provided.',
              dueDate: assignment.dueDate ?? assignment.deadline ?? '',
              maxMarks: Number(assignment.maxMarks ?? assignment.marks ?? 0),
              submissionCount,
            };
          })
        );

        setAssignments(enrichedAssignments);
      } catch (fetchError) {
        console.error('Failed to load teacher dashboard assignments:', fetchError);
        setError('Failed to load assignments from the API.');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const totalAssignments = useMemo(() => assignments.length, [assignments]);

  if (loading) {
    return <div className="max-w-5xl mx-auto p-6 text-gray-500">Loading assignments...</div>;
  }

  if (error) {
    return <div className="max-w-5xl mx-auto p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage created assignments and review student submissions.</p>
        </div>

        <button 
          onClick={() => (window.location.href = "/teacher/assignments/create")}
          className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition self-start"
        >
          + New Assignment
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">You haven't posted any assignments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="relative">
              <AssignmentCard
                title={assignment.title}
                description={assignment.description}
                dueDate={assignment.dueDate}
                maxMarks={assignment.maxMarks}
                role="teacher"
              />
              <div className="absolute top-4 right-24 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {assignment.submissionCount} Turned In
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};