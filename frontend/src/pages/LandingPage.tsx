
import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link } from 'react-router-dom';

const TypingText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
    const letters = Array.from(text);

    const container: any = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: delay * i },
        }),
    };

    const child: any = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.span
            className={className}
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            style={{ display: 'inline-block' }}
        >
            {letters.map((letter, index) => (
                <motion.span key={index} variants={child} style={{ display: 'inline-block' }}>
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </motion.span>
    );
};

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
const FadeIn = ({
    children,
    delay = 0,
    className,
    direction = 'up',
    fullWidth = false
}: {
    children: React.ReactNode,
    delay?: number,
    className?: string,
    direction?: 'up' | 'down' | 'left' | 'right' | 'none',
    fullWidth?: boolean
}) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-10%" });

    const getDirectionOffset = () => {
        switch (direction) {
            case 'up': return { y: 40 };
            case 'down': return { y: -40 };
            case 'left': return { x: 40 };
            case 'right': return { x: -40 };
            case 'none': return {};
            default: return { y: 40 };
        }
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, ...getDirectionOffset() }}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...getDirectionOffset() }}
            transition={{
                duration: 0.8,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98]
            }}
            className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
        >
            {children}
        </motion.div>
    );
};

function LandingPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-[#e7edf3]/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-black">
                            <span className="material-symbols-outlined text-[20px]">forest</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-[#0d141b] dark:text-white font-display">WildfireGuard AI</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-base font-medium text-[#0d141b]/80 dark:text-white/80 hover:text-primary dark:hover:text-primary transition-colors" href="#">Technology</a>
                        <a className="text-base font-medium text-[#0d141b]/80 dark:text-white/80 hover:text-primary dark:hover:text-primary transition-colors" href="#">Platform</a>
                        <a className="text-base font-medium text-[#0d141b]/80 dark:text-white/80 hover:text-primary dark:hover:text-primary transition-colors" href="#">Success Stories</a>
                        <a className="text-base font-medium text-[#0d141b]/80 dark:text-white/80 hover:text-primary dark:hover:text-primary transition-colors" href="#">About Us</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="hidden md:flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-black hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,229,114,0.3)] hover:shadow-[0_0_20px_rgba(0,229,114,0.5)]">
                            Dashboard
                        </Link>
                        <button className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-[#e7edf3]/20 text-[#0d141b] dark:text-white">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </header>
            <section className="relative flex min-h-[600px] flex-col items-center justify-center overflow-hidden py-20 lg:min-h-[800px]">
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                    >
                        <source src="https://ororatech.com/storage/files/homepageheroes-allpersonas-1080-99mb_2.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-background-dark/90 via-background-dark/70 to-background-dark"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,114,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,114,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                </div>
                <div className="layout-content-container relative z-10 flex max-w-7xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm tracking-wider">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        LIVE SYSTEM ACTIVE
                    </div>
                    <h1 className="max-w-5xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl font-display uppercase">
                        <TypingText text="Stop Wildfires" /> <br className="hidden sm:block" />
                        <TypingText text="Before They Spread" className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#80ffdb]" delay={0.5} />
                    </h1>
                    <p className="max-w-2xl text-lg text-gray-300 sm:text-xl font-light tracking-wide">
                        Our autonomous AI system detects threats 40x faster than traditional methods, protecting forests, assets, and lives with 99.9% accuracy.
                    </p>
                    <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4 pt-4">
                        <FadeIn delay={0.8} direction="up">
                            <Link to="/dashboard" className="h-12 w-full sm:w-auto flex items-center justify-center rounded-lg bg-primary px-8 text-lg font-bold text-black shadow-[0_0_20px_rgba(0,229,114,0.4)] hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,229,114,0.6)] transition-all uppercase tracking-wider">
                                Deploy System
                            </Link>
                        </FadeIn>
                        <FadeIn delay={1.0} direction="up">
                            <button className="group flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-8 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10 uppercase tracking-wider">
                                <span className="material-symbols-outlined text-[24px] transition-transform group-hover:translate-x-1">play_arrow</span>
                                Watch Demo
                            </button>
                        </FadeIn>
                    </div>
                    <FadeIn delay={1.2} fullWidth>
                        <div className="mt-12 grid w-full grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-4 lg:w-4/5">
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-bold text-white font-display">
                                    <Counter from={0} to={2.4} suffix="M+" decimals={1} duration={4} />
                                </span>
                                <span className="text-sm text-gray-400 uppercase tracking-widest">Acres Monitored</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-bold text-white font-display">
                                    <Counter from={120} to={60} prefix="<" suffix="s" duration={4} />
                                </span>
                                <span className="text-sm text-gray-400 uppercase tracking-widest">Detection Time</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-bold text-white font-display">
                                    <Counter from={0} to={99.9} suffix="%" decimals={1} duration={4} />
                                </span>
                                <span className="text-sm text-gray-400 uppercase tracking-widest">Accuracy Rate</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl font-bold text-white font-display">24/7</span>
                                <span className="text-sm text-gray-400 uppercase tracking-widest">Autonomous Uptime</span>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>
            <div className="w-full bg-background-light dark:bg-[#0f161c] py-8 border-b border-[#e7edf3]/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <FadeIn delay={0.2} direction="up">
                        <p className="mb-6 text-center text-sm font-bold text-primary/70 uppercase tracking-[0.2em] font-display">Trusted by Forestry Services Worldwide</p>
                    </FadeIn>
                    <FadeIn delay={0.4} fullWidth>
                        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 md:gap-16">
                            <div className="flex items-center gap-2 text-xl font-bold dark:text-white font-display"><span className="material-symbols-outlined">public</span> GlobalForest</div>
                            <div className="flex items-center gap-2 text-xl font-bold dark:text-white font-display"><span className="material-symbols-outlined">park</span> EcoGuard</div>
                            <div className="flex items-center gap-2 text-xl font-bold dark:text-white font-display"><span className="material-symbols-outlined">satellite_alt</span> OrbitalView</div>
                            <div className="flex items-center gap-2 text-xl font-bold dark:text-white font-display"><span className="material-symbols-outlined">security</span> SafeLand</div>
                        </div>
                    </FadeIn>
                </div>
            </div>
            <section className="py-20 bg-background-light dark:bg-background-dark">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 md:text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-extrabold text-[#0d141b] dark:text-white sm:text-4xl font-display uppercase">
                            Intelligence at the Edge
                        </h2>
                        <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                            Our autonomous system leverages edge computing to process visual data instantly, detecting threats faster than any human observer or traditional thermal sensor.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <FadeIn delay={0.2} direction="up">
                            <div className="group relative overflow-hidden rounded-2xl border border-[#e7edf3]/20 bg-white dark:bg-[#111921] p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,229,114,0.1)]">
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-[28px]">bolt</span>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-[#0d141b] dark:text-white font-display">Instant Alerts</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Receive precise geolocation data and high-res imagery within 60 seconds of ignition detection.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.4} direction="up">
                            <div className="group relative overflow-hidden rounded-2xl border border-[#e7edf3]/20 bg-white dark:bg-[#111921] p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,229,114,0.1)]">
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-[28px]">filter_alt</span>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-[#0d141b] dark:text-white font-display">Zero False Positives</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Our proprietary neural network distinguishes actual smoke from fog, low clouds, and industrial exhaust.
                                </p>
                            </div>
                        </FadeIn>
                        <FadeIn delay={0.6} direction="up">
                            <div className="group relative overflow-hidden rounded-2xl border border-[#e7edf3]/20 bg-white dark:bg-[#111921] p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,229,114,0.1)]">
                                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-[28px]">visibility</span>
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-[#0d141b] dark:text-white font-display">24/7 Monitoring</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Seamless integration with autonomous drones and satellites for uninterrupted day and night coverage.
                                </p>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-background-light dark:bg-[#0a1014]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl bg-white dark:bg-[#111921] shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10">
                        <div className="grid lg:grid-cols-2">
                            <div className="p-8 lg:p-16 flex flex-col justify-center">
                                <FadeIn delay={0.2} direction="right">
                                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-6 uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-[16px]">memory</span>
                                        Neural Network Technology
                                    </div>
                                    <h2 className="mb-6 text-3xl font-extrabold text-[#0d141b] dark:text-white sm:text-4xl font-display uppercase">
                                        Powered by Deep Learning
                                    </h2>
                                    <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                                        Trained on 5 million hours of forestry footage, our AI model is the most advanced in the industry. It evolves with every detection, learning local terrain patterns and seasonal weather changes to improve accuracy over time.
                                    </p>
                                </FadeIn>
                                <FadeIn delay={0.4} direction="up">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                            <div>
                                                <h4 className="font-bold text-[#0d141b] dark:text-white font-display">Multi-spectral Analysis</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Analyzes thermal, IR, and visual spectrums simultaneously.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined mt-1 text-primary">check_circle</span>
                                            <div>
                                                <h4 className="font-bold text-[#0d141b] dark:text-white font-display">Edge Processing</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Decisions made on-device, not in the cloud, for millisecond latency.</p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                                <FadeIn delay={0.6} direction="up">
                                    <div className="mt-10">
                                        <button className="flex items-center gap-2 text-primary font-bold hover:text-primary/80 uppercase tracking-wide">
                                            Read the Technical Whitepaper <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                </FadeIn>
                            </div>
                            <div className="relative min-h-[400px] bg-[#000] lg:min-h-full">
                                <div
                                    className="absolute inset-0 bg-cover bg-center opacity-80"
                                    data-alt="Digital visualization of a neural network overlaying a forest landscape"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYhrcN_aOnuTKfQIdpDMerPpDcTZ8CwFw8-1MSds3kVMbVgmR9qwQlwEQFA_hdXSsa_1KUyC7tMm4clMS-TWWKkqwbSpk1A-prZPyBWsZl8Lnmn00Uz7uoGxDSJF3kgngPHSdnfUz-sjEf_vjgV_hMr0TDr1J_yeUErot8XIaSGvUfqBD50pGNLUwbAZk1oozQ6_b468z9AzyqjDawI6CqrV_6WqKRlyUdpUbHpf5oK-yibazY97pbIrr7BplHayZBQGRsaTsni2A")' }}
                                >
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111921] to-transparent lg:bg-gradient-to-l"></div>
                                <div className="absolute top-8 left-8 right-8">
                                    <div className="flex justify-between items-center text-xs font-mono text-primary bg-black/50 p-2 rounded border border-primary/30 backdrop-blur-sm">
                                        <span>STATUS: ANALYZING</span>
                                        <span>CONFIDENCE: 99.4%</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-8 left-8">
                                    <div className="bg-black/80 backdrop-blur border border-red-500/50 p-4 rounded-lg max-w-[260px]">
                                        <div className="flex items-center gap-2 text-red-500 mb-2">
                                            <span className="material-symbols-outlined text-[20px] animate-pulse">warning</span>
                                            <span className="text-xs font-bold uppercase tracking-wider font-display">Anomaly Detected</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: "0%" }}
                                                whileInView={{ width: "92%" }}
                                                transition={{ duration: 7, ease: "easeInOut" }}
                                                className="h-full bg-red-500"
                                            />
                                        </div>
                                        <div className="flex justify-between mt-1 text-[10px] text-gray-400 font-mono">
                                            <span>Heat Signature</span>
                                            <span>High</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-20 bg-background-light dark:bg-background-dark overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <FadeIn delay={0.2} direction="up">
                        <h2 className="text-3xl font-extrabold text-[#0d141b] dark:text-white sm:text-4xl mb-4 font-display uppercase">
                            Command Center Visibility
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-500 dark:text-gray-400 mb-12">
                            Manage your entire territory from a single dashboard. Real-time fleet tracking, camera feeds, and weather data in one view.
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.4} fullWidth>
                        <div className="relative mx-auto max-w-5xl rounded-xl border border-[#e7edf3]/20 bg-[#101922] shadow-2xl overflow-hidden aspect-video group">
                            <div
                                className="absolute inset-0 bg-cover bg-center grayscale opacity-60 group-hover:scale-105 transition-transform duration-700"
                                data-alt="Dark mode topographic map interface showing terrain contour lines"
                                data-location="Topographic Map of California"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbXufs-DIdXO3B6S5jURziPkrK1Z3xvc9hrYkiwBNMDLKgHYmzMRqksGwveb-x1OlpBQ68Q5BX3alplvXaQ5YTkV1oULedNRWnlh-NrjwFwcS5vvArv2mFi0SMpQi-ZWwaurIfkt64MqHsWdXdAaF9x5j7Tv6143V4JGm2g2B38U9W_hd0FTL6KukAltW-HCpUHtwo2GtuySQ_GqfYgyZu6GW_EgiIvwURrjgmckil6lk-rFxG9G2_XHl4UfGxT7rcLimTGv6ZSYU")' }}
                            >
                            </div>
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-4 left-4 bottom-4 w-64 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 p-4 hidden sm:flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-white border-b border-white/10 pb-4">
                                        <span className="material-symbols-outlined text-primary">dashboard</span>
                                        <span className="font-bold text-sm font-display uppercase">Main Dashboard</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 rounded bg-white/5 text-xs text-gray-300">
                                            <span>Active Sensors</span>
                                            <span className="text-primary font-bold">428</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-white/5 text-xs text-gray-300">
                                            <span>Drones Airborne</span>
                                            <span className="text-primary font-bold">12</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                                            <span>Active Alerts</span>
                                            <span className="font-bold">1</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="relative">
                                        <div className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping"></div>
                                        <div className="relative h-4 w-4 rounded-full bg-red-500 border-2 border-white shadow-[0_0_20px_rgba(239,68,68,0.8)]"></div>
                                    </div>
                                    <div className="mt-2 bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-red-500/50 whitespace-nowrap font-mono">
                                        Possible Ignition: Sector 7G
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <div className="h-8 w-8 rounded bg-black/80 border border-white/10 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                    </div>
                                    <div className="h-8 w-8 rounded bg-black/80 border border-white/10 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-[16px]">remove</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>
            <section className="relative overflow-hidden py-24">
                <div className="absolute inset-0 bg-primary">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-green-600 to-primary"></div>
                </div>
                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <FadeIn delay={0.2} direction="up">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl font-display uppercase">
                            Ready to secure your perimeter?
                        </h2>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-green-50">
                            Join the network of protected lands. Schedule a live demonstration with our engineering team today.
                        </p>
                    </FadeIn>
                    <FadeIn delay={0.4} direction="up">
                        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                            <input className="h-12 w-full rounded-lg border-0 bg-white px-4 text-[#0d141b] placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 sm:w-80 font-sans" placeholder="Enter your work email" type="email" />
                            <button className="h-12 w-full rounded-lg bg-[#0d141b] px-8 text-base font-bold text-white hover:bg-[#1a2633] transition-colors sm:w-auto uppercase tracking-wide">
                                Get Started
                            </button>
                        </div>
                        <p className="mt-4 text-sm text-green-100/80">
                            No credit card required. Free 14-day on-site pilot available.
                        </p>
                    </FadeIn>
                </div>
            </section>
            <footer className="border-t border-[#e7edf3]/10 bg-background-light dark:bg-[#070b0f] pt-16 pb-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-black">
                                    <span className="material-symbols-outlined text-[16px]">forest</span>
                                </div>
                                <span className="text-lg font-bold text-[#0d141b] dark:text-white font-display">WildfireGuard AI</span>
                            </div>
                            <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
                                Protecting nature through advanced artificial intelligence and real-time monitoring systems.
                            </p>
                        </div>
                        <div>
                            <h4 className="mb-4 text-sm font-bold text-[#0d141b] dark:text-white uppercase tracking-wider">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li><a className="hover:text-primary transition-colors" href="#">Sensors</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Software</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">API</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Drones</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 text-sm font-bold text-[#0d141b] dark:text-white uppercase tracking-wider">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li><a className="hover:text-primary transition-colors" href="#">About</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="mb-4 text-sm font-bold text-[#0d141b] dark:text-white uppercase tracking-wider">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <li><a className="hover:text-primary transition-colors" href="#">Privacy</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Terms</a></li>
                                <li><a className="hover:text-primary transition-colors" href="#">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e7edf3]/10 pt-8 sm:flex-row">
                        <p className="text-xs text-gray-500 dark:text-gray-600">© 2024 WildfireGuard AI Inc. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a className="text-gray-400 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined text-[20px]">thumb_up</span></a>
                            <a className="text-gray-400 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined text-[20px]">share</span></a>
                            <a className="text-gray-400 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined text-[20px]">mail</span></a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
