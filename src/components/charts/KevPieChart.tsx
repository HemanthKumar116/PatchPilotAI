import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useVulnerability } from '../../context/VulnerabilityContext';

export const KevPieChart: React.FC = () => {
    const { fleetStats, vulnerabilities } = useVulnerability();

    const knownExploitedCount = fleetStats.knownExploitedCount || vulnerabilities.filter((v) => v.knownExploited).length;
    const total = fleetStats.totalCount || vulnerabilities.length;
    const notExploited = Math.max(0, total - knownExploitedCount);

    const data = [
        { name: 'CISA KEV Weaponized', value: knownExploitedCount, color: '#000000' },
        { name: 'Theoretical Risk Only', value: notExploited, color: '#D4D4D8' },
    ];

    return (
        <div className="card-maximalist p-6 flex flex-col justify-between">
            <div>
                <h3 className="text-base font-extrabold font-display text-black tracking-tight mb-1">
                    CISA KEV Exploitation Ratio
                </h3>
                <p className="text-xs font-mono text-zinc-500 mb-4">
                    Proportion of fleet vulnerabilities weaponized by active threat actors.
                </p>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
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
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-xs font-mono text-black font-bold">{value}</span>}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="#000000" strokeWidth={2} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default KevPieChart;
