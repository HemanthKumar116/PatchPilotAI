import React, { useState } from 'react';
import { RefreshCw, Upload, Search, Database, AlertTriangle, Sparkles, Menu, X } from 'lucide-react';
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
        reloadDemoData,
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

    const formatLastUpdate = (isoString: string | null) => {
        if (!isoString) return 'Just now';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Just now';
        }
    };

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left Title & Status Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {/* Mobile Hamburger Menu Toggle */}
                        {onMenuToggle && (
                            <button
                                onClick={onMenuToggle}
                                className="md:hidden p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
                                aria-label="Toggle navigation menu"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        )}

                        <div>
                            <div className="flex items-center space-x-2.5">
                                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 font-sans">
                                    PatchPilot <span className="text-blue-600 font-mono">AI</span>
                                </h1>

                                {/* Status Badge */}
                                {intelStatus.mode === 'LIVE' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        🟢 SYSTEM ONLINE
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                        🟡 DEMO DATA
                                    </span>
                                )}

                                <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
                                    Updated: {formatLastUpdate(intelStatus.lastUpdated)}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-sans mt-0.5">
                                Know what to patch before attackers do.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Action buttons & CVE Search */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Direct CVE Lookup Input */}
                    <form onSubmit={handleLookupSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Search CVE (e.g. CVE-2024-3094)"
                            value={lookupInput}
                            onChange={(e) => setLookupInput(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-16 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono uppercase w-56 sm:w-64 shadow-xs"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        {lookupInput && (
                            <button
                                type="button"
                                onClick={() => setLookupInput('')}
                                className="absolute right-12 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={lookupLoading || !lookupInput.trim()}
                            className="absolute right-1 px-2.5 py-1 text-[10px] bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded font-mono font-bold disabled:opacity-40 transition-all shadow-xs"
                        >
                            {lookupLoading ? '...' : 'Lookup'}
                        </button>
                    </form>

                    {/* Threat Intelligence Sync */}
                    <button
                        onClick={refreshThreatIntelligence}
                        disabled={isRefreshingIntel}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all shadow-xs disabled:opacity-50"
                        title="Fetch latest NVD & CISA KEV catalog and recalculate scores"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingIntel ? 'animate-spin text-blue-600' : ''}`} />
                        <span className="hidden sm:inline">{isRefreshingIntel ? 'Syncing...' : 'Sync Intel'}</span>
                    </button>

                    {/* Import CSV Button */}
                    <button
                        onClick={() => setIsCsvModalOpen(true)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono bg-slate-900 hover:bg-slate-800 text-white shadow-xs active:scale-95 transition-all"
                    >
                        <Upload className="w-3.5 h-3.5 text-blue-400" />
                        <span>Import</span>
                    </button>

                    {/* Reload Demo Data Button */}
                    <button
                        onClick={reloadDemoData}
                        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all shadow-xs"
                        title="Reset dataset back to default demo records"
                    >
                        <Database className="w-3 h-3 text-slate-400" />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                </div>
            </div>

            {/* Lookup feedback message banner */}
            {lookupMessage && (
                <div className="max-w-7xl mx-auto mt-3 animate-page-enter">
                    <div
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between border ${lookupMessage.isError
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            {lookupMessage.isError ? (
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {lookupMessage.text}
                        </span>
                        <button
                            onClick={() => setLookupMessage(null)}
                            className="text-slate-400 hover:text-slate-600 font-sans text-xs ml-4"
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
