import React from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    ZAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { useVulnerability } from '../../context/VulnerabilityContext';

export const RiskScatterChart: React.FC = () => {
    const { vulnerabilities, setSelectedVulnModal } = useVulnerability();

    const data = vulnerabilities.map((v) => ({
        cveId: v.cveId,
        cvss: v.cvss,
        riskScore: v.analysis.riskScore,
        knownExploited: v.knownExploited,
        priority: v.analysis.priority,
        title: v.title,
        vuln: v,
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg text-xs font-mono max-w-xs z-50">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-blue-700">{item.cveId}</span>
                        <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.priority === 'CRITICAL'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : item.priority === 'HIGH'
                                    ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                    : item.priority === 'MEDIUM'
                                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                        >
                            {item.priority}
                        </span>
                    </div>
                    <p className="text-slate-700 font-sans text-[11px] line-clamp-1 mb-2">{item.title}</p>
                    <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                            <span className="text-slate-500">CVSS Score:</span>
                            <span className="text-slate-900 font-bold">{item.cvss}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">AI Risk Score:</span>
                            <span className="text-blue-700 font-extrabold">{item.riskScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">CISA KEV Listed:</span>
                            <span className={item.knownExploited ? 'text-red-700 font-bold' : 'text-slate-500'}>
                                {item.knownExploited ? '🔥 YES' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        CVSS Score vs. AI Risk Score
                    </h3>
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                        Proof Visualization
                    </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                    Red points represent CISA KEV active exploitation. Notice how lower CVSS scores often score higher in AI Risk due to active threats.
                </p>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis
                            type="number"
                            dataKey="cvss"
                            name="CVSS"
                            domain={[0, 10]}
                            stroke="#94A3B8"
                            fontSize={11}
                            label={{ value: 'CVSS Score (0-10)', position: 'insideBottom', offset: -10, fill: '#64748B', fontSize: 11 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="riskScore"
                            name="AI Risk Score"
                            domain={[0, 100]}
                            stroke="#94A3B8"
                            fontSize={11}
                            label={{ value: 'AI Risk Score (0-100)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748B', fontSize: 11 }}
                        />
                        <ZAxis type="number" range={[90, 90]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter
                            name="Vulnerabilities"
                            data={data}
                            onClick={(e: any) => e?.vuln && setSelectedVulnModal(e.vuln)}
                            cursor="pointer"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.knownExploited ? '#EF4444' : '#2563EB'}
                                    stroke={entry.knownExploited ? '#DC2626' : '#1D4ED8'}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-100 text-xs font-mono">
                <span className="flex items-center gap-2 text-red-700 font-bold">
                    <span className="w-3 h-3 rounded-full bg-red-500 border border-red-600 inline-block" />
                    🔥 Known Exploited (CISA KEV)
                </span>
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                    <span className="w-3 h-3 rounded-full bg-blue-600 border border-blue-700 inline-block" />
                    ✓ Not Listed in KEV
                </span>
            </div>
        </div>
    );
};
