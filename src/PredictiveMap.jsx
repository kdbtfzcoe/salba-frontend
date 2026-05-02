import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, Tooltip } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PredictiveMap = () => {
  const center = [14.3411, 121.0825];
  const prototypePos = [14.3450, 121.0850]; 
  const [userPos, setUserPos] = useState([14.3400, 121.0800]);
  
  const [floodRate] = useState(8); 
  const [currentWaterLevel] = useState(2.1); 

  const stats = useMemo(() => {
    const latDiff = Math.abs(prototypePos[0] - userPos[0]);
    const lngDiff = Math.abs(prototypePos[1] - userPos[1]);
    const distanceKm = Math.sqrt(Math.pow(latDiff * 111, 2) + Math.pow(lngDiff * 111, 2));
    const distanceMeters = (distanceKm * 1000).toFixed(0);
    const baseTravelTime = (distanceKm * 1000) / 1.5; 
    const adjustedTime = baseTravelTime / (floodRate / 5);
    const arrivalTime = Math.max(5, Math.floor(adjustedTime / 60)); 
    return { distanceMeters, arrivalTime };
  }, [userPos, floodRate]);

  // DYNAMIC STATUS LOGIC
  const getStatus = () => {
    if (stats.arrivalTime <= 20) return "KRITIKAL";
    if (stats.arrivalTime <= 45) return "BABALA";
    return "LIGTAS";
  };

  const status = getStatus();

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setUserPos([e.latlng.lat, e.latlng.lng]);
      },
    });
    return (
      <Marker position={userPos} icon={redIcon}>
        <Tooltip permanent direction="top" offset={[0, -40]}>
          <span className="font-bold text-red-600 text-[10px]">CURRENT LOCATION (MOVE ME)</span>
        </Tooltip>
      </Marker>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* 1. NAVBAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-[5000]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-800 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter text-slate-900 block leading-none uppercase">PROJECT SALBA</span>
              <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Flood Prediction</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-sm font-black text-slate-600 hover:text-teal-700 uppercase tracking-wider">Home</Link>
            <Link to="/monitoring" className="text-sm font-black text-slate-600 hover:text-teal-700 uppercase tracking-wider">Monitoring</Link>
            <Link to="/map" className="text-sm font-black text-teal-700 uppercase tracking-wider underline underline-offset-8 decoration-2">Predictive Map</Link>
            <Link to="/register" className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="bg-teal-800 py-8 px-6 text-center text-white">
        <h1 className="text-3xl font-black mb-1 tracking-tight uppercase">Predictive Flood Map</h1>
        <p className="text-teal-100 font-medium max-w-xl mx-auto text-xs opacity-90">
          I-pin ang iyong lokasyon upang malaman ang tinatayang oras bago umabot ang baha sa inyong lugar.
        </p>
      </div>

      {/* 3. MAIN CONTAINER (Combined Map and Info Box) */}
      <div className="max-w-[1800px] mx-auto w-full p-6 md:p-8 flex-1">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row gap-0">
          
          {/* LEFT SIDE: MAP */}
          <div className="w-full md:w-[72%] relative border-r border-gray-100" style={{ height: '750px' }}>
            <MapContainer center={center} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={[prototypePos, userPos]} pathOptions={{ color: '#0f172a', dashArray: '10, 10', weight: 2, opacity: 0.5 }} />
              <Marker position={prototypePos} icon={greenIcon}>
                <Tooltip permanent direction="top" offset={[0, -40]}>
                  <span className="font-bold text-teal-700 text-[10px]">SENSOR NG BAHA (STATION)</span>
                </Tooltip>
              </Marker>
              <LocationMarker />
            </MapContainer>
          </div>

          {/* RIGHT SIDE: INFO BOX PANEL */}
          <div className="w-full md:w-[28%] bg-gray-50/50 p-6 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '750px' }}>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Live Analysis</h2>
            
            {/* Card 1: Arrival Time - Light Blue */}
            <div className="bg-blue-50 rounded-2xl p-5 shadow-sm border border-blue-100">
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${status === 'KRITIKAL' ? 'text-blue-600' : 'text-blue-600'}`}>Tinatayang Dating ng Baha</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${status === 'KRITIKAL' ? 'text-black-700' : 'text-slate-900'}`}>{stats.arrivalTime}</span>
                <span className="text-lg font-black text-slate-900">MINUTO</span>
              </div>
            </div>

            {/* Card 2: Distance - Light Gray */}
            <div className="bg-gray-100 rounded-2xl p-5 shadow-sm border border-gray-200">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Layo mula sa Sensor</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">{stats.distanceMeters}</span>
                <span className="text-lg font-black text-slate-800">m</span>
              </div>
            </div>

            {/* Card 3: Water Level - Light Yellow */}
            <div className="bg-yellow-50 rounded-2xl p-5 shadow-sm border border-yellow-100">
              <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-1">Water Level sa Station</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-800">{currentWaterLevel}</span>
                <span className="text-lg font-black text-slate-800">ft</span>
              </div>
            </div>

            {/* Card 4: Status */}
            <div className={`rounded-2xl p-5 shadow-sm border transition-colors duration-500 ${
              status === 'KRITIKAL' ? 'bg-red-50 border-red-200' : 
              status === 'BABALA' ? 'bg-orange-50 border-orange-200' : 
              'bg-blue-50 border-blue-200'
            }`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                status === 'KRITIKAL' ? 'text-red-800' : 
                status === 'BABALA' ? 'text-orange-800' : 
                'text-blue-800'
              }`}>Warning Status</p>
              <p className={`text-2xl font-black uppercase ${
                status === 'KRITIKAL' ? 'text-red-900' : 
                status === 'BABALA' ? 'text-orange-900' : 
                'text-blue-900'
              }`}>
                {status}
              </p>
            </div>

            {/* Card 5: Recommendation */}
            <div className={`rounded-2xl p-5 shadow-sm border transition-colors duration-500 flex-1 ${
              status === 'KRITIKAL' ? 'bg-red-100 border-red-300' : 
              status === 'BABALA' ? 'bg-orange-100 border-orange-300' : 
              'bg-teal-50 border-teal-100'
            }`}>
              <div className="flex justify-between items-start mb-2">
                 <p className={`text-[10px] font-bold uppercase tracking-widest ${
                   status === 'KRITIKAL' ? 'text-red-800' : 
                   status === 'BABALA' ? 'text-orange-800' : 
                   'text-teal-800'
                 }`}>Rekomendasyon</p>
                 <svg className={`w-4 h-4 ${status === 'KRITIKAL' ? 'text-red-600' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
              </div>
              <p className="text-[13px] text-slate-700 font-bold leading-relaxed italic">
                {status === 'KRITIKAL' 
                  ? "LUMIKAS NA AGAD! Ang baha ay napakalapit na sa inyong lokasyon. Itaas ang mga gamit at pumunta sa evacuation center." 
                  : status === 'BABALA'
                  ? "MAGHANDA NA. Iakyat ang mga gamit at ihanda ang emergency kit dahil mabilis ang pagtaas ng tubig."
                  : "MALAYO PA ANG BAHA. Mag-ingat at ihanda ang mga gamit na madaling mabasa bilang pag-iingat."}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PredictiveMap;