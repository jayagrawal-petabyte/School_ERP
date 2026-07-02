import React, { useEffect, useState } from 'react';
import ResultStatistics from './ResultStatistics';
import MarksTable from './MarksTable'; 
import PerformanceChart from './PerformanceChart';

// 1. ADD OUTSIDE the component function
const getRemarks = (subjects: any[]) => {
  const strong = subjects.filter(s => s.obtained >= 90).map(s => s.name);
  const weak = subjects.filter(s => s.obtained < 75).map(s => s.name);
  return { strong, weak };
};

const ResultsPage: React.FC = () => {
  const user = { id: 'STU123', role: 'Student' }; 
  const token = 'mock-jwt-token';
  
  // 2. UPDATE your mockSummary object
  const mockSummary = {
    totalMarks: 450,
    maxMarks: 500,
    overallPercentage: 90.0,
    overallGrade: 'A+',
    studentRank: '05',
    classAverage: '82.5%'
  };

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

  // 3. ADD INSIDE the component body (before the return statement)
  const { strong, weak } = getRemarks(mockSubjects);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setError('Unauthorized access. Please log in.');
      setLoading(false);
      return;
    }
    if (user.role !== 'Student') {
      setError('This view is restricted to Students.');
      setLoading(false);
      return;
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Examination Results</h1>
        <p className="text-gray-500 mt-1">View your latest academic performance</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-3">
            <ResultStatistics summary={mockSummary} />
        </div>

        <div className="col-span-1 lg:col-span-2 space-y-6">
           <div className="p-4 rounded-xl shadow-sm border border-gray-200 bg-white">
             <MarksTable subjects={mockSubjects} />
           </div>
           
           {/* 4. ADD the new Remarks Box here */}
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
          <PerformanceChart subjects={mockSubjects} />
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;