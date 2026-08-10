import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Header } from './Header';
import { VulnerabilityModal } from './VulnerabilityModal';
import { CsvImportModal } from './CsvImportModal';
import { useVulnerability } from '../context/VulnerabilityContext';

export const Layout: React.FC = () => {
    const { selectedVulnModal, setSelectedVulnModal } = useVulnerability();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Left Sidebar Navigation */}
            <Navbar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
                <Header onMenuToggle={() => setIsSidebarOpen(true)} />
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <Outlet />
                </main>
                <footer className="border-t border-slate-200 bg-white py-5 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-mono">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                        <div>
                            <span className="font-bold text-slate-800 font-sans">🛡️ PatchPilot AI</span> — Know what to patch before attackers do.
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Enterprise Cybersecurity Vulnerability Prioritizer • NVD & CISA KEV Intelligence
                        </div>
                    </div>
                </footer>
            </div>

            {/* Global Sliding Details Panel & CSV Modal */}
            <VulnerabilityModal vuln={selectedVulnModal} onClose={() => setSelectedVulnModal(null)} />
            <CsvImportModal />
        </div>
    );
};

export default Layout;
