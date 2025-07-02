import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="text-blue-800 font-bold text-2xl">
              <span className="text-purple-700">Eval</span>Edge
            </div>
          </div>
          <div className="hidden md:block space-x-4">
            <button 
              onClick={() => navigate('/instructions')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Test
            </button>
            <button className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-md text-sm font-medium">
              Request Demo
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-800 hover:bg-gray-100"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button 
                onClick={() => {
                  navigate('/instructions');
                  setIsMenuOpen(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium block w-full text-left"
              >
                Test
              </button>
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-md text-sm font-medium block w-full text-left mt-2">
                Request Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
