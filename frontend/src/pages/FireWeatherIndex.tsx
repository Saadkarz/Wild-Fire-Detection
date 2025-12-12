import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Variants } from 'framer-motion';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LeafletMouseEvent } from 'leaflet';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Counter = ({ from = 0, to, duration = 2, suffix = "", prefix = "", decimals = 0 }: { from?: number, to: number, duration?: number, suffix?: string, prefix?: string, decimals?: number }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => {
        return prefix + latest.toFixed(decimals) + suffix;
    });

    useEffect(() => {
        if (inView) {
            animate(count, to, { duration });
        }
    }, [inView, count, to, duration]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
};

// Component to handle map clicks and updates
const MapController = ({
    coords,
    setCoords
}: {
    coords: { lat: number, lng: number },
    setCoords: (c: { lat: number, lng: number }) => void
}) => {
    const map = useMap();

    useMapEvents({
        click(e: LeafletMouseEvent) {
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    useEffect(() => {
        map.flyTo([coords.lat, coords.lng], map.getZoom());
    }, [coords, map]);

    return null;
};

// Open-Meteo Types
interface OpenMeteoPeriod {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
}

interface GridPoint {
    lat: number;
    lng: number;
    fwi: number;
    temp: number;
    humidity: number;
    wind: number;
}

interface FireData {
    current: {
        temp: number;
        humidity: number;
        wind: number;
        fwi: number;
    };
    hourly: OpenMeteoPeriod[];
    grid?: GridPoint[]; // Only present in Scan mode
}

// Simple Fire Danger Index Heuristic
const calculateFireDangerIndex = (tempC: number, rh: number, windKmh: number): number => {
    const dryFactor = Math.max(0, (100 - rh) * 0.8);
    const heatFactor = Math.max(0, (tempC - 10) * 1.5);
    const windFactor = Math.min(windKmh * 1.2, 40);

    let score = (dryFactor * 0.5) + (heatFactor * 0.3) + (windFactor * 0.2);

    if (tempC > 30 && rh < 30) score *= 1.3;
    if (windKmh > 30) score *= 1.2;

    return Math.min(Math.round(score), 100);
};

const getDangerColorHex = (fwi: number) => {
    if (fwi > 80) return "#a855f7"; // Purple
    if (fwi > 60) return "#dc2626"; // Red
    if (fwi > 40) return "#f87171"; // Light Red
    if (fwi > 20) return "#fb923c"; // Orange
    return "#4ade80"; // Green
};

const FireWeatherIndex = () => {
    const [coords, setCoords] = useState({ lat: 31.7917, lng: -7.0926 });
    const [fireData, setFireData] = useState<FireData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisMode, setAnalysisMode] = useState<'single' | 'scan'>('scan');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        setFireData(null);

        try {
            let results: any[] = [];
            let centerData: any = null;

            if (analysisMode === 'scan') {
                // Generate Grid: 5x5
                const offsets = [-0.2, -0.1, 0, 0.1, 0.2];
                const lats: number[] = [];
                const lngs: number[] = [];

                offsets.forEach(latOff => {
                    offsets.forEach(lngOff => {
                        lats.push(coords.lat + latOff);
                        lngs.push(coords.lng + lngOff);
                    });
                });

                const latStr = lats.join(",");
                const lngStr = lngs.join(",");

                const url = `https://api.open-meteo.com/v1/forecast?latitude=${latStr}&longitude=${lngStr}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&forecast_days=1&timezone=auto`;

                const response = await fetch(url);
                if (!response.ok) throw new Error("Open-Meteo API Failed");

                const dataArr = await response.json();
                results = Array.isArray(dataArr) ? dataArr : [dataArr]; // Should be array of 25
                centerData = results[12] || results[0]; // Approx center
            } else {
                // Single Point
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&forecast_days=1&timezone=auto`;

                const response = await fetch(url);
                if (!response.ok) throw new Error("Open-Meteo API Failed");

                centerData = await response.json();
                results = [centerData];
            }

            // 1. Process Center/Single Point
            const currentTemp = centerData.current.temperature_2m;
            const currentRh = centerData.current.relative_humidity_2m;
            const currentWind = centerData.current.wind_speed_10m;
            const currentFwi = calculateFireDangerIndex(currentTemp, currentRh, currentWind);

            // 2. Process Hourly for Center
            const hourlyData: OpenMeteoPeriod[] = [];
            const hours = centerData.hourly.time;
            const temps = centerData.hourly.temperature_2m;
            const hums = centerData.hourly.relative_humidity_2m;
            const winds = centerData.hourly.wind_speed_10m;
            const rains = centerData.hourly.precipitation;

            const nowIso = new Date().toISOString().slice(0, 13);
            let startIndex = hours.findIndex((t: string) => t.startsWith(nowIso));
            if (startIndex === -1) startIndex = 0;

            for (let i = startIndex; i < startIndex + 8; i++) {
                if (hours[i]) {
                    hourlyData.push({
                        time: hours[i],
                        temperature_2m: temps[i],
                        relative_humidity_2m: hums[i],
                        wind_speed_10m: winds[i],
                        precipitation: rains[i]
                    });
                }
            }

            // 3. Process Grid Data (Only for Scan Mode)
            let gridPoints: GridPoint[] | undefined = undefined;
            if (analysisMode === 'scan') {
                gridPoints = results.map((res: any) => {
                    const t = res.current.temperature_2m;
                    const h = res.current.relative_humidity_2m;
                    const w = res.current.wind_speed_10m;
                    return {
                        lat: res.latitude,
                        lng: res.longitude,
                        temp: t,
                        humidity: h,
                        wind: w,
                        fwi: calculateFireDangerIndex(t, h, w)
                    };
                });
            }

            setFireData({
                current: {
                    temp: currentTemp,
                    humidity: currentRh,
                    wind: currentWind,
                    fwi: currentFwi
                },
                hourly: hourlyData,
                grid: gridPoints
            });

        } catch (err: any) {
            console.error("API Error:", err);
            setError(err.message || "Failed to fetch weather data");
        } finally {
            setLoading(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    const fwi = fireData?.current.fwi || 0;
    const dangerLevel =
        fwi > 80 ? "EXTREME" :
            fwi > 60 ? "VERY HIGH" :
                fwi > 40 ? "HIGH" :
                    fwi > 20 ? "MODERATE" : "LOW";

    const dangerColor =
        fwi > 80 ? "text-purple-500" :
            fwi > 60 ? "text-red-600" :
                fwi > 40 ? "text-red-400" :
                    fwi > 20 ? "text-orange-400" : "text-green-400";

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-surface-border bg-background-dark px-6 py-3 shrink-0 z-30 relative shadow-lg">
                <div className="flex items-center gap-3 text-white">
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        className="size-8 flex items-center justify-center bg-primary/20 rounded-lg text-primary"
                    >
                        <span className="material-symbols-outlined">local_fire_department</span>
                    </motion.div>
                    <div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Global Fire Weather</h2>
                        <p className="text-xs text-slate-400 font-normal">Open-Meteo Intelligence</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-6">
                        <Link className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal" to="/dashboard">Dashboard</Link>
                        <span className="text-primary text-sm font-medium leading-normal">Analysis</span>
                        <Link to="/detection" className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal">Detection</Link>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative group/design-root">
                {/* Left Pane: Interactive Map */}
                <div className="w-full lg:w-[60%] xl:w-[65%] relative h-full bg-[#0a150f] hidden lg:block overflow-hidden group/map">
                    <MapContainer
                        center={[coords.lat, coords.lng]}
                        zoom={9}
                        style={{ height: "100%", width: "100%", background: "#0a150f" }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={[coords.lat, coords.lng]} />

                        {/* Heatmap/Risk Zones - Only in Scan Mode */}
                        {analysisMode === 'scan' && fireData?.grid?.map((point, idx) => (
                            <Circle
                                key={idx}
                                center={[point.lat, point.lng]}
                                radius={5000}
                                pathOptions={{
                                    color: getDangerColorHex(point.fwi),
                                    fillColor: getDangerColorHex(point.fwi),
                                    fillOpacity: 0.4,
                                    opacity: 0,
                                    weight: 0
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="text-slate-900 p-1">
                                        <p className="font-bold text-sm">FWI: {point.fwi}</p>
                                        <p className="text-xs">Temp: {point.temp}°C</p>
                                    </div>
                                </Popup>
                            </Circle>
                        ))}

                        <MapController coords={coords} setCoords={setCoords} />
                    </MapContainer>

                    {/* Overlays */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface-dark/90 backdrop-blur-md border border-[#23482f] px-4 py-2 rounded-full flex items-center gap-2 shadow-xl z-[1000] pointer-events-none">
                        <span className="material-symbols-outlined text-primary text-sm">touch_app</span>
                        <span className="text-white text-sm font-medium">Click map to select target location</span>
                    </div>

                    <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-[1000]">
                        <div className="bg-background-dark/90 backdrop-blur-sm border border-surface-border rounded-lg p-3 text-xs text-slate-300 shadow-xl">
                            <p className="font-bold text-white mb-2">Risk Legend</p>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="size-3 rounded-full bg-green-400"></span> Low Risk (0-20)
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="size-3 rounded-full bg-red-400"></span> High (40-60)
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-3 rounded-full bg-purple-500"></span> Extreme ({">"}60)
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Pane: Controls & Data */}
                <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col h-full bg-background-dark border-l border-surface-border relative z-10 shadow-2xl">
                    <motion.div
                        className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Control Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">tune</span>
                                    Settings
                                </h3>
                            </div>

                            {/* Mode Toggle */}
                            <div className="flex bg-input-bg rounded-lg p-1 border border-surface-border">
                                <button
                                    onClick={() => setAnalysisMode('single')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${analysisMode === 'single' ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <span className="material-symbols-outlined text-base">location_on</span>
                                    Single Point
                                </button>
                                <button
                                    onClick={() => setAnalysisMode('scan')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all ${analysisMode === 'scan' ? 'bg-primary text-background-dark shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    <span className="material-symbols-outlined text-base">radar</span>
                                    Region Scan
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col flex-1">
                                    <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Latitude</p>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-input-bg border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-green-700 h-12 pl-4 pr-10 placeholder:text-slate-500 text-sm transition-all"
                                            value={coords.lat}
                                            onChange={(e) => setCoords({ ...coords, lat: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </label>
                                <label className="flex flex-col flex-1">
                                    <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">Longitude</p>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-input-bg border border-surface-border focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-green-700 h-12 pl-4 pr-10 placeholder:text-slate-500 text-sm transition-all"
                                            value={coords.lng}
                                            onChange={(e) => setCoords({ ...coords, lng: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </label>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={fetchData}
                                className="w-full bg-primary hover:bg-[#0fd650] text-background-dark font-bold text-base h-14 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {loading ? <span className="material-symbols-outlined animate-spin">sync</span> :
                                    analysisMode === 'scan' ? <span className="material-symbols-outlined">radar</span> :
                                        <span className="material-symbols-outlined">search</span>}
                                {analysisMode === 'scan' ? "Scan Region Risks" : "Get Station Data"}
                            </motion.button>
                        </section>

                        <div className="h-px bg-surface-border w-full"></div>

                        {/* Top Risk Zones List (Heatmap Only) */}
                        {analysisMode === 'scan' && fireData?.grid && (
                            <section className="flex flex-col gap-4">
                                <h4 className="text-white text-md font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-500">warning</span>
                                    Risk Hotspots
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {[...fireData.grid]
                                        .sort((a, b) => b.fwi - a.fwi)
                                        .slice(0, 3)
                                        .map((point, i) => (
                                            <motion.div
                                                key={i}
                                                variants={itemVariants}
                                                className="bg-[#1a0f0f] border border-red-900/30 rounded-lg p-3 flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-red-900/50 flex items-center justify-center text-red-500 font-bold text-xs">{i + 1}</div>
                                                    <div>
                                                        <p className="text-white text-sm font-medium">Zone {point.lat.toFixed(2)}, {point.lng.toFixed(2)}</p>
                                                        <p className="text-xs text-slate-500">FWI: {point.fwi} • Wind: {point.wind}km/h</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                </div>
                            </section>
                        )}

                        {/* Results Section */}
                        <section className="flex flex-col gap-6">
                            <motion.div variants={itemVariants} className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white text-xl font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">assessment</span>
                                        {analysisMode === 'scan' ? 'Regional Center Analysis' : 'Local Analysis'}
                                    </h3>
                                    <p className="text-slate-400 text-sm mt-1">Real-time metrics</p>
                                </div>
                            </motion.div>

                            {/* Main Status Card */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-gradient-to-br from-surface-dark to-[#0f1d14] border border-surface-border rounded-xl p-6 relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between relative z-10">
                                    <div>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Calculated FWI</p>
                                        <div className="flex items-baseline gap-3">
                                            <h2 className="text-6xl font-bold text-white tracking-tighter">
                                                <Counter from={0} to={fwi} decimals={0} duration={1} />
                                            </h2>
                                            <span className="flex flex-col">
                                                <span className={`${dangerColor} font-bold text-lg flex items-center gap-1`}>
                                                    {dangerLevel}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                    {/* Circular Gauge */}
                                    <div className="relative size-20 flex items-center justify-center">
                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-surface-border" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                                            <motion.path
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: Math.min(fwi / 100, 1) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={`${fwi > 50 ? "text-red-500" : "text-primary"} drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeDasharray="100, 100"
                                                strokeWidth="3"
                                            ></motion.path>
                                        </svg>
                                        <span className="absolute text-white font-bold text-xs">{fwi.toFixed(0)}</span>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-500 text-[10px] uppercase">Temp</span>
                                        <span className="text-white font-bold text-lg flex items-center gap-1">
                                            {fireData?.current.temp || "--"}°C
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-500 text-[10px] uppercase">Humidity</span>
                                        <span className="text-white font-medium text-sm flex items-center gap-1">
                                            {fireData?.current.humidity || "--"}%
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-500 text-[10px] uppercase">Wind</span>
                                        <span className="text-white font-medium text-sm flex items-center gap-1">
                                            {fireData?.current.wind || "--"} km/h
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Hourly Forecast */}
                            <motion.div variants={itemVariants}>
                                <h4 className="text-white text-sm font-bold mb-3">Hourly Forecast (Next 8 Hours)</h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {(fireData?.hourly || []).map((period: OpenMeteoPeriod, i: number) => {
                                        const date = new Date(period.time);
                                        const hour = date.getHours().toString().padStart(2, '0') + ":00";
                                        const pFwi = calculateFireDangerIndex(period.temperature_2m, period.relative_humidity_2m, period.wind_speed_10m);

                                        return (
                                            <motion.div
                                                key={i}
                                                whileHover={{ y: -5 }}
                                                className="bg-input-bg border border-surface-border rounded-lg p-2 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors cursor-pointer group"
                                            >
                                                <span className="text-slate-400 text-[10px] font-bold">{hour}</span>
                                                <span className={`material-symbols-outlined ${pFwi > 50 ? "text-orange-400" : "text-green-400"} text-lg`}>
                                                    {pFwi > 50 ? "local_fire_department" : "wb_sunny"}
                                                </span>
                                                <span className="text-white text-xs font-bold">{period.temperature_2m}°C</span>
                                            </motion.div>
                                        );
                                    })}
                                    {!fireData && Array(4).fill(0).map((_, i) => (
                                        <div key={i} className="bg-input-bg/50 border border-surface-border/50 rounded-lg h-20 animate-pulse"></div>
                                    ))}
                                </div>
                            </motion.div>
                        </section>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default FireWeatherIndex;
