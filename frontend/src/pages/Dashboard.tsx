
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = () => {
    const map = useMap();
    const [position, setPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            map.flyTo(e.latlng, map.getZoom());
        });
    }, [map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>You are here</Popup>
        </Marker>
    );
};

interface WildfireEvent {
    id: string;
    title: string;
    geometries: {
        date: string;
        coordinates: [number, number]; // Long, Lat
    }[];
}

const Dashboard = () => {
    const [logs, setLogs] = useState<WildfireEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWildfires = async () => {
            try {
                // Fetch wildfires (category 8)
                const response = await fetch('https://eonet.gsfc.nasa.gov/api/v2.1/events?categories=8&limit=20');
                const data = await response.json();
                if (data.events) {
                    setLogs(data.events);
                }
            } catch (error) {
                console.error("Failed to fetch wildfires:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWildfires();
        // Poll every 5 minutes
        const interval = setInterval(fetchWildfires, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased selection:bg-primary selection:text-black">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-primary/20 bg-background-dark/95 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-wider">AI SENTINEL</h2>
                        <p className="text-primary text-xs tracking-widest font-medium opacity-80">WILDFIRE DEFENSE GRID</p>
                    </div>
                </div>
                <div className="hidden md:flex flex-1 justify-center gap-8">
                    <nav className="flex items-center gap-1 rounded-full bg-surface-darker p-1 border border-white/5">
                        <Link className="px-5 py-2 rounded-full bg-primary/20 text-primary text-sm font-bold shadow-[0_0_10px_rgba(19,236,91,0.2)] transition-all" to="/dashboard">Dashboard</Link>
                        <Link className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" to="/fwi">Fire Weather</Link>
                        <Link className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" to="/realtime">Live Monitoring</Link>
                        <Link className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" to="/upload">Upload Analyze</Link>
                        <Link className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" to="/prediction">Predict Spread</Link>
                        <Link className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" to="/prevention">Prevention</Link>
                        <Link className="px-5 py-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-all" to="/satellite">Satellite</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-darker border border-primary/20">
                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-primary text-xs font-mono uppercase">System Online</span>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-1"></div>
                    <Link to="/" className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-white/5 text-white transition-colors relative" title="Back to Home">
                        <span className="material-symbols-outlined">home</span>
                    </Link>
                    <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-white/5 text-white transition-colors relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg hover:bg-white/5 text-white transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <button className="flex size-10 cursor-pointer items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white overflow-hidden">
                        <span className="material-symbols-outlined">person</span>
                    </button>
                </div>
            </header>

            {/* Main Content Layout */}
            <main className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 lg:p-8 gap-6">
                {/* Dashboard Controls & KPI Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-[140px]">
                    {/* Title Block */}
                    <div className="flex flex-col justify-center gap-1 lg:col-span-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">Sector <span className="text-primary">Alpha-9</span></h1>
                        <div className="flex items-center gap-2 text-white/60">
                            <span className="material-symbols-outlined text-sm">radar</span>
                            <span className="text-sm font-mono">Scanning Active // Lat: 34.05, Long: -118.24</span>
                        </div>
                    </div>
                    {/* KPI Cards */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Stat 1 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-primary/20 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">local_fire_department</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Active Threats</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">arrow_upward</span> +1
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">3</p>
                                <span className="text-red-400 text-sm font-medium animate-pulse">CRITICAL</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[25%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            </div>
                        </div>
                        {/* Stat 2 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-white/10 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">psychology</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">AI Confidence</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span> 0.2%
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">99.8%</p>
                                <span className="text-primary text-sm font-medium">OPTIMAL</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[99%] shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
                            </div>
                        </div>
                        {/* Stat 3 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-white/10 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">shutter_speed</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Avg Response</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">arrow_downward</span> -2s
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">14s</p>
                                <span className="text-primary text-sm font-medium">FAST</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full w-[65%] shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                            </div>
                        </div>
                        {/* Stat 4: Prevention */}
                        <Link to="/prevention" className="group relative overflow-hidden rounded-xl bg-surface-dark border border-white/10 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">security</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Prevention</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">shield</span> ACTIVE
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">GRID</p>
                                <span className="text-primary text-sm font-medium tracking-tighter">NASA LIVE</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[100%] shadow-[0_0_10px_rgba(19,236,91,0.5)] animate-pulse"></div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Main Content: Map & Logs */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-0">
                    {/* Center Map Visualization */}
                    <div className="lg:col-span-3 relative rounded-xl border border-white/10 bg-surface-darker overflow-hidden flex flex-col">
                        {/* Map Controls Toolbar */}
                        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-start justify-between pointer-events-none">
                            {/* Filters */}
                            <div className="flex flex-wrap gap-2 pointer-events-auto bg-surface-darker/80 backdrop-blur rounded-lg p-1.5 border border-white/10">
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-primary text-surface-darker font-bold text-xs uppercase tracking-wide transition hover:brightness-110">
                                    <span className="material-symbols-outlined text-base">layers</span> All Layers
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-red-400">thermostat</span> Thermal
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-blue-400">air</span> Wind
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-yellow-400">landscape</span> Topo
                                </button>
                            </div>
                            {/* Live Status Tag */}
                            <div className="bg-red-500/20 text-red-400 border border-red-500/50 backdrop-blur px-3 py-1 rounded flex items-center gap-2 animate-pulse-slow">
                                <div className="size-2 bg-red-500 rounded-full animate-ping"></div>
                                <span className="text-xs font-bold uppercase tracking-wider">Live Feed</span>
                            </div>
                        </div>
                        {/* Map Image Container */}
                        {/* Map Image Container replaced with Dynamic Map */}
                        <div className="flex-1 relative bg-surface-darker w-full h-full z-0">
                            <MapContainer center={[36.7783, -119.4179]} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={true}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />
                                <LocationMarker />

                                {/* Hotspot 1: Heat Spike */}
                                <Marker position={[36.85, -119.5]}>
                                    <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-md animate-pulse pointer-events-none"></div>
                                    <Popup className="custom-popup">
                                        <div className="bg-surface-darker border border-red-500/50 p-2 rounded text-xs">
                                            <p className="text-red-400 font-bold mb-1">ALERT: HEAT SPIKE</p>
                                            <p className="text-white/80">Temp: 840°C</p>
                                            <p className="text-white/80">Confidence: 98%</p>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Circle center={[36.85, -119.5]} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }} radius={500} />

                                {/* Hotspot 2: Minor */}
                                <Marker position={[36.70, -119.35]}>
                                    <Popup>
                                        <div className="text-xs text-orange-400">Potential hotspot</div>
                                    </Popup>
                                </Marker>
                                <Circle center={[36.70, -119.35]} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.4 }} radius={300} />
                            </MapContainer>

                            {/* Grid Overlay - pointer events none to allow map interaction */}
                            <div className="absolute inset-0 z-10 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#13ec5b 1px, transparent 1px), linear-gradient(90deg, #13ec5b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                            </div>

                            {/* Central Radar Scan Effect - pointer events none */}
                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                <div className="w-[500px] h-[500px] border border-primary/10 rounded-full flex items-center justify-center">
                                    <div className="w-[300px] h-[300px] border border-primary/20 rounded-full flex items-center justify-center">
                                        <div className="w-[100px] h-[100px] border border-primary/30 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Bottom Bar on Map */}
                        <div className="h-12 bg-surface-dark border-t border-white/10 flex items-center justify-between px-4 text-xs font-mono text-white/50">
                            <div className="flex gap-4">
                                <span>SCALE: 1:5000</span>
                                <span>SOURCE: SAT-V2, DRONE-SWARM</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary"></span>
                                <span className="text-primary">SYNCED</span>
                            </div>
                        </div>
                    </div>
                    {/* Right Column: System Logs / Data Stream */}
                    <div className="lg:col-span-1 bg-surface-dark rounded-xl border border-white/10 flex flex-col overflow-hidden max-h-[600px] lg:max-h-none">
                        <div className="p-4 border-b border-white/5 bg-surface-darker flex justify-between items-center">
                            <h3 className="text-white font-bold tracking-wide text-sm uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">public</span> Global Fire Feed
                            </h3>
                            <div className="flex items-center gap-2">
                                {loading && <span className="size-2 rounded-full bg-primary animate-ping"></span>}
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50 border border-white/5">NASA EONET LIVE</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 font-mono text-xs">
                            {/* Dynamic Logs from API */}
                            {logs.map((log) => (
                                <div key={log.id} className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group border-b border-white/5 last:border-0">
                                    <div className="flex justify-between text-white/40 mb-1">
                                        <span>{new Date(log.geometries[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>#{log.id.split('_')[1]}</span>
                                    </div>
                                    <p className="text-white/90 leading-relaxed">
                                        <span className="text-red-400 font-bold">DETECTED:</span> {log.title}
                                        {/* Calculate simple relative time msg */}
                                    </p>
                                    <div className="flex justify-between mt-1 opacity-50 text-[10px]">
                                        <span>Lat: {log.geometries[0].coordinates[1].toFixed(2)}</span>
                                        <span>Long: {log.geometries[0].coordinates[0].toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Fallback/Static log if API empty or loading errors, or just to keep list populated */}
                            {!loading && logs.length === 0 && (
                                <div className="p-4 text-center text-white/30 italic">
                                    No recent major wildfire events returned by NASA EONET.
                                </div>
                            )}

                            {/* Keeping a few static system logs at the bottom for flavor/simulation context if desired, or can remove them entirely. 
                                Let's keep one "System nominal" log at the bottom. */}
                            <div className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group opacity-50">
                                <div className="flex justify-between text-white/40 mb-1">
                                    <span>SYSTEM</span>
                                    <span>#LOC-001</span>
                                </div>
                                <p className="text-white/90 leading-relaxed">
                                    Local Scanning Grid Active.
                                </p>
                            </div>
                        </div>
                        {/* Input Area */}
                        <div className="p-3 bg-surface-darker border-t border-white/5">
                            <div className="flex items-center bg-surface-dark rounded border border-white/10 px-3 py-2">
                                <span className="material-symbols-outlined text-white/30 text-sm mr-2">chevron_right</span>
                                <input className="bg-transparent border-none p-0 text-xs text-white placeholder-white/20 w-full focus:ring-0 font-mono" placeholder="Filter feed..." type="text" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
