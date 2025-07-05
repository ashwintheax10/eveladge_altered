import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MONITOR_BASE = "http://localhost:7000";

const MonitoringStart: React.FC = () => {
  const nav = useNavigate();
  const [monitorReady, setMonitorReady] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if monitoring-app is running
    fetch(`${MONITOR_BASE}/status`)
      .then(res => res.ok ? setMonitorReady(true) : setMonitorReady(false))
      .catch(() => setMonitorReady(false))
      .finally(() => setChecking(false));
  }, []);

  const handleStartExam = async () => {
    await fetch(`${MONITOR_BASE}/reset`, { method: "POST" });
    nav("/exam", { state: { verified: true } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Monitoring Is About to Start</h1>
        <p className="mb-6 text-gray-700">
          Please prepare yourself. The exam will be monitored using your webcam to ensure academic integrity.
        </p>
        <div className="mb-6 text-left">
          <h2 className="font-semibold mb-2 text-gray-800">Exam Rules:</h2>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Keep your face visible and look at the screen at all times.</li>
            <li>Do not leave the camera view or look away for extended periods.</li>
            <li>Do not use mobile phones or other devices during the exam.</li>
            <li>Do not talk to others or receive help.</li>
            <li>Three warnings will end your session automatically.</li>
            <li>Make sure your webcam and microphone are working.</li>
          </ul>
        </div>
        {!monitorReady && !checking && (
          <div className="mb-4 text-red-600 font-semibold">
            Monitoring app is not running! Please start the monitoring app before proceeding.
          </div>
        )}
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
          onClick={handleStartExam}
          disabled={!monitorReady}
        >
          Start Exam
        </button>
      </div>
    </div>
  );
};

export default MonitoringStart; 