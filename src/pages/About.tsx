import React from 'react';
import { Info, ShieldAlert, Flame, ArrowRight, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-page-enter font-sans">
            {/* Header Banner */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Info className="w-3.5 h-3.5" />
                    ABOUT PATCHPILOT AI
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    AI Vulnerability Prioritizer for Lean IT Teams
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                    Know what to patch before attackers do — based on real-world risk, CISA KEV exploitation telemetry, and organization context.
                </p>
            </div>

            {/* Key Insight Box */}
            <div className="bg-white border-2 border-red-200 rounded-2xl p-6 sm:p-8 text-center shadow-xs space-y-3">
                <span className="text-xs font-mono font-bold text-red-700 uppercase tracking-widest block">
                    CORE VALUE PROPOSITION
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    "The most severe vulnerability is not always the most urgent vulnerability."
                </h2>
                <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed font-sans">
                    CVSS 9.8 vulnerabilities sitting on unexposed internal staging servers without active exploits do not demand fire-drills. CVSS 7.5 vulnerabilities actively exploited in the wild against internet-facing production infrastructure demand immediate 24-hour remediation.
                </p>
            </div>

            {/* 3 Core Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pillar 1: Problem */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs hover-card">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-xs">
                        <ShieldAlert className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">The Challenge</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        Lean IT and SOC teams face hundreds of CVE vulnerabilities every month but have limited engineering bandwidth to remediate everything immediately.
                    </p>
                </div>

                {/* Pillar 2: Limitation */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs hover-card">
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700 shadow-xs">
                        <Flame className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">CVSS Limitations</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        CVSS measures theoretical severity, but severity alone does not tell an IT team which vulnerability requires immediate action versus routine maintenance.
                    </p>
                </div>

                {/* Pillar 3: Solution */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs hover-card">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs">
                        <Zap className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">PatchPilot AI</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        Combines CVSS, NVD telemetry, CISA KEV weaponization data, and organization context into an explainable 0–100 risk score and Random Forest ML prediction.
                    </p>
                </div>
            </div>

            {/* Scoring Engine Formula Breakdown Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-mono">
                    <Target className="w-5 h-5 text-blue-600" />
                    Risk Scoring Engine Architecture (Explainable 0–100 Formula)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-blue-700 font-bold block">30% CVSS Severity</span>
                        <span className="text-slate-500 text-[10px]">Normalized score × 10</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-red-700 font-bold block">35% CISA KEV</span>
                        <span className="text-slate-500 text-[10px]">Active wild exploitation</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-orange-700 font-bold block">15% Exposure</span>
                        <span className="text-slate-500 text-[10px]">Internet-facing vs Internal</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-purple-700 font-bold block">15% Criticality</span>
                        <span className="text-slate-500 text-[10px]">Critical / High / Med / Low</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="text-emerald-700 font-bold block">5% Exploit Code</span>
                        <span className="text-slate-500 text-[10px]">Public PoC availability</span>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono leading-relaxed overflow-x-auto">
                    <code>
                        riskScore = Math.round((cvss * 3) + (knownExploited ? 35 : 0) + (internetExposed ? 15 : 4.5) + (assetCriticalityScore * 0.15) + (exploitAvailable ? 5 : 0))
                    </code>
                </div>
            </div>

            {/* CTA Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div>
                    <h4 className="text-base font-bold text-white">Ready to prioritize your patch queue?</h4>
                    <p className="text-xs text-slate-300">Explore active vulnerabilities on the security dashboard.</p>
                </div>
                <Link
                    to="/"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all font-mono"
                >
                    <span>Launch Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
};

export default About;
