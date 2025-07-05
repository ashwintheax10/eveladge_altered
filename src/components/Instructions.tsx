// src/components/Instructions.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerifyApp from './VerifyApp';

/* ───────── static data ───────── */
const guidelines = [
  'Do not switch tabs or lose focus during the test',
  'Keep your face visible to the camera at all times',
  'Ensure good lighting and a quiet environment',
  'You will receive warnings for any violations',
  'Three warnings will result in disqualification',
];

/* ───────── component ───────── */
const Instructions: React.FC = () => {
  const nav = useNavigate();
  const [showVerify, setShowVerify] = useState(false);   // modal hidden at first

  /* called by <VerifyApp> after a successful check */
  const handleVerified = () => {
    setShowVerify(false);                       // close modal
    nav('/monitoring-start', { state: { verified: true } }); // go to monitoring start page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e8f0fe] to-[#dbeafe]">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4 mt-8">
          Ready to Start Your Test?
        </h1>

        <p className="text-lg text-gray-700 text-center mb-8 max-w-xl">
          This test will be monitored using webcam‑based proctoring. Please ensure you have a working webcam and are in a well‑lit environment.
        </p>

        <div className="bg-white rounded-xl shadow-lg p-8 w-full mb-10">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Test Guidelines</h2>
          <ul className="space-y-4">
            {guidelines.map((g, i) => (
              <li key={i} className="flex items-start text-base text-gray-800">
                <span className="text-red-500 mr-3 mt-1 text-lg">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => setShowVerify(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-10 py-3 rounded-lg shadow transition-colors duration-200 mb-8"
        >
          Start Test
        </button>
      </div>

      {/* ------------ webcam verification modal ------------ */}
      {showVerify && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <VerifyApp onClose={handleVerified} />
        </div>
      )}
    </div>
  );
};

export default Instructions;
