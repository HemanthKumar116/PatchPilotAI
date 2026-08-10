import React from 'react';
import { Info, ShieldAlert, Flame, ArrowRight, Zap, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-page-enter font-sans">
            {/* Header Banner */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-black bg-white text-black border-2 border-white shadow-md">
                    <Info className="w-3.5 h-3.5 text-black" />
                    ABOUT PATCHPILOT AI
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white tracking-tight drop-shadow-md">
                    AI Vulnerability Prioritizer for Lean IT Teams
                </h1>
                <p className="text-xs sm:text-sm font-mono text-zinc-200 max-w-2xl mx-auto">
                    Know what to patch before attackers do — based on real-world risk, CISA KEV exploitation telemetry, and organization context.
                </p>
            </div>

            {/* Key Insight Box (Solid Pure Black Card) */}
            <div className="card-plum p-8 sm:p-10 text-center space-y-4 border-2 border-black shadow-2xl relative overflow-hidden">
                <span className="text-xs font-mono font-black text-zinc-400 uppercase tracking-widest block">
                    ⚡ CORE VALUE PROPOSITION
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight max-w-3xl mx-auto leading-tight">
                    "The most severe vulnerability is not always the most urgent vulnerability."
                </h2>
                <p className="text-xs font-mono text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                    CVSS 9.8 vulnerabilities sitting on unexposed internal staging servers without active exploits do not demand fire-drills. CVSS 7.5 vulnerabilities actively exploited in the wild against internet-facing production infrastructure demand immediate 24-hour remediation.
                </p>
            </div>

            {/* 3 Core Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pillar 1: Problem */}
                <div className="card-maximalist p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 border-2 border-black flex items-center justify-center text-black">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="font-extrabold font-display text-black text-lg">The Challenge</h3>
                    <p className="text-xs font-mono text-zinc-600 leading-relaxed">
                        Lean IT and SOC teams face hundreds of CVE vulnerabilities every month but have limited engineering bandwidth to remediate everything immediately.
                    </p>
                </div>

                {/* Pillar 2: Limitation */}
                <div className="card-maximalist p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 border-2 border-black flex items-center justify-center text-black">
                        <Flame className="w-6 h-6 fill-black" />
                    </div>
                    <h3 className="font-extrabold font-display text-black text-lg">CVSS Limitations</h3>
                    <p className="text-xs font-mono text-zinc-600 leading-relaxed">
                        CVSS measures theoretical severity, but severity alone does not tell an IT team which vulnerability requires immediate action versus routine maintenance.
                    </p>
                </div>

                {/* Pillar 3: Solution */}
                <div className="card-maximalist p-6 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-black text-white border-2 border-black flex items-center justify-center">
                        <Zap className="w-6 h-6 fill-white" />
                    </div>
                    <h3 className="font-extrabold font-display text-black text-lg">PatchPilot AI</h3>
                    <p className="text-xs font-mono text-zinc-600 leading-relaxed">
                        Combines CVSS, NVD telemetry, CISA KEV weaponization data, and organization context into an explainable 0–100 risk score and Random Forest ML prediction.
                    </p>
                </div>
            </div>

            {/* Scoring Engine Formula Breakdown Card */}
            <div className="card-maximalist p-6 sm:p-8 space-y-5">
                <h3 className="text-lg font-extrabold text-black flex items-center gap-2 font-display">
                    <Target className="w-6 h-6 text-black" />
                    Risk Scoring Engine Architecture (Explainable 0–100 Formula)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono text-xs">
                    <div className="bg-zinc-50 p-3.5 rounded-2xl border-2 border-black text-center">
                        <span className="text-black font-black block text-sm">30% CVSS</span>
                        <span className="text-zinc-500 text-[10px]">Severity × 3</span>
                    </div>
                    <div className="bg-black text-white p-3.5 rounded-2xl border-2 border-black text-center">
                        <span className="text-white font-black block text-sm">+35 pts KEV</span>
                        <span className="text-zinc-400 text-[10px]">Wild exploitation</span>
                    </div>
                    <div className="bg-zinc-100 p-3.5 rounded-2xl border-2 border-black text-center">
                        <span className="text-black font-black block text-sm">+15 pts Net</span>
                        <span className="text-zinc-500 text-[10px]">Internet exposed</span>
                    </div>
                    <div className="bg-zinc-50 p-3.5 rounded-2xl border-2 border-black text-center">
                        <span className="text-black font-black block text-sm">15% Asset</span>
                        <span className="text-zinc-500 text-[10px]">Criticality weight</span>
                    </div>
                    <div className="bg-zinc-100 p-3.5 rounded-2xl border-2 border-black text-center">
                        <span className="text-black font-black block text-sm">+5 pts PoC</span>
                        <span className="text-zinc-500 text-[10px]">Public exploit</span>
                    </div>
                </div>

                <div className="bg-black text-white p-4 rounded-2xl border-2 border-black text-xs font-mono leading-relaxed overflow-x-auto">
                    <code className="text-zinc-200">
                        riskScore = Math.round((cvss * 3) + (knownExploited ? 35 : 0) + (internetExposed ? 15 : 4.5) + (assetCriticalityScore * 0.15) + (exploitAvailable ? 5 : 0))
                    </code>
                </div>
            </div>

            {/* CTA Box */}
            <div className="card-plum p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl border-2 border-black">
                <div>
                    <h4 className="text-2xl font-extrabold font-display text-white">Ready to prioritize your patch queue?</h4>
                    <p className="text-xs font-mono text-zinc-400">Explore active vulnerabilities on the security dashboard.</p>
                </div>
                <Link
                    to="/"
                    className="px-6 py-3 rounded-full bg-white text-black font-mono font-black text-xs hover:bg-zinc-200 transition-all flex items-center gap-2 shrink-0 shadow-brutalist"
                >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                </Link>
            </div>
        </div>
    );
};

export default About;
