import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useVulnerability } from '../../context/VulnerabilityContext';

export const KevPieChart: React.FC = () => {
    const { vulnerabilities } = useVulnerability();

    const kevCount = vulnerabilities.filter((v) => v.knownExploited).length;
    const nonKevCount = vulnerabilities.length - kevCount;

    const data = [
        { name: '🔥 Known Exploited (CISA KEV)', value: kevCount, color: '#DC2626' },
        { name: '✓ Not Listed in KEV', value: nonKevCount, color: '#2563EB' },
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                    CISA KEV Exploitation Breakdown
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                    Ratio of vulnerabilities known to be actively exploited in the wild.
                </p>
            </div>

            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.5rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
