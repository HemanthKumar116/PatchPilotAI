import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useVulnerability } from '../../context/VulnerabilityContext';

export const RiskDistributionChart: React.FC = () => {
    const { vulnerabilities } = useVulnerability();

    const bins = [
        { name: '0–25', count: 0, color: '#D4D4D8' },
        { name: '26–50', count: 0, color: '#A1A1AA' },
        { name: '51–75', count: 0, color: '#52525B' },
        { name: '76–90', count: 0, color: '#27272A' },
        { name: '91–100', count: 0, color: '#000000' },
    ];

    vulnerabilities.forEach((v) => {
        const s = v.analysis.riskScore;
        if (s <= 25) bins[0].count++;
        else if (s <= 50) bins[1].count++;
        else if (s <= 75) bins[2].count++;
        else if (s <= 90) bins[3].count++;
        else bins[4].count++;
    });

    return (
        <div className="card-maximalist p-6 flex flex-col justify-between">
            <div>
                <h3 className="text-base font-extrabold font-display text-black tracking-tight mb-1">
                    Risk Score Frequency Bands
                </h3>
                <p className="text-xs font-mono text-zinc-500 mb-4">
                    Histogram of calculated AI risk scores across fleet assets.
                </p>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bins} margin={{ top: 10, right: 10, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#000000"
                            tick={{ fill: '#000000', fontSize: 11, fontFamily: 'monospace' }}
                        />
                        <YAxis
                            stroke="#000000"
                            tick={{ fill: '#000000', fontSize: 11, fontFamily: 'monospace' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#000000',
                                border: '2px solid #000000',
                                borderRadius: '12px',
                                color: '#FFFFFF',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                            }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {bins.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="#000000" strokeWidth={1.5} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RiskDistributionChart;
