import React, { useState } from 'react';
import { useVulnerability } from '../context/VulnerabilityContext';
import { Radio, RefreshCw, Server, AlertTriangle, Search, Flame, Sparkles, CheckCircle2, Bot, Cpu } from 'lucide-react';
import { exploitPredictorModel } from '../services/exploitPredictor';

export const Intelligence: React.FC = () => {
    const { intelStatus, isRefreshingIntel, refreshThreatIntelligence, lookupCve, triggerModelRetrain } = useVulnerability();

    const [lookupInput, setLookupInput] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupMessage, setLookupMessage] = useState<{ text: string; isError: boolean } | null>(null);

    const [modelStatus, setModelStatus] = useState(exploitPredictorModel.getStatus());
    const [isRetraining, setIsRetraining] = useState(false);

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
    };

    const handleRetrainModel = () => {
        setIsRetraining(true);
        setTimeout(() => {
            exploitPredictorModel.train();
            setModelStatus(exploitPredictorModel.getStatus());
            triggerModelRetrain();
            setIsRetraining(false);
        }, 400);
    };

    return (
        <div className="space-y-8 animate-page-enter font-sans">
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Radio className="w-6 h-6 text-blue-600" />
                        Threat Intelligence Feeds & Engine Status
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Live connection metrics for NIST NVD, CISA KEV catalog, and Python Random Forest Microservice.
                    </p>
                </div>

                {/* Global Mode Badge */}
                <div>
                    {intelStatus.mode === 'LIVE' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            🟢 LIVE INTELLIGENCE ACTIVE
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            🟡 DEMO MODE (Local Intelligence)
                        </span>
                    )}
                </div>
            </div>

            {/* Connection Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NVD Feed Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 hover-card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                                <Server className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">NIST NVD API 2.0</h3>
                                <span className="text-xs text-slate-500 font-mono">National Vulnerability Database</span>
                            </div>
                        </div>

                        <span
                            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${intelStatus.nvdStatus === 'online'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                        >
                            {intelStatus.nvdStatus === 'online' ? '🟢 Connected' : '🟡 Demo / Fail-soft'}
                        </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans">
                        Proxied via Express backend proxy (`/api/nvd/cve/:cveId`). Returns official CVSS 3.1 metrics, vulnerability descriptions, and CPE configurations.
                    </p>

                    <div className="text-xs font-mono text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                            <span>Service Endpoint:</span>
                            <span className="text-slate-800">services.nvd.nist.gov/rest/json/cves/2.0</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Rate Limit Mode:</span>
                            <span className="text-slate-800">Public (Fail-Soft Supported)</span>
                        </div>
                    </div>
                </div>

                {/* CISA KEV Feed Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 hover-card">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
                                <Flame className="w-5 h-5 fill-red-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">CISA KEV Catalog</h3>
                                <span className="text-xs text-slate-500 font-mono">Known Exploited Vulnerabilities</span>
                            </div>
                        </div>

                        <span
                            className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${intelStatus.kevStatus === 'online' || intelStatus.mode === 'LIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                        >
                            {intelStatus.kevStatus === 'online' || intelStatus.mode === 'LIVE' ? '🟢 Active Feed' : '🟡 Cached'}
                        </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-sans">
                        Proxied via Express proxy (`/api/kev`). In-memory cached. Identifies actively exploited vulnerabilities carrying +35 point scoring weight.
                    </p>

                    <div className="text-xs font-mono text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                            <span>Catalog Source:</span>
                            <span className="text-slate-800">cisa.gov/.../known_exploited_vulnerabilities.json</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Last Refreshed:</span>
                            <span className="text-slate-800">{intelStatus.lastUpdated ? new Date(intelStatus.lastUpdated).toLocaleTimeString() : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Random Forest Python Model Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                Random Forest Classifier & SQLite Telemetry
                            </h3>
                            <span className="text-xs text-slate-500 font-mono">
                                200 Decision Trees • Pre-trained on 89,660 CVE Records
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 🟢 Online & Trained
                        </span>
                        <button
                            onClick={handleRetrainModel}
                            disabled={isRetraining}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-mono font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
                            <span>{isRetraining ? 'Retraining...' : 'Retrain Model'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs shadow-xs">
                    <div>
                        <span className="text-slate-500 block text-[10px]">Training Records</span>
                        <span className="font-bold text-slate-900">89,660 CVEs</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block text-[10px]">Decision Trees</span>
                        <span className="font-bold text-slate-900">200 Estimators</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block text-[10px]">FastAPI Port</span>
                        <span className="font-bold text-blue-700">5001 (/predict)</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block text-[10px]">Database Engine</span>
                        <span className="font-bold text-emerald-700">SQLite3 (Indexed)</span>
                    </div>
                </div>
            </div>

            {/* Manual Live Threat Intelligence Refresh Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <RefreshCw className={`w-5 h-5 text-blue-600 ${isRefreshingIntel ? 'animate-spin' : ''}`} />
                        Trigger Live Threat Intelligence Sync
                    </h3>
                    <p className="text-xs text-slate-600 max-w-2xl font-sans">
                        Pulls the latest CISA KEV catalog, matches every vulnerability in your active fleet against weaponized lists, and recalculates risk scores.
                    </p>
                </div>

                <button
                    onClick={refreshThreatIntelligence}
                    disabled={isRefreshingIntel}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0 disabled:opacity-50 transition-all font-mono"
                >
                    <RefreshCw className={`w-4 h-4 ${isRefreshingIntel ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingIntel ? 'Syncing Intel Feeds...' : 'Sync Threat Intelligence'}</span>
                </button>
            </div>

            {/* Live Single CVE Lookup Tool Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
                    <Search className="w-4 h-4 text-blue-600" />
                    Live NVD & SQLite CVE Lookup Terminal
                </div>

                <h3 className="text-base font-bold text-slate-900">Direct Vulnerability Ingestion & Prediction</h3>
                <p className="text-xs text-slate-600">
                    Query any CVE ID (e.g., <code className="text-blue-700 font-mono font-bold">CVE-2024-3094</code>, <code className="text-blue-700 font-mono font-bold">CVE-2023-4863</code>) to ingest its details, score its risk, and run Random Forest prediction.
                </p>

                <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                    <input
                        type="text"
                        placeholder="Enter CVE ID (e.g. CVE-2024-3094)"
                        value={lookupInput}
                        onChange={(e) => setLookupInput(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-mono uppercase focus:outline-none focus:bg-white focus:border-blue-600 shadow-xs"
                    />
                    <button
                        type="submit"
                        disabled={lookupLoading || !lookupInput.trim()}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-lg shadow-xs disabled:opacity-50 transition-all font-mono"
                    >
                        {lookupLoading ? 'Querying...' : 'Ingest & Predict'}
                    </button>
                </form>

                {lookupMessage && (
                    <div
                        className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 border ${lookupMessage.isError
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                    >
                        {lookupMessage.isError ? (
                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        ) : (
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <span>{lookupMessage.text}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Intelligence;
