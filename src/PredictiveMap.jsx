import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from './Navbar';

// Fix para sa icons ng Leaflet (dahil minsan nawawala ang icons sa React)
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { Icon } from 'leaflet';

const greenIcon = new Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });
const redIcon = new Icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41] });

const PredictiveMap = () => {
  // Coordinates ng Biñan (Center)
  const center = [14.3411, 121.0825];
  
  // 1. Lokasyon ng Prototype (Fixed Green Pin)
  const prototypePos = [14.3450, 121.0850]; 

  // 2. Lokasyon ng User (Movable Red Pin)
  const [userPos, setUserPos] = useState([14.3400, 121.0800]);

  // Logic para sa oras (Simulation lang ito)
  // Mas malayo ang Red Pin sa Green Pin, mas matagal ang dating ng tubig
  const travelTime = useMemo(() => {
    const latDiff = Math.abs(prototypePos[0] - userPos[0]);
    const lngDiff = Math.abs(prototypePos[1] - userPos[1]);
    const distanceFactor = (latDiff + lngDiff) * 1000; 
    return Math.max(10, Math.floor(distanceFactor)); // minimum 10 mins
  }, [userPos]);

  // Component para mahuli ang pag-click sa map
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setUserPos([e.latlng.lat, e.latlng.lng]);
      },
    });
    return (
      <Marker position={userPos} icon={redIcon}>
        <Popup>Ito ang iyong napiling lokasyon.</Popup>
      </Marker>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
    
      {/* NAVBAR COMPONENT IS PLUGGED IN HERE */}
      <Navbar />

      <div className="flex-1 relative flex flex-col md:flex-row">
        
        {/* SIDEBAR POP-UP STYLE */}
        <div className="absolute top-10 right-10 z-[1000] w-72 bg-white p-6 rounded-2xl shadow-2xl border-t-4 border-teal-600">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Flood Prediction</h2>
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-black text-slate-800">{travelTime} mins</p>
              <p className="text-sm text-gray-500 font-medium italic">Estimated arrival of flood from Sensor Station</p>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-teal-600 uppercase">Recommendation:</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {travelTime < 30 ? "⚠️ Critical! Maging handa sa agarang paglikas." : "✅ May sapat pang oras para itaas ang mga kagamitan."}
              </p>
            </div>
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="flex-1 z-0">
          <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Prototype Pin */}
            <Marker position={prototypePos} icon={greenIcon}>
              <Popup><b>Sensor Station 1</b><br/>Nandito ang ating prototype.</Popup>
            </Marker>

            {/* User Movable Pin */}
            <LocationMarker />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default PredictiveMap;