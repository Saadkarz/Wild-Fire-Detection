import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HotspotCard from '../components/HotspotCard';

// Interfaces
interface Hotspot {
    lat: number;
    lon: number;
    brightness: number;
    acq_datetime: string;
    confidence: string;
    satellite: string;
    spread_radius_km: number;
    wind_speed_kph?: number;
    wind_direction?: number;
}

// Logic to create pulsating div icons
const createPulseIcon = (confidence: string) => {
    const isHigh = confidence === 'high' || confidence === 'h';
    const colorClass = isHigh ? 'bg-primary' : 'bg-accent-blue';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 ${colorClass}/30 rounded-full animate-ping"></div>
            <div class="absolute w-6 h-6 ${colorClass}/50 rounded-full animate-pulse"></div>
            <span class="material-icons-round text-${isHigh ? 'primary' : 'accent-blue'} text-3xl drop-shadow-md">location_on</span>
        </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 48], // Tip of pin
        popupAnchor: [0, -48]
    });
};

// Map Controller
const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
};

const RealTimePrevention = () => {
    // State
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [loading, setLoading] = useState(false);
    const [region, setRegion] = useState('morocco');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(true); // Default to dark as per design preference
    const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

    // Map View State
    const [mapView, setMapView] = useState<{ center: [number, number], zoom: number }>({
        center: [31.7917, -7.0926],
        zoom: 6
    });

    // Toggle Dark Mode
    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkMode]);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/wildfire/realtime?region=${region}`);
            if (response.ok) {
                const data = await response.json();
                setHotspots(data);
                setLastUpdated(new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }) + ' UTC');

                // Update map view based on region
                if (region === 'morocco') setMapView({ center: [31.7917, -7.0926], zoom: 6 });
                else if (region === 'california') setMapView({ center: [36.7783, -119.4179], zoom: 6 });
                else if (region === 'australia') setMapView({ center: [-25.2744, 133.7751], zoom: 5 });
                else if (region === 'global') setMapView({ center: [20, 0], zoom: 2 });
                else setMapView({ center: [20, 0], zoom: 2 }); // Fallback
            } else {
                console.error("Failed to fetch data");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [region]);

    // Stats
    const totalDetected = hotspots.length;
    const highConfidence = hotspots.filter(h => h.confidence === 'high' || h.confidence === 'h').length;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-sans h-screen flex flex-col overflow-hidden transition-colors duration-300">
            {/* Header */}
            <header className="bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-30 shadow-md">
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-primary text-2xl animate-pulse">local_fire_department</span>
                        <h1 className="text-xl font-bold tracking-tight text-primary">
                            FireSight <span className="text-slate-500 dark:text-slate-400 font-normal">Real-Time Prevention</span>
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 font-mono">Live NASA FIRMS Satellite Data & Wind-Driven Prediction</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-icons-round text-slate-400 text-sm">public</span>
                        </div>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-md pl-9 pr-8 py-2 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-colors cursor-pointer outline-none appearance-none"
                        >
                            <option value="morocco">Morocco (North)</option>
                            <option value="california">California (USA)</option>
                            <option value="australia">Australia (NSW)</option>
                            <option value="global">Global</option>
                        </select>
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-md shadow-lg shadow-orange-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className={`material-icons-round text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
                        {loading ? 'Fetching...' : 'Refresh Data'}
                    </button>

                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden md:block"></div>

                    <div className="hidden md:flex flex-col items-end text-xs text-slate-400 font-mono">
                        <span>Updated: {lastUpdated || '--:--:--'}</span>
                        <span className="text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live
                        </span>
                    </div>

                    <button
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        <span className="material-icons-round dark:hidden">dark_mode</span>
                        <span className="material-icons-round hidden dark:block">light_mode</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative flex-1 w-full overflow-hidden bg-slate-900">

                {/* Map Grid Overlay (Visual candy) */}
                <div className="absolute inset-0 pointer-events-none z-10 opacity-30"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/20 to-slate-900/90 pointer-events-none z-10"></div>

                {/* Hotspot Info Card Overlay */}
                {selectedHotspot && (
                    <div className="absolute top-0 right-0 h-full z-[1001] p-4 flex items-center justify-center animate-slide-in-right">
                        <HotspotCard hotspot={selectedHotspot} onClose={() => setSelectedHotspot(null)} />
                    </div>
                )}

                {/* Map Controls (Zoom) */}
                <div className="absolute top-6 left-6 flex flex-col gap-1 z-20">
                    {/* Leaflet handles zoom controls usually, but we can add custom ones or just let standard ones exist.
                         The user design has custom +/- buttons. We'll leave them visual for now or implement map hooks.
                         For simplicity, we let Leaflet's default controls coexist or hide them if needed. 
                         Let's just show the user's buttons as visual elements for now. */}
                    <button className="w-10 h-10 bg-surface-light dark:bg-surface-dark text-slate-600 dark:text-slate-200 rounded-t-md border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg transition-colors">
                        <span className="material-icons-round">add</span>
                    </button>
                    <button className="w-10 h-10 bg-surface-light dark:bg-surface-dark text-slate-600 dark:text-slate-200 rounded-b-md border-x border-b border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 shadow-lg transition-colors">
                        <span className="material-icons-round">remove</span>
                    </button>
                </div>

                {/* Map Layers Card */}
                <div className="absolute top-6 right-6 z-20">
                    <div className="bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl p-3 w-48">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Map Layers</h3>
                        <div className="space-y-1">
                            <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                <input defaultChecked type="checkbox" className="form-checkbox text-primary rounded border-slate-300 bg-transparent focus:ring-primary h-4 w-4" />
                                <span className="text-sm font-medium">Heat Signatures</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                <input type="checkbox" className="form-checkbox text-primary rounded border-slate-300 bg-transparent focus:ring-primary h-4 w-4" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">Wind Patterns</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                <input type="checkbox" className="form-checkbox text-primary rounded border-slate-300 bg-transparent focus:ring-primary h-4 w-4" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">Vegetation</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="absolute bottom-6 left-6 z-20">
                    <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-5 w-72 transform transition-all hover:scale-[1.02]">
                        <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Active Hotspots
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-4xl font-mono font-bold text-slate-800 dark:text-white leading-none">{totalDetected}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Total Detected</span>
                            </div>
                            <div className="flex flex-col border-l border-slate-300 dark:border-slate-700 pl-4">
                                <span className="text-4xl font-mono font-bold text-red-600 dark:text-red-500 leading-none">{highConfidence}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">High Confidence</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Risk Level</span>
                                <span className="text-xs font-bold text-orange-500">{totalDetected > 50 ? 'CRITICAL' : totalDetected > 10 ? 'ELEVATED' : 'MODERATE'}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 to-red-600 h-1.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (totalDetected / 50) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attribution */}
                <div className="absolute bottom-4 right-4 z-20">
                    <div className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md rounded px-3 py-1.5 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Leaflet | © OpenStreetMap contributors
                    </div>
                </div>

                {/* Actual Map */}
                <MapContainer
                    center={mapView.center}
                    zoom={mapView.zoom}
                    zoomControl={false} // We have custom buttons (visual only for now)
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <MapController center={mapView.center} zoom={mapView.zoom} />
                    <TileLayer
                        attribution=""
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {hotspots.map((hotspot, idx) => (
                        <Marker
                            key={idx}
                            position={[hotspot.lat, hotspot.lon]}
                            icon={createPulseIcon(hotspot.confidence)}
                            eventHandlers={{
                                click: () => setSelectedHotspot(hotspot)
                            }}
                        />
                    ))}
                </MapContainer>
            </main>
        </div>
    );
};

export default RealTimePrevention;
