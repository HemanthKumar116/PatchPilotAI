import React, { useState, useRef, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Header } from './Header';
import { VulnerabilityModal } from './VulnerabilityModal';
import { CsvImportModal } from './CsvImportModal';
import { useVulnerability } from '../context/VulnerabilityContext';

export const Layout: React.FC = () => {
    const { selectedVulnModal, setSelectedVulnModal } = useVulnerability();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.log('Autoplay handled:', err);
                });
            }
        }
    }, []);

    return (
        <div className="min-h-screen reference-ambient-bg text-black flex flex-col font-sans selection:bg-[#A64B1D] selection:text-white relative overflow-x-clip">
            {/* Fullscreen Video Background with ambient fallback */}
            <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    onLoadedData={() => {
                        if (videoRef.current) {
                            videoRef.current.play().catch(() => {});
                        }
                    }}
                    className="w-full h-full object-cover opacity-90"
                >
                    <source src="/background.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Mobile Navigation Drawer */}
            <Navbar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Floating Reference Gradient Navbar (Sticky) */}
            <Header onMenuToggle={() => setIsSidebarOpen(true)} />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-10 py-2 sm:py-4 relative z-10">
                <Outlet />
            </main>

            {/* Reference Style Dark Footer */}
            <footer className="mt-12 border-t-2 border-white/10 bg-black/70 backdrop-blur-md py-6 px-3 sm:px-6 lg:px-10 text-xs text-zinc-400 font-mono relative z-10">
                <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <span className="font-display font-black text-white text-sm">PatchPilot AI</span>
                        <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full font-bold">CYBER TELEMETRY</span>
                        <span>— Know what to patch before attackers do!</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-bold">
                        Vulnerability Intelligence • CISA KEV • NIST NVD 2.0 • Random Forest
                    </div>
                </div>
            </footer>

            {/* Modals */}
            <VulnerabilityModal vuln={selectedVulnModal} onClose={() => setSelectedVulnModal(null)} />
            <CsvImportModal />
        </div>
    );
};

export default Layout;
