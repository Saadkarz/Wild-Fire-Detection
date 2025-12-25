import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Detection {
    class: string;
    confidence: number;
}

const UploadDetection: React.FC = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [detections, setDetections] = useState<Detection[]>([]);
    const [videoResultUrl, setVideoResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'image' | 'video' | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setResultImage(null);
            setVideoResultUrl(null);
            setDetections([]);
            setError(null);

            // Auto-upload for better UX in this sci-fi dashboard
            handleUpload(file, type);
        }
    };

    const handleUpload = async (file: File, type: 'image' | 'video') => {
        setIsProcessing(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const endpoint = type === 'image'
                ? 'http://localhost:8000/detect/image'
                : 'http://localhost:8000/detect/video';

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Upload failed');
            }

            if (type === 'image') {
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                const base64Img = `data:image/jpeg;base64,${data.image}`;
                setResultImage(base64Img);
                setDetections(data.detections);
                setModalType('image');
                setShowModal(true);
            } else {
                const blob = await response.blob();
                const videoUrl = URL.createObjectURL(blob);
                setVideoResultUrl(videoUrl);
                setModalType('video');
                setShowModal(true);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-cy-bg text-white font-body min-h-screen relative overflow-x-hidden selection:bg-cy-accent selection:text-cy-bg">
            <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'image')}
            />
            <input
                type="file"
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
            />

            {/* Background elements */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-cy-bg/80 to-cy-bg"></div>
                <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-20"></div>
                <div className="absolute inset-0 crt-overlay opacity-30 z-50 pointer-events-none"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl flex flex-col min-h-screen">
                {error && (
                    <div className="mb-6 p-4 bg-cy-danger/20 border border-cy-danger text-cy-danger rounded-lg font-display text-sm animate-pulse flex items-center gap-3">
                        <span className="material-symbols-outlined">warning</span>
                        <div>
                            <span className="font-bold uppercase tracking-wider">System Alert:</span> {error}
                        </div>
                        <button onClick={() => setError(null)} className="ml-auto hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}
                <header className="flex flex-col md:flex-row items-center justify-between mb-12 border-b border-cy-dim pb-6 relative">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cy-accent to-transparent"></div>
                    <div className="absolute bottom-[-3px] left-1/4 w-1 h-1 bg-cy-accent rounded-full"></div>
                    <div className="absolute bottom-[-3px] right-1/4 w-1 h-1 bg-cy-accent rounded-full"></div>

                    <Link to="/dashboard" className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 border-2 border-cy-accent rounded-lg flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-cy-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="material-symbols-outlined text-cy-accent text-3xl z-10 transition-transform group-hover:scale-110">local_fire_department</span>
                        </div>
                        <div>
                            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-cy-accent">
                                Wildfire <span className="text-cy-accent">Guard</span> Hub
                            </h1>
                            <p className="text-xs text-cy-text-dim tracking-[0.3em] uppercase">Autonomous Detection System v4.2</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-6 mt-6 md:mt-0 font-display text-xs">
                        <div className="flex flex-col items-end">
                            <span className="text-cy-text-dim uppercase tracking-wider">Network Status</span>
                            <span className="text-cy-accent flex items-center gap-2">
                                <span className="w-2 h-2 bg-cy-accent rounded-full animate-pulse"></span> ONLINE
                            </span>
                        </div>
                        <div className="h-8 w-[1px] bg-cy-dim"></div>
                        <div className="flex flex-col items-end text-cy-accent group cursor-pointer hover:text-white transition-colors">
                            <Link to="/dashboard" className="flex flex-col items-end">
                                <span className="text-cy-text-dim uppercase tracking-wider group-hover:text-white font-display">Hub Controller</span>
                                <span className="flex items-center gap-1 uppercase tracking-widest font-bold font-display">
                                    <span className="material-symbols-outlined text-xs">arrow_back</span> Dashboard
                                </span>
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
                    {/* Section: Input Source A (Image) */}
                    <section className="lg:col-span-3 flex flex-col gap-4 group">
                        <div className="flex items-center justify-between text-cy-accent mb-2 px-2">
                            <h2 className="font-display text-sm tracking-widest uppercase">Input Source A</h2>
                            <span className="material-symbols-outlined text-sm">image</span>
                        </div>
                        <div
                            onClick={() => imageInputRef.current?.click()}
                            className="glass-panel relative h-64 md:h-80 rounded-xl p-1 transition-all duration-500 group-hover:shadow-neon group-hover:border-cy-accent/60 overflow-hidden cursor-pointer"
                        >
                            <div className="tech-border-corner top-0 left-0 border-t-2 border-l-2 rounded-tl-lg"></div>
                            <div className="tech-border-corner top-0 right-0 border-t-2 border-r-2 rounded-tr-lg"></div>
                            <div className="tech-border-corner bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg"></div>
                            <div className="tech-border-corner bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg"></div>

                            <div className="w-full h-full bg-cy-bg/40 rounded-lg border border-dashed border-cy-dim flex flex-col items-center justify-center relative hover:bg-cy-accent/5 transition-colors">
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="w-full h-[1px] bg-cy-accent/50 shadow-[0_0_10px_#00ff88] absolute top-0 animate-scan hidden group-hover:block"></div>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-cy-panel border border-cy-accent/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-neon">
                                    <span className="material-symbols-outlined text-cy-accent text-3xl">upload_file</span>
                                </div>
                                <p className="font-display text-cy-text-dim text-xs uppercase tracking-widest mb-1">Upload Imagery</p>
                                <span className="text-[10px] text-gray-500 uppercase tracking-tighter">JPG, PNG, TIFF supported</span>
                            </div>
                        </div>
                        <button
                            onClick={() => imageInputRef.current?.click()}
                            className="w-full py-3 bg-cy-panel border border-cy-accent/30 text-cy-accent font-display text-xs uppercase tracking-widest hover:bg-cy-accent hover:text-black transition-all duration-300 clip-path-slant relative overflow-hidden group/btn"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">add_a_photo</span>
                                Select Image
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>
                        </button>
                    </section>

                    {/* Section: AI Core (Neural Processor) */}
                    <section className="lg:col-span-6 flex flex-col items-center justify-center relative py-10 lg:py-0">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-[1px] bg-gradient-to-r from-transparent to-cy-accent opacity-50 hidden lg:block"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-[1px] bg-gradient-to-l from-transparent to-cy-accent opacity-50 hidden lg:block"></div>

                        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center perspective-1000">
                            <div className="absolute inset-0 border border-cy-dim rounded-full animate-spin-slow"></div>
                            <div className="absolute inset-4 border border-dashed border-cy-accent/30 rounded-full animate-spin-reverse"></div>
                            <div className="absolute inset-8 border-2 border-transparent border-t-cy-accent/60 border-b-cy-accent/60 rounded-full animate-spin duration-[8s] linear infinite opacity-60"></div>

                            <div className={`w-48 h-48 rounded-full bg-black relative overflow-hidden shadow-neon-strong z-20 transition-all duration-500 ${isProcessing ? 'scale-110' : 'animate-float'}`}>
                                <img
                                    alt="AI Processor Core"
                                    className={`w-full h-full object-cover opacity-80 mix-blend-screen transition-opacity duration-500 ${isProcessing ? 'animate-pulse' : 'animate-hologram-flicker grayscale brightness-125'}`}
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwHzaBX0XMFZt2lNvBMpzu5-tMlAw0-jvvozxWvNhqr0nEJD0FJDJxDWGi5m-XyoibuPcQk5Ooj8hqVK3082CKcJoEAjf-c3Tkqb_Xil7h6LV-NDpJNsL87ok5DVaWdzXO_UmDTdUhi7K66RqI3ZpErkPn1k1dLlCYaHj0HAByS9bCwUMYYnWis8L_GhVDABKbjdnvTJIXAuDIBlqptH7T6AI21YWVMZ-hGblhGAmNAnUUEHXjAvA_etMbIZvtatxwiR1gg7jETUc"
                                />
                                {isProcessing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-cy-accent/20 backdrop-blur-sm">
                                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cy-accent/10 to-transparent animate-pulse pointer-events-none"></div>
                            </div>

                            <div className="absolute -bottom-16 w-32 h-8 holo-base rounded-[100%]"></div>
                            <div className="absolute bottom-0 w-40 h-24 holo-beam opacity-30 z-10 pointer-events-none"></div>
                        </div>

                        <div className="mt-8 text-center relative z-20">
                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-cy-accent/20 bg-black/50 backdrop-blur-sm shadow-neon">
                                <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-white animate-ping' : 'bg-cy-accent animate-pulse'}`}></span>
                                <span className="font-display text-xs text-cy-accent tracking-[0.2em] uppercase">
                                    {isProcessing ? 'Neural Sync in Progress' : 'Neural Net Active'}
                                </span>
                            </div>
                            <div className="flex justify-center gap-1 mt-2">
                                <div className="h-1 w-8 bg-cy-accent/20 overflow-hidden rounded-full">
                                    <div className={`h-full bg-cy-accent w-full animate-[scan_2s_linear_infinite] translate-x-[-100%] ${isProcessing ? 'animate-[scan_0.5s_linear_infinite]' : ''}`}></div>
                                </div>
                                <div className="h-1 w-8 bg-cy-accent/20 overflow-hidden rounded-full">
                                    <div className={`h-full bg-cy-accent w-full animate-[scan_2s_linear_infinite_0.5s] translate-x-[-100%] ${isProcessing ? 'animate-[scan_0.5s_linear_infinite_0.2s]' : ''}`}></div>
                                </div>
                                <div className="h-1 w-8 bg-cy-accent/20 overflow-hidden rounded-full">
                                    <div className={`h-full bg-cy-accent w-full animate-[scan_2s_linear_infinite_1s] translate-x-[-100%] ${isProcessing ? 'animate-[scan_0.5s_linear_infinite_0.4s]' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Input Source B (Video) */}
                    <section className="lg:col-span-3 flex flex-col gap-4 group">
                        <div className="flex items-center justify-between text-cy-accent mb-2 px-2">
                            <span className="material-symbols-outlined text-sm">videocam</span>
                            <h2 className="font-display text-sm tracking-widest uppercase">Input Source B</h2>
                        </div>
                        <div
                            onClick={() => videoInputRef.current?.click()}
                            className="glass-panel relative h-64 md:h-80 rounded-xl p-1 transition-all duration-500 group-hover:shadow-neon group-hover:border-cy-accent/60 overflow-hidden cursor-pointer"
                        >
                            <div className="tech-border-corner top-0 left-0 border-t-2 border-l-2 rounded-tl-lg"></div>
                            <div className="tech-border-corner top-0 right-0 border-t-2 border-r-2 rounded-tr-lg"></div>
                            <div className="tech-border-corner bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg"></div>
                            <div className="tech-border-corner bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg"></div>

                            <div className="w-full h-full bg-cy-bg/40 rounded-lg border border-dashed border-cy-dim flex flex-col items-center justify-center relative hover:bg-cy-accent/5 transition-colors">
                                <div className="w-32 h-32 rounded-full border-2 border-cy-dim flex items-center justify-center relative group-hover:border-cy-accent/50 transition-colors">
                                    <div className="absolute inset-[-5px] border-t-2 border-cy-accent w-full h-full rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-20 h-20 rounded-full bg-cy-panel border border-cy-accent/30 flex items-center justify-center shadow-neon">
                                        <span className="material-symbols-outlined text-cy-accent text-3xl transition-transform group-hover:scale-125">play_circle</span>
                                    </div>
                                </div>
                                <p className="font-display text-cy-text-dim text-xs uppercase tracking-widest mt-4 mb-1">Upload Footage</p>
                                <span className="text-[10px] text-gray-500 uppercase tracking-tighter">MP4, MOV, AVI supported</span>
                            </div>
                        </div>
                        <button
                            onClick={() => videoInputRef.current?.click()}
                            className="w-full py-3 bg-cy-panel border border-cy-accent/30 text-cy-accent font-display text-xs uppercase tracking-widest hover:bg-cy-accent hover:text-black transition-all duration-300 clip-path-slant relative overflow-hidden group/btn"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">sensors</span>
                                Stream Content
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>
                        </button>
                    </section>
                </main>

                {/* Section: Live Analysis (Results) */}
                <section className="mt-8 pb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <h3 className="font-display text-xl text-white uppercase tracking-widest">Live Analysis Report</h3>
                        <div className="h-[1px] flex-grow bg-gradient-to-r from-cy-accent/50 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Analysis Article */}
                        <article className={`glass-panel p-4 rounded-lg flex flex-col sm:flex-row gap-4 relative overflow-hidden hover:bg-cy-panel transition-all duration-300 group ${resultImage ? 'opacity-100 translate-y-0' : 'opacity-40 grayscale pointer-events-none'}`}>
                            <div className="absolute top-0 right-0 p-2 z-20">
                                <span className="material-symbols-outlined text-cy-text-dim text-sm opacity-50">more_horiz</span>
                            </div>

                            <div className="w-full sm:w-48 h-32 relative rounded border border-cy-dim overflow-hidden flex-shrink-0 bg-black/60">
                                {resultImage ? (
                                    <>
                                        <img alt="Recent Analysis" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={resultImage} />
                                        <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,#00ff88_95%)] bg-[size:10px_10px] opacity-20"></div>
                                        <div className="absolute inset-0 border border-cy-accent/20"></div>
                                        {detections.length > 0 && (
                                            <div className="absolute top-[30%] left-[20%] w-[30%] h-[40%] border-2 border-cy-danger shadow-[0_0_10px_red] animate-pulse"></div>
                                        )}
                                        <div className="absolute top-1 left-1 bg-cy-danger/90 text-black text-[9px] font-bold px-1 uppercase font-display shadow-lg">Detection Active</div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-cy-dim text-4xl">image</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <h4 className="font-display text-sm text-white uppercase tracking-wider">Imagery Analysis</h4>
                                        <span className="font-mono text-cy-accent text-xs">{(detections.length > 0 ? detections[0].confidence * 100 : 0).toFixed(1)}% CONF</span>
                                    </div>
                                    <div className="space-y-2">
                                        {detections.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {detections.map((det, idx) => (
                                                    <span key={idx} className={`text-[9px] px-2 py-0.5 rounded-full border border-cy-accent/30 bg-cy-accent/10 text-cy-accent uppercase font-bold`}>
                                                        {det.class}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-gray-500 uppercase italic font-mono">No data streamed</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                                    <div className="flex gap-3 text-cy-text-dim">
                                        <span className="material-symbols-outlined text-sm hover:text-cy-accent cursor-pointer transition-colors" title="Location">location_on</span>
                                        <span className="material-symbols-outlined text-sm hover:text-cy-accent cursor-pointer transition-colors" title="Export">download</span>
                                    </div>
                                    <button className="text-[10px] bg-cy-accent/10 text-cy-accent border border-cy-accent/50 px-3 py-1 uppercase font-display tracking-widest hover:bg-cy-accent hover:text-black transition-colors">
                                        View Detail
                                    </button>
                                </div>
                            </div>
                        </article>

                        {/* Video Analysis Article */}
                        <article className={`glass-panel p-4 rounded-lg flex flex-col sm:flex-row gap-4 relative overflow-hidden hover:bg-cy-panel transition-all duration-300 group ${videoResultUrl ? 'opacity-100 translate-y-0' : 'opacity-40 grayscale pointer-events-none'}`}>
                            <div className="absolute top-0 right-0 p-2 z-20">
                                <span className="material-symbols-outlined text-cy-text-dim text-sm opacity-50">more_horiz</span>
                            </div>

                            <div className="w-full sm:w-48 h-32 relative rounded border border-cy-dim overflow-hidden flex-shrink-0 bg-black/60">
                                {videoResultUrl ? (
                                    <>
                                        <video className="w-full h-full object-cover opacity-80 group-hover:opacity-100" muted loop autoPlay src={videoResultUrl} />
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[8px] font-bold text-red-500 font-display border border-red-500/30">
                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> LIVE REC
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-sm">play_arrow</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-cy-dim text-4xl">videocam</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <h4 className="font-display text-sm text-white uppercase tracking-wider">Footage Stream</h4>
                                        <span className="font-mono text-cy-secondary text-xs">{videoResultUrl ? 'ANALYZED' : 'READY'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="bg-cy-bg/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-gray-500 uppercase font-display mb-1">Status</div>
                                            <div className="text-sm font-bold leading-none text-cy-accent uppercase tracking-tighter">Verified</div>
                                        </div>
                                        <div className="bg-cy-bg/50 p-2 rounded border border-white/5">
                                            <div className="text-[9px] text-gray-500 uppercase font-display mb-1">Path</div>
                                            <div className="text-sm font-bold leading-none text-white font-mono">NEURAL_B</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                                    <div className="flex gap-3 text-cy-text-dim">
                                        <span className="material-symbols-outlined text-sm hover:text-cy-accent cursor-pointer transition-colors" title="Full Screen">fullscreen</span>
                                        <span className="material-symbols-outlined text-sm hover:text-cy-accent cursor-pointer transition-colors" title="Download">download</span>
                                    </div>
                                    <a
                                        href={videoResultUrl || '#'}
                                        download="processed_footage.mp4"
                                        className="text-[10px] bg-cy-accent/10 text-cy-accent border border-cy-accent/50 px-3 py-1 uppercase font-display tracking-widest hover:bg-cy-accent hover:text-black transition-colors"
                                    >
                                        Download Feed
                                    </a>
                                </div>
                            </div>
                        </article>
                    </div>
                </section>

                <footer className="mt-auto py-8 text-center relative border-t border-cy-dim">
                    <p className="font-display text-[10px] text-cy-text-dim tracking-[0.4em] uppercase">
                        System Link Established // Secure Terminal // Wildfire Guard AI v4.2.0
                    </p>
                    <div className="mt-4 flex justify-center gap-8 text-[10px] font-mono text-cy-accent/40 uppercase tracking-widest">
                        <span>Lat: 34.0522° N</span>
                        <span>Lon: 118.2437° W</span>
                        <span>Status: Nominal</span>
                    </div>
                </footer>
            </div>

            {/* Intelligence Report Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                        onClick={() => setShowModal(false)}
                    ></div>

                    <div className="relative w-full max-w-5xl glass-panel rounded-2xl border-2 border-cy-accent/40 shadow-neon-strong overflow-hidden animate-float flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-cy-accent/20 flex justify-between items-center bg-cy-accent/5">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-cy-accent rounded-full animate-pulse"></div>
                                <h3 className="font-display text-sm md:text-md uppercase tracking-[0.3em] text-white">Intelligence Report: Analyzed Feed</h3>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full border border-cy-accent/30 flex items-center justify-center text-cy-accent hover:bg-cy-accent hover:text-black transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-grow overflow-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Visual Display */}
                            <div className="lg:col-span-3 relative rounded-xl border border-cy-accent/20 overflow-hidden bg-black group">
                                <div className="absolute inset-0 pointer-events-none z-10 crt-overlay opacity-20"></div>
                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                    <span className="bg-cy-danger/80 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase font-display animate-pulse">Detection Confirmed</span>
                                    <span className="bg-black/60 backdrop-blur text-cy-accent text-[10px] px-2 py-0.5 rounded border border-cy-accent/30 font-display">System Level V</span>
                                </div>

                                {modalType === 'image' && resultImage ? (
                                    <img src={resultImage} alt="Analyzed Result" className="w-full h-auto object-contain max-h-[70vh] mx-auto" />
                                ) : modalType === 'video' && videoResultUrl ? (
                                    <video src={videoResultUrl} controls autoPlay loop className="w-full h-auto max-h-[70vh] mx-auto" />
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-cy-text-dim uppercase tracking-widest font-display animate-pulse">Fetching Neural Data...</div>
                                )}

                                <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-1">
                                    <div className="text-[10px] text-cy-accent/60 font-mono">FRAME_INDEX: 4812</div>
                                    <div className="text-[10px] text-cy-accent/60 font-mono italic">SYST_TIME: {new Date().toLocaleTimeString()}</div>
                                </div>
                            </div>

                            {/* Sidebar Info */}
                            <div className="lg:col-span-1 flex flex-col gap-4">
                                <div className="glass-panel p-4 rounded-lg border border-cy-accent/20">
                                    <h4 className="font-display text-[10px] text-cy-accent uppercase tracking-widest mb-3 border-b border-cy-accent/10 pb-2">Analysis Metrics</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[10px] uppercase text-gray-400 mb-1">Confidence Score</div>
                                            <div className="h-1.5 w-full bg-cy-dim rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-cy-accent shadow-[0_0_10px_#00ff88]"
                                                    style={{ width: `${(detections.length > 0 ? detections[0].confidence * 100 : 85)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-right text-cy-accent font-mono text-xs mt-1">
                                                {(detections.length > 0 ? detections[0].confidence * 100 : 85).toFixed(1)}%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-gray-400 mb-1">Detections</div>
                                            <div className="flex flex-wrap gap-1">
                                                {detections.length > 0 ? detections.map((d, i) => (
                                                    <span key={i} className="text-[9px] px-2 py-0.5 rounded border border-cy-accent/20 bg-cy-accent/5 text-cy-accent font-bold uppercase">{d.class}</span>
                                                )) : <span className="text-[9px] text-cy-accent font-bold uppercase">Wildfire Detected</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel p-4 rounded-lg border border-cy-secondary/20 mt-auto">
                                    <h4 className="font-display text-[10px] text-cy-secondary uppercase tracking-widest mb-3">Next Operations</h4>
                                    <div className="grid grid-cols-1 gap-2 text-[10px]">
                                        <button className="py-2 px-3 border border-cy-accent/30 hover:bg-cy-accent hover:text-black transition-colors uppercase font-bold tracking-tighter">Export Report</button>
                                        <button className="py-2 px-3 border border-cy-secondary/30 hover:bg-cy-secondary hover:text-black transition-colors uppercase font-bold tracking-tighter">Sync to GIS</button>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="py-2 px-3 border border-white/20 hover:bg-white/10 transition-colors uppercase font-bold tracking-tighter mt-4"
                                        >
                                            Return to Hub
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tech Scan Line */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-cy-accent/30 shadow-[0_0_15px_#00ff88] animate-scan pointer-events-none"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadDetection;
