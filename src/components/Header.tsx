import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { RefreshCw, Upload, Search, Database, AlertTriangle, Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';
import { useVulnerability } from '../context/VulnerabilityContext';

interface Props {
    onMenuToggle?: () => void;
}

export const Header: React.FC<Props> = ({ onMenuToggle }) => {
    const {
        intelStatus,
        isRefreshingIntel,
        refreshThreatIntelligence,
        setIsCsvModalOpen,
        lookupCve,
    } = useVulnerability();

    const [lookupInput, setLookupInput] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupMessage, setLookupMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const handleLookupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!lookupInput.trim()) return;

        setLookupLoading(true);
        setLookupMessage(null);

        const res = await lookupCve(lookupInput.trim());
        setLookupLoading(false);

        setLookupMessage({
            text: res.message,
            isError: !res.success,
        });

        if (res.success) {
            setLookupInput('');
        }
        setTimeout(() => setLookupMessage(null), 6000);
    };

    const navLinks = [
        { to: '/', label: 'Dashboard' },
        { to: '/vulnerabilities', label: 'Vulnerabilities' },
        { to: '/patch-queue', label: 'Patch Queue' },
        { to: '/intelligence', label: 'Intelligence' },
        { to: '/ai-model', label: 'AI Model' },
        { to: '/about', label: 'About' },
    ];

    return (
        <header className="sticky top-3 z-50 px-3 sm:px-6 lg:px-10 max-w-[1700px] mx-auto w-full mb-6">
            {/* Exact Reference Navbar: Purple-to-Terracotta Gradient Rounded Rectangle (No Border, Sticky Float) */}
            <div className="w-full navbar-gradient backdrop-blur-md text-white rounded-2xl px-6 py-3.5 flex items-center justify-between gap-4 shadow-2xl transition-all">
                {/* Brand / Logo */}
                <div className="flex items-center gap-3">
                    {onMenuToggle && (
                        <button
                            onClick={onMenuToggle}
                            className="md:hidden p-1.5 rounded-xl bg-black/25 text-white hover:bg-black/40 transition-colors"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                    )}
                    <NavLink to="/" className="flex items-center gap-2 group">
                        <span className="font-display font-black text-lg sm:text-xl tracking-tight text-white drop-shadow-xs">
                            PatchPilot...
                        </span>
                        <span className="bg-black/35 text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full border border-white/20">
                            AI
                        </span>
                    </NavLink>
                </div>

                {/* Horizontal Navigation Links */}
                <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-bold">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === '/'}
                            className={({ isActive }) =>
                                `transition-all hover:underline underline-offset-4 decoration-2 ${isActive ? 'underline font-black decoration-white text-white' : 'text-white/85 hover:text-white'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Search & Actions */}
                <div className="flex items-center gap-2.5">
                    {/* Quick Search */}
                    <form onSubmit={handleLookupSubmit} className="relative hidden sm:flex items-center">
                        <input
                            type="text"
                            placeholder="CVE ID..."
                            value={lookupInput}
                            onChange={(e) => setLookupInput(e.target.value)}
                            className="bg-black/25 rounded-full pl-8 pr-14 py-1.5 text-xs text-white placeholder-white/60 font-mono focus:outline-none focus:bg-black/40 w-36 sm:w-48 transition-all"
                        />
                        <Search className="w-3.5 h-3.5 text-white/70 absolute left-2.5 top-2.5" />
                        <button
                            type="submit"
                            disabled={lookupLoading || !lookupInput.trim()}
                            className="absolute right-1 px-2.5 py-0.5 text-[10px] bg-black/40 text-white hover:bg-black/60 rounded-full font-mono font-bold transition-all disabled:opacity-40"
                        >
                            {lookupLoading ? '...' : 'Go'}
                        </button>
                    </form>

                    {/* Threat Intel Sync */}
                    <button
                        onClick={refreshThreatIntelligence}
                        disabled={isRefreshingIntel}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-black/25 text-white hover:bg-black/40 active:scale-95 transition-all"
                        title="Sync NVD & CISA KEV Intelligence"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingIntel ? 'animate-spin' : ''}`} />
                        <span className="hidden xl:inline">{isRefreshingIntel ? 'Syncing...' : 'Sync'}</span>
                    </button>

                    {/* Import CSV CTA */}
                    <button
                        onClick={() => setIsCsvModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-black bg-white text-black hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all shadow-md"
                    >
                        <Upload className="w-3.5 h-3.5 text-black" />
                        <span>Import</span>
                    </button>
                </div>
            </div>

            {/* Lookup feedback message banner */}
            {lookupMessage && (
                <div className="mt-3 animate-page-enter">
                    <div
                        className={`px-4 py-2.5 rounded-2xl text-xs font-mono flex items-center justify-between border-2 shadow-brutalist ${lookupMessage.isError
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-black'
                            }`}
                    >
                        <span className="flex items-center gap-2 font-bold">
                            {lookupMessage.isError ? (
                                <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-black shrink-0" />
                            )}
                            {lookupMessage.text}
                        </span>
                        <button
                            onClick={() => setLookupMessage(null)}
                            className="text-black hover:text-zinc-600 font-mono text-xs font-bold ml-4"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
