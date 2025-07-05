// src/components/Exam.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Editor from "@monaco-editor/react";
import VerifyApp from "./VerifyApp";
import CamPreview from "./CamPreview";

/* ─────────── types ─────────── */
interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  starter_code: Record<string, string>;
  test_cases: { input: any[]; expected: any; description: string }[];
}

interface TestResult {
  testCase: number;
  input: any[];
  expected: any;
  actual: any;
  passed: boolean;
  error?: string;
  executionTime: number;
}

interface ExecutionResult {
  success: boolean;
  results: TestResult[];
  score: number;
  passed_tests: number;
  total_tests: number;
  all_passed: boolean;
  error?: string;
}

/* ─────────── constants ───────── */
const API_BASE       = "http://localhost:5001";   // your code‑exec backend
const MONITOR_BASE   = "http://localhost:6000";   // monitor_app backend
const EXAM_SECONDS   = 90 * 60;                   // 90 min

/* ─────────── component ───────── */
const Exam: React.FC = () => {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { verified?: boolean } };
const Exam: React.FC = () => {
  /* existing state … */
  const [showCam, setShowCam] = useState(true); // toggle helper

  /* … the rest of your component … */

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* header */}
      <header /* unchanged */>
        <div className="flex items-center space-x-3">
          {/* ⏰ timer etc. */}
          <button
            onClick={() => setShowCam(s => !s)}
            className="bg-gray-200 text-xs px-2 py-1 rounded"
          >
            {showCam ? "Hide Cam" : "Show Cam"}
          </button>
        </div>
      </header>

      {/* splitter */}
      <div className="flex flex-1 pt-14">
        {/* LEFT panel (problem description) */ }
        <aside /* unchanged */ />

        {/* RIGHT panel (editor) */}
        <section className="flex-1 flex flex-col relative">
          {/* existing toolbar + editor + console … */}

          {/* ⬇ preview lives in a corner ⬇ */}
          {showCam && (
            <div
              style={{
                position: "absolute",
                right: 8,
                bottom: 8,
                zIndex: 60,
                background: "#00000080",
                padding: 4,
                borderRadius: 6,
              }}
            >
              <CamPreview w={180} h={135} />
            </div>
          )}
        </section>
      </div>

      {/* warn / verify modals … */}
    </div>
  );
};

  /* send people back if they bypass verification */
  useEffect(() => {
    if (!loc.state?.verified) nav("/instructions", { replace: true });
  }, [loc.state, nav]);

  /* ─── state fragments ─── */
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading,  setLoading]  = useState(true);

  /* editor / executor */
  const [idx,  setIdx ]   = useState(0);
  const [lang, setLang]   = useState<"javascript" | "python">("javascript");
  const [code, setCode]   = useState("");
  const [execing, setExecing] = useState(false);
  const [execRes, setExecRes] = useState<ExecutionResult | null>(null);
  const [output,  setOutput]  = useState("");

  /* proctoring & timer */
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [warnings, setWarnings] = useState(0);
  const [warnModal, setWarnModal] = useState(false);
  const [terminated, setTerminated] = useState(false);

  /* verify modal (if you want manual re‑verify) */
  const [showVerify, setShowVerify] = useState(false);

  /* ───────── load problems once ───────── */
  useEffect(() => {
    (async () => {
      try {
        const r   = await fetch(`${API_BASE}/api/problems`);
        const jsn = await r.json();
        setProblems(jsn.problems);
      } catch (e) {
        console.error("fetch problems:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ───────── starter code on change ───────── */
  useEffect(() => {
    if (problems.length) setCode(problems[idx].starter_code[lang] || "");
  }, [problems, idx, lang]);

  /* ───────── countdown timer ───────── */
  useEffect(() => {
    if (terminated) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [terminated]);

  /* ───────── monitor_app polling ───────── */
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r   = await fetch(`${MONITOR_BASE}/status`);
        const jsn = await r.json() as { warn: boolean; terminate: boolean };

        if (jsn.terminate) {
          setTerminated(true);
          return;
        }
        if (jsn.warn) {
          setWarnings((w) => {
            const next = w + 1;
            if (next >= 3) setTerminated(true);
            else           setWarnModal(true);
            return next;
          });
        }
      } catch (e) {
        console.error("status poll:", e);
      }
    }, 3000);               // every 3 s
    return () => clearInterval(id);
  }, []);

  /* ───────── helpers ───────── */
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  /* ───────── run code ───────── */
  const runCode = async (all = true) => {
    if (!problems[idx]) return;
    setExecing(true);
    setExecRes(null);
    setOutput("");

    const endpoint = all ? "/api/execute" : "/api/run-sample";
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: lang,
          problem_id: problems[idx].id,
        }),
      });
      const jsn: ExecutionResult = await res.json();
      setExecRes(jsn);
      setOutput(jsn.success ? "✅ Finished." : `❌ ${jsn.error}`);
    } catch (e) {
      setOutput(`❌ ${e}`);
    } finally {
      setExecing(false);
    }
  };

  /* ───────── early states ───────── */
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  if (!problems.length)
    return (
      <div className="h-screen flex items-center justify-center">
        No problems.
      </div>
    );
  if (terminated)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Session Ended</h2>
          <p className="mb-4">
            You received three warnings or looked away too long.
          </p>
          <button
            onClick={() => nav("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Home
          </button>
        </div>
      </div>
    );

  const cur = problems[idx];
  const total = problems.length;

  /* ───────── render ───────── */
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* header */}
      <header className="bg-white border-b shadow px-6 py-3 flex justify-between items-center fixed w-full z-40">
        <span className="font-semibold">EvalEdge Coding Assessment</span>
        <span className="text-sm">⏰ {fmt(timeLeft)}</span>
      </header>

      {/* main splitter */}
      <div className="flex flex-1 pt-14">
        {/* left panel */}
        <aside className="w-2/5 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              Problem {idx + 1}/{total}
            </h2>
            <p className="text-sm text-gray-500">{cur.title}</p>
          </div>

          <pre className="flex-1 p-4 overflow-y-auto whitespace-pre-wrap">
            {cur.description}
          </pre>

          <div className="p-4 border-t flex justify-between">
            <button
              disabled={idx === 0}
              onClick={() => setIdx((i) => i - 1)}
              className={
                idx === 0
                  ? "opacity-40"
                  : "bg-gray-200 px-3 py-1 rounded cursor-pointer"
              }
            >
              ◀ Prev
            </button>
            <button
              disabled={idx === total - 1}
              onClick={() => setIdx((i) => i + 1)}
              className={
                idx === total - 1
                  ? "opacity-40"
                  : "bg-gray-200 px-3 py-1 rounded cursor-pointer"
              }
            >
              Next ▶
            </button>
          </div>
        </aside>

        {/* right panel */}
        <section className="flex-1 flex flex-col">
          {/* toolbar */}
          <div className="bg-gray-800 text-white px-4 py-2 flex justify-between">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as any)}
              className="bg-gray-700 border-none rounded px-1 py-0.5"
            >
              <option value="javascript">JS</option>
              <option value="python">Python</option>
            </select>
            <div className="space-x-2">
              <button
                onClick={() => runCode(false)}
                disabled={execing}
                className="bg-blue-600 px-2 py-1 text-xs rounded"
              >
                ▷ Run Sample
              </button>
              <button
                onClick={() => runCode(true)}
                disabled={execing}
                className="bg-green-600 px-2 py-1 text-xs rounded"
              >
                🚀 Submit
              </button>
            </div>
          </div>

          {/* editor */}
          <Editor
            height="60%"
            language={lang}
            value={code}
            onChange={(v) => setCode(v || "")}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, automaticLayout: true }}
          />

          {/* console */}
          <div className="flex-1 bg-black text-green-400 p-3 text-sm overflow-y-auto">
            <pre>{output || "// run code to see output"}</pre>
          </div>
        </section>
      </div>

      {/* warning modal */}
      {warnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-xs text-center">
            <h2 className="font-bold text-yellow-600 mb-2">
              Warning {warnings}/3
            </h2>
            <p className="mb-4">
              Keep full‑screen and look at the screen.
            </p>
            <button
              onClick={() => setWarnModal(false)}
              className="bg-yellow-500 text-white px-4 py-1 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* optional manual re‑verify */}
      {showVerify && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <VerifyApp onClose={() => setShowVerify(false)} />
        </div>
      )}
    </div>
  );
};

export default Exam;
