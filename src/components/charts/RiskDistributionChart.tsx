import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useVulnerability } from '../../context/VulnerabilityContext';

export const RiskDistributionChart: React.FC = () => {
    const { vulnerabilities } = useVulnerability();

    const bins = [
        { range: '0-20 (Low)', count: 0, color: '#16A34A' },
        { range: '21-40 (Low)', count: 0, color: '#22C55E' },
        { range: '41-60 (Med)', count: 0, color: '#D97706' },
        { range: '61-80 (High)', count: 0, color: '#EA580C' },
        { range: '81-100 (Crit)', count: 0, color: '#DC2626' },
    ];

    vulnerabilities.forEach((v) => {
        const s = v.analysis.riskScore;
        if (s <= 20) bins[0].count++;
        else if (s <= 40) bins[1].count++;
        else if (s <= 60) bins[2].count++;
        else if (s <= 80) bins[3].count++;
        else bins[4].count++;
    });

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                    Risk Score Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                    Frequency of risk scores across 0-100 bands.
                </p>
            </div>

            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bins} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="range" stroke="#64748B" fontSize={10} interval={0} />
                        <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.5rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#2563EB' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {bins.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
