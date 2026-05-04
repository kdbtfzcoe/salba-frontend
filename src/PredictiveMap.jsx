import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from './Navbar';

// --- Icons ---
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const PredictiveMap = () => {
  const center = [14.3487, 121.0848];
  const prototypePos = [14.348548, 121.074335];
  const [userPos, setUserPos] = useState([14.3480, 121.0840]);
  const [elevations, setElevations] = useState({ sensor: 0, user: 0 });
  const [loading, setLoading] = useState(false);
  const [floodRate] = useState(3); // cm/hr
  const [waterLevel] = useState(3.5); // ft

  // --- Elevation Fetching ---
  const fetchElevation = async (lat, lng) => {
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
      const data = await response.json();
      return data.elevation[0] || 0;
    } catch (err) { return 10.2; }
  };

  useEffect(() => {
    let isMounted = true;
    const updateElevations = async () => {
      setLoading(true);
      const [sEle, uEle] = await Promise.all([
        fetchElevation(prototypePos[0], prototypePos[1]),
        fetchElevation(userPos[0], userPos[1])
      ]);
      if (isMounted) {
        setElevations({ sensor: sEle, user: uEle });
        setLoading(false);
      }
    };
    updateElevations();
    return () => { isMounted = false; };
  }, [userPos]);

  // --- Logic Stats ---
  const stats = useMemo(() => {
    const lat = userPos[0];
    const lng = userPos[1];
    const isInsideDelaPaz = lat >= 14.3350 && lat <= 14.3650 && lng >= 121.0700 && lng <= 121.1000;

    const distanceMeters = Math.sqrt(
      Math.pow(Math.abs(prototypePos[0] - userPos[0]) * 111320, 2) +
      Math.pow(Math.abs(prototypePos[1] - userPos[1]) * 111320, 2)
    );

    const relativeHeight = elevations.user - elevations.sensor;

    // --- Confidence Level Calculation ---
    // High: Distance < 500m, Moderate: 500m-1200m, Low: > 1200m
    let confLabel = "Low";
    let confValue = 45;
    let confColor = "bg-red-100 text-red-700 border-red-200";

    if (distanceMeters < 500) {
      confLabel = "High";
      confValue = 92;
      confColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (distanceMeters < 1200) {
      confLabel = "Moderate";
      confValue = 74;
      confColor = "bg-blue-100 text-blue-700 border-blue-200";
    }
   
    if (!isInsideDelaPaz) {
      return { distanceMeters: distanceMeters.toFixed(0), arrivalTime: "OUTSIDE", heightDiff: relativeHeight.toFixed(1), isInsideDelaPaz: false, confidence: { label: "N/A", value: 0, style: "bg-gray-100 text-gray-400" } };
    }

    let baseSpeed;
    if (floodRate <= 2) baseSpeed = 0.5;
    else if (floodRate <= 7) baseSpeed = 1.2;
    else baseSpeed = 2.5;

    const slope = relativeHeight / Math.max(1, distanceMeters);
    let adjustedVelocity;

    if (relativeHeight > 0) {
      adjustedVelocity = baseSpeed / (1 + (slope * 50));
    } else {
      adjustedVelocity = baseSpeed * (1 + (Math.abs(slope) * 50));
    }

    adjustedVelocity = Math.max(0.05, adjustedVelocity * (floodRate / 5));
    let calculatedTime = Math.floor((distanceMeters / adjustedVelocity) / 60);

    return {
      distanceMeters: distanceMeters.toFixed(0),
      arrivalTime: Math.max(1, calculatedTime),
      heightDiff: relativeHeight.toFixed(1),
      isInsideDelaPaz: true,
      isUphill: relativeHeight > 0,
      confidence: { label: confLabel, value: confValue, style: confColor }
    };
  }, [userPos, elevations, floodRate]);

  const status = useMemo(() => {
    if (!stats.isInsideDelaPaz) return "OUTSIDE PARAMETER";
    if (stats.arrivalTime <= 15) return "KRITIKAL";
    if (stats.arrivalTime <= 60) return "ACTION";
    return "WARNING";
  }, [stats]);

  const getArrivalTimeColor = () => {
    if (!stats.isInsideDelaPaz) return "bg-gray-400 text-white";
    if (stats.arrivalTime <= 15) return "bg-red-600 text-white";
    if (stats.arrivalTime <= 60) return "bg-orange-500 text-white";
    return "bg-yellow-400 text-slate-900";
  };

  function LocationMarker() {
    useMapEvents({ click(e) { setUserPos([e.latlng.lat, e.latlng.lng]); } });
    return (
      <Marker position={userPos} icon={redIcon}>
        <Tooltip permanent direction="top" offset={[0, -40]}>
          <span className="font-bold text-red-600 text-[10px]">LOKASYON MO ({elevations.user}m)</span>
        </Tooltip>
      </Marker>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />
      <div className="bg-teal-800 py-7 px-6 text-center text-white">
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">LIVE PREDICTIVE MAP</h1>
        <p className="text-teal-100 font-medium max-w-xl mx-auto">Localized Flood Prediction System</p>
      </div>

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow -mt-3 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Container */}
          <div className="lg:w-[75%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[700px] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">DELA PAZ TERRAIN ANALYSIS</h2>
              <div className="text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-3 py-2 rounded-lg border">
                {loading ? "Analyzing..." : "Ready"}
              </div>
            </div>
            <div className="flex-grow relative bg-slate-200 z-0">
            <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={[prototypePos, userPos]} pathOptions={{ color: '#0f172a', dashArray: '10, 10', weight: 2 }} />
                <Marker position={prototypePos} icon={greenIcon}>
                  <Tooltip permanent direction="top" offset={[0, -40]}>
                    <span className="font-bold text-teal-700 text-[10px]">SENSOR ({elevations.sensor}m)</span>
                  </Tooltip>
                </Marker>
                <LocationMarker />
              </MapContainer>
            </div>
          </div>

          {/* Revised Information Box Sidebar */}
          <div className="lg:w-[25%] flex flex-col gap-4 h-[700px]">
            <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-200 flex flex-col gap-3 h-full overflow-hidden">
             
              {/* Confidence Level Box */}
              <div className={`p-2 rounded-lg border flex justify-between items-center ${stats.confidence.style}`}>
                <span className="text-[10px] font-black uppercase tracking-wider">Confidence Level</span>
                <span className="text-[11px] font-black">{stats.confidence.label} ({stats.confidence.value}%)</span>
              </div>

              <div className={`p-4 rounded-xl border ${getArrivalTimeColor()}`}>
                <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Est. Arrival Time</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black leading-tight">{stats.arrivalTime}</span>
                  <span className="text-sm font-bold uppercase">{stats.isInsideDelaPaz ? "MINS" : ""}</span>
                </div>
              </div>

              <div className="bg-blue-900 p-4 rounded-xl text-white">
                <p className="text-[10px] font-bold uppercase text-blue-300 mb-2 tracking-widest">Sensor Water Level</p>
                <div className="flex items-center gap-3">
                  <div className="flex-grow bg-blue-950 h-3 rounded-full overflow-hidden border border-blue-800">
                    <div className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" style={{ width: `${(waterLevel / 5) * 100}%` }}></div>
                  </div>
                  <span className="text-xl font-black whitespace-nowrap">{waterLevel.toFixed(1)} <span className="text-xs text-blue-300">FT</span></span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Distance From Sensor</p>
                <p className="text-2xl font-black text-slate-800">{stats.distanceMeters} <span className="text-sm text-slate-500 uppercase">m</span></p>
              </div>

              <div className={`p-4 rounded-xl border flex flex-col gap-1 ${stats.isUphill ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className={`text-[10px] font-bold uppercase ${stats.isUphill ? 'text-emerald-700' : 'text-orange-700'}`}>
                  Terrain: {stats.isUphill ? 'UPHILL CLIMB' : 'DOWNHILL FLOW'}
                </p>
                <div className="flex items-center gap-2 font-black text-slate-800">
                  <span className="text-2xl">{stats.heightDiff}m</span>
                  <span className="text-xl">{stats.isUphill ? '▲' : '▼'}</span>
                </div>
                <p className="text-[9px] font-bold italic leading-tight text-slate-600">
                  {stats.isUphill ? "Water is climbing to higher ground; arrival is slowed." : "Gravity accelerates the flow; water arrives faster."}
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${status === 'KRITIKAL' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Warning Status</p>
                <p className={`text-xl font-black uppercase ${status === 'KRITIKAL' ? 'text-red-700' : 'text-blue-700'}`}>{status}</p>
              </div>

              <div className={`p-4 rounded-xl border mt-auto flex-grow flex items-center ${status === 'KRITIKAL' ? 'bg-red-100 border-red-200' : 'bg-slate-100 border-slate-200'}`}>
                <p className="text-[11px] text-slate-800 font-bold leading-tight italic">
                  {status === 'KRITIKAL' ? "🚨 KRITIKAL: Mabilis ang agos ng tubig patungo sa inyong lokasyon! Lumikas na agad." : "⚠️ BABALA: Maging handa sa posibleng pagbaha sa inyong lugar sa Dela Paz."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTIONS: Guide and Hotlines */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="md:col-span-2 bg-teal-50 p-8 rounded-2xl border border-teal-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Flood Arrival Guide</h3>
            <div className="overflow-x-auto text-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[10px] uppercase tracking-widest text-slate-400">
                    <th className="pb-3">Level</th>
                    <th className="pb-3">Time Window</th>
                    <th className="pb-3">Primary Goal</th>
                    <th className="pb-3">Mindset</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-slate-700">
                  <tr className="border-b border-slate-100"><td className="py-4 text-blue-600">5: Awareness</td><td className="py-4">24+ Hours</td><td className="py-4">Planning</td><td className="py-4 font-black">Proactive</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-4 text-emerald-600">4: Precaution</td><td className="py-4">6 - 24 Hours</td><td className="py-4">Protection</td><td className="py-4 font-black text-emerald-700">Labor-Intensive</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-4 text-yellow-500">3: Warning</td><td className="py-4">1 - 6 Hours</td><td className="py-4">Staging</td><td className="py-4 font-black text-yellow-600">Alert</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-4 text-orange-500">2: Action</td><td className="py-4">15 - 60 Mins</td><td className="py-4">Mitigation</td><td className="py-4 font-black text-orange-600">Urgent</td></tr>
                  <tr><td className="py-4 text-red-600">1: Critical</td><td className="py-4">0 - 15 Mins</td><td className="py-4">Survival</td><td className="py-4 font-black text-red-700">Immediate</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tight">Emergency Hotline</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border">
                <span className="font-bold text-slate-700 uppercase text-xs">Biñan Rescue</span>
                <span className="text-teal-700 font-black tracking-tighter">911 / (049) 511-9111</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border">
                <span className="font-bold text-slate-700 uppercase text-xs">PNP Biñan</span>
                <span className="text-teal-700 font-black tracking-tighter">(049) 511-6633</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest border-t border-gray-100">
        &copy; 2026 Project Salba - Biñan, Laguna
      </footer>
    </div>
  );
};

export default PredictiveMap;