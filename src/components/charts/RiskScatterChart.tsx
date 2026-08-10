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
        x: v.cvss,
        y: v.analysis.riskScore,
        z: v.knownExploited ? 100 : 40,
        cve: v.cveId,
        title: v.title,
        priority: v.analysis.priority,
        raw: v,
        knownExploited: v.knownExploited,
    }));

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const point = payload[0].payload;
            return (
                <div className="bg-black text-white p-3 rounded-xl border-2 border-black shadow-xl text-xs font-mono">
                    <div className="font-black text-white">{point.cve}</div>
                    <div className="text-[11px] text-zinc-300 truncate max-w-xs">{point.title}</div>
                    <div className="mt-1 pt-1 border-t border-zinc-700 space-y-0.5">
                        <div>CVSS Severity: <strong className="text-white">{point.x}</strong></div>
                        <div>AI Risk Score: <strong className="text-white">{point.y}/100</strong></div>
                        <div>CISA KEV: <strong className="text-white">{point.knownExploited ? 'YES' : 'NO'}</strong></div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="card-maximalist p-6 flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-base font-extrabold font-display text-black tracking-tight">
                        CVSS Score vs. AI Risk Score
                    </h3>
                    <span className="text-[10px] font-mono bg-zinc-100 text-black border-2 border-black px-2.5 py-0.5 rounded-full font-bold">
                        Proof Chart
                    </span>
                </div>
                <p className="text-xs font-mono text-zinc-500 mb-4">
                    Demonstrating why raw CVSS severity diverges from actual exploitable business risk.
                </p>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: -10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name="CVSS Base"
                            domain={[0, 10]}
                            stroke="#000000"
                            tick={{ fill: '#000000', fontSize: 11, fontFamily: 'monospace' }}
                            label={{ value: 'Raw CVSS Severity', position: 'insideBottom', offset: -10, fill: '#000000', fontSize: 11 }}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name="AI Risk Score"
                            domain={[0, 100]}
                            stroke="#000000"
                            tick={{ fill: '#000000', fontSize: 11, fontFamily: 'monospace' }}
                            label={{ value: 'AI Risk Score', angle: -90, position: 'insideLeft', fill: '#000000', fontSize: 11 }}
                        />
                        <ZAxis type="number" dataKey="z" range={[40, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Scatter
                            name="Vulnerabilities"
                            data={data}
                            onClick={(point: any) => setSelectedVulnModal(point.raw)}
                            className="cursor-pointer"
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.knownExploited ? '#000000' : '#71717A'}
                                    stroke="#000000"
                                    strokeWidth={1.5}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RiskScatterChart;
