import React, {
  useState,
  useMemo,
  useEffect
} from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  Circle,
  useMapEvents
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './radar.css';
import Navbar from './Navbar';

// =====================================
// ICONS
// =====================================
const sensorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// =====================================
// CONSTANTS
// =====================================
const SENSOR_COORDINATES = [14.348981, 121.080614];
const MAX_RADAR_RADIUS = 950; // Meters to cover Barangay Dela Paz at 5.0 ft

const MAP_MAX_BOUNDS = [
  [14.3200, 121.0500],
  [14.3750, 121.1000]
];

const PredictiveMap = () => {
  const mapCenter = [14.348981, 121.080614];

  // =====================================
  // STATES
  // =====================================
  const [userPos, setUserPos] = useState(null);
  const [waterLevel, setWaterLevel] = useState(0); // 0 to 5 feet
  const [waterTrend, setWaterTrend] = useState("Stable");

  // Geolocation Initial Setup
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPos([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        // Fallback: placed 450 meters away from the sensor for testing simulation
        setUserPos([14.3515, 121.0835]);
      }
    );
  }, []);

  // =====================================
  // DYNAMIC CALCULATIONS & METRICS
  // =====================================

  // 1. Get exact straight-line relative distance between user and sensor (meters)
  const distanceMeters = useMemo(() => {
    if (!userPos) return 0;
    return Math.round(L.latLng(userPos).distanceTo(SENSOR_COORDINATES));
  }, [userPos]);

  // 2. Current absolute physical reach of the floodwater radius (meters)
  const currentWaterReach = useMemo(() => {
    return (waterLevel / 5) * MAX_RADAR_RADIUS;
  }, [waterLevel]);

  // 3. Rate of spread velocity (meters per minute) based on water height
  // Higher water levels create higher velocity coefficients
  const rateOfSpread = useMemo(() => {
    if (waterLevel <= 0) return 0;
    return parseFloat((15 + Math.sqrt(waterLevel) * 25).toFixed(2)); // m/min
  }, [waterLevel]);

  // 4. Personalized User Proximity Status & Forecast Engine Logic
  const userMetrics = useMemo(() => {
    // Distance remaining before the water radius line reaches the user's feet
    const bufferDistance = distanceMeters - currentWaterReach;

    // Default Fallback values if sensor is completely dry
    if (waterLevel === 0) {
      return {
        status: { label: 'SAFE', color: 'text-green-600', bg: 'bg-green-50', nextLabel: 'MONITOR' },
        minutesToNext: '--'
      };
    }

    // IF WATER RADIUS HAS ALREADY OVERTAKEN OR MATCHED USER LOCATION
    if (bufferDistance <= 0) {
      return {
        status: { label: 'DANGER', color: 'text-red-600', bg: 'bg-red-50', nextLabel: 'MAX HAZARD' },
        minutesToNext: 0 
      };
    }

    // DYNAMIC SEGMENTATION MATRIX (Based entirely on distance to incoming flood edge)
    if (bufferDistance > 600) {
      // Flood is far away
      const mins = Math.round((bufferDistance - 600) / rateOfSpread);
      return {
        status: { label: 'SAFE', color: 'text-green-600', bg: 'bg-green-50', nextLabel: 'MONITOR' },
        minutesToNext: Math.max(1, mins)
      };
    } 
    else if (bufferDistance > 350) {
      // Flood is entering outer observation zone
      const mins = Math.round((bufferDistance - 350) / rateOfSpread);
      return {
        status: { label: 'MONITOR', color: 'text-blue-600', bg: 'bg-blue-50', nextLabel: 'ALERT' },
        minutesToNext: Math.max(1, mins)
      };
    } 
    else if (bufferDistance > 150) {
      // Flood is close and approaching rapidly
      const mins = Math.round((bufferDistance - 150) / rateOfSpread);
      return {
        status: { label: 'ALERT', color: 'text-yellow-500', bg: 'bg-yellow-50', nextLabel: 'WARNING' },
        minutesToNext: Math.max(1, mins)
      };
    } 
    else {
      // Flood is immediately threatening within 150 meters
      const mins = Math.round(bufferDistance / rateOfSpread);
      return {
        status: { label: 'WARNING', color: 'text-orange-500', bg: 'bg-orange-50', nextLabel: 'DANGER' },
        minutesToNext: Math.max(1, mins)
      };
    }
  }, [distanceMeters, currentWaterReach, rateOfSpread, waterLevel]);

  // Dynamic color for map rendering properties
  const radarColor = useMemo(() => {
    switch (userMetrics.status.label) {
      case 'SAFE': return '#22c55e';
      case 'MONITOR': return '#2563eb';
      case 'ALERT': return '#eab308';
      case 'WARNING': return '#f97316';
      case 'DANGER': return '#dc2626';
      default: return '#22c55e';
    }
  }, [userMetrics]);

  // =====================================
  // MAP CLICK EVENTS
  // =====================================
  const LocationPin = () => {
    useMapEvents({
      click(e) {
        setUserPos([e.latlng.lat, e.latlng.lng]);
      }
    });
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      <div className="bg-teal-800 py-7 px-6 text-center text-white">
        <h1 className="text-4xl font-black mb-2 uppercase tracking-tight">
          PROXIMITY FLOOD ANALYSIS
        </h1>
        <p className="text-teal-100 font-medium max-w-xl mx-auto">
          Project Salba Live Environmental Monitoring System • Biñan, Laguna
        </p>
      </div>

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow -mt-3 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEAFLET MAP */}
          <div className="lg:w-[70%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[650px] flex flex-col relative">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                Live Spatial Operations Map
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                
              </span>
            </div>

            <div className="flex-grow relative bg-slate-200 z-0 min-h-[550px]">
              <MapContainer
                center={mapCenter}
                zoom={15}
                minZoom={13}
                maxBounds={MAP_MAX_BOUNDS}
                maxBoundsViscosity={1.0}
                style={{ height: '100%', width: '100%', position: 'absolute' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationPin />

                {/* DYNAMIC SENSOR RADAR PULSES */}
                {currentWaterReach > 0 && (
                  <>
                    <Circle
                      center={SENSOR_COORDINATES}
                      radius={currentWaterReach * 0.4}
                      pathOptions={{
                        color: radarColor,
                        fillColor: radarColor,
                        fillOpacity: 0.12,
                        className: 'radar-pulse-1'
                      }}
                    />
                    <Circle
                      center={SENSOR_COORDINATES}
                      radius={currentWaterReach * 0.7}
                      pathOptions={{
                        color: radarColor,
                        fillColor: radarColor,
                        fillOpacity: 0.08,
                        className: 'radar-pulse-2'
                      }}
                    />
                    <Circle
                      center={SENSOR_COORDINATES}
                      radius={currentWaterReach}
                      pathOptions={{
                        color: radarColor,
                        fillColor: radarColor,
                        fillOpacity: 0.04,
                        className: 'radar-pulse-3'
                      }}
                    />
                  </>
                )}

                {/* FIXED LOCATION PROTO-SENSOR */}
                <Marker icon={sensorIcon} position={SENSOR_COORDINATES}>
                  <Tooltip offset={[0, -40]} direction="top" permanent>
                    <span className="font-bold text-teal-700 text-[10px]">
                      SALBA SENSOR BASE
                    </span>
                  </Tooltip>
                </Marker>

                {/* REPOSITIONABLE USER MARKER */}
                {userPos && (
                  <>
                    <Polyline
                      positions={[SENSOR_COORDINATES, userPos]}
                      pathOptions={{
                        color: '#475569',
                        dashArray: '8, 8',
                        weight: 2
                      }}
                    />

                    <Marker
                      draggable={true}
                      icon={userIcon}
                      position={userPos}
                      eventHandlers={{
                        dragend: (e) => {
                          const newPos = e.target.getLatLng();
                          setUserPos([newPos.lat, newPos.lng]);
                        }
                      }}
                    >
                      <Tooltip offset={[0, -40]} direction="top" permanent>
                        <span className="font-bold text-red-600 text-[10px]">
                          USER LOCATION
                        </span>
                      </Tooltip>
                    </Marker>
                  </>
                )}
              </MapContainer>
            </div>
          </div>

          {/* DYNAMIC RELATIVE SIDEBAR */}
          <div className="lg:w-[30%] flex flex-col gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-300 flex flex-col justify-between h-full space-y-6">
              
              <h2 className="text-center text-xl font-black uppercase text-slate-700 tracking-wider border-b pb-2">
                FLOOD ANALYTICS
              </h2>

              {/* AREA STATUS - NOW CONTROLLED BY DISTANCE TO WATER FRONTLINE */}
              <div className={`p-5 rounded-xl border text-center transition-all ${userMetrics.status.bg} border-slate-200`}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Area Status
                </p>
                <p className={`text-4xl font-black tracking-tight uppercase ${userMetrics.status.color}`}>
                  {userMetrics.status.label}
                </p>
              </div>

              {/* DISTANCE INTERFACE */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Distance:
                </p>
                <p className="text-3xl font-black text-slate-800 leading-none mb-1">
                  {distanceMeters} meters
                </p>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Direct distance from structural sensor tracking point to user position.
                </p>
              </div>

              {/* FORECAST ENGINE - CALCULATES ONE STEP AHEAD BASED ON VELOCITY */}
              <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-950 shadow-inner">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Forecast Engine
                </p>
                <p className="text-4xl font-black text-amber-400 tracking-tight leading-none mb-2">
                  {userMetrics.minutesToNext === '--' ? '--' : userMetrics.minutesToNext === 0 ? '0 Minutes' : `${userMetrics.minutesToNext} Minutes`}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {userMetrics.status.label === 'DANGER' ? (
                    <span className="text-red-400 font-bold">Floodwaters have officially breached your current coordinates.</span>
                  ) : (
                    <>
                      Estimated time before oncoming wave spread hits the <span className={`font-black uppercase ${userMetrics.status.color}`}>{userMetrics.status.nextLabel}</span> threshold step.
                    </>
                  )}
                </p>
              </div>

              {/* CONTROLLER SLIDER SIMULATOR */}
              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                  <span>Water Depth Level:</span>
                  <span className="text-slate-800 font-black">{waterLevel.toFixed(1)} / 5.0 FT</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={waterLevel}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setWaterTrend(value > waterLevel ? "Rising ↑" : value < waterLevel ? "Falling ↓" : "Stable");
                    setWaterLevel(value);
                  }}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1 uppercase">
                  <span>Wave Speed: {rateOfSpread > 0 ? `${rateOfSpread} m/min` : '0 m/min'}</span>
                  <span>Trend: {waterTrend}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      <footer className="py-6 text-center text-gray-400 text-xs font-bold uppercase tracking-widest border-t border-gray-200">
        &copy; 2026 Project Salba - Biñan, Laguna
      </footer>
    </div>
  );
};

export default PredictiveMap;