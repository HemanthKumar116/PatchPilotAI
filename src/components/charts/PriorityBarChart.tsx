import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useVulnerability } from '../../context/VulnerabilityContext';

export const PriorityBarChart: React.FC = () => {
    const { vulnerabilities } = useVulnerability();

    const counts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
    };

    vulnerabilities.forEach((v) => {
        counts[v.analysis.priority]++;
    });

    const data = [
        { priority: 'CRITICAL', label: 'Patch Now (90-100)', count: counts.CRITICAL, color: '#DC2626' },
        { priority: 'HIGH', label: '7 Days (75-89)', count: counts.HIGH, color: '#EA580C' },
        { priority: 'MEDIUM', label: '30 Days (50-74)', count: counts.MEDIUM, color: '#D97706' },
        { priority: 'LOW', label: 'Monitor (0-49)', count: counts.LOW, color: '#16A34A' },
    ];

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                    Patch Priority Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                    Count of vulnerabilities grouped by action timeline.
                </p>
            </div>

            <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="priority" stroke="#64748B" fontSize={11} />
                        <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.5rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
