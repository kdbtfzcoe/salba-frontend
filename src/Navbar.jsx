import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from './assets/salba-logo.png';

const Navbar = () => {
  return (
    <nav className="w-full bg-white px-8 py-5 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Official Project Salba Logo */}
        <img 
          src={logoImage} 
          alt="Project Salba Logo" 
          className="w-10 h-10 object-contain hover:scale-105 transition-transform duration-300" 
        />
        <span className="text-xl font-black tracking-tight text-slate-800">PROJECT SALBA</span>
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