import React from 'react';
import { useVulnerability, EvaluatedVulnerability } from '../context/VulnerabilityContext';
import { ListOrdered, Flame, Globe, Building2, ArrowRight, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export const PatchQueue: React.FC = () => {
    const { vulnerabilities, fleetStats, setSelectedVulnModal } = useVulnerability();

    // Group vulnerabilities by priority
    const criticalList = vulnerabilities
        .filter((v) => v.analysis.priority === 'CRITICAL')
        .sort((a, b) => b.analysis.riskScore - a.analysis.riskScore);

    const highList = vulnerabilities
        .filter((v) => v.analysis.priority === 'HIGH')
        .sort((a, b) => b.analysis.riskScore - a.analysis.riskScore);

    const mediumList = vulnerabilities
        .filter((v) => v.analysis.priority === 'MEDIUM')
        .sort((a, b) => b.analysis.riskScore - a.analysis.riskScore);

    const lowList = vulnerabilities
        .filter((v) => v.analysis.priority === 'LOW')
        .sort((a, b) => b.analysis.riskScore - a.analysis.riskScore);

    const renderSection = (
        title: string,
        badgeColor: string,
        borderColor: string,
        items: EvaluatedVulnerability[],
        emptyMessage: string,
        fleetCount?: number
    ) => {
        const displayTotal = fleetCount || items.length;

        return (
            <div className={`bg-white border ${borderColor} rounded-2xl p-5 sm:p-6 shadow-xs space-y-4`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                        <span className={`w-3 h-3 rounded-full ${badgeColor}`} />
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight font-mono">{title}</h2>
                    </div>
                    <span className="text-xs font-mono font-bold bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-slate-700 shadow-xs">
                        {displayTotal.toLocaleString()} {displayTotal === 1 ? 'Vulnerability' : 'Vulnerabilities'}
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        {emptyMessage}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((v) => {
                            const { analysis } = v;

                            return (
                                <div
                                    key={v.id}
                                    onClick={() => setSelectedVulnModal(v)}
                                    className="bg-slate-50/70 border border-slate-200 hover:border-blue-400 p-4 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all group shadow-xs hover:bg-white"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono font-bold text-blue-700 text-sm group-hover:text-blue-900 transition-colors">
                                                    {v.cveId}
                                                </span>
                                                <span className="text-xs font-bold text-slate-800">{v.title}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{v.affectedProduct}</div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="px-3 py-1 rounded-lg text-xs font-mono font-black bg-white border border-slate-200 text-slate-900 shadow-xs">
                                                Risk: {analysis.riskScore}/100
                                            </span>
                                        </div>
                                    </div>

                                    {/* Why Prioritized Line */}
                                    <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200 mb-3 leading-relaxed">
                                        "{analysis.explanation}"
                                    </p>

                                    {/* Action & Metadata Footer */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-slate-200">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {v.knownExploited && (
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                                                    <Flame className="w-3 h-3 text-red-600 fill-red-600" /> Known Exploited
                                                </span>
                                            )}
                                            {v.internetExposed && (
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-medium">
                                                    <Globe className="w-3 h-3" /> Internet
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 font-medium">
                                                <Building2 className="w-3 h-3" /> {v.assetCriticality} Asset
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" /> {analysis.recommendedTimeline}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedVulnModal(v);
                                                }}
                                                className="px-3 py-1 bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
                                            >
                                                Breakdown <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-page-enter font-sans">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2 drop-shadow-md font-display">
                    <ListOrdered className="w-7 h-7 text-white" />
                    Patch Queue & Remediation Roadmap
                </h1>
                <p className="text-xs text-zinc-200 font-medium font-mono mt-1">
                    Prioritized patching schedule organized by urgency band. Fix critical exposures within 24 hours.
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
                {renderSection('🔴 PATCH NOW (Within 24 Hours - Score 90–100)', 'bg-red-600', 'border-red-200', criticalList, 'No vulnerabilities currently in Critical Patch Now tier.', fleetStats.criticalCount)}
                {renderSection('🟠 PATCH WITHIN 7 DAYS (High Urgency - Score 75–89)', 'bg-orange-500', 'border-orange-200', highList, 'No vulnerabilities currently in High 7-Day tier.', fleetStats.highCount)}
                {renderSection('🟡 PATCH THIS MONTH (Standard Batch - Score 50–74)', 'bg-amber-500', 'border-amber-200', mediumList, 'No vulnerabilities currently in Medium 30-Day tier.', fleetStats.mediumCount)}
                {renderSection('🟢 MONITOR (Low Risk - Score 0–49)', 'bg-emerald-600', 'border-emerald-200', lowList, 'No vulnerabilities currently in Low Monitor tier.', fleetStats.lowCount)}
            </div>
        </div>
    );
};

export default PatchQueue;
