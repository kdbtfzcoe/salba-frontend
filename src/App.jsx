import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Register from './Register';
import Navbar from './Navbar';
import Floodmonitoring from './Floodmonitoring'; 
import PredictiveMap from './PredictiveMap';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<Home />} />
        
        {/* Register Page */}
        <Route path="/register" element={<Register />} />

        {/* Flood Monitoring Page - DITO NAKACONNECT */}
        <Route path="/monitoring" element={<Floodmonitoring />} />
        
        <Route path="/map" element={<PredictiveMap />} />
        {/* (Optional) Predictive Map Page - Para handa na kung gagawin natin mamaya */}
        {/* <Route path="/map" element={<PredictiveMap />} /> */}
      </Routes>
    </Router>
  );
}

export default App;