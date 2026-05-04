import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const Floodmonitoring = () => {
  const [chartData, setChartData] = useState([]);
  
  // Logic states for the Info Box
  const [waterLevel, setWaterLevel] = useState(2.8);
  const [rateOfChange, setRateOfChange] = useState(0.4); // Positive = Increasing, Negative = Decreasing
  const isIncreasing = rateOfChange > 0;

  // Helper function to generate intervals for the last 2 hours
  const generateRealTimeData = () => {
    const dataPoints = [];
    const now = new Date();
    
    // We want 9 points (15 min intervals over 2 hours)
    for (let i = 8; i >= 0; i--) {
      const timePoint = new Date(now.getTime() - i * 15 * 60 * 1000);
      
      let hours = timePoint.getHours();
      const minutes = timePoint.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12; // convert 0 to 12

      dataPoints.push({
        time: `${hours}:${minutes}`,
        period: period,
        // Using your original level progression pattern but dynamic
        level: (3.5 - (i * 0.08)).toFixed(1)
      });
    }
    return dataPoints;
  };

  // Update the timeline every minute
  useEffect(() => {
    setChartData(generateRealTimeData());

    const timer = setInterval(() => {
      setChartData(generateRealTimeData());
    }, 60000); // 60,000ms = 1 minute

    return () => clearInterval(timer);
  }, []);

  // Custom Tick component to stack Time and AM/PM
  const CustomXAxisTick = ({ x, y, payload }) => {
    const item = chartData[payload.index];
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
          <div className="lg:w-[75%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">FLOOD LEVEL WAVE GRAPH</h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-3 py-2 rounded-lg border border-teal-100">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Live Update as of: {currentDateTime}
                </div>
            </div>

            <div className="flex-grow relative p-4 bg-teal-800"> 
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                  <defs>
                    <pattern id="static-bg" patternUnits="userSpaceOnUse" width="100%" height="100%">
                        <image 
                          href="/Background.png" 
                          x="0" y="0" 
                          width="100%" 
                          height="100%" 
                          preserveAspectRatio="none" 
                          opacity="0.50" 
                        />
                    </pattern>
                  </defs>

                  {/* 1. BACKGROUND IMAGE - Strictly bounded by first/last time and 0-5ft */}
                  {chartData.length > 0 && (
                    <>
                      <ReferenceArea 
                        x1={chartData[0].time} 
                        x2={chartData[chartData.length - 1].time} 
                        y1={0} 
                        y2={5} 
                        fill="url(#static-bg)" 
                      />
                      {/* 2. COLOR ZONES - Strictly bounded horizontally to fit inside axis */}
                      <ReferenceArea x1={chartData[0].time} x2={chartData[chartData.length - 1].time} y1={0} y2={1} fill="#22c55e" fillOpacity={0.3} />
                      <ReferenceArea x1={chartData[0].time} x2={chartData[chartData.length - 1].time} y1={1} y2={2} fill="#eab308" fillOpacity={0.3} />
                      <ReferenceArea x1={chartData[0].time} x2={chartData[chartData.length - 1].time} y1={2} y2={3} fill="#f97316" fillOpacity={0.3} />
                      <ReferenceArea x1={chartData[0].time} x2={chartData[chartData.length - 1].time} y1={3} y2={5} fill="#ef4444" fillOpacity={0.3} />
                    </>
                  )}

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

          {/* NEW INFORMATION BOX - PERFECTLY SPACED, NO WASTED SPACE */}
          <div className="lg:w-[25%] flex flex-col gap-4 h-[700px]">
            <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-200 flex flex-col gap-3 h-full overflow-hidden">
              
              {/* STATION INFO - Compact */}
              <div className="mb-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Station</p>
                <div className="mt-1 p-3 bg-teal-900 rounded-xl">
                  <p className="text-sm font-black text-white">Brgy. Dela Paz</p>
                </div>
              </div>

              {/* 1. RATE OF CHANGE (Main Feature) */}
              <div className={`p-4 rounded-xl border ${isIncreasing ? 'bg-red-600 text-white border-red-700' : 'bg-emerald-600 text-white border-emerald-700'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isIncreasing ? 'text-red-100' : 'text-emerald-100'}`}>Rate of Change</p>
                <p className="text-2xl font-black">{isIncreasing ? '+' : ''}{rateOfChange} <span className="text-sm font-bold">FT / HR</span></p>
              </div>

              {/* 2. STATUS */}
              <div className={`p-3 rounded-xl border ${isIncreasing ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Status</p>
                <div className="flex items-center justify-between">
                  <p className={`text-lg font-black uppercase ${isIncreasing ? 'text-red-700' : 'text-emerald-700'}`}>
                    {isIncreasing ? 'Increasing' : 'Decreasing'}
                  </p>
                  <svg className={`w-5 h-5 ${isIncreasing ? 'text-red-600 animate-bounce' : 'text-emerald-600 rotate-180 animate-bounce'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7 7 7" />
                  </svg>
                </div>
              </div>

              {/* 3. CURRENT WATER LEVEL (Progress Bar) */}
              <div className="bg-blue-900 p-3 rounded-xl text-white shadow-lg shadow-blue-900/20 border border-blue-800">
                <p className="text-[10px] font-bold uppercase text-blue-300 mb-1 tracking-widest">Water Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-grow bg-blue-950 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] transition-all duration-1000" style={{ width: `${(waterLevel / 5) * 100}%` }}></div>
                  </div>
                  <span className="text-lg font-black whitespace-nowrap">{waterLevel.toFixed(1)} <span className="text-xs">FT</span></span>
                </div>
              </div>

              {/* 4. WARNING STATUS */}
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                <p className="text-[10px] font-bold text-orange-700 uppercase tracking-widest mb-1">Warning Status</p>
                <p className="text-base font-black text-orange-800 uppercase">Waist Level</p>
              </div>

              {/* 5. ESTIMATED PEAK TIME - Pushes to bottom */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-auto">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Est. Peak Time</p>
                <p className="text-lg font-black text-slate-800">2:30 PM</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Expected: 4.2 ft</p>
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