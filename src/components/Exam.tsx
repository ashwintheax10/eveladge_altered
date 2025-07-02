import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';

const Exam: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [code, setCode] = useState('// Write your code here\nfunction solution() {\n  \n}');
  
  const totalQuestions = 15;
  
  // Mock questions data
  const questions = [
    {
      id: 1,
      title: "Explain the key differences between synchronous and asynchronous programming",
      content: "Describe the fundamental differences between synchronous and asynchronous programming paradigms. Include examples of when each approach is most appropriate and discuss the trade-offs involved."
    },
    {
      id: 2,
      title: "Implement a binary search algorithm",
      content: "Write a function that implements the binary search algorithm to find a target element in a sorted array. The function should return the index of the target element if found, or -1 if not found."
    },
    {
      id: 3,
      title: "Design a simple REST API",
      content: "Design a REST API for a user management system. Include endpoints for creating, reading, updating, and deleting users. Specify the HTTP methods, URL patterns, request/response formats, and status codes."
    }
  ];

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
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

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Home
          </button>
          <div className="text-lg font-semibold text-gray-900">
            EvalEdge Coding Assessment
          </div>
        </div>
        <div className="flex items-center space-x-4">
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
              ></div>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {currentQuestionData.title}
            </h3>
            <div className="text-gray-700 leading-relaxed">
              {currentQuestionData.content}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  currentQuestion === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                Previous
              </button>
              
              <button
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
              <span className="text-sm">main.js</span>
              <span className="text-xs text-gray-400">JavaScript</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">
                Run Code
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                Format Code
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
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
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-32 bg-gray-900 text-green-400 p-4 font-mono text-sm overflow-y-auto">
            <div className="mb-2 text-gray-400">Output:</div>
            <div>// Code output will appear here when you run your solution</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam; 