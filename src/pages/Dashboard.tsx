import React from 'react';
import { useVulnerability } from '../context/VulnerabilityContext';
import {
    Activity,
    ShieldAlert,
    Flame,
    Cpu,
    ArrowRight,
    Sparkles,
    TrendingUp,
    CheckCircle2,
    Clock,
    Zap,
    ShieldCheck,
} from 'lucide-react';
import { RiskScatterChart } from '../components/charts/RiskScatterChart';
import { PriorityBarChart } from '../components/charts/PriorityBarChart';
import { KevPieChart } from '../components/charts/KevPieChart';
import { RiskDistributionChart } from '../components/charts/RiskDistributionChart';

export const Dashboard: React.FC = () => {
    const { vulnerabilities, fleetStats, setSelectedVulnModal } = useVulnerability();

    const {
        totalCount,
        criticalCount,
        highCount,
        knownExploitedCount,
        patchNowCount,
        avgRiskScore,
    } = fleetStats;

    // Highest risk vulnerability for "WHAT SHOULD I PATCH NOW?" card
    const topVuln = vulnerabilities.length > 0
        ? [...vulnerabilities].sort((a, b) => b.analysis.riskScore - a.analysis.riskScore)[0]
        : undefined;

    // Section 7 comparison pair lookup (Vulnerability A & Vulnerability B)
    const vulnB = vulnerabilities.find((v) => v.cveId === 'CVE-2024-3094') || topVuln;
    const vulnA = vulnerabilities.find((v) => v.cveId === 'CVE-2024-8891') || vulnerabilities.find((v) => v.cvss >= 9.5 && !v.knownExploited) || (vulnerabilities.length > 1 ? vulnerabilities[1] : undefined);

    return (
        <div className="space-y-10 animate-page-enter font-sans">
            {/* 1. Reference Hero Section (Editorial Cyber Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
                {/* Left Column: Bold Geometric Display Headline */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-black bg-white text-black border-2 border-white shadow-md">
                            <Zap className="w-3.5 h-3.5 text-black fill-black" />
                            AI VULNERABILITY PRIORITIZATION
                        </div>

                        <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold font-display text-white leading-[1.08] tracking-tight drop-shadow-xl">
                            Liven up your defense:<br />
                            Prioritize CVEs that<br />
                            attackers exploit!
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                        <p className="text-xs sm:text-[13px] font-mono text-black leading-relaxed bg-white p-5 rounded-2xl border-2 border-black shadow-brutalist flex items-center">
                            Add intelligence to your remediation backlog. We score CVSS, active CISA KEV exploitation, asset exposure, and Random Forest ML to pinpoint the vulnerabilities that demand immediate 24-hour action.
                        </p>

                        {/* Telemetry Stat Badges */}
                        <div className="flex flex-col justify-between gap-3 font-mono text-xs">
                            <div className="flex items-center justify-between bg-white border-2 border-black p-3.5 rounded-2xl font-bold shadow-brutalist">
                                <span className="flex items-center gap-2 text-black font-black">
                                    <Flame className="w-4 h-4 text-black fill-black" /> KEV Weaponized:
                                </span>
                                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black">
                                    <AnimatedNumber value={knownExploitedCount} />
                                </span>
                            </div>
                            <div className="flex items-center justify-between bg-white border-2 border-black p-3.5 rounded-2xl font-bold shadow-brutalist">
                                <span className="flex items-center gap-2 text-black font-black">
                                    <ShieldAlert className="w-4 h-4 text-black" /> Immediate Patch:
                                </span>
                                <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-black">
                                    <AnimatedNumber value={patchNowCount} />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Solid Pure Black Priority Card with Black Circular Button */}
                <div className="lg:col-span-5 relative flex items-center">
                    {topVuln ? (
                        <div className="w-full relative">
                            {/* Solid Black Circular Action Button */}
                            <button
                                onClick={() => setSelectedVulnModal(topVuln)}
                                className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full btn-circle-gradient flex items-center justify-center text-white text-2xl font-black shadow-2xl group cursor-pointer"
                                title="Inspect Top Priority CVE"
                            >
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>

                            {/* Solid Pure Black Card */}
                            <div className="card-plum p-7 pl-10 space-y-5 relative overflow-hidden bg-black border-2 border-black rounded-3xl sm:rounded-4xl shadow-2xl">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="px-3.5 py-1 rounded-full text-xs font-mono font-black bg-white text-black border border-white">
                                        ⚡ WHAT TO PATCH NOW
                                    </span>
                                    <span className="text-xs font-mono font-bold bg-zinc-900 px-3 py-1 rounded-full text-white border border-zinc-700">
                                        Score: <strong className="text-white font-black text-sm">{topVuln.analysis.riskScore}</strong>/100
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                                        {topVuln.cveId}
                                    </h2>
                                    <h3 className="text-xs sm:text-sm font-bold font-mono text-zinc-300 mt-1 line-clamp-1">
                                        {topVuln.cveId} - Vulnerability
                                    </h3>
                                    <p className="text-xs font-mono text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                                        {topVuln.description}
                                    </p>
                                </div>

                                {/* Progress meter */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between text-[11px] font-mono text-zinc-300">
                                        <span className="font-bold">Risk Index:</span>
                                        <span className="text-white font-black">{topVuln.analysis.riskScore}%</span>
                                    </div>
                                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                                        <div
                                            className="h-full bg-white rounded-full animate-bar-fill"
                                            style={{ width: `${topVuln.analysis.riskScore}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Nested Pure White Action Box */}
                                <div className="bg-white text-black p-4 rounded-2xl border-2 border-black flex items-center justify-between gap-3 shadow-inner">
                                    <div>
                                        <span className="text-[10px] font-mono font-black text-zinc-500 uppercase block">
                                            ACTION TIMELINE
                                        </span>
                                        <span className="text-xs font-mono font-black text-black">
                                            {topVuln.analysis.recommendedTimeline}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedVulnModal(topVuln)}
                                        className="px-4 py-2 bg-black hover:bg-zinc-800 active:scale-95 text-white text-xs font-mono font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Inspect</span>
                                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card-plum p-8 w-full text-center space-y-3 bg-black">
                            <ShieldCheck className="w-12 h-12 text-white mx-auto" />
                            <h3 className="font-display font-bold text-lg text-white">Fleet Fully Secured</h3>
                            <p className="text-xs font-mono text-zinc-400">No critical vulnerabilities detected.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Reference 5 KPI Cards Grid (Solid White Arched Cards with Black Border & Offset Shadow) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                {/* KPI 1: Total CVEs */}
                <div className="card-maximalist p-5 space-y-3 group hover:bg-zinc-50">
                    <div className="flex items-center justify-between text-zinc-500 font-mono">
                        <span className="text-xs font-black uppercase tracking-wider text-black">TOTAL CVES</span>
                        <div className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-black flex items-center justify-center">
                            <Activity className="w-4 h-4 text-black" />
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-display text-black tracking-tight">
                        <AnimatedNumber value={totalCount} />
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-zinc-500">Monitored Fleet Assets</div>
                </div>

                {/* KPI 2: Critical Risk */}
                <div className="card-maximalist p-5 space-y-3 group hover:bg-zinc-50">
                    <div className="flex items-center justify-between text-zinc-500 font-mono">
                        <span className="text-xs font-black uppercase tracking-wider text-black">CRITICAL</span>
                        <div className="w-8 h-8 rounded-full bg-black text-white border-2 border-black flex items-center justify-center">
                            <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-display text-black tracking-tight">
                        <AnimatedNumber value={criticalCount} />
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-zinc-500">Risk score 90–100</div>
                </div>

                {/* KPI 3: High Risk */}
                <div className="card-maximalist p-5 space-y-3 group hover:bg-zinc-50">
                    <div className="flex items-center justify-between text-zinc-500 font-mono">
                        <span className="text-xs font-black uppercase tracking-wider text-black">HIGH RISK</span>
                        <div className="w-8 h-8 rounded-full bg-zinc-200 border-2 border-black flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-black" />
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-display text-black tracking-tight">
                        <AnimatedNumber value={highCount} />
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-zinc-500">Risk score 75–89</div>
                </div>

                {/* KPI 4: Known Exploited (CISA KEV) */}
                <div className="card-maximalist p-5 space-y-3 group hover:bg-zinc-50">
                    <div className="flex items-center justify-between text-zinc-500 font-mono">
                        <span className="text-xs font-black uppercase tracking-wider text-black">EXPLOITED</span>
                        <div className="w-8 h-8 rounded-full bg-zinc-100 border-2 border-black flex items-center justify-center">
                            <Flame className="w-4 h-4 text-black fill-black" />
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-display text-black tracking-tight">
                        <AnimatedNumber value={knownExploitedCount} />
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-zinc-500">Listed in CISA KEV</div>
                </div>

                {/* KPI 5: Patch Now Urgent */}
                <div className="card-maximalist p-5 space-y-3 group hover:bg-zinc-50">
                    <div className="flex items-center justify-between text-zinc-500 font-mono">
                        <span className="text-xs font-black uppercase tracking-wider text-black">PATCH NOW</span>
                        <div className="w-8 h-8 rounded-full bg-black text-white border-2 border-black flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="text-3xl sm:text-4xl font-extrabold font-display text-black tracking-tight flex items-baseline gap-1">
                        <AnimatedNumber value={patchNowCount} />
                        <span className="text-xs font-mono font-bold text-zinc-500">24h</span>
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-zinc-500">Avg: <AnimatedNumber value={avgRiskScore} />/100</div>
                </div>
            </div>

            {/* 3. Core Value Proposition Banner */}
            {vulnA && vulnB && (
                <div className="card-maximalist p-6 sm:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
                        <div>
                            <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-widest block">
                                CORE VALUE PROPOSITION DEMONSTRATION
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold font-display text-black tracking-tight mt-1">
                                "Lower CVSS does not always mean lower priority."
                            </h2>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-full text-xs font-mono font-bold self-start sm:self-auto">
                            <Sparkles className="w-3.5 h-3.5" />
                            Telemetry Proof
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CVE-A: High CVSS, but unexploited */}
                        <div
                            onClick={() => setSelectedVulnModal(vulnA)}
                            className="bg-zinc-50 border-2 border-black rounded-2xl p-5 space-y-4 hover:shadow-brutalist transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-zinc-500">VULNERABILITY A (Standard Tooling View)</span>
                                <span className="text-xs font-mono font-black bg-zinc-200 text-black px-2.5 py-0.5 rounded-full border border-black">
                                    CVSS {vulnA.cvss}
                                </span>
                            </div>
                            <div>
                                <div className="text-lg font-black font-mono text-black">{vulnA.cveId}</div>
                                <div className="text-xs font-mono text-zinc-600 line-clamp-1 mt-0.5">{vulnA.title}</div>
                            </div>
                            <div className="space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between text-zinc-600">
                                    <span>CISA KEV Exploitation:</span>
                                    <span className="font-bold text-black">{vulnA.knownExploited ? 'YES' : 'NO'}</span>
                                </div>
                                <div className="flex justify-between text-zinc-600">
                                    <span>Internet Exposed:</span>
                                    <span className="font-bold text-black">{vulnA.internetExposed ? 'YES' : 'NO'}</span>
                                </div>
                                <div className="flex justify-between text-zinc-600">
                                    <span>PatchPilot Risk Score:</span>
                                    <span className="font-black text-black">{vulnA.analysis.riskScore}/100</span>
                                </div>
                            </div>
                            <div className="bg-white border-2 border-black p-3 rounded-xl flex items-center justify-between text-xs font-mono font-bold">
                                <span>Action Priority:</span>
                                <span className="bg-black text-white px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase">
                                    {vulnA.analysis.priority}
                                </span>
                            </div>
                        </div>

                        {/* CVE-B: Lower CVSS, but active in KEV */}
                        <div
                            onClick={() => setSelectedVulnModal(vulnB)}
                            className="bg-zinc-100 border-2 border-black rounded-2xl p-5 space-y-4 hover:shadow-brutalist transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-black">VULNERABILITY B (PatchPilot Prioritized)</span>
                                <span className="text-xs font-mono font-black bg-black text-white px-2.5 py-0.5 rounded-full border border-black">
                                    CVSS {vulnB.cvss}
                                </span>
                            </div>
                            <div>
                                <div className="text-lg font-black font-mono text-black">{vulnB.cveId}</div>
                                <div className="text-xs font-mono text-zinc-600 line-clamp-1 mt-0.5">{vulnB.title}</div>
                            </div>
                            <div className="space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between text-black">
                                    <span>CISA KEV Exploitation:</span>
                                    <span className="font-black text-black">{vulnB.knownExploited ? '⚡ WEAPONIZED' : 'NO'}</span>
                                </div>
                                <div className="flex justify-between text-black">
                                    <span>Internet Exposed:</span>
                                    <span className="font-bold text-black">{vulnB.internetExposed ? 'YES' : 'NO'}</span>
                                </div>
                                <div className="flex justify-between text-black">
                                    <span>PatchPilot Risk Score:</span>
                                    <span className="font-black text-black">{vulnB.analysis.riskScore}/100</span>
                                </div>
                            </div>
                            <div className="bg-black text-white border-2 border-black p-3 rounded-xl flex items-center justify-between text-xs font-mono font-bold">
                                <span>Action Priority:</span>
                                <span className="bg-white text-black px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase">
                                    {vulnB.analysis.priority} (PATCH NOW)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Threat Intelligence & Interactive Analytics Grid */}
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold font-display text-white tracking-tight flex items-center gap-2 drop-shadow-md">
                        Threat Visualizations & Analytics
                    </h2>
                    <span className="text-xs text-black font-mono font-bold bg-white px-3 py-1 rounded-full border-2 border-black shadow-brutalist">
                        Live Radar Telemetry
                    </span>
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

// Internal animated counter helper
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
    return <span>{typeof value === 'number' ? value.toLocaleString() : value}</span>;
};

export default Dashboard;
