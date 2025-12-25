import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';

// Leaflet Icon fix
import L, { type LeafletMouseEvent } from 'leaflet';
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ setCoords }: { setCoords: (c: { lat: number; lng: number }) => void }) => {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
};

const PredictionDashboard = () => {
    const [coords, setCoords] = useState({ lat: 34.05, lng: -118.24 }); // Default LA
    const [brightness, setBrightness] = useState<number>(330);
    const [confidence, setConfidence] = useState<'High' | 'Low'>('High');
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        setLoading(true);
        setError(null);
        setPrediction(null);

        try {
            const response = await fetch('http://localhost:8000/predict/wildfire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: coords.lat,
                    longitude: coords.lng,
                    brightness: Number(brightness),
                    confidence: confidence
                })
            });

            if (!response.ok) throw new Error('Prediction failed');

            const data = await response.json();
            setPrediction(data.prediction);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background-dark text-white font-display overflow-hidden">
            {/* Sidebar Controls - Technical Panel */}
            <div className="w-[400px] flex flex-col border-r border-white/10 bg-surface-dark relative z-20 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-surface-darker/50 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-10 rounded bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                            <span className="material-symbols-outlined text-2xl">timeline</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-widest text-white leading-none mb-1">Spread Model</h1>
                            <p className="text-primary/70 text-[10px] font-mono tracking-widest uppercase">Simulation Engine v1.0</p>
                        </div>
                    </div>
                </div>

                {/* Controls Container */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">

                    {/* Location Card */}
                    <div className="bg-surface-darker rounded border border-white/10 p-4 relative group hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-orange-brand animate-pulse"></span> Ignition Point
                            </h3>
                            <span className="material-symbols-outlined text-white/20 group-hover:text-primary transition-colors text-sm">location_on</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-surface-dark rounded border border-white/5 p-2">
                                <label className="block text-[10px] text-white/40 uppercase mb-1">Latitude</label>
                                <div className="font-mono text-sm text-primary">{coords.lat.toFixed(4)}</div>
                            </div>
                            <div className="bg-surface-dark rounded border border-white/5 p-2">
                                <label className="block text-[10px] text-white/40 uppercase mb-1">Longitude</label>
                                <div className="font-mono text-sm text-primary">{coords.lng.toFixed(4)}</div>
                            </div>
                        </div>
                        <p className="text-[10px] text-white/40 italic flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">touch_app</span>
                            Click map to update coordinates
                        </p>
                    </div>

                    {/* Parameters */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-white/70 uppercase tracking-wide">Brightness Intensity</label>
                                <span className="font-mono text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{brightness}K</span>
                            </div>
                            <input
                                type="range"
                                min="200"
                                max="500"
                                value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                                className="w-full h-2 bg-surface-darker rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-dim"
                            />
                            <div className="flex justify-between text-[10px] text-white/30 font-mono">
                                <span>200K (Low)</span>
                                <span>500K (Extreme)</span>
                            </div>
                            <p className="text-[10px] text-white/50 border-l-2 border-primary/30 pl-2 mt-1 py-1">
                                {brightness > 350 ? 'WARNING: Intense heat signature. Rapid spread (+3.0km).' : brightness > 320 ? 'CAUTION: Moderate heat. Standard spread (+1.5km).' : 'Low intensity thermal signature.'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/70 uppercase tracking-wide block">Detection Confidence</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['High', 'Low'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setConfidence(level as 'High' | 'Low')}
                                        className={`py-2 rounded border text-xs font-bold uppercase tracking-wider transition-all ${confidence === level
                                                ? 'bg-primary/20 border-primary text-primary shadow-glow'
                                                : 'bg-surface-darker border-white/5 text-white/40 hover:bg-white/5'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-background-dark font-black uppercase tracking-widest text-sm rounded shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_30px_rgba(19,236,91,0.5)] hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">network_intelligence</span>}
                            Run Simulation
                        </span>
                        {/* Hover shine effect */}
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                    </button>

                    {/* Tools */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                        <button
                            onClick={() => {
                                setBrightness(Math.floor(Math.random() * (400 - 300) + 300));
                                setConfidence(Math.random() > 0.5 ? 'High' : 'Low');
                            }}
                            className="py-2.5 bg-surface-darker hover:bg-white/5 text-white/60 text-[10px] font-bold uppercase tracking-wide rounded border border-white/5 flex items-center justify-center gap-2 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">casino</span>
                            Simulate Rnd
                        </button>
                        <a
                            href="https://firms.modaps.eosdis.nasa.gov/map/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue text-[10px] font-bold uppercase tracking-wide rounded border border-accent-blue/30 flex items-center justify-center gap-2 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">public</span>
                            NASAFIRMS
                        </a>
                    </div>
                </div>

                {/* Footer Status */}
                <div className="p-3 bg-background-dark/80 backdrop-blur border-t border-white/5 text-[10px] font-mono text-white/30 flex justify-between">
                    <span>STATUS: ONLINE</span>
                    <span>LATENCY: 45ms</span>
                </div>
            </div>

            {/* Results Overlay (Absolute) */}
            {prediction && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-6 left-[424px] z-[500] w-80 bg-surface-dark/95 backdrop-blur-xl border-l-4 border-primary rounded-r-xl border-y border-r border-white/10 shadow-2xl overflow-hidden"
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Analysis Report
                        </h3>
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">FINALIZED</span>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white/50 text-xs uppercase tracking-wide">Predicted Radius</span>
                            <span className="text-3xl font-black text-white font-mono">{prediction.radius_km}<span className="text-sm text-primary ml-1">km</span></span>
                        </div>

                        <div className="space-y-2 text-xs font-mono border-t border-white/10 pt-3">
                            <div className="flex justify-between text-white/70">
                                <span>Base Spread</span>
                                <span>{prediction.components.base} km</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Thermal Factor</span>
                                <span className={prediction.components.brightness_factor > 0 ? "text-red-400" : "text-white/30"}>+{prediction.components.brightness_factor} km</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Confidence</span>
                                <span className={prediction.components.confidence_factor >= 0 ? "text-red-400" : "text-primary"}>
                                    {prediction.components.confidence_factor > 0 ? '+' : ''}{prediction.components.confidence_factor} km
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Wind Var.</span>
                                <span className="text-accent-blue">{prediction.components.wind_factor > 0 ? '+' : ''}{prediction.components.wind_factor} km</span>
                            </div>
                        </div>
                    </div>
                    {/* Scanline decoration */}
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                </motion.div>
            )}

            {/* Error Toast */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-[2000] bg-red-900/90 border border-red-500/50 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined text-red-400">error</span>
                    <span className="font-mono text-sm">{error}</span>
                </motion.div>
            )}

            {/* Map Area */}
            <div className="flex-1 relative z-10 bg-black">
                <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={10}
                    style={{ height: "100%", width: "100%", background: "#051414" }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapController setCoords={setCoords} />

                    <Marker position={[coords.lat, coords.lng]}>
                        <Popup className="custom-popup">
                            <div className="text-center">
                                <p className="font-bold text-xs uppercase tracking-wide">Ignition Point</p>
                                <p className="text-[10px] opacity-70">Simulation Origin</p>
                            </div>
                        </Popup>
                    </Marker>

                    {prediction && (
                        <Circle
                            center={[coords.lat, coords.lng]}
                            radius={prediction.radius_km * 1000}
                            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2, weight: 1, dashArray: '5, 5' }}
                        >
                            <Popup>
                                <div className="text-center font-mono">
                                    <b className="text-orange-500">SPREAD ZONE</b><br />
                                    R: {prediction.radius_km} km
                                </div>
                            </Popup>
                        </Circle>
                    )}
                </MapContainer>

                {/* HUD Overlay - Factors */}
                <div className="absolute top-6 right-6 z-[1000] pointer-events-none">
                    <div className="bg-background-dark/80 backdrop-blur border border-white/10 p-4 rounded-xl shadow-2xl">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Model Parameters</p>
                        <ul className="space-y-2 text-[10px] font-mono text-white/70">
                            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-white/20"></span> Base Rate: 3.0km / 6h</li>
                            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-red-400"></span> Heat {'>'}350K: +3.0km</li>
                            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-orange-400"></span> Heat {'>'}320K: +1.5km</li>
                            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-accent-blue"></span> Wind Var: ±2.0km</li>
                        </ul>
                    </div>
                </div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-grid-pattern"></div>
            </div>
        </div>
    );
};

export default PredictionDashboard;
