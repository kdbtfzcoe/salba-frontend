import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Rectangle, Polyline, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from './Navbar';

// --- Icons (Cleaned URLs) ---
const sensorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const SENSOR_POS = [14.34902, 121.08070];
const DELA_PAZ_BOUNDS = [
  [14.339225, 121.067147],
  [14.355722, 121.086287]
];

// ADD THIS NEW CONSTANT:
const MAP_MAX_BOUNDS = [
  [14.3200, 121.0500], // South-West limit (Outer Biñan)
  [14.3750, 121.1000]  // North-East limit (Lake Shore)
];

const PredictiveMap = () => {
  const center = [14.3487, 121.0848];
  const [userPos, setUserPos] = useState([14.3480, 121.0840]);
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // --- REAL-TIME STATE ---
  const [waterLevel, setWaterLevel] = useState(4.0);
  const [floodRate] = useState(3);
  const sensorBaseElevation = 4.6;

  // --- Logic: Hydraulic Modeling ---
  const getHydraulicColor = useCallback((cellEle, cellDist, currentWaterFt) => {
    const waterMeters = currentWaterFt * 0.3048;
    const sourceASL = sensorBaseElevation + waterMeters;
    
    const localDepth = sourceASL - cellEle - (cellDist * 0.0008);

    if (localDepth <= 0) return "#22c55e";    // Green (Safe)
    if (localDepth < 0.5) return "#fde047";   // Yellow (Low Risk)
    if (localDepth < 1.2) return "#f97316";   // Orange (High Risk)
    return "#dc2626";                         // Red (Critical)
  }, [sensorBaseElevation]);

  // --- LiDAR Simulation Engine ---
  const generateSimulatedLiDAR = useCallback(() => {
    setLoading(true);
    const minLat = DELA_PAZ_BOUNDS[0][0], maxLat = DELA_PAZ_BOUNDS[1][0];
    const minLng = DELA_PAZ_BOUNDS[0][1], maxLng = DELA_PAZ_BOUNDS[1][1];
    const rows = 15, cols = 18;
    const latStep = (maxLat - minLat) / rows, lngStep = (maxLng - minLng) / cols;
    
    let simulatedGrid = [];

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const lat = minLat + (i * latStep);
        const lng = minLng + (j * lngStep);
        const cLat = lat + latStep / 2;
        const cLng = lng + lngStep / 2;

        const northFactor = (i / rows);
        const eastFactor = (j / cols);  
        
        let elevation = 8.5 - (northFactor * 3.5) - (eastFactor * 2.5);
        const noise = (Math.sin(i * 0.8) * 0.4) + (Math.cos(j * 0.8) * 0.4);
        elevation += noise;

        const distance = Math.sqrt(
          Math.pow(cLat - SENSOR_POS[0], 2) +
          Math.pow(cLng - SENSOR_POS[1], 2)
        ) * 111320;

        simulatedGrid.push({
          id: `${i}-${j}`,
          bounds: [[lat, lng], [lat + latStep, lng + lngStep]],
          centerLat: cLat,
          centerLng: cLng,
          elevation: Math.max(1.8, elevation),
          distance
        });
      }
    }

    setGridData(simulatedGrid);
    setLoading(false);
  }, []);

  useEffect(() => {
    generateSimulatedLiDAR();
  }, [generateSimulatedLiDAR]);

  const findCellAtLocation = useCallback((lat, lng) => {
    const cell = gridData.find(c => 
      lat >= c.bounds[0][0] && lat <= c.bounds[1][0] && 
      lng >= c.bounds[0][1] && lng <= c.bounds[1][1]
    );
    if (cell) setSelectedCell(cell);
  }, [gridData]);

  useEffect(() => {
    if (gridData.length > 0 && userPos && !selectedCell) {
      findCellAtLocation(userPos[0], userPos[1]);
    }
  }, [gridData, userPos, selectedCell, findCellAtLocation]);

    const stats = useMemo(() => {
    const currentLat = userPos[0];
    const currentLng = userPos[1];
    const currentEle = selectedCell ? selectedCell.elevation : 10.2;
    const isInsideDelaPaz = currentLat >= DELA_PAZ_BOUNDS[0][0] && currentLat <= DELA_PAZ_BOUNDS[1][0] && currentLng >= DELA_PAZ_BOUNDS[0][1] && currentLng <= DELA_PAZ_BOUNDS[1][1];

    const distanceMeters = Math.sqrt(
      Math.pow(Math.abs(SENSOR_POS[0] - currentLat) * 111320, 2) +
      Math.pow(Math.abs(SENSOR_POS[1] - currentLng) * 111320, 2)
    );

    const relativeHeight = currentEle - sensorBaseElevation;

    let confLabel = "Low", confValue = 45, confColor = "bg-red-100 text-red-700 border-red-200";
    if (distanceMeters < 500) {
      confLabel = "High"; confValue = 92; confColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
    } else if (distanceMeters < 1200) {
      confLabel = "Moderate"; confValue = 74; confColor = "bg-blue-100 text-blue-700 border-blue-200";
    }
    
    if (!isInsideDelaPaz) {
      return { distanceMeters: distanceMeters.toFixed(0), arrivalTime: "OUTSIDE", heightDiff: relativeHeight.toFixed(1), isInsideDelaPaz: false, confidence: { label: "N/A", value: 0, style: "bg-gray-100 text-gray-400" } };
    }

    // --- NEW LOGIC: Dynamic ETA scaling ---
    const waterMeters = waterLevel * 0.3048;
    const sourceASL = sensorBaseElevation + waterMeters;
    
    // Calculate if the water has already reached the cell
    const localDepth = sourceASL - currentEle - (distanceMeters * 0.0008);
    let arrivalTime = 0;

    if (localDepth >= 0) {
      // If local depth is positive, the water is already there!
      arrivalTime = 0; 
    } else {
      // Water hasn't arrived yet. Calculate base velocity.
      let baseSpeed = floodRate <= 2 ? 0.5 : floodRate <= 7 ? 1.2 : 2.5;
      const slope = relativeHeight / Math.max(1, distanceMeters);
      let adjustedVelocity = relativeHeight > 0 ? baseSpeed / (1 + (slope * 50)) : baseSpeed * (1 + (Math.abs(slope) * 50));
      adjustedVelocity = Math.max(0.05, adjustedVelocity * (floodRate / 5));
      
      const baseTimeMins = (distanceMeters / adjustedVelocity) / 60;
      
      // Calculate how much MORE the water needs to rise to hit this cell
      const depthNeededAtZero = (currentEle + (distanceMeters * 0.0008)) - sensorBaseElevation;
      
      // Scale the ETA based on how much water is already present
      let scaleFactor = depthNeededAtZero > 0 ? Math.abs(localDepth) / depthNeededAtZero : 0;
      scaleFactor = Math.min(1, Math.max(0, scaleFactor)); // Lock between 0 and 1
      
      arrivalTime = Math.max(1, Math.floor(baseTimeMins * scaleFactor));
    }

    return {
      distanceMeters: distanceMeters.toFixed(0),
      arrivalTime, // Returns 0 if already flooded, or the scaled time
      heightDiff: Math.abs(relativeHeight).toFixed(1),
      isInsideDelaPaz: true,
      isUphill: relativeHeight > 0,
      confidence: { label: confLabel, value: confValue, style: confColor }
    };
    // CRITICAL: Added waterLevel here so the math recalculates on slider drag
  }, [userPos, selectedCell, floodRate, sensorBaseElevation, waterLevel]);

  const status = useMemo(() => {
    if (!stats.isInsideDelaPaz) return "OUTSIDE PARAMETER";
    if (!selectedCell) return "ANALYZING";
    
    const riskColor = getHydraulicColor(selectedCell.elevation, selectedCell.distance, waterLevel);
    if (riskColor === "#dc2626") return "KRITIKAL";
    if (riskColor === "#f97316") return "ACTION";
    if (riskColor === "#fde047") return "WARNING";
    return "SAFE";
  }, [stats, selectedCell, waterLevel, getHydraulicColor]);

  const getArrivalTimeColor = () => {
    if (!stats.isInsideDelaPaz || !selectedCell) return "bg-gray-400 text-white";
    
    const riskColor = getHydraulicColor(selectedCell.elevation, selectedCell.distance, waterLevel);
    switch (riskColor) {
      case "#dc2626": return "bg-red-600 text-white";       
      case "#f97316": return "bg-orange-500 text-white";    
      case "#fde047": return "bg-yellow-400 text-slate-900";
      case "#22c55e": return "bg-green-500 text-white";     
      default: return "bg-gray-400 text-white";
    }
  };

  const LocationPin = () => {
    useMapEvents({
      click(e) {
        setUserPos([e.latlng.lat, e.latlng.lng]);
        findCellAtLocation(e.latlng.lat, e.latlng.lng);
      }
    });
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar/>
      
      <div className="bg-teal-800 py-7 px-6 text-center text-white">
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">LIVE PREDICTIVE MAP</h1>
        <p className="text-teal-100 font-medium max-w-xl mx-auto">Localized Flood Prediction System</p>
      </div>

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow -mt-3 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          
          <div className="lg:w-[75%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[700px] flex flex-col relative">
            {loading && (
              <div className="absolute inset-0 z-[2000] bg-white/95 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Processing Terrain...</p>
              </div>
            )}
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dela Paz Terrain Analysis</h2>
              <div className="text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-3 py-2 rounded-lg border">
                {loading ? "Analyzing..." : "Ready"}
              </div>
            </div>
            
            {/* --- REPAIRED JSX TAGS --- */}
            <div className="flex-grow relative bg-slate-200 z-0">
              <MapContainer 
                center={center} 
                zoom={16} 
                minZoom={14} /* Prevents zooming out to see the whole country */
                maxBounds={MAP_MAX_BOUNDS} /* Creates the invisible wall */
                maxBoundsViscosity={1.0} /* 1.0 makes it a solid wall that bounces back instantly */
                style={{ height: '100%', width: '100%' }}
>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <LocationPin/>
                
                <Rectangle 
                  bounds={DELA_PAZ_BOUNDS} 
                  pathOptions={{ color: '#64748b', dashArray: '5, 5', fill: false, weight: 2 }}
                >
                </Rectangle>

                {gridData.map((cell) => (
                  <Rectangle 
                    key={cell.id}
                    bounds={cell.bounds} 
                    pathOptions={{
                      fillColor: getHydraulicColor(cell.elevation, cell.distance, waterLevel),
                      fillOpacity: selectedCell?.id === cell.id ? 0.7 : 0.35,
                      color: selectedCell?.id === cell.id ? '#1e293b' : 'white',
                      weight: selectedCell?.id === cell.id ? 2 : 0.5
                    }}
                    eventHandlers={{
                      click: () => {
                        setSelectedCell(cell);
                        setUserPos([cell.centerLat, cell.centerLng]);
                      }
                    }}
                  />
                ))}

                <Marker icon={sensorIcon} position={SENSOR_POS}>
                  <Tooltip offset={[0, -40]} direction="top" permanent>
                    <span className="font-bold text-teal-700 text-[10px]">SENSOR ({sensorBaseElevation}m)</span>
                  </Tooltip>
                </Marker>

                {userPos && (
                  <>
                    <Polyline 
                      positions={[SENSOR_POS, userPos]} 
                      pathOptions={{ color: '#0f172a', dashArray: '10, 10', weight: 2 }} 
                    />
                    <Marker 
                      draggable={true} 
                      icon={userIcon} 
                      position={userPos}
                      eventHandlers={{
                        dragend: (e) => {
                          const newPos = e.target.getLatLng();
                          setUserPos([newPos.lat, newPos.lng]);
                          findCellAtLocation(newPos.lat, newPos.lng);
                        }
                      }}
                    > 
                      <Tooltip offset={[0, -40]} direction="top" permanent>
                        <span className="font-bold text-red-600 text-[10px]">
                          LOKASYON MO ({(selectedCell?.elevation || 10.2).toFixed(1)}m)
                        </span>
                      </Tooltip>
                    </Marker>
                  </>
                )}
              </MapContainer>
            </div>
          </div>

          <div className="lg:w-[25%] flex flex-col gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-200 flex flex-col gap-3 h-full overflow-hidden">
              
              <div className={`p-2 rounded-lg border flex justify-between items-center ${stats.confidence.style}`}>
                <span className="text-[10px] font-black uppercase tracking-wider">Confidence Level</span>
                <span className="text-[11px] font-black">{stats.confidence.label} ({stats.confidence.value}%)</span>
              </div>

              <div className={`p-4 rounded-xl border transition-colors duration-300 ${getArrivalTimeColor()}`}>
                <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Est. Arrival Time</p>
                <div className="flex items-baseline gap-1">
                  
                  {/* If arrivalTime is 0, print "NOW". Otherwise, print the number. */}
                  <span className="text-4xl font-black leading-tight">
                    {stats.arrivalTime === 0 ? "NOW" : stats.arrivalTime}
                  </span>
                  
                  {/* Hide the word "MINS" if the time says "NOW" */}
                  <span className="text-sm font-bold uppercase">
                    {stats.isInsideDelaPaz && stats.arrivalTime !== 0 ? "MINS" : ""}
                  </span>
                  
                </div>
              </div>

              <div className="bg-blue-900 p-5 rounded-xl text-white shadow-lg">
                <div className="flex justify-between items-center mb-3">
                   <p className="text-[10px] font-bold uppercase text-blue-300 tracking-widest">Adjust Water Level</p>
                   <span className="text-xl font-black text-cyan-400">{waterLevel.toFixed(1)} <small className="text-xs">FT</small></span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex justify-between text-[9px] font-bold text-blue-400 mt-2 uppercase">
                   <span>0ft</span>
                   <span>7.5ft</span>
                   <span>15ft</span>
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
              </div>

              <div className={`p-4 rounded-xl border ${status === 'KRITIKAL' ? 'bg-red-50 border-red-200' : status === 'SAFE' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Warning Status</p>
                <p className={`text-xl font-black uppercase ${status === 'KRITIKAL' ? 'text-red-700' : status === 'SAFE' ? 'text-green-700' : 'text-orange-700'}`}>{status}</p>
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