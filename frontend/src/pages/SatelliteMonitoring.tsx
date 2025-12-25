import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Zone {
    name: string;
    bbox: [number, number, number, number];
}

interface ScanResult {
    zone: string;
    prediction: string;
    confidence: number;
    is_fire: boolean;
    coordinates: [number, number];
    timestamp: string;
    image_base64?: string;
}

interface MonitoringStatus {
    is_running: boolean;
    interval_hours: number;
    detection_threshold: number;
    services: {
        sentinel_hub: boolean;
        email: boolean;
        model_loaded: boolean;
        scheduler: boolean;
    };
    zones: number;
    recent_scans: number;
    next_scan?: string;
    last_scan?: {
        timestamp: string;
        results: ScanResult[];
        fires_detected: number;
    };
}

const API_BASE = 'http://localhost:8000';

const SatelliteMonitoring = () => {
    const [status, setStatus] = useState<MonitoringStatus | null>(null);
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [intervalHours, setIntervalHours] = useState(6);
    const [error, setError] = useState<string | null>(null);
    // Zone image modal state
    const [selectedZone, setSelectedZone] = useState<string | null>(null);
    const [zoneImage, setZoneImage] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        fetchStatus();
        fetchZones();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/satellite/status`);
            const data = await res.json();
            setStatus(data);
            if (data.last_scan?.results) {
                setScanResults(data.last_scan.results);
            }
        } catch {
            setError('Failed to fetch status');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchZones = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/satellite/zones`);
            const data = await res.json();
            setZones(data.zones || []);
        } catch {
            console.error('Failed to fetch zones');
        }
    };

    const handleScan = async () => {
        setIsScanning(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/satellite/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else if (data.results) {
                setScanResults(data.results);
            }

            fetchStatus();
        } catch {
            setError('Scan failed');
        } finally {
            setIsScanning(false);
        }
    };

    const handleStartMonitoring = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/satellite/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interval_hours: intervalHours })
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else {
                fetchStatus();
            }
        } catch {
            setError('Failed to start monitoring');
        }
    };

    const handleStopMonitoring = async () => {
        try {
            await fetch(`${API_BASE}/api/satellite/stop`, { method: 'POST' });
            fetchStatus();
        } catch {
            setError('Failed to stop monitoring');
        }
    };

    const handleViewZoneImage = async (zoneName: string) => {
        setSelectedZone(zoneName);
        setZoneImage(null);
        setImageLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/satellite/image/${zoneName}`);
            const data = await res.json();

            if (data.image_base64) {
                setZoneImage(data.image_base64);
            }
        } catch {
            console.error('Failed to fetch zone image');
        } finally {
            setImageLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedZone(null);
        setZoneImage(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="text-primary text-xl animate-pulse font-display">INITIALIZING SYSTEM...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark text-slate-100 font-body relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 satellite-bg opacity-20 mix-blend-screen"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-30" style={{ backgroundSize: '40px 40px' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-background-dark"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-transparent to-background-dark"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 w-full border-b border-white/10 glass-panel">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-4xl animate-pulse">satellite_alt</span>
                            <div className="flex flex-col">
                                <span className="font-display font-bold text-lg tracking-wider text-white uppercase">Satellite Monitoring</span>
                                <span className="text-xs text-primary font-mono tracking-widest">REGION: MOROCCO</span>
                            </div>
                        </div>
                        <div className="hidden md:flex items-baseline space-x-8">
                            <Link to="/dashboard" className="text-slate-400 hover:text-primary transition-colors px-3 py-2 text-sm font-display tracking-wide">DASHBOARD</Link>
                            <Link to="/prevention" className="text-slate-400 hover:text-primary transition-colors px-3 py-2 text-sm font-display tracking-wide">PREVENTION</Link>
                            <Link to="/realtime" className="text-slate-400 hover:text-primary transition-colors px-3 py-2 text-sm font-display tracking-wide">REALTIME</Link>
                            <span className="text-primary border-b-2 border-primary px-3 py-2 text-sm font-display tracking-wide">SATELLITE</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Error Alert */}
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-red-400">error</span>
                        <span className="text-red-300">{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                )}

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Monitoring Status */}
                    <div className="group relative bg-slate-900/60 rounded-xl p-6 shadow-sm border border-white/10 glass-panel overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="material-symbols-outlined text-6xl text-white">radar</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${status?.is_running ? 'bg-primary animate-pulse' : 'bg-slate-400'}`}></div>
                            <h3 className="text-xs font-display uppercase tracking-widest text-slate-400">Monitoring Status</h3>
                        </div>
                        <div className={`text-3xl font-display font-bold tracking-wider ${status?.is_running ? 'text-primary' : 'text-slate-500'}`}>
                            {status?.is_running ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                        <div className="mt-4 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${status?.is_running ? 'bg-primary w-full' : 'bg-slate-400 w-0'}`}></div>
                        </div>
                    </div>

                    {/* Zones */}
                    <div className="group relative bg-slate-900/60 rounded-xl p-6 shadow-sm border border-cyan-500/30 glass-panel">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-cyan-500 text-sm">map</span>
                            <h3 className="text-xs font-display uppercase tracking-widest text-cyan-400">Zones</h3>
                        </div>
                        <div className="text-4xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{status?.zones || 0}</div>
                    </div>

                    {/* Interval */}
                    <div className="group relative bg-slate-900/60 rounded-xl p-6 shadow-sm border border-amber-500/30 glass-panel">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-amber-500 text-sm">timer</span>
                            <h3 className="text-xs font-display uppercase tracking-widest text-amber-400">Interval</h3>
                        </div>
                        <div className="text-4xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{status?.interval_hours || 6}h</div>
                    </div>

                    {/* Total Scans */}
                    <div className="group relative bg-slate-900/60 rounded-xl p-6 shadow-sm border border-purple-500/30 glass-panel">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-purple-500 text-sm">history</span>
                            <h3 className="text-xs font-display uppercase tracking-widest text-purple-400">Total Scans</h3>
                        </div>
                        <div className="text-4xl font-display font-bold text-white drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]">{status?.recent_scans || 0}</div>
                    </div>
                </div>

                {/* Services Status */}
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 glass-panel">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <span className="material-symbols-outlined text-primary animate-spin-slow">settings_suggest</span>
                        <h2 className="text-lg font-display font-bold text-white">Services Status</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { key: 'sentinel_hub', label: 'Sentinel Hub', available: status?.services?.sentinel_hub },
                            { key: 'email', label: 'Email Service', available: status?.services?.email },
                            { key: 'model_loaded', label: 'AI Model', available: status?.services?.model_loaded },
                            { key: 'scheduler', label: 'Job Scheduler', available: status?.services?.scheduler },
                        ].map((service) => (
                            <div key={service.key} className="flex items-center gap-3 group">
                                <div className="relative flex h-3 w-3">
                                    {service.available && (
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    )}
                                    <span className={`relative inline-flex rounded-full h-3 w-3 ${service.available ? 'bg-primary' : 'bg-red-500'}`}></span>
                                </div>
                                <span className="text-sm font-medium text-slate-300 group-hover:text-primary transition-colors">{service.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Controls */}
                <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 glass-panel tech-border">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-slate-300">tune</span>
                        <h2 className="text-lg font-display font-bold text-white">System Controls</h2>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative w-full md:w-auto">
                            <label className="block text-xs font-mono text-slate-400 mb-1 ml-1">INTERVAL (HOURS)</label>
                            <input
                                type="number"
                                min="1"
                                max="24"
                                value={intervalHours}
                                onChange={(e) => setIntervalHours(Number(e.target.value))}
                                className="w-full md:w-32 bg-slate-900 border border-slate-600 rounded-lg py-2.5 px-4 text-white font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition shadow-inner"
                            />
                        </div>
                        <div className="flex-grow hidden md:block"></div>
                        <div className="flex w-full md:w-auto gap-3">
                            <button
                                onClick={handleStartMonitoring}
                                disabled={status?.is_running}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-emerald-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-6 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all transform hover:-translate-y-0.5 font-display tracking-wide"
                            >
                                <span className="material-symbols-outlined">play_arrow</span>
                                START
                            </button>
                            <button
                                onClick={handleStopMonitoring}
                                disabled={!status?.is_running}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-700 text-slate-300 hover:bg-red-500 hover:text-white disabled:bg-slate-700 disabled:cursor-not-allowed disabled:hover:bg-slate-700 transition-colors py-3 px-6 rounded-lg font-display font-medium border border-slate-600"
                            >
                                <span className="material-symbols-outlined">stop</span>
                                STOP
                            </button>
                            <button
                                onClick={handleScan}
                                disabled={isScanning}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white py-3 px-6 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all font-display font-medium"
                            >
                                <span className={`material-symbols-outlined ${isScanning ? 'animate-spin' : ''}`}>
                                    {isScanning ? 'sync' : 'fingerprint'}
                                </span>
                                {isScanning ? 'SCANNING...' : 'MANUAL'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Active Zones with Scan Line */}
                <div className="relative rounded-2xl p-1 overflow-hidden">
                    <div className="scan-line"></div>
                    <div className="bg-slate-900/60 border border-white/10 rounded-xl p-6 glass-panel">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-amber-500">fmd_good</span>
                                <h2 className="text-lg font-display font-bold text-white">
                                    Active Zones <span className="text-xs font-mono font-normal text-slate-500 ml-2">// REAL-TIME DATA</span>
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {zones.map((zone) => {
                                const result = scanResults.find(r => r.zone === zone.name);
                                const isFire = result?.is_fire;
                                const confidence = result?.confidence ? (result.confidence * 100).toFixed(1) : '0.0';

                                return (
                                    <button
                                        key={zone.name}
                                        onClick={() => handleViewZoneImage(zone.name)}
                                        className={`relative rounded-lg p-5 border transition-all group overflow-hidden cursor-pointer text-left ${isFire
                                            ? 'bg-red-900/10 border-red-500/50 hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:scale-[1.02]'
                                            : 'bg-slate-800/40 border-emerald-500/20 hover:border-emerald-500/60 hover:scale-[1.02]'
                                            }`}
                                    >
                                        {/* Background decoration */}
                                        <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${isFire ? 'bg-red-500/10 animate-pulse' : 'bg-emerald-500/5'} hexagon-clip z-0`}></div>
                                        {isFire && (
                                            <div className="absolute inset-0 z-0 opacity-5 fire-pattern"></div>
                                        )}

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <h3 className={`text-lg font-display font-bold ${isFire ? 'text-red-100' : 'text-emerald-100'}`}>
                                                {zone.name}
                                            </h3>
                                            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-mono border ${isFire
                                                ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                }`}>
                                                {isFire && <span className="material-symbols-outlined text-[10px]">warning</span>}
                                                {result?.prediction || 'PENDING'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 relative z-10">
                                            <div className={`text-xs font-mono ${isFire ? 'text-red-300' : 'text-slate-400'}`}>CONFIDENCE</div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-2xl font-bold text-white">{confidence}%</span>
                                                <span className={`mb-1 block h-2 w-2 rounded-full ${isFire ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
                                            </div>
                                            <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${isFire ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${confidence}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* Zone Image Modal */}
            {selectedZone && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
                    onClick={closeModal}
                >
                    <div
                        className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-4xl w-full p-6 glass-panel relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">satellite_alt</span>
                                <h3 className="text-xl font-display font-bold text-white">
                                    {selectedZone} <span className="text-slate-500 text-sm font-normal">// SATELLITE VIEW</span>
                                </h3>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Image Content */}
                        {imageLoading ? (
                            <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl animate-spin mb-3 text-primary">sync</span>
                                <span className="font-mono text-sm">FETCHING SATELLITE DATA...</span>
                            </div>
                        ) : zoneImage ? (
                            <div className="relative">
                                <img
                                    src={`data:image/png;base64,${zoneImage}`}
                                    alt={`Satellite view of ${selectedZone}`}
                                    className="w-full rounded-xl border border-white/10"
                                />
                                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-mono text-primary">
                                    ZONE: {selectedZone} | RESOLUTION: 60m
                                </div>
                            </div>
                        ) : (
                            <div className="h-80 flex flex-col items-center justify-center text-slate-500">
                                <span className="material-symbols-outlined text-4xl mb-3">image_not_supported</span>
                                <span className="font-mono text-sm">NO IMAGE DATA AVAILABLE</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="mt-8 py-6 text-center text-slate-600 text-xs font-mono border-t border-white/5 bg-slate-900/80 glass-panel">
                SYSTEM V.2.0.4 | SATELLITE LINK ESTABLISHED | <span className="text-primary">ONLINE</span>
            </footer>
        </div>
    );
};

export default SatelliteMonitoring;
