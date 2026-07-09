import { useEffect, useState, type FC } from 'react';
import ResultStatistics from './ResultStatistics';
import MarksTable from './MarksTable'; 
import PerformanceChart from './PerformanceChart';
import { useAuth } from "../context/AuthContext"; 

interface Subject {
  name: string;
  maxMarks: number;
  obtained: number;
  grade: string;
}

const getRemarks = (subjects: Subject[]) => {
  const strong = subjects.filter(s => s.obtained >= 90).map(s => s.name);
  const weak = subjects.filter(s => s.obtained < 75).map(s => s.name);
  return { strong, weak };
};

const ResultsPage: FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const mockSubjects = [
    { name: 'Mathematics', maxMarks: 100, obtained: 95, grade: 'A+' },
    { name: 'Physics', maxMarks: 100, obtained: 88, grade: 'A' },
    { name: 'Chemistry', maxMarks: 100, obtained: 92, grade: 'A' },
    { name: 'Biology', maxMarks: 100, obtained: 85, grade: 'B+' },
    { name: 'History', maxMarks: 100, obtained: 78, grade: 'B' },
    { name: 'Geography', maxMarks: 100, obtained: 80, grade: 'B+' },
    { name: 'Political Science', maxMarks: 100, obtained: 84, grade: 'B+' },
    { name: 'Economics', maxMarks: 100, obtained: 79, grade: 'B' },
    { name: 'English', maxMarks: 100, obtained: 89, grade: 'A' },
    { name: 'Language', maxMarks: 100, obtained: 91, grade: 'A' },
    { name: 'Computer Science', maxMarks: 100, obtained: 98, grade: 'O' }
  ];

  const [editableSubjects, setEditableSubjects] = useState(mockSubjects);

  const handleSave = () => {
    console.log("Saving updated marks:", editableSubjects);
    setIsEditing(false);
    alert("Marks updated successfully!");
  };

  const mockSummary = {
    totalMarks: 450, maxMarks: 500, overallPercentage: 90.0,
    overallGrade: 'A+', studentRank: '05', classAverage: '82.5%'
  };

  const { strong, weak } = getRemarks(editableSubjects);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user === undefined) return;
    const timer = setTimeout(() => {
      if (!user) {
        setError('Unauthorized access. Please log in.');
        setLoading(false);
        return;
      }
      const normalizedRole = user.role?.toLowerCase();
      if (!['student', 'teacher', 'admin'].includes(normalizedRole)) {
        setError(`Unauthorized role: ${user.role}`);
        setLoading(false);
        return;
      }
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Examination Results</h1>
          <p className="text-gray-500 mt-1">View your latest academic performance</p>
        </div>

        {(user?.role?.toLowerCase() === 'teacher' || user?.role?.toLowerCase() === 'admin') && (
          <div className="flex gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Edit Marks
              </button>
            ) : (
              <>
                <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                  Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition">
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-3">
            <ResultStatistics summary={mockSummary} />
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
           <div className="p-4 rounded-xl shadow-sm border border-gray-200 bg-white">
             {isEditing ? (
               <div className="space-y-4">
                 <h3 className="font-semibold text-gray-700">Edit Subject Marks</h3>
                 {editableSubjects.map((sub, index) => (
                   <div key={index} className="flex justify-between items-center border-b pb-2">
                     <span>{sub.name}</span>
                     <input 
                       type="number" 
                       value={sub.obtained}
                       className="border p-1 rounded w-20 text-center"
                       onChange={(e) => {
                         const newSubjects = [...editableSubjects];
                         newSubjects[index].obtained = parseInt(e.target.value) || 0;
                         setEditableSubjects(newSubjects);
                       }}
                     />
                   </div>
                 ))}
               </div>
             ) : (
               <MarksTable subjects={editableSubjects} />
             )}
           </div>
           
           <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
             <h3 className="font-semibold text-blue-800">Performance Insight</h3>
             <p className="text-sm text-blue-600 mt-1">
               <strong>Strengths:</strong> {strong.length > 0 ? strong.join(', ') : 'None'}
             </p>
             <p className="text-sm text-blue-600 mt-1">
               <strong>Needs Improvement:</strong> {weak.length > 0 ? weak.join(', ') : 'None'}
             </p>
           </div>
        </div>

        <div className="col-span-1 p-4 rounded-xl shadow-sm border border-gray-200 bg-white">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Performance Trends</h3>
          <PerformanceChart subjects={editableSubjects} />
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
