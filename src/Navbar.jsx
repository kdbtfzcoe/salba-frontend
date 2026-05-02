import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full bg-white px-8 py-5 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* COMMENT COMMENT */}
        <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <span className="text-xl font-black tracking-tight text-slate-800">LOWKEY PROJECT TESTING</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
        <Link to="/" className="hover:text-teal-700 transition-colors">Home</Link>
        <Link to="/monitoring" className="hover:text-teal-700 transition-colors">Flood Monitoring</Link>
        <Link to="/map" className="hover:text-teal-700 transition-colors">Predictive Map</Link>
        <Link to="/register" className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md transition-all transform active:scale-95">
          Register
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;