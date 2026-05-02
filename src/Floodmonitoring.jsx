import React from 'react';
import Navbar from './Navbar';

const Floodmonitoring = () => {
  // Sample data - sa real project, from Backend/Database
  const areaStatus = [
    { id: 1, area: "Brgy. Dela Paz", level: "0.5m", status: "Normal", color: "text-green-600", bg: "bg-green-50" },
    { id: 2, area: "Brgy. Malaban", level: "1.2m", status: "Warning", color: "text-yellow-600", bg: "bg-yellow-50" },
    { id: 3, area: "Brgy. Casile", level: "2.5m", status: "Critical", color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      
      {/* NAVBAR COMPONENT IS PLUGGED IN HERE */}
      <Navbar />

      {/* HEADER SECTION */}
      <div className="bg-teal-800 py-16 px-6 text-center text-white">
        <h1 className="text-4xl font-black mb-2 tracking-tight">LIVE FLOOD MONITORING</h1>
        <p className="text-teal-100 font-medium max-w-xl mx-auto">
          Aktwal na antas ng tubig at status ng baha sa iba't ibang bahagi ng Biñan.
        </p>
      </div>

      {/* MAIN DASHBOARD */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 -mt-10 relative z-10">
        
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Current Rainfall</p>
            <h3 className="text-2xl font-black text-slate-800">Light Rain</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Active Warnings</p>
            <h3 className="text-2xl font-black text-slate-800">2 Barangays</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Last Updated</p>
            <h3 className="text-2xl font-black text-slate-800">Just Now</h3>
          </div>
        </div>

        {/* AREA STATUS TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-800">Barangay Water Levels</h2>
            <span className="flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-teal-600 rounded-full"></span> LIVE UPDATES
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Area / Barangay</th>
                  <th className="px-8 py-4">Water Level (m)</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {areaStatus.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-700">{item.area}</td>
                    <td className="px-8 py-5 font-medium text-gray-600">{item.level}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight ${item.bg} ${item.color}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <svg className="w-5 h-5 ml-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* LEGEND SECTION (Informative) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-teal-50 p-8 rounded-2xl border border-teal-100">
            <h3 className="text-lg font-black text-teal-900 mb-4 uppercase tracking-tight">Level Guide</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-green-500 rounded-full mt-1 shrink-0"></span>
                <div>
                  <p className="font-bold text-teal-900 text-sm">Normal (0m - 1m)</p>
                  <p className="text-teal-700/80 text-xs">Safe levels. No immediate action required.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-yellow-500 rounded-full mt-1 shrink-0"></span>
                <div>
                  <p className="font-bold text-teal-900 text-sm">Warning (1.1m - 2m)</p>
                  <p className="text-teal-700/80 text-xs">Stay alert. Water is reaching critical points.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-red-500 rounded-full mt-1 shrink-0"></span>
                <div>
                  <p className="font-bold text-teal-900 text-sm">Critical (Above 2m)</p>
                  <p className="text-teal-700/80 text-xs">Evacuation may be necessary. Follow authorities.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tight">Emergency Hotline</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Kung may emergency o nangangailangan ng rescue, tumawag sa mga sumusunod:</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="font-bold text-slate-700">Biñan Rescue</span>
                <span className="text-teal-700 font-black">911 / (049) 511-9111</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="font-bold text-slate-700">PNP Biñan</span>
                <span className="text-teal-700 font-black">(049) 511-6633</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="mt-auto py-8 text-center border-t border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-widest">
        &copy; 2024 Project Salba - Biñan, Laguna
      </footer>
    </div>
  );
};

export default Floodmonitoring;