// src/components/Exam.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VerifyApp from './VerifyApp';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  starter_code: Record<string, string>;
  test_cases: { input: any[]; expected: any; description: string }[];
}

const Exam: React.FC = () => {
  const navigate = useNavigate();

  /* ---------- state ---------- */
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerification, setShowVerification] = useState(false);

  /* ---------- load problems once ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/problems');
        const data = await res.json();
        setProblems(data.problems);
      } catch (err) {
        console.error('Failed to fetch problems', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading coding problems…</p>
      </div>
    );

  if (!problems.length)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">No problems available</p>
      </div>
    );

  /* ---------- main JSX ---------- */
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-900">
            ← Back to Home
          </button>
          <span className="text-lg font-semibold">EvalEdge Coding Assessment</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            style={{ padding: '1rem', fontSize: '1rem', background: 'lime' }}
            onClick={() => {
              console.log('✅ Test button was clicked!');
              setShowVerification(true);
            }}
          >
            🔍 TEST BUTTON
          </button>
        </div>
      </div>

      {/* You can render description/editor here later */}

      {/* Face‑verification modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <VerifyApp onClose={() => setShowVerification(false)} />
        </div>
      )}
    </div>
  );
};

export default Exam;
