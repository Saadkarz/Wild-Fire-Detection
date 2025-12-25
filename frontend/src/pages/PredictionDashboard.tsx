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
        <div className="flex h-screen bg-[#0f172a] text-white">
            {/* Sidebar Controls */}
            <div className="w-[400px] p-6 bg-[#1e293b] border-r border-slate-700 flex flex-col gap-6 overflow-y-auto">
                <div>
                    <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-orange-500">timeline</span>
                        Fire Spread Prediction
                    </h1>
                    <p className="text-slate-400 text-sm">Empirical Model v1.0</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                        <h3 className="text-sm font-bold text-slate-300 uppercase mb-3">Ignition Point</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <label className="block text-xs text-slate-500">Lat</label>
                                <div className="font-mono">{coords.lat.toFixed(4)}</div>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500">Lng</label>
                                <div className="font-mono">{coords.lng.toFixed(4)}</div>
                            </div>
                        </div>
                        <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">touch_app</span>
                            Click on map to set location
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="block">
                            <span className="text-sm font-bold text-slate-300">Brightness (Kelvin)</span>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="range"
                                    min="200"
                                    max="500"
                                    value={brightness}
                                    onChange={(e) => setBrightness(Number(e.target.value))}
                                    className="flex-1 accent-orange-500"
                                />
                                <span className="font-mono w-12 text-right">{brightness}K</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {brightness > 350 ? 'Intense Fire (+3.0km)' : brightness > 320 ? 'Moderate Fire (+1.5km)' : 'Low Intensity'}
                            </p>
                        </label>

                        <label className="block">
                            <span className="text-sm font-bold text-slate-300">Confidence</span>
                            <div className="flex gap-2 mt-1">
                                {['High', 'Low'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setConfidence(level as 'High' | 'Low')}
                                        className={`flex-1 py-2 rounded border ${confidence === level ? 'bg-orange-600 border-orange-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </label>
                    </div>

                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">network_intelligence</span>}
                        Run Prediction Model
                    </button>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700">
                        <button
                            onClick={() => {
                                setBrightness(Math.floor(Math.random() * (400 - 300) + 300));
                                setConfidence(Math.random() > 0.5 ? 'High' : 'Low');
                            }}
                            className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded border border-slate-600 flex items-center justify-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">casino</span>
                            Simulate Data
                        </button>
                        <a
                            href="https://firms.modaps.eosdis.nasa.gov/map/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 text-xs font-bold rounded border border-blue-800/50 flex items-center justify-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">public</span>
                            NASA FIRMS
                        </a>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/50 border border-red-500/50 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                {prediction && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800 p-4 rounded-lg border border-slate-700"
                    >
                        <h3 className="font-bold text-lg mb-4 text-orange-400">Prediction Results</h3>

                        <div className="flex items-center justify-between mb-6">
                            <span className="text-slate-400">Predicted Radius</span>
                            <span className="text-2xl font-bold">{prediction.radius_km} km</span>
                        </div>

                        <div className="space-y-2 text-sm border-t border-slate-700 pt-4">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Base Rate (6h)</span>
                                <span>{prediction.components.base} km</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Brightness Factor</span>
                                <span className={prediction.components.brightness_factor > 0 ? "text-red-400" : ""}>+{prediction.components.brightness_factor} km</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Confidence Factor</span>
                                <span className={prediction.components.confidence_factor >= 0 ? "text-red-400" : "text-green-400"}>
                                    {prediction.components.confidence_factor > 0 ? '+' : ''}{prediction.components.confidence_factor} km
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Wind Variation</span>
                                <span>{prediction.components.wind_factor > 0 ? '+' : ''}{prediction.components.wind_factor} km</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Map Area */}
            <div className="flex-1 relative">
                <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={10}
                    style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
                >
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapController setCoords={setCoords} />

                    <Marker position={[coords.lat, coords.lng]}>
                        <Popup>Ignition Point</Popup>
                    </Marker>

                    {prediction && (
                        <Circle
                            center={[coords.lat, coords.lng]}
                            radius={prediction.radius_km * 1000}
                            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.3 }}
                        >
                            <Popup>
                                <div>
                                    <b>Predicted Spread Zone</b><br />
                                    Radius: {prediction.radius_km} km
                                </div>
                            </Popup>
                        </Circle>
                    )}
                </MapContainer>

                <div className="absolute top-4 right-4 bg-slate-900/90 p-3 rounded border border-slate-700 z-[1000] text-xs text-slate-300">
                    <p className="font-bold mb-1">Spread Model Factors</p>
                    <ul className="space-y-1">
                        <li>• Base: 3.0km / 6h</li>
                        <li>• {'>'}350K: +3.0km</li>
                        <li>• {'>'}320K: +1.5km</li>
                        <li>• Wind: Random ±2.0km</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PredictionDashboard;
