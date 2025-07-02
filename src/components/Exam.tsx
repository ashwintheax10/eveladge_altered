import React, { useState, useEffect } from 'react';
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

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  starter_code: { [key: string]: string };
  test_cases: Array<{
    input: any[];
    expected: any;
    description: string;
  }>;
}

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

  // Load problems on component mount
  useEffect(() => {
    fetchProblems();
  }, []);

  // Update code when problem or language changes
  useEffect(() => {
    if (problems.length > 0 && problems[currentProblemIndex]) {
      const problem = problems[currentProblemIndex];
      const starterCode = problem.starter_code[language] || '';
      setCode(starterCode);
    }
  }, [currentProblemIndex, language, problems]);

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
<<<<<<< HEAD
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft for question', currentQuestion);
    alert('Draft saved successfully!');
  };

  const getCurrentQuestionData = () => {
    return questions.find(q => q.id === currentQuestion) || {
      id: currentQuestion,
      title: `Question ${currentQuestion}`,
      content: `This is question ${currentQuestion}. Please provide a detailed answer to this question.`
    };
  };

  const currentQuestionData = getCurrentQuestionData();
=======
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
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
<<<<<<< HEAD
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Home
=======
            className="text-gray-600 hover:text-gray-900 flex items-center"
          >
            ← Back to Home
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
          </button>
          <div className="text-lg font-semibold text-gray-900">
            EvalEdge Coding Assessment
          </div>
        </div>
        <div className="flex items-center space-x-4">
