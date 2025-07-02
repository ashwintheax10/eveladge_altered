import React from "react";

const Hero = () => (
  <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-white">
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
            Revolutionizing Academic <span className="bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">Assessment.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Experience the next generation of university exams with AI-powered proctoring, instant grading, and unparalleled security. 
            <span className="font-semibold text-[#3B82F6]"> Transform education today.</span>
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-8 py-4 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white rounded-lg hover:from-[#2563EB] hover:to-[#7C3AED] transition-all duration-300 shadow-lg hover:shadow-[#3B82F6]/25 transform hover:scale-105 whitespace-nowrap cursor-pointer font-semibold">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 flex items-center whitespace-nowrap cursor-pointer font-semibold group">
              <i className="fas fa-play-circle mr-3 text-[#3B82F6] group-hover:scale-110 transition-transform duration-300"></i> 
              Watch Demo
            </button>
          </div>
          <div className="flex items-center space-x-6 pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-white text-sm"></i>
              </div>
              <span className="text-sm text-gray-600">Trusted by 500+ Universities</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-white text-sm"></i>
              </div>
              <span className="text-sm text-gray-600">99.9% Uptime</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="relative bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-200">
            <div className="absolute top-0 left-0 right-0 bg-gray-50 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-sm text-gray-500">EvalEdge Exam Environment</div>
            </div>
            <div className="pt-12 p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <span className="bg-[#3B82F6]/10 text-[#3B82F6] px-3 py-1 rounded-full text-sm font-medium">Question 3/15</span>
                        <span className="text-[#3B82F6]"><i className="fas fa-clock mr-2"></i>2:30</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-300">
                          <i className="fas fa-flag text-sm"></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors duration-300">
                          <i className="fas fa-question-circle text-sm"></i>
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900">Explain the key differences between supervised and unsupervised learning in machine learning.</h3>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 min-h-[120px] mb-6">
                      <textarea className="w-full bg-transparent border-none focus:ring-0 resize-none text-gray-700 placeholder-gray-400" placeholder="Type your answer here..." rows={4}></textarea>
                    </div>
                    <div className="flex justify-between items-center">
                      <button className="px-5 py-2.5 bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg flex items-center transition-colors duration-300 whitespace-nowrap cursor-pointer">
                        <i className="fas fa-arrow-left mr-2"></i> Previous
                      </button>
                      <div className="flex space-x-3">
                        <button className="px-4 py-2.5 bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg transition-colors duration-300 whitespace-nowrap cursor-pointer">Save Draft</button>
                        <button className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg flex items-center transition-colors duration-300 whitespace-nowrap cursor-pointer">
                          Next <i className="fas fa-arrow-right ml-2"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <i className="fas fa-video text-4xl"></i>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm text-[#3B82F6] flex items-center">
                        <i className="fas fa-circle text-xs mr-2"></i> Camera Active
                      </span>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors duration-300">
                        <i className="fas fa-cog"></i>
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#3B82F6] mb-2">42:18</div>
                      <div className="text-sm text-gray-500">Time Remaining</div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Progress</span>
                        <span>3/15</span>
                      </div>
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-1/5 h-full bg-[#3B82F6] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
