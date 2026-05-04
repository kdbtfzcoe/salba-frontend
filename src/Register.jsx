import React, { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import heroImage from './assets/hero-bg.webp'; 
import logoImage from './assets/salba-logo.png';

const fetchElevation = async (lat, lng) => {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lng}`);
    const data = await response.json();
    return data.elevation[0] || 0;
  } catch (err) { 
    return 10.2; 
  }
};

const customMarker = new L.divIcon({
  className: 'custom-icon',
  html: `<svg class="w-10 h-10 text-red-600 drop-shadow-xl -ml-5 -mt-10" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const DraggableLocationMarker = ({ position, setPosition, mapCenter, setFormData, setElevation }) => {
  const map = useMap();
  const markerRef = useRef(null);
  
  useEffect(() => { if (mapCenter) map.flyTo(mapCenter, 17); }, [mapCenter, map]);
  
  const eventHandlers = useMemo(() => ({
    async dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const lat = marker.getLatLng().lat;
        const lng = marker.getLatLng().lng;
        setPosition([lat, lng]);

        const elev = await fetchElevation(lat, lng);
        setElevation(elev);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await res.json();
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          }
        } catch (err) {
          console.error("Geocoding error:", err);
        }
      }
    },
  }), [setPosition, setFormData, setElevation]); 

  return (
    <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} icon={customMarker}>
      <Popup>Drag to pinpoint your exact house location</Popup>
    </Marker>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', address: '' });
  const [pinPosition, setPinPosition] = useState([14.3384, 121.0792]);
  const [mapCenter, setMapCenter] = useState([14.3384, 121.0792]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const navigate = useNavigate();
  const [elevation, setElevation] = useState(0);
  
  const mapRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => { if (mapRef.current && !mapRef.current.contains(e.target)) setShowMap(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'phoneNumber' ? value.replace(/[^0-9]/g, '') : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMapSearch = async (e) => {
    if (e) e.preventDefault();
    if (!formData.address.trim()) return;
    setIsSearchingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.address + ', Biñan City, Laguna')}&limit=1`);
      const data = await res.json();
      if (data?.[0]) {
        const pos = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setMapCenter(pos); 
        setPinPosition(pos);
        setFormData(prev => ({ ...prev, address: data[0].display_name }));

        const elev = await fetchElevation(pos[0], pos[1]);
        setElevation(elev);
      }
    } catch (err) { console.error(err); } finally { setIsSearchingMap(false); }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim() || formData.phoneNumber.length !== 10 || !formData.address.trim() || !consentChecked) {
      newErrors.global = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phoneNumber: `+63${formData.phoneNumber}`,
          address: formData.address,
          lat: pinPosition[0], 
          lng: pinPosition[1], 
          elevation: elevation, 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Registration successful!');
        setFormData({ fullName: '', phoneNumber: '', address: '' });

        setTimeout(() => {
          navigate('/'); 
          window.scrollTo(0, 0); 
        }, 1000);

      } else {
        setMessage(data.error || 'Registration failed.');
      }
    } catch (error) {
      setMessage('Server offline. Please make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* NAVBAR */}
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
          {/* Default gray, turns teal on hover */}
          <a href="/" className="text-gray-500 hover:text-teal-700 transition-colors">Home</a>
          <Link to="/monitoring" className="text-gray-500 hover:text-teal-700 transition-colors">
            Flood Monitoring
          </Link>
          <Link to="/map" className="text-gray-500 hover:text-teal-700 transition-colors">Predictive Map</Link>
        </div>
      </nav>

      {/* 2. THE REST OF THE PAGE TAKES THE REMAINING SPACE */}
      <div className="flex-grow flex w-full bg-white font-sans text-gray-800">
        
      {/* Left Panel */}
        <div className="hidden lg:flex w-1/2 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
          
          <div 
            className="absolute inset-0 z-0 bg-cover"
            style={{ 
              backgroundImage: `url(${heroImage})`,
              backgroundPosition: '25% center' 
            }} 
          ></div>

          {/* Matched the richer gradient from Home.jsx */}
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-teal-900/95 via-teal-800/90 to-teal-900/95"></div>

          <div className="relative z-20 text-center">
            <h1 className="text-7xl font-black mb-2 tracking-tighter drop-shadow-md">PROJECT SALBA</h1>
            <p className="text-teal-200 tracking-widest uppercase font-bold drop-shadow-sm">Flood Monitoring & Early Warning System</p>
          </div>

        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-10"> 
              <h2 className="text-5xl font-black text-slate-900 leading-tight mb-4">
                Register
              </h2>
              <p className="text-gray-500 font-medium text-lg">
                Join the flood alert community.
              </p>
            </div>

            {errors.global && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl shadow-sm">
                 Please fill up all boxes correctly.
              </div>
            )}

            {message && (
              <div className={`mb-6 p-4 border-2 rounded-2xl font-bold text-center ${message === 'Registration successful!' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {message}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  {/* Unified border and padding (py-4) */}
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-teal-500 outline-none transition-all shadow-sm" placeholder="Juan Dela Cruz"/>
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mobile Number <span className="text-red-500">*</span></label>
                {/* Matched background and transition logic to other inputs */}
                <div className="flex rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 focus-within:bg-white focus-within:border-teal-500 transition-all shadow-sm">
                  <span className="inline-flex items-center px-4 bg-gray-100 text-gray-600 font-bold text-sm border-r border-gray-200">+63</span>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} maxLength="10" className="w-full px-4 py-4 bg-transparent outline-none" placeholder="9123456789"/>
                </div>
              </div>

              {/* Address / Map Box */}
              <div className="relative" ref={mapRef}>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Home Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  {/* Unified border and padding (py-4) */}
                  <input 
                    type="text" name="address" value={formData.address} onChange={handleInputChange} onFocus={() => setShowMap(true)}
                    className="w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:border-teal-500 outline-none transition-all shadow-sm" placeholder="Type location or tap to pin map..."
                  />
                </div>

                {/* LATITUDE / LONGITUDE HUD DISPLAY */}
                <div className="flex justify-between items-center px-2 mt-1.5 opacity-70">
                  <span className="text-[10px] font-black tracking-widest text-teal-700 uppercase">GPS Coordinates</span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {pinPosition[0].toFixed(6)}, {pinPosition[1].toFixed(6)}
                  </span>
                </div>
                
                {showMap && (
                  <div className="absolute z-50 left-0 right-0 mt-2 p-4 bg-white border-2 border-teal-500 rounded-3xl shadow-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Pin Location</span>
                      
                      <div className="flex space-x-2">
                        <button type="button" onClick={handleMapSearch} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all transform active:scale-95">
                          {isSearchingMap ? 'Searching...' : 'Search'}
                        </button>
                        <button type="button" onClick={() => setShowMap(false)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all transform active:scale-95">
                          Done
                        </button>
                      </div>
                    </div>
                    
                    <div className="w-full text-center bg-gray-50 border border-gray-200 rounded-t-lg py-1">
                      <span className="text-xs font-mono font-bold text-teal-800">
                         LAT: {pinPosition[0].toFixed(5)} | LNG: {pinPosition[1].toFixed(5)}
                      </span>
                    </div>

                    <div className="w-full h-[200px] rounded-b-xl overflow-hidden border-b border-l border-r border-gray-200">
                      <MapContainer center={mapCenter} zoom={16} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <DraggableLocationMarker position={pinPosition} setPosition={setPinPosition} mapCenter={mapCenter} setFormData={setFormData} setElevation={setElevation}/>
                      </MapContainer>
                    </div>
                  </div>
                )}
              </div>

              {/* Consent */}
              <div className="flex items-center pt-2">
                <input id="consent" type="checkbox" className="w-5 h-5 rounded-lg text-teal-600 border-2 border-gray-300 transition-all cursor-pointer" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)}/>
                <label htmlFor="consent" className="ml-3 text-sm font-bold text-gray-600 cursor-pointer">I agree to receive SMS alerts <span className="text-red-500">*</span></label>
              </div>

              {/* Submit Button: Added mt-6 for better spacing and hover states */}
              <button type="submit" disabled={loading} className="w-full py-4 bg-teal-700 hover:bg-teal-800 hover:shadow-lg hover:-translate-y-0.5 text-white font-black rounded-2xl shadow-md transition-all duration-300 active:scale-[0.98] text-lg mt-6">
                {loading ? 'Registering...' : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;