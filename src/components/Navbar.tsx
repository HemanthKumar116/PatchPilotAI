import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, ListOrdered, Radio, Brain, Info, Upload, X } from 'lucide-react';
import { useVulnerability } from '../context/VulnerabilityContext';

interface Props {
    isOpen?: boolean;
    onClose?: () => void;
}

export const Navbar: React.FC<Props> = ({ isOpen = false, onClose }) => {
    const { vulnerabilities, fleetStats, setIsCsvModalOpen } = useVulnerability();

    const criticalCount = fleetStats.criticalCount || vulnerabilities.filter((v) => v.analysis.priority === 'CRITICAL').length;
    const totalCount = fleetStats.totalCount || vulnerabilities.length;
    const patchNowCount = fleetStats.patchNowCount || criticalCount;

    const formatBadge = (num: number) => {
        if (!num) return undefined;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return num.toString();
    };

    const navItems = [
        { to: '/', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/vulnerabilities', label: 'Vulnerabilities', icon: ShieldAlert, badge: formatBadge(totalCount) },
        { to: '/patch-queue', label: 'Patch Queue', icon: ListOrdered, badge: patchNowCount > 0 ? formatBadge(patchNowCount) : undefined, badgeColor: 'bg-black text-white' },
        { to: '/intelligence', label: 'Threat Intelligence', icon: Radio },
        { to: '/ai-model', label: 'AI Model (RF)', icon: Brain },
        { to: '/about', label: 'About & Formula', icon: Info },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-page-enter"
            />

            {/* Mobile Drawer */}
            <aside className="relative w-72 bg-white border-r-2 border-black shadow-2xl h-full flex flex-col font-sans z-50 animate-slide-in-right">
                {/* Header */}
                <div className="p-5 border-b-2 border-black flex items-center justify-between">
                    <NavLink to="/" className="flex items-center gap-2" onClick={onClose}>
                        <span className="font-display font-black text-xl tracking-tight text-black">
                            PatchPilot...
                        </span>
                        <span className="bg-black text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                            AI
                        </span>
                    </NavLink>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full bg-black text-white hover:bg-zinc-800 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase px-2 block mb-2">
                        MENU
                    </span>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-mono font-bold transition-all border-2 ${isActive
                                        ? 'bg-black text-white border-black shadow-[4px_4px_0px_#71717A]'
                                        : 'bg-white text-black border-black/20 hover:border-black hover:bg-zinc-50'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </div>
                                {item.badge !== undefined && (
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${item.badgeColor || 'bg-black text-white'
                                            }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t-2 border-black/10">
                        <button
                            onClick={() => {
                                if (onClose) onClose();
                                setIsCsvModalOpen(true);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-mono font-black bg-black text-white border-2 border-black shadow-[4px_4px_0px_#71717A] active:scale-95 transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                <span>Import Dataset</span>
                            </div>
                            <span className="text-[10px] bg-white text-black px-2 py-0.5 rounded-full">
                                CSV
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-black bg-zinc-50 text-[11px] font-mono text-zinc-600 space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="font-bold text-black">SYSTEM STATUS:</span>
                        <span className="text-black font-black flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-black animate-pulse" /> ONLINE
                        </span>
                    </div>
                    <div className="text-[10px] text-zinc-500">Random Forest v2.0 • ML Active</div>
                </div>
            </aside>
        </div>
    );
};

export default Navbar;
