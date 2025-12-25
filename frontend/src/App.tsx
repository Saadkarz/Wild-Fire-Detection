
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DetectionConsole from './pages/DetectionConsole';
import FireWeatherIndex from './pages/FireWeatherIndex';
import RealTimeDetection from './pages/RealTimeDetection';
import RealTimePrevention from './pages/RealTimePrevention';

import UploadDetection from './pages/UploadDetection';
import PredictionDashboard from './pages/PredictionDashboard';
import SatelliteMonitoring from './pages/SatelliteMonitoring';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/detection" element={<DetectionConsole />} />
        <Route path="/realtime" element={<RealTimeDetection />} />
        <Route path="/upload" element={<UploadDetection />} />
        <Route path="/prevention" element={<RealTimePrevention />} />
        <Route path="/prediction" element={<PredictionDashboard />} />
        <Route path="/fwi" element={<FireWeatherIndex />} />
        <Route path="/satellite" element={<SatelliteMonitoring />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
