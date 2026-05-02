import React from 'react';
import Navbar from './Navbar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const Floodmonitoring = () => {
  // 2-hour window with 15-minute intervals
  const data = [
    { time: '12:00', period: 'AM', level: 0.8 },
    { time: '12:15', period: 'AM', level: 1.1 },
    { time: '12:30', period: 'AM', level: 1.5 },
    { time: '12:45', period: 'AM', level: 1.9 },
    { time: '1:00', period: 'AM', level: 2.2 },
    { time: '1:15', period: 'AM', level: 2.6 },
    { time: '1:30', period: 'AM', level: 3.1 },
    { time: '1:45', period: 'AM', level: 3.4 },
    { time: '2:00', period: 'AM', level: 3.5 },
  ];

  // Custom Tick component to stack Time and AM/PM
  const CustomXAxisTick = ({ x, y, payload }) => {
    const item = data[payload.index];
    if (!item) return null;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={15} dy={0} textAnchor="middle" fill="#f0fdfa" fontSize={11} fontWeight="bold">
          {item.time}
        </text>
        <text x={0} y={15} dy={14} textAnchor="middle" fill="#f0fdfa" fontSize={10} fontWeight="normal">
          {item.period}
        </text>
      </g>
    );
  };

  const currentDateTime = new Date().toLocaleString('en-US', { 
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <Navbar />

      {/* HEADER SECTION */}
      <div className="bg-teal-800 py-7 px-6 text-center text-white">
        <h1 className="text-4xl font-black mb-2 tracking-tight">LIVE FLOOD MONITORING</h1>
        <p className="text-teal-100 font-medium max-w-xl mx-auto">
          Aktwal na antas ng tubig at status ng baha sa Brgy. Dela Paz, Biñan.
        </p>
      </div>

      {/* MAIN DASHBOARD */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 -mt-3 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* 80% GRAPH SECTION */}
          <div className="lg:w-[80%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">FLOOD LEVEL WAVE GRAPH</h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-3 py-2 rounded-lg border border-teal-100">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live Update as of: {currentDateTime}
                </div>
            </div>

            <div className="flex-grow relative p-4 bg-teal-800"> 
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                  <defs>
                    <pattern id="static-bg" patternUnits="userSpaceOnUse" width="100%" height="100%">
                        <image 
                          href="/GraphBackground.png" 
                          x="0" y="0" 
                          width="100%" 
                          height="100%" 
                          preserveAspectRatio="none" 
                          opacity="0.15" 
                        />
                    </pattern>
                  </defs>

                  {/* 1. BACKGROUND IMAGE - Strictly bounded by first/last time and 0-5ft */}
                  <ReferenceArea 
                    x1={data[0].time} 
                    x2={data[data.length - 1].time} 
                    y1={0} 
                    y2={5} 
                    fill="url(#static-bg)" 
                  />

                  {/* 2. COLOR ZONES - Strictly bounded horizontally to fit inside axis */}
                  <ReferenceArea x1={data[0].time} x2={data[data.length - 1].time} y1={0} y2={1} fill="#22c55e" fillOpacity={0.3} />
                  <ReferenceArea x1={data[0].time} x2={data[data.length - 1].time} y1={1} y2={2} fill="#eab308" fillOpacity={0.3} />
                  <ReferenceArea x1={data[0].time} x2={data[data.length - 1].time} y1={2} y2={3} fill="#f97316" fillOpacity={0.3} />
                  <ReferenceArea x1={data[0].time} x2={data[data.length - 1].time} y1={3} y2={5} fill="#ef4444" fillOpacity={0.3} />

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  
                  <XAxis 
                    dataKey="time" 
                    interval={0} 
                    tick={<CustomXAxisTick />} 
                    axisLine={{stroke: '#2dd4bf'}} 
                  />
                  
                  <YAxis 
                    domain={[0, 5]} 
                    tickCount={6} 
                    axisLine={{stroke: '#2dd4bf'}} 
                    tick={{fontWeight: 'bold', fill: '#f0fdfa', fontSize: 11}} 
                  />
                  
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  
                  <Area 
                    type="monotone" 
                    dataKey="level" 
                    stroke="#5eead4" 
                    fill="#0f766e" 
                    fillOpacity={0.4} 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 20% INFORMATION BOX */}
          <div className="lg:w-[20%] flex flex-col gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 h-full">
              <div className="mb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Station</p>
                <div className="mt-1 p-3 bg-teal-900 rounded-xl">
                  <p className="text-sm font-black text-white">Brgy. Dela Paz</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Current Water Level</p>
                <p className="text-3xl font-black text-slate-800">2.8 ft</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-[10px] font-bold text-orange-700 uppercase">Warning Status</p>
                <p className="text-lg font-black text-orange-800">Waist Level</p>
              </div>

              <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                <p className="text-[10px] font-bold text-teal-700 uppercase">Status</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-black text-teal-800">Increasing</p>
                  <svg className="w-5 h-5 text-teal-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7 7 7" />
                  </svg>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-700 uppercase">Rate of Change</p>
                <p className="text-lg font-black text-blue-800">+0.4 ft / hr</p>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-auto">
                <p className="text-[10px] font-bold text-red-700 uppercase">Est. Peak Time</p>
                <p className="text-lg font-black text-red-800">2:30 PM</p>
                <p className="text-[10px] text-red-600 font-medium">Expected to hit 4.2 ft</p>
              </div>
            </div>
          </div>
        </div>

        {/* RESTORED BOTTOM SECTION */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-teal-50 p-8 rounded-2xl border border-teal-100">
            <h3 className="text-lg font-black text-teal-900 mb-4 uppercase tracking-tight">Level Guide</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-green-500 rounded-full mt-1 shrink-0"></span>
                <div>
                  <p className="font-bold text-teal-900 text-sm">Normal (0ft - 2ft)</p>
                  <p className="text-teal-700/80 text-xs">Safe levels. Ankle to Knee level.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-yellow-500 rounded-full mt-1 shrink-0"></span>
                <div>
                  <p className="font-bold text-teal-900 text-sm">Warning (2.1ft - 3ft)</p>
                  <p className="text-teal-700/80 text-xs">Knee to Waist level. Stay alert.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-orange-500 rounded-full mt-1 shrink-0"></span>
                <div>
                  <p className="font-bold text-teal-900 text-sm">High Alert (3.1ft - 4ft)</p>
                  <p className="text-teal-700/80 text-xs">Chest level. Prepare for possible evacuation.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 bg-red-500 rounded-full mt-1 shrink-0"></span>
                <div>
                  <p className="font-bold text-teal-900 text-sm">Critical (Above 4ft)</p>
                  <p className="text-teal-700/80 text-xs">Overhead. Mandatory evacuation in effect.</p>
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
        &copy; 2026 Project Salba - Biñan, Laguna
      </footer>
    </div>
  );
};

export default Floodmonitoring;