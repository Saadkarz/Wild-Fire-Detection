import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Variants } from 'framer-motion';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

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

const DetectionConsole = () => {
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<{ prediction: string, confidence: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationError("Location access denied");
                }
            );
        } else {
            setLocationError("Geolocation not supported");
        }
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setPrediction(null);
            setIsLoading(true);

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch("http://localhost:8000/predict", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Prediction result:", data);
                setPrediction(data);
            } catch (error) {
                console.error("Error analyzing image:", error);
                alert("Failed to analyze image. Please ensure the backend server is running.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#23482f] bg-surface-darker px-8 py-4 shrink-0">
                <div className="flex items-center gap-4 text-white">
                    <motion.div
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="size-6 text-primary"
                    >
                        <span className="material-symbols-outlined text-2xl">local_fire_department</span>
                    </motion.div>
                    <motion.h2
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-white text-xl font-bold leading-tight tracking-[-0.015em]"
                    >
                        WildfireGuard AI
                    </motion.h2>
                </div>
                <div className="hidden md:flex flex-1 justify-end gap-8">
                    <div className="flex items-center gap-9">
                        <Link className="text-gray-300 hover:text-primary transition-colors text-sm font-medium leading-normal" to="/dashboard">Dashboard</Link>
                        <Link className="text-gray-300 hover:text-primary transition-colors text-sm font-medium leading-normal" to="/fwi">Fire Weather</Link>
                        <Link className="text-gray-300 hover:text-primary transition-colors text-sm font-medium leading-normal" to="/prevention">Prevention</Link>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary/10 border border-primary text-primary text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_10px_rgba(19,236,91,0.2)]"
                    >
                        <span className="truncate flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            System Active
                        </span>
                    </motion.button>
                </div>
                {/* Mobile Menu Icon */}
                <button className="md:hidden text-white">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </header>

            {/* Main Content Area: Split View */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Panel: Input Zone */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex-1 flex flex-col p-6 lg:p-10 border-r border-[#23482f] overflow-y-auto bg-surface-darker/50"
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-2xl mx-auto w-full flex flex-col h-full"
                    >
                        <motion.div variants={itemVariants} className="mb-8">
                            <h1 className="text-white tracking-tight text-3xl font-bold leading-tight mb-2">Visual Intelligence Input</h1>
                            <p className="text-gray-400 text-base font-normal leading-normal">Upload satellite imagery or drone footage for immediate threat analysis.</p>
                        </motion.div>
                        {/* Drop Zone */}
                        <motion.div variants={itemVariants} className="flex-1 min-h-[300px] flex flex-col justify-center mb-8">
                            <label htmlFor="dropzone-file" className="group relative flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-dashed border-[#326744] hover:border-primary/60 bg-[#162b1e] hover:bg-[#1a3324] transition-all duration-300 cursor-pointer overflow-hidden">
                                {/* Radar Sweep Animation Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10 p-6">
                                    <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-4xl text-primary">add_a_photo</span>
                                    </div>
                                    <p className="mb-2 text-lg text-white font-semibold text-center">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400 text-center">Supports JPG, PNG, TIFF (High Res 4K+)</p>
                                    <p className="text-xs text-gray-500 mt-4 font-mono">SECURE UPLOAD ENCRYPTED</p>
                                </div>
                                <input
                                    className="hidden"
                                    id="dropzone-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </motion.div>
                        {/* Recent Scans / History */}
                        <motion.div variants={itemVariants} className="mt-auto">
                            <h3 className="text-white text-sm uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-gray-400">history</span>
                                Recent Scans
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* History Item 1 */}
                                <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#23482f] hover:border-primary transition-colors">
                                    <img className="w-full h-24 object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="Forest landscape with smoke in distance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiJxIv7kFXmYrvJhytnJOoPWOhYgMndAfzm7eQnRnTdZAsUlz4urEdz9sijpPs0ECcjJ3svlCAf4W3RCw9K4K8Nhp-g7CQDhZ5IEtzsWAUin9DrSga3iu5HvgF9H_FdXbdI0A2b3Bb1gptb_-O6azb3KuWTQ4tlbs1MqGY-afnLld2O0AgoGmxhWf30cct4xUPmcEGGJOh3aRKQGgN9fXDoJoOeTOBPKhdnqh-ItV7ZuKOk_qAjvq-LL60hthka6NpyBJheRs_Y2Y" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[10px] text-white truncate">Sector 7G</div>
                                </div>
                                {/* History Item 2 */}
                                <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#23482f] hover:border-primary transition-colors">
                                    <img className="w-full h-24 object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="Dense forest canopy viewed from above" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKL0sbiNFfROU6HSconL34zFHQS0LSkUKwu9_XGiW5v2GaBhzxyDiJUb_DVSlpwaNG3YNIIAnPXn8LUqz734k3xQ4IEqLSwhPGXC0AID3po5e2B5IAFTfdLh2LRPDzi1ZR2FJLzCGEte6szMERNMNqisBn1VBpMtFAExL5lTvmJKr2USLiLDRLRqUC3mSVJovW4Zc2YFGjUPsqgs0BYRet8JFq_wu6Vdf1nb_ObWV1zLlM5-DTIfd397SOFc76VLBBfjpl52Vbbz0" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[10px] text-white truncate">North Ridge</div>
                                </div>
                                {/* History Item 3 */}
                                <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#23482f] hover:border-primary transition-colors">
                                    <img className="w-full h-24 object-cover opacity-70 group-hover:opacity-100 transition-opacity" data-alt="Forest with autumn colors" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi3ReIKHO40S7yHoki8csAcrAaL413c69YydI07X5pQ5bLakVY0Fe_uNBphWkiIQAfKzEhzqij_IsG8Jqpq2zxMvsX3n5AH5Pqbt210K_pMbKzY9hmqnFWkfD3dv3SH8vKPetimjxMSuDWgGspBhbZwT0bFwfTvlWo6u0HNQsVkCai1vT-4IuhlDN47_atyobijHj_SM4Xb4QiRMA9l1A2LGgExCKv12mJmlTBsHSt6GKClEEp7bG9t4XQAqsplqAnoJBgiY_KAu0" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[10px] text-white truncate">Alpha Zone</div>
                                </div>
                                {/* Add Button */}
                                <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-[#326744] hover:bg-[#1a3324] cursor-pointer transition-colors">
                                    <span className="material-symbols-outlined text-gray-500">add</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Right Panel: Analysis Zone */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="flex-1 bg-surface-dark flex flex-col p-6 lg:p-10 overflow-y-auto relative"
                >
                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#13ec5b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative z-10 flex flex-col h-full max-w-2xl mx-auto w-full gap-6"
                    >
                        <motion.div variants={itemVariants} className="flex justify-between items-center pb-4 border-b border-[#23482f]">
                            <h2 className="text-xl text-white font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                Analysis Report
                            </h2>
                            {isLoading ? (
                                <span className="px-2 py-1 rounded bg-yellow-900/30 text-yellow-400 text-xs font-mono font-bold border border-yellow-500/50 flex items-center gap-1">
                                    <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                                    ANALYZING...
                                </span>
                            ) : prediction ? (
                                <span className={`px-2 py-1 rounded text-xs font-mono font-bold border flex items-center gap-1 ${prediction.prediction === "Fire" ? "bg-[#322323] text-red-400 border-red-900/50" :
                                    prediction.prediction === "Smoke" ? "bg-gray-800 text-gray-300 border-gray-600" :
                                        "bg-green-900/30 text-green-400 border-green-900/50"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${prediction.prediction === "Fire" ? "bg-red-500 animate-pulse" :
                                        prediction.prediction === "Smoke" ? "bg-gray-400" :
                                            "bg-green-500"
                                        }`}></span>
                                    {prediction.prediction === "Fire" ? "THREAT DETECTED" : prediction.prediction.toUpperCase()}
                                </span>
                            ) : (
                                <span className="px-2 py-1 rounded bg-gray-900 text-gray-500 text-xs font-mono font-bold border border-gray-800 flex items-center gap-1">
                                    WAITING FOR INPUT
                                </span>
                            )}
                        </motion.div>
                        {/* Main Analysis Canvas */}
                        <motion.div variants={itemVariants} className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_20px_rgba(19,236,91,0.1)] group">
                            {/* The Analyzed Image */}
                            <img
                                className="w-full h-full object-cover opacity-80"
                                src={selectedImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuD81JaoANYbowO2dSeMqNPaqhygsQoZPa4PFau2tlfiD44PacwYsoig3F28FYhAv3HSr17PcrfCT8MU-ipVFRh5c3OXGS2nMFrElc-n6KtjHI2fRjjvydjNxBv6toN-Z5IpOvwg7EZdgJas-6zFcx1f1MG19IIEtkicOn8HVee7YWeO0zfYCogg1MR82mU-hnGNIbnv8MhddiS-wEKUqeCLDS8QNDBCBAXuCHSSJQURtwDRUbaZSE5qE85EChNXT54Too2DA143mlQ"}
                                alt="Analysis Target"
                            />

                            {/* Overlay UI Elements on Image */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-primary border border-primary/20">
                                {selectedImage ? "UPLOADED IMAGE" : "LIVE FEED // CAM_04"}
                            </div>

                            {/* Bounding Box Animation (Only show if Fire or Smoke) */}
                            {(prediction && (prediction.prediction === "Fire" || prediction.prediction === "Smoke")) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                    className={`absolute top-1/4 left-1/4 w-1/3 h-1/3 border-2 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-start justify-end p-1 ${prediction.prediction === "Fire" ? "border-red-500 bg-red-500/10" : "border-gray-400 bg-gray-500/10"
                                        }`}
                                >
                                    <span className={`text-white text-[10px] font-bold px-1 ${prediction.prediction === "Fire" ? "bg-red-600" : "bg-gray-600"
                                        }`}>
                                        {prediction.prediction.toUpperCase()} {(prediction.confidence * 100).toFixed(1)}%
                                    </span>
                                </motion.div>
                            )}

                            {/* Scanning Line */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent w-full h-[5%] animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>
                        </motion.div>
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Confidence Card */}
                            <motion.div variants={itemVariants} className="bg-[#112217] border border-[#23482f] p-4 rounded-xl flex items-center gap-4">
                                <div className="relative size-16 shrink-0">
                                    <svg className="size-full" viewBox="0 0 36 36">
                                        <path className="text-[#23482f]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                        <motion.path
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: prediction ? prediction.confidence : 0 }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`${prediction?.prediction === "Fire" ? "text-red-500" : "text-primary"} drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeDasharray="100, 100"
                                            strokeWidth="4"
                                        ></motion.path>
                                    </svg>
                                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {prediction ? (
                                                <Counter from={0} to={prediction.confidence * 100} suffix="%" duration={1} />
                                            ) : "--"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Confidence</p>
                                    <p className="text-white text-lg font-bold">
                                        {prediction ? (prediction.confidence > 0.8 ? "High Probability" : "Moderate") : "Waiting..."}
                                    </p>
                                    <p className={`${prediction && prediction.confidence > 0.8 ? "text-red-400" : "text-gray-500"} text-xs`}>
                                        {prediction && prediction.confidence > 0.8 ? "Critical Threshold Met" : "Analysis Pending"}
                                    </p>
                                </div>
                            </motion.div>
                            {/* Location Card */}
                            <motion.div variants={itemVariants} className="bg-[#112217] border border-[#23482f] p-4 rounded-xl flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-sm">near_me</span>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Coordinates</p>
                                </div>
                                <p className="text-white text-lg font-mono tracking-tight">
                                    {location ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° W` : (locationError || "Locating...")}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">Sierra National Forest, Sector 4</p>
                            </motion.div>
                            {/* Detailed Stats */}
                            <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#112217] border border-[#23482f] rounded-xl p-4">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 text-xs border-b border-[#23482f]">
                                            <th className="pb-2 font-normal">Metric</th>
                                            <th className="pb-2 font-normal">Value</th>
                                            <th className="pb-2 font-normal text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        <tr className="border-b border-[#23482f]/50">
                                            <td className="py-2 text-white">Class</td>
                                            <td className="py-2 text-gray-300">{prediction ? prediction.prediction : "--"}</td>
                                            <td className="py-2 text-right">
                                                {prediction ? (
                                                    <span className={prediction.prediction === "Fire" ? "text-red-400" : "text-green-400"}>
                                                        {prediction.prediction === "Fire" ? "Critical" : "Safe"}
                                                    </span>
                                                ) : "--"}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-[#23482f]/50">
                                            <td className="py-2 text-white">Wind Speed</td>
                                            <td className="py-2 text-gray-300">12 km/h NE</td>
                                            <td className="py-2 text-right"><span className="text-yellow-400">Moderate</span></td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 text-white">Est. Area</td>
                                            <td className="py-2 text-gray-300">2.4 Hectares</td>
                                            <td className="py-2 text-right"><span className="text-primary">Tracking</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </motion.div>
                        </div>
                        {/* Action Buttons */}
                        <motion.div variants={itemVariants} className="mt-auto pt-6 flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">warning</span>
                                REPORT EMERGENCY
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">flag</span>
                                Mark False Positive
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default DetectionConsole;
