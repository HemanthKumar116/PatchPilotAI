import React, { useMemo } from 'react';
import { useVulnerability, EvaluatedVulnerability } from '../context/VulnerabilityContext';
import { Search, Filter, ArrowUpDown, Flame, Globe, Building2, ExternalLink, RotateCcw, ShieldAlert, Eye, X } from 'lucide-react';

export const Vulnerabilities: React.FC = () => {
    const {
        vulnerabilities,
        fleetStats,
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        severityFilter,
        setSeverityFilter,
        kevFilter,
        setKevFilter,
        exposureFilter,
        setExposureFilter,
        criticalityFilter,
        setCriticalityFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        setSelectedVulnModal,
        clearFilters,
    } = useVulnerability();

    // Filter & Sort Logic
    const filteredVulns = useMemo(() => {
        return vulnerabilities
            .filter((v) => {
                // Search query
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().trim();
                    const match =
                        v.cveId.toLowerCase().includes(q) ||
                        v.title.toLowerCase().includes(q) ||
                        v.description.toLowerCase().includes(q) ||
                        v.affectedProduct.toLowerCase().includes(q) ||
                        (v.vendor && v.vendor.toLowerCase().includes(q)) ||
                        (v.product && v.product.toLowerCase().includes(q));
                    if (!match) return false;
                }

                // Priority filter
                if (priorityFilter.length > 0 && !priorityFilter.includes(v.analysis.priority)) {
                    return false;
                }

                // Severity filter
                if (severityFilter.length > 0 && !severityFilter.includes(v.cvssSeverity)) {
                    return false;
                }

                // KEV filter
                if (kevFilter === 'exploited' && !v.knownExploited) return false;
                if (kevFilter === 'not_exploited' && v.knownExploited) return false;

                // Exposure filter
                if (exposureFilter === 'internet' && !v.internetExposed) return false;
                if (exposureFilter === 'internal' && v.internetExposed) return false;

                // Criticality filter
                if (criticalityFilter.length > 0 && !criticalityFilter.includes(v.assetCriticality)) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                let cmp = 0;
                if (sortBy === 'riskScore') {
                    cmp = a.analysis.riskScore - b.analysis.riskScore;
                } else if (sortBy === 'cvss') {
                    cmp = a.cvss - b.cvss;
                } else if (sortBy === 'publishedDate') {
                    cmp = new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
                } else if (sortBy === 'priority') {
                    const orderMap: any = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
                    cmp = orderMap[a.analysis.priority] - orderMap[b.analysis.priority];
                }

                return sortOrder === 'desc' ? -cmp : cmp;
            });
    }, [
        vulnerabilities,
        searchQuery,
        priorityFilter,
        severityFilter,
        kevFilter,
        exposureFilter,
        criticalityFilter,
        sortBy,
        sortOrder,
    ]);

    const toggleArrayFilter = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
        if (array.includes(item)) {
            setArray(array.filter((x) => x !== item));
        } else {
            setArray([...array, item]);
        }
    };

    const activeFilterCount =
        (searchQuery ? 1 : 0) +
        priorityFilter.length +
        severityFilter.length +
        (kevFilter !== 'all' ? 1 : 0) +
        (exposureFilter !== 'all' ? 1 : 0) +
        criticalityFilter.length;

    const getPriorityBadgeClass = (p: string) => {
        switch (p.toUpperCase()) {
            case 'CRITICAL':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'HIGH':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'MEDIUM':
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'LOW':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-page-enter font-sans">
            {/* Header title & summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-blue-600" />
                        Vulnerability Catalog
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Search, filter, and inspect AI-evaluated risk scores for the fleet. Click any row to slide out detailed factors.
                    </p>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-500">Showing:</span>
                    <span className="font-bold text-slate-900 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-xs">
                        {filteredVulns.length} of {(fleetStats.totalCount || vulnerabilities.length).toLocaleString()} CVEs
                    </span>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    {/* Search Input */}
                    <div className="md:col-span-5 relative">
                        <input
                            type="text"
                            placeholder="Search CVE ID, title, product, vendor, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all font-mono"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="md:col-span-4 flex items-center space-x-2">
                        <span className="text-xs text-slate-500 font-mono flex items-center gap-1 shrink-0">
                            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
                        </span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 font-mono font-medium focus:outline-none focus:border-blue-600 flex-1 shadow-xs"
                        >
                            <option value="riskScore">AI Risk Score (Highest)</option>
                            <option value="cvss">CVSS Score</option>
                            <option value="priority">Priority Band</option>
                            <option value="publishedDate">Published Date</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="px-2.5 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-mono text-slate-700 rounded-lg active:scale-95 transition-all shadow-xs"
                        >
                            {sortOrder === 'desc' ? 'DESC' : 'ASC'}
                        </button>
                    </div>

                    {/* KEV Filter Dropdown */}
                    <div className="md:col-span-3">
                        <select
                            value={kevFilter}
                            onChange={(e) => setKevFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 font-mono font-medium focus:outline-none focus:border-blue-600 shadow-xs"
                        >
                            <option value="all">CISA KEV: All Statuses</option>
                            <option value="exploited">🔥 Known Exploited Only</option>
                            <option value="not_exploited">✓ Not Listed Only</option>
                        </select>
                    </div>
                </div>

                {/* Filter Badges Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-mono">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5" /> Priority:
                        </span>
                        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
                            const active = priorityFilter.includes(p);
                            return (
                                <button
                                    key={p}
                                    onClick={() => toggleArrayFilter(priorityFilter, setPriorityFilter, p)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors active:scale-95 ${active
                                        ? p === 'CRITICAL'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : p === 'HIGH'
                                                ? 'bg-orange-600 text-white border-orange-600'
                                                : p === 'MEDIUM'
                                                    ? 'bg-amber-600 text-white border-amber-600'
                                                    : 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {p}
                                </button>
                            );
                        })}

                        <span className="text-slate-400 font-bold ml-2">Exposure:</span>
                        <button
                            onClick={() => setExposureFilter(exposureFilter === 'internet' ? 'all' : 'internet')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border active:scale-95 transition-all ${exposureFilter === 'internet'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                        >
                            Internet-Facing
                        </button>
                        <button
                            onClick={() => setExposureFilter(exposureFilter === 'internal' ? 'all' : 'internal')}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border active:scale-95 transition-all ${exposureFilter === 'internal'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                        >
                            Internal
                        </button>
                    </div>

                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold"
                        >
                            <RotateCcw className="w-3 h-3" /> Reset Filters ({activeFilterCount})
                        </button>
                    )}
                </div>
            </div>

            {/* Vulnerability Table with Sticky Header */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[680px]">
                    <table className="w-full text-left text-xs font-sans border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600 uppercase font-mono text-[11px] border-b border-slate-200 tracking-wider">
                            <tr>
                                <th className="py-3.5 px-4 font-bold">CVE & Description</th>
                                <th className="py-3.5 px-3 font-bold text-center">CVSS</th>
                                <th className="py-3.5 px-3 font-bold text-center">Severity</th>
                                <th className="py-3.5 px-3 font-bold">Vendor</th>
                                <th className="py-3.5 px-3 font-bold">Product</th>
                                <th className="py-3.5 px-3 font-bold text-center">ML Priority</th>
                                <th className="py-3.5 px-3 font-bold text-center">Confidence</th>
                                <th className="py-3.5 px-3 font-bold text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredVulns.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-14 text-center text-slate-400 font-mono text-xs">
                                        No vulnerabilities match your active search and filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredVulns.map((v) => {
                                    const { analysis } = v;
                                    const confidenceVal = analysis.mlPrediction
                                        ? Math.round(analysis.mlPrediction.confidence * 100)
                                        : 91;

                                    return (
                                        <tr
                                            key={v.id}
                                            onClick={() => setSelectedVulnModal(v)}
                                            className="hover:bg-blue-50/40 cursor-pointer transition-colors duration-150 group border-b border-slate-100"
                                        >
                                            {/* CVE & Title */}
                                            <td className="py-3 px-4 max-w-xs">
                                                <div className="font-mono font-bold text-blue-700 group-hover:text-blue-900 flex items-center gap-1.5">
                                                    {v.cveId}
                                                    {v.knownExploited && (
                                                        <span className="text-[10px] text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded font-sans font-bold flex items-center gap-0.5">
                                                            <Flame className="w-2.5 h-2.5 fill-red-600" /> KEV
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="font-medium text-slate-800 truncate mt-0.5 text-xs">{v.title}</div>
                                                <div className="text-[11px] text-slate-400 truncate">{v.description}</div>
                                            </td>

                                            {/* CVSS */}
                                            <td className="py-3 px-3 text-center font-mono">
                                                <span className="font-extrabold text-slate-900 text-sm">{v.cvss.toFixed(1)}</span>
                                            </td>

                                            {/* Severity */}
                                            <td className="py-3 px-3 text-center font-mono text-[11px]">
                                                <span className={`inline-block px-2 py-0.5 rounded font-bold border ${getPriorityBadgeClass(v.cvssSeverity)}`}>
                                                    {v.cvssSeverity}
                                                </span>
                                            </td>

                                            {/* Vendor */}
                                            <td className="py-3 px-3 text-slate-700 font-medium truncate max-w-[130px]">
                                                {v.vendor || 'Not available'}
                                            </td>

                                            {/* Product */}
                                            <td className="py-3 px-3 text-slate-700 font-medium truncate max-w-[150px]">
                                                {v.product || v.affectedProduct || 'Not available'}
                                            </td>

                                            {/* ML Priority */}
                                            <td className="py-3 px-3 text-center">
                                                <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold border shadow-xs ${getPriorityBadgeClass(analysis.priority)}`}>
                                                    {analysis.priority}
                                                </span>
                                            </td>

                                            {/* Confidence */}
                                            <td className="py-3 px-3 text-center font-mono">
                                                <span className="font-bold text-slate-800 text-xs">{confidenceVal}%</span>
                                                <div className="w-12 mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="h-full bg-blue-600 rounded-full"
                                                        style={{ width: `${confidenceVal}%` }}
                                                    />
                                                </div>
                                            </td>

                                            {/* Action Icon */}
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedVulnModal(v);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Inspect AI Prioritization Breakdown"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Vulnerabilities;
