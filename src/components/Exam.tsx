import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';

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
  const navigate = useNavigate();
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [output, setOutput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeTab, setActiveTab] = useState<'description' | 'examples' | 'constraints'>('description');
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [sessionTerminated, setSessionTerminated] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes in seconds
  const [initialWindowSize, setInitialWindowSize] = useState<{width: number, height: number} | null>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const [initialAppRect, setInitialAppRect] = useState<{width: number, height: number} | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Load problems on component mount
  useEffect(() => {
    fetchProblems();
    // Request full screen on component mount
    requestFullScreen();
  }, []);

  // Update code when problem or language changes
  useEffect(() => {
    if (problems.length > 0 && problems[currentProblemIndex]) {
      const problem = problems[currentProblemIndex];
      const starterCode = problem.starter_code[language] || '';
      setCode(starterCode);
    }
  }, [currentProblemIndex, language, problems]);

  useEffect(() => {
    setInitialWindowSize({ width: window.innerWidth, height: window.innerHeight });
    if (appContainerRef.current) {
      const rect = appContainerRef.current.getBoundingClientRect();
      setInitialAppRect({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarningCount((prev) => {
          if (prev < 2) {
            setShowWarning(true);
            return prev + 1;
          } else if (prev === 2) {
            setSessionTerminated(true);
            setShowWarning(false);
            return prev + 1;
          }
          return prev;
        });
      }
    };
    
    const handleResize = () => {
      if (initialWindowSize) {
        if (
          window.innerWidth < initialWindowSize.width * 0.9 ||
          window.innerHeight < initialWindowSize.height * 0.9
        ) {
          setWarningCount((prev) => {
            if (prev < 2) {
              setShowWarning(true);
              return prev + 1;
            } else if (prev === 2) {
              setSessionTerminated(true);
              setShowWarning(false);
              return prev + 1;
            }
            return prev;
          });
        }
      }
    };

    const handleFullScreenChange = () => {
      const isCurrentlyFullScreen = !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).msFullscreenElement);
      setIsFullScreen(isCurrentlyFullScreen);
      
      // If user exits full screen, give warning
      if (!isCurrentlyFullScreen && isFullScreen) {
        setWarningCount((prev) => {
          if (prev < 2) {
            setShowWarning(true);
            return prev + 1;
          } else if (prev === 2) {
            setSessionTerminated(true);
            setShowWarning(false);
            return prev + 1;
          }
          return prev;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
    };
  }, [initialWindowSize, isFullScreen]);

  // Prevent keyboard shortcuts that could exit full screen or switch tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Alt+Tab, Ctrl+Tab, F11, Escape, etc.
      const forbiddenKeys = [
        'F11',
        'Escape',
        'Tab'
      ];
      
      const forbiddenCombos = [
        { key: 'Tab', ctrl: true },
        { key: 'Tab', alt: true },
        { key: 'Tab', meta: true },
        { key: 'F4', alt: true },
        { key: 'F4', ctrl: true },
        { key: 'F4', meta: true },
        { key: 'F11', ctrl: true },
        { key: 'F11', alt: true },
        { key: 'F11', meta: true },
        { key: 'Escape', ctrl: true },
        { key: 'Escape', alt: true },
        { key: 'Escape', meta: true }
      ];

      // Check for forbidden keys
      if (forbiddenKeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Check for forbidden combinations
      const isForbiddenCombo = forbiddenCombos.some(combo => 
        e.key === combo.key && 
        !!e.ctrlKey === !!combo.ctrl && 
        !!e.altKey === !!combo.alt && 
        !!e.metaKey === !!combo.meta
      );

      if (isForbiddenCombo) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  // Periodically check visible area of app container
  useEffect(() => {
    if (!initialAppRect) return;
    const interval = setInterval(() => {
      if (appContainerRef.current) {
        const rect = appContainerRef.current.getBoundingClientRect();
        if (
          rect.width < initialAppRect.width * 0.9 ||
          rect.height < initialAppRect.height * 0.9
        ) {
          setWarningCount((prev) => {
            if (prev < 2) {
              setShowWarning(true);
              return prev + 1;
            } else if (prev === 2) {
              setSessionTerminated(true);
              setShowWarning(false);
              return prev + 1;
            }
            return prev;
          });
        }
      }
    }, 1000); // check every second
    return () => clearInterval(interval);
  }, [initialAppRect]);

  useEffect(() => {
    if (sessionTerminated) return;
    if (timeLeft <= 0) {
      setSessionTerminated(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, sessionTerminated]);

  // Helper to format time as MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Full screen functions
  const requestFullScreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen();
        setIsFullScreen(true);
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen();
        setIsFullScreen(true);
      }
    } catch (error) {
      console.log('Full screen request failed:', error);
    }
  };

  const exitFullScreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullScreen(false);
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
        setIsFullScreen(false);
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
        setIsFullScreen(false);
      }
    } catch (error) {
      console.log('Exit full screen failed:', error);
    }
  };

  const fetchProblems = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/problems');
      const data = await response.json();
      setProblems(data.problems);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch problems:', error);
      setLoading(false);
    }
  };

  const executeCode = async (runAll = true) => {
    if (!problems[currentProblemIndex]) return;
    
    setExecuting(true);
    setExecutionResult(null);
    setOutput('');
    
    // Debug logging
    console.log('🐛 Executing with:', {
      language,
      problem_id: problems[currentProblemIndex].id,
      code_preview: code.substring(0, 100) + '...'
    });
    
    try {
      const endpoint = runAll ? 'http://localhost:5001/api/execute' : 'http://localhost:5001/api/run-sample';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          problem_id: problems[currentProblemIndex].id,
        }),
      });
      
      const result = await response.json();
      setExecutionResult(result);
      
      if (result.success) {
        setOutput(`✅ Execution completed!\n\n${runAll ? 'All' : 'Sample'} test cases:\n${result.results.map((r: TestResult) => 
          `Test ${r.testCase}: ${r.passed ? '✅ PASS' : '❌ FAIL'} (${r.executionTime.toFixed(2)}ms)`
        ).join('\n')}\n\nScore: ${result.score.toFixed(1)}%`);
      } else {
        setOutput(`❌ Execution failed: ${result.error}`);
      }
    } catch (error) {
      setOutput(`❌ Network error: ${error}`);
    } finally {
      setExecuting(false);
    }
  };

  const handlePrevious = () => {
    if (currentProblemIndex > 0) {
      setCurrentProblemIndex(currentProblemIndex - 1);
      setExecutionResult(null);
      setShowResults(false);
    }
  };

  const handleNext = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(currentProblemIndex + 1);
      setExecutionResult(null);
      setShowResults(false);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setExecutionResult(null);
    setShowResults(false);
  };

  if (sessionTerminated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Session Ended</h2>
          <p className="mb-4">You have switched tabs or exited full screen too many times. Your exam session has been terminated.</p>
          <button onClick={() => window.location.href = '/'} className="bg-blue-600 text-white px-4 py-2 rounded">Go to Home</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading coding problems...</div>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-600">
          <div className="text-xl mb-2">No problems available</div>
          <div>Please contact your administrator</div>
        </div>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];
  const totalProblems = problems.length;

  return (
    <div ref={appContainerRef} className="h-screen flex flex-col bg-gray-100">
      {/* Full Screen Overlay */}
      {!isFullScreen && !sessionTerminated && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-40">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
            <div className="text-6xl mb-4">🖥️</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Full Screen Required</h2>
            <p className="text-gray-600 mb-6">
              This exam must be taken in full screen mode to ensure academic integrity and prevent tab switching.
            </p>
            <div className="space-y-3">
              <button 
                onClick={requestFullScreen}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Enter Full Screen Mode
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Exit Exam
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Press F11 or click the button above to enter full screen mode
            </p>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-xl font-bold mb-2 text-yellow-600">Warning {warningCount}/3</h2>
            <p className="mb-4">
              {warningCount === 1 ? 
                "Do not leave or switch tabs during the exam! You must stay in full screen mode." :
                "Do not leave or switch tabs during the exam! On the 3rd warning, your session will be terminated."
              }
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowWarning(false)} className="bg-yellow-500 text-white px-4 py-2 rounded">OK</button>
              {!isFullScreen && (
                <button onClick={requestFullScreen} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Enter Full Screen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center fixed top-0 left-0 w-full z-50">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            EvalEdge Coding Assessment
          </div>
          {!isFullScreen && (
            <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              ⚠️ Full Screen Required
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="text-sm text-gray-600">
            Time Remaining: <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex pt-16">
        {/* Left Panel - Problem Description (40%) */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">
          {/* Problem Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Problem {currentProblemIndex + 1} of {totalProblems}
              </h2>
              <span className={`px-2 py-1 text-xs rounded font-medium ${
                currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {currentProblem.difficulty}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentProblemIndex + 1) / totalProblems) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Problem Content with Tabs */}
          <div className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'description'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'examples'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Examples
              </button>
              <button
                onClick={() => setActiveTab('constraints')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'constraints'
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Constraints
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto bg-white">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">{currentProblem.title}</h3>
                  <div className="text-gray-700 whitespace-pre-wrap">{currentProblem.description}</div>
                </div>
              )}
              {activeTab === 'examples' && (
                <div className="space-y-4">
                  {currentProblem.examples?.map((example: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-900 mb-1">Example {index + 1}:</div>
                      <div className="text-sm text-gray-700">
                        <div><strong>Input:</strong> {JSON.stringify(example.input)}</div>
                        <div><strong>Output:</strong> {JSON.stringify(example.output)}</div>
                        {example.explanation && (
                          <div><strong>Explanation:</strong> {example.explanation}</div>
                        )}
                      </div>
                    </div>
                  )) || <div className="text-gray-500">No examples available</div>}
                </div>
              )}
              {activeTab === 'constraints' && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {currentProblem.constraints || 'No constraints specified'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentProblemIndex === 0}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  currentProblemIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Previous
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentProblemIndex === totalProblems - 1}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  currentProblemIndex === totalProblems - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor (60%) */}
        <div className="w-3/5 flex flex-col">
          {/* Editor Header */}
          <div className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
              <span className="text-xs text-gray-400">Solution.{language === 'javascript' ? 'js' : 'py'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => executeCode(false)}
                disabled={executing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-1 rounded text-xs flex items-center"
              >
                {executing ? '⏳' : '▶️'} Run Sample
              </button>
              <button 
                onClick={() => executeCode(true)}
                disabled={executing}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-3 py-1 rounded text-xs flex items-center"
              >
                {executing ? '⏳' : '🚀'} Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
                insertSpaces: true,
                detectIndentation: false,
                folding: true,
                autoIndent: 'full',
                cursorStyle: 'line',
                renderWhitespace: 'selection',
                contextmenu: true,
                mouseWheelZoom: true,
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
