import React from 'react';

interface HotspotCardProps {
    hotspot: {
        lat: number;
        lon: number;
        brightness: number;
        acq_datetime: string;
        confidence: string;
        satellite: string;
        spread_radius_km: number;
        wind_speed_kph?: number;
        wind_direction?: number;
    };
    onClose: () => void;
}

const HotspotCard: React.FC<HotspotCardProps> = ({ hotspot, onClose }) => {
    // Generate a pseudo-ID based on coords for "HS-XXXX"
    const pseudoId = Math.floor((Math.abs(hotspot.lat) + Math.abs(hotspot.lon)) * 100).toString().slice(0, 4);

    return (
        <div className="relative z-10 w-full max-w-[520px] bg-[#112217]/95 dark:bg-[#112217]/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/10 bg-[#162b1e]">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#13ec5b]"></div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tight leading-none text-white font-display">HS-{pseudoId}</h2>
                        <p className="text-xs text-primary/80 font-mono mt-1">LAT: {hotspot.lat.toFixed(4)} N | LON: {hotspot.lon.toFixed(4)} W</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {hotspot.confidence === 'high' && (
                        <span className="px-2 py-1 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold tracking-wider uppercase">Critical</span>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <span className="material-icons-round text-[20px]">close</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-5 flex flex-col gap-5 max-h-[80vh] overflow-y-auto custom-scrollbar font-body">
                {/* Hero Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* FWI Card */}
                    <div className="col-span-2 sm:col-span-1 p-4 rounded-lg bg-surface-dark border border-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                            <span className="material-icons-round text-4xl text-primary">local_fire_department</span>
                        </div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Fire Intensity</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{hotspot.brightness.toFixed(0)}K</span>
                            <span className="text-sm font-medium text-red-400">High</span>
                        </div>
                        <div className="w-full bg-gray-700/50 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-primary to-red-500 h-full w-[75%]"></div>
                        </div>
                        <p className="text-primary text-xs mt-2 flex items-center gap-1">
                            <span className="material-icons-round text-[14px]">trending_up</span>
                            Active Spread
                        </p>
                    </div>
                    {/* Weather Snapshots */}
                    <div className="col-span-2 sm:col-span-1 grid grid-rows-2 gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-dark border border-white/5">
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Wind Spd</p>
                                <p className="text-white font-semibold">{hotspot.wind_speed_kph || '20'} km/h</p>
                            </div>
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                                <span className="material-icons-round text-[18px] rotate-45">north_west</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-dark border border-white/5">
                            <div>
                                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Spread</p>
                                <p className="text-white font-semibold">{hotspot.spread_radius_km} km</p>
                            </div>
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500/10 text-blue-400">
                                <span className="material-icons-round text-[18px]">water_drop</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="p-4 rounded-lg bg-surface-dark border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-300 font-medium text-sm">Thermal Trend (24h)</p>
                        <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Rising</span>
                    </div>
                    <div className="relative h-32 w-full">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            <div className="w-full border-t border-dashed border-white/5"></div>
                            <div className="w-full border-t border-dashed border-white/5"></div>
                            <div className="w-full border-t border-dashed border-white/5"></div>
                        </div>
                        {/* Chart SVG */}
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                            <defs>
                                <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#13ec5b', stopOpacity: 0.3 }}></stop>
                                    <stop offset="100%" style={{ stopColor: '#13ec5b', stopOpacity: 0 }}></stop>
                                </linearGradient>
                            </defs>
                            <path d="M0 45 L10 40 L20 42 L30 35 L40 38 L50 25 L60 28 L70 15 L80 18 L90 5 L100 8" fill="url(#gradient)" stroke="none"></path>
                            <path className="drop-shadow-[0_0_4px_rgba(19,236,91,0.5)]" d="M0 45 L10 40 L20 42 L30 35 L40 38 L50 25 L60 28 L70 15 L80 18 L90 5 L100 8" fill="none" stroke="#13ec5b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                            {/* Active Point */}
                            <circle className="animate-pulse" cx="100" cy="8" fill="#13ec5b" r="3"></circle>
                        </svg>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-mono uppercase">
                        <span>-24h</span>
                        <span>-12h</span>
                        <span>Now</span>
                    </div>
                </div>

                {/* Impact Zone List */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Impact Analysis</h3>
                    {/* List Item 1 */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-lighter/50 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                        <div className="h-10 w-10 rounded bg-[#2e1a1a] flex items-center justify-center shrink-0 border border-red-500/20 group-hover:border-red-500/50 transition-colors">
                            <span className="material-icons-round text-red-400 text-lg">warning</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">Impact Zone: Sector 4</p>
                            <p className="text-xs text-gray-400 truncate">Est. Arrival: {'<'} 2 Hours</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs font-mono text-white">45/km²</p>
                            <p className="text-[10px] text-gray-500">Pop. Density</p>
                        </div>
                    </div>
                    {/* List Item 2 */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-lighter/50 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                        <div className="h-10 w-10 rounded bg-[#2e2a1a] flex items-center justify-center shrink-0 border border-yellow-500/20 group-hover:border-yellow-500/50 transition-colors">
                            <span className="material-icons-round text-yellow-400 text-lg">electric_bolt</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">North Grid Station</p>
                            <p className="text-xs text-gray-400 truncate">Critical Infrastructure</p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs font-mono text-white">1.2km</p>
                            <p className="text-[10px] text-gray-500">Distance</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-white/5 bg-[#14261d] grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors">
                        <span className="material-icons-round text-[18px]">edit_note</span>
                        Report Update
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-[#0fd650] text-background-dark text-sm font-bold shadow-glow hover:shadow-[0_0_25px_rgba(19,236,91,0.5)] transition-all">
                        <span className="material-icons-round text-[18px]">visibility</span>
                        View Full Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotspotCard;
