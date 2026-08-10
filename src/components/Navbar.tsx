import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, ListOrdered, Radio, Brain, Info, Upload, X, Shield } from 'lucide-react';
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
        { to: '/patch-queue', label: 'Patch Queue', icon: ListOrdered, badge: patchNowCount > 0 ? formatBadge(patchNowCount) : undefined, badgeColor: 'bg-red-50 text-red-700 border border-red-200' },
        { to: '/intelligence', label: 'Threat Intelligence', icon: Radio },
        { to: '/about', label: 'About & Metrics', icon: Info },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white text-slate-800 font-sans select-none border-r border-slate-200 shadow-xs">
            {/* Header / Logo */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <NavLink to="/" className="flex items-center space-x-3 group" onClick={onClose}>
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                        <span className="text-xl">🛡️</span>
                    </div>
                    <div>
                        <div className="flex items-center space-x-1.5">
                            <span className="font-extrabold text-base tracking-tight text-slate-900">PatchPilot</span>
                            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                                AI
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">
                            Enterprise Cyber Prioritizer
                        </p>
                    </div>
                </NavLink>

                {/* Close Button on Mobile Drawer */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Navigation items list */}
            <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2 font-mono">
                    NAVIGATION
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
                                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-normal transition-all duration-150 relative ${isActive
                                    ? 'bg-blue-50/80 text-blue-700 font-bold border-l-4 border-l-blue-600 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-l-4 border-l-transparent'
                                }`
                            }
                        >
                            <div className="flex items-center space-x-3">
                                <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                                <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${item.badgeColor || 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    );
                })}

                {/* Data Import Direct Action */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                    <button
                        onClick={() => {
                            if (onClose) onClose();
                            setIsCsvModalOpen(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-all shadow-xs group"
                    >
                        <div className="flex items-center space-x-3">
                            <Upload className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                            <span>Data Import</span>
                        </div>
                        <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-500">
                            CSV
                        </span>
                    </button>
                </div>
            </div>

            {/* Status Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-600">SYSTEM STATUS:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ONLINE
                    </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400">Random Forest v2.0 • ML Active</div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Navigation Sidebar */}
            <aside className="hidden md:flex md:flex-col md:w-64 md:h-screen md:sticky md:top-0 bg-white border-r border-slate-200 shrink-0 z-30">
                {sidebarContent}
            </aside>

            {/* Mobile Navigation Drawer Backdrop */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-300 animate-page-enter"
                />
            )}

            {/* Mobile Navigation Drawer Panel */}
            <aside
                className={`md:hidden fixed top-0 bottom-0 left-0 w-64 bg-white z-50 border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default Navbar;