<<<<<<< HEAD
=======
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
          <div className="text-sm text-gray-600">
            Time Remaining: <span className="font-semibold text-red-600">89:45</span>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
            Submit Test
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
<<<<<<< HEAD
        {/* Left Panel - Questions (40%) */}
        <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">
          {/* Question Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Question {currentQuestion} of {totalQuestions}
              </h2>
              <div className="text-sm text-gray-500">
                {Math.round((currentQuestion / totalQuestions) * 100)}% Complete
              </div>
            </div>
            
            {/* Question Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
=======
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
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
              ></div>
            </div>
          </div>

<<<<<<< HEAD
          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestionData.title}
            </h3>
            <div className="text-gray-700 leading-relaxed">
              {currentQuestionData.content}
=======
          {/* Problem Content with Tabs */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 px-6 pt-6">
              {currentProblem.title}
            </h3>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 px-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'description'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 Description
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'examples'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💡 Examples
              </button>
              <button
                onClick={() => setActiveTab('constraints')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'constraints'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚠️ Constraints
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'description' && (
                <div className="prose text-gray-700 leading-relaxed">
                  {currentProblem.description.split('**Example:**')[0].trim()}
                </div>
              )}
              
              {activeTab === 'examples' && (
                <div className="space-y-4">
                  {/* Main Example from Description */}
                  {currentProblem.description.includes('**Example:**') && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">📝 Main Example:</h4>
                      <div className="text-sm font-mono bg-white p-3 rounded border">
                        {currentProblem.description.split('**Example:**')[1]?.split('**Constraints:**')[0]?.trim()}
                      </div>
                    </div>
                  )}
                  
                  {/* Sample Test Cases */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-3">🧪 Sample Test Cases:</h4>
                    <div className="space-y-3">
                      {currentProblem.test_cases.slice(0, 3).map((testCase, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Test Case {index + 1}:</div>
                          <div className="text-sm font-mono space-y-1">
                            <div><span className="font-semibold">Input:</span> {JSON.stringify(testCase.input)}</div>
                            <div><span className="font-semibold">Output:</span> {JSON.stringify(testCase.expected)}</div>
                            <div className="text-gray-600 italic">{testCase.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'constraints' && (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-900 mb-3">⚠️ Constraints & Requirements:</h4>
                    <div className="prose text-gray-700">
                      {currentProblem.description.includes('**Constraints:**') ? (
                        <div className="bg-white p-3 rounded border">
                          <pre className="whitespace-pre-wrap text-sm">
                            {currentProblem.description.split('**Constraints:**')[1]?.trim()}
                          </pre>
                        </div>
                      ) : (
                        <div className="text-gray-600 italic">No specific constraints provided for this problem.</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-900 mb-2">📊 Complexity Requirements:</h4>
                    <div className="text-sm space-y-1">
                      <div>• <strong>Time Complexity:</strong> Try to optimize your solution</div>
                      <div>• <strong>Space Complexity:</strong> Consider memory usage</div>
                      <div>• <strong>Edge Cases:</strong> Handle boundary conditions</div>
                    </div>
                  </div>
                </div>
              )}
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
<<<<<<< HEAD
                disabled={currentQuestion === 1}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  currentQuestion === 1
=======
                disabled={currentProblemIndex === 0}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  currentProblemIndex === 0
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Previous
              </button>
              
              <button
<<<<<<< HEAD
                onClick={handleSaveDraft}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Save Draft
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentQuestion === totalQuestions}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  currentQuestion === totalQuestions
=======
                onClick={handleNext}
                disabled={currentProblemIndex === totalProblems - 1}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  currentProblemIndex === totalProblems - 1
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
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
<<<<<<< HEAD
              <span className="text-sm">main.js</span>
              <span className="text-xs text-gray-400">JavaScript</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">
                Run Code
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                Format Code
=======
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
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
<<<<<<< HEAD
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
=======
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
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
<<<<<<< HEAD
=======
                folding: true,
                bracketMatching: 'always',
                autoIndent: 'full',
                cursorStyle: 'line',
                renderWhitespace: 'selection',
                contextmenu: true,
                mouseWheelZoom: true,
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
              }}
            />
          </div>

<<<<<<< HEAD
          {/* Output Panel */}
          <div className="h-32 bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-y-auto">
            <div className="mb-2 text-gray-400">Output:</div>
            <div>// Code output will appear here when you run your solution</div>
=======
          {/* Results Panel */}
          <div className={`${showResults ? 'h-80' : 'h-40'} bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-y-auto border-t border-gray-700 transition-all duration-300`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Output:</span>
              {executionResult && (
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    executionResult.all_passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}>
                    {executionResult.passed_tests}/{executionResult.total_tests} Passed
                  </span>
                  <span className="text-xs text-gray-400">
                    Score: {executionResult.score.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            
            {executing ? (
              <div className="text-yellow-400">🔄 Executing code...</div>
            ) : output ? (
              <div className="whitespace-pre-wrap">{output}</div>
            ) : (
              <div className="text-gray-500">// Click "Run Sample" to test your code or "Submit" to run all test cases</div>
            )}
            
            {/* Detailed Results */}
{executionResult && showResults && executionResult.results && (
              <div className="mt-6">
                {/* Summary Card */}
                <div className="mb-4 p-4 rounded-lg border border-gray-700 bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                        executionResult.all_passed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                        {executionResult.all_passed ? '🎉' : '🔍'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {executionResult.all_passed ? 'All Tests Passed!' : 'Some Tests Failed'}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {executionResult.passed_tests} of {executionResult.total_tests} test cases passed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{executionResult.score.toFixed(0)}%</div>
                      <div className="text-gray-400 text-sm">Score</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Results Table */}
<div className="bg-gray-800 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr className="bg-gray-700 text-white">
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Test</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Input</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Expected</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actual</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {executionResult.results.map((result, index) => (
                        <tr key={index} className={`hover:bg-gray-800 transition-colors ${
                          result.passed ? 'bg-green-900 bg-opacity-30' : 'bg-red-900 bg-opacity-30'
                        }`}>
                          <td className="px-3 py-3 text-sm font-bold">#{result.testCase}</td>
                          <td className="px-3 py-3 text-xs font-mono max-w-xs truncate" title={JSON.stringify(result.input)}>
                            {JSON.stringify(result.input)}
                          </td>
                          <td className="px-3 py-3 text-xs font-mono max-w-xs truncate" title={JSON.stringify(result.expected)}>
                            {JSON.stringify(result.expected)}
                          </td>
                          <td className="px-3 py-3 text-xs font-mono max-w-xs truncate" title={JSON.stringify(result.actual)}>
                            {result.error ? (
                              <span className="text-red-300 italic">Error: {result.error}</span>
                            ) : (
                              JSON.stringify(result.actual)
                            )}
                          </td>
                          <td className="px-3 py-3 text-sm font-bold">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              result.passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.passed ? '✅ PASS' : '❌ FAIL'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-400">{result.executionTime.toFixed(2)}ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={() => setShowResults(false)}
                  className="mt-4 text-blue-500 hover:text-blue-400 text-sm"
                >
                  Hide Details
                </button>
              </div>
            )}
            
            {executionResult && !showResults && executionResult.results && (
              <button 
                onClick={() => setShowResults(true)}
                className="text-blue-400 hover:text-blue-300 text-xs underline mt-2"
              >
                Show Detailed Results
              </button>
            )}
>>>>>>> ff420ab4b937058fe52bdd7d7413bee8b2962ec3
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam; 