import React from 'react';
import { useVulnerability } from '../context/VulnerabilityContext';
import { ShieldAlert, Flame, Globe, Building2, AlertTriangle, ArrowRight, Activity, TrendingUp, Cpu, Radar, Bot, Sparkles } from 'lucide-react';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { RiskScatterChart } from '../components/charts/RiskScatterChart';
import { RiskDistributionChart } from '../components/charts/RiskDistributionChart';
import { KevPieChart } from '../components/charts/KevPieChart';
import { PriorityBarChart } from '../components/charts/PriorityBarChart';

export const Dashboard: React.FC = () => {
    const { vulnerabilities, fleetStats, setSelectedVulnModal } = useVulnerability();

    // Fleet Metrics from dataset
    const totalCount = fleetStats.totalCount || vulnerabilities.length;
    const criticalCount = fleetStats.criticalCount || vulnerabilities.filter((v) => v.analysis.priority === 'CRITICAL').length;
    const highCount = fleetStats.highCount || vulnerabilities.filter((v) => v.analysis.priority === 'HIGH').length;
    const knownExploitedCount = fleetStats.knownExploitedCount || vulnerabilities.filter((v) => v.knownExploited).length;
    const patchNowCount = fleetStats.patchNowCount || criticalCount;
    const avgRiskScore = fleetStats.avgRiskScore || 78;

    // Highest risk vulnerability for "WHAT SHOULD I PATCH NOW?" card
    const topVuln = [...vulnerabilities].sort((a, b) => b.analysis.riskScore - a.analysis.riskScore)[0];

    // Section 7 comparison pair lookup (Vulnerability A & Vulnerability B)
    const vulnB = vulnerabilities.find((v) => v.cveId === 'CVE-2024-3094') || topVuln;
    const vulnA = vulnerabilities.find((v) => v.cveId === 'CVE-2024-8891') || vulnerabilities.find((v) => v.cvss >= 9.5 && !v.knownExploited);

    return (
        <div className="space-y-8 animate-page-enter font-sans">
            {/* 1. Header Section */}
            <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs cyber-grid-light">
                <div className="radar-scan-line-light" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Radar className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '8s' }} />
                            CYBERSECURITY INTELLIGENCE COMMAND
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Vulnerability Intelligence
                        </h1>
                        <p className="text-sm text-slate-600 max-w-xl font-normal">
                            Prioritize vulnerabilities using machine learning and real-world security context.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <span className="text-slate-500">SOC DECISION ENGINE:</span>
                            <span className="font-bold text-blue-700">ACTIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* KPI 1: Total CVEs */}
                <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-xs hover-card group">
                    <div className="flex items-center justify-between text-slate-500 mb-2 font-mono">
                        <span className="text-xs font-semibold tracking-wider text-slate-600 uppercase">TOTAL CVES</span>
                        <Activity className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                        <AnimatedNumber value={totalCount} />
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Monitored Fleet</span>
                </div>

                {/* KPI 2: Critical */}
                <div className="bg-white border border-slate-200 hover:border-red-400 rounded-xl p-4 shadow-xs hover-card group">
                    <div className="flex items-center justify-between text-slate-500 mb-2 font-mono">
                        <span className="text-xs font-semibold tracking-wider text-red-600 uppercase">CRITICAL</span>
                        <ShieldAlert className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-black text-red-600 font-mono tracking-tight">
                        <AnimatedNumber value={criticalCount} />
                    </div>
                    <span className="text-[11px] text-red-600/80 font-mono">Risk score 90–100</span>
                </div>

                {/* KPI 3: High Risk */}
                <div className="bg-white border border-slate-200 hover:border-orange-400 rounded-xl p-4 shadow-xs hover-card group">
                    <div className="flex items-center justify-between text-slate-500 mb-2 font-mono">
                        <span className="text-xs font-semibold tracking-wider text-orange-600 uppercase">HIGH RISK</span>
                        <TrendingUp className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-black text-orange-600 font-mono tracking-tight">
                        <AnimatedNumber value={highCount} />
                    </div>
                    <span className="text-[11px] text-orange-600/80 font-mono">Risk score 75–89</span>
                </div>

                {/* KPI 4: Known Exploited */}
                <div className="bg-white border border-slate-200 hover:border-red-400 rounded-xl p-4 shadow-xs hover-card group">
                    <div className="flex items-center justify-between text-slate-500 mb-2 font-mono">
                        <span className="text-xs font-semibold tracking-wider text-amber-700 uppercase">KNOWN EXPLOITED</span>
                        <Flame className="w-4 h-4 text-red-600 fill-red-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-black text-amber-600 font-mono tracking-tight">
                        <AnimatedNumber value={knownExploitedCount} />
                    </div>
                    <span className="text-[11px] text-amber-700/80 font-mono">Listed in CISA KEV</span>
                </div>

                {/* KPI 5: Patch Now / Avg Risk */}
                <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-xs hover-card group">
                    <div className="flex items-center justify-between text-slate-500 mb-2 font-mono">
                        <span className="text-xs font-semibold tracking-wider text-blue-700 uppercase">PATCH NOW</span>
                        <Cpu className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-3xl font-black text-blue-700 font-mono tracking-tight flex items-baseline gap-1">
                        <AnimatedNumber value={patchNowCount} />
                        <span className="text-xs text-slate-400 font-normal">Immediate</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Avg Fleet: {avgRiskScore}/100</span>
                </div>
            </div>

            {/* 3. Hero Card: "WHAT SHOULD I PATCH NOW?" */}
            {topVuln && (
                <div className="relative overflow-hidden bg-white border-2 border-red-200 rounded-2xl p-6 sm:p-8 shadow-md hover:border-red-300 transition-all duration-300">
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-4 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                                <Flame className="w-4 h-4 fill-red-600 text-red-600" />
                                WHAT SHOULD I PATCH NOW?
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
                                        {topVuln.cveId}
                                    </h2>
                                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-extrabold bg-red-600 text-white shadow-xs">
                                        CRITICAL
                                    </span>
                                    <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                        Risk Score: <strong className="text-red-600 font-black">{topVuln.analysis.riskScore}</strong> / 100
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-800">{topVuln.title}</h3>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-sans">
                                    {topVuln.description}
                                </p>
                            </div>

                            {/* Animated Risk Meter Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-mono">
                                    <span className="text-slate-500 font-medium">Risk Score Prioritization Index</span>
                                    <span className="text-red-700 font-bold">{topVuln.analysis.riskScore}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full animate-bar-fill"
                                        style={{ width: `${topVuln.analysis.riskScore}%` }}
                                    />
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
                                {topVuln.knownExploited && (
                                    <span className="px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 font-bold">
                                        <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" /> Known Exploited
                                    </span>
                                )}
                                {topVuln.internetExposed && (
                                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-medium">
                                        <Globe className="w-3.5 h-3.5 text-blue-600" /> Internet Facing
                                    </span>
                                )}
                                <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 font-medium">
                                    <Building2 className="w-3.5 h-3.5 text-purple-600" /> {topVuln.assetCriticality} Asset
                                </span>
                                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                    CVSS: {topVuln.cvss} ({topVuln.cvssSeverity})
                                </span>
                            </div>
                        </div>

                        {/* Recommendation Action Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 shrink-0 lg:w-80 shadow-xs">
                            <div>
                                <span className="text-[10px] font-mono font-bold text-red-700 uppercase tracking-widest block mb-1">
                                    RECOMMENDED ACTION
                                </span>
                                <div className="text-xl font-black text-red-700 tracking-wide font-mono">
                                    PATCH NOW
                                </div>
                                <div className="text-xs text-slate-600 mt-1">
                                    Timeline: <strong className="text-slate-900 font-mono">{topVuln.analysis.recommendedTimeline}</strong>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedVulnModal(topVuln)}
                                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-mono font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all group"
                            >
                                <span>Inspect Risk Breakdown</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Section 7 Proof Callout: CVSS alone is insufficient */}
            {vulnA && vulnB && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                        CORE VALUE PROPOSITION DEMONSTRATION
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        "Lower CVSS does not always mean lower priority."
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl font-sans">
                        Standard vulnerability management relies solely on CVSS severity scores. PatchPilot AI proves why CVSS alone fails IT teams: active threat intelligence (CISA KEV) and asset exposure context dramatically elevate real-world risk.
                    </p>

                    {/* Comparison Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Vuln A Card */}
                        <div
                            onClick={() => setSelectedVulnModal(vulnA)}
                            className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all space-y-2 group"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-mono font-bold text-slate-500">Vulnerability A</span>
                                    <div className="text-base font-extrabold text-slate-900 font-mono group-hover:text-blue-600 transition-colors">
                                        {vulnA.cveId}
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    Risk Score: {vulnA.analysis.riskScore}/100 ({vulnA.analysis.priority})
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-1">{vulnA.title}</p>
                            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-2 border-t border-slate-200 text-slate-700">
                                <div>
                                    <span className="text-slate-500 block">CVSS</span>
                                    <span className="text-red-700 font-bold">{vulnA.cvss} (Critical)</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">CISA KEV</span>
                                    <span className="text-slate-500">✓ No (0 pts)</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Exposure</span>
                                    <span className="text-blue-600">Internet</span>
                                </div>
                            </div>
                        </div>

                        {/* Vuln B Card */}
                        <div
                            onClick={() => setSelectedVulnModal(vulnB)}
                            className="bg-red-50/50 border border-red-200 hover:border-red-300 p-4 rounded-xl cursor-pointer hover:-translate-y-0.5 transition-all space-y-2 group shadow-xs"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-mono font-bold text-red-700">Vulnerability B (Exploited)</span>
                                    <div className="text-base font-extrabold text-slate-900 font-mono flex items-center gap-1.5 group-hover:text-red-600 transition-colors">
                                        {vulnB.cveId}
                                        <Flame className="w-4 h-4 fill-red-600 text-red-600" />
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-red-600 text-white shadow-xs">
                                    Risk Score: {vulnB.analysis.riskScore}/100 (CRITICAL)
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-1">{vulnB.title}</p>
                            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-2 border-t border-red-200 text-slate-700">
                                <div>
                                    <span className="text-slate-500 block">CVSS</span>
                                    <span className="text-orange-700 font-bold">{vulnB.cvss} (High)</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">CISA KEV</span>
                                    <span className="text-red-700 font-bold">🔥 YES (+35 pts)</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Exposure</span>
                                    <span className="text-blue-600">Internet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Threat Intelligence & Risk Visualizations */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        Threat Intelligence Visualizations
                    </h2>
                    <span className="text-xs text-slate-500 font-mono">Live Interactive Analytics</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RiskScatterChart />
                    <PriorityBarChart />
                    <KevPieChart />
                    <RiskDistributionChart />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
