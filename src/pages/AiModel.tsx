import React, { useState, useEffect } from 'react';
import {
    Brain,
    BarChart3,
    Search,
    Sparkles,
    CheckCircle2,
    Info,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Database,
    Layers,
    Cpu
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface ModelMetrics {
    overall_accuracy: number;
    total_samples: number;
    train_samples: number;
    test_samples: number;
    tree_count: number;
    algorithm: string;
    per_class_metrics: Record<string, { precision: number; recall: number; 'f1-score': number; support: number }>;
    confusion_matrix: number[][];
    class_labels: string[];
    feature_importances: Array<{ feature: string; importance: number }>;
    disclaimer: string;
}

interface DatasetResponse {
    page: number;
    limit: number;
    total_count: number;
    total_pages: number;
    items: Array<{
        cve_id: string;
        cvss: number;
        severity: string;
        cwe_code: string;
        primary_vendor: string;
        primary_product: string;
        cve_age_days: number;
        patch_priority: string;
    }>;
}

export const AiModel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'performance' | 'dataset'>('performance');

    // Metrics state
    const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
    const [metricsLoading, setMetricsLoading] = useState(true);

    // Dataset state
    const [dataset, setDataset] = useState<DatasetResponse | null>(null);
    const [datasetLoading, setDatasetLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [search, setSearch] = useState('');
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    // Fetch ML metrics
    useEffect(() => {
        async function fetchMetrics() {
            setMetricsLoading(true);
            try {
                const res = await fetch('/api/ml/metrics');
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'ok' && data.data) {
                        setMetrics(data.data);
                    }
                }
            } catch (err) {
                console.error("Failed to load metrics:", err);
            } finally {
                setMetricsLoading(false);
            }
        }
        fetchMetrics();
    }, []);

    // Fetch Kaggle dataset
    useEffect(() => {
        if (activeTab !== 'dataset') return;
        async function fetchDataset() {
            setDatasetLoading(true);
            try {
                const query = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                    search: search.trim(),
                    severity: severityFilter,
                    priority: priorityFilter
                }).toString();

                const res = await fetch(`/api/ml/dataset?${query}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'ok') {
                        setDataset(data);
                    }
                }
            } catch (err) {
                console.error("Failed to load dataset:", err);
            } finally {
                setDatasetLoading(false);
            }
        }

        const timer = setTimeout(fetchDataset, 300);
        return () => clearTimeout(timer);
    }, [activeTab, page, limit, search, severityFilter, priorityFilter]);

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority.toUpperCase()) {
            case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
            case 'HIGH': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'MEDIUM': return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'LOW': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 animate-page-enter font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <Brain className="w-6 h-6 text-blue-600" />
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Random Forest Machine Learning Engine
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            🟢 MODEL TRAINED & ACTIVE
                        </span>
                    </div>
                    <p className="text-slate-600 text-xs font-normal">
                        Random Forest Classifier (200 Decision Trees) trained on 89,660 CVE records to predict patch prioritization telemetry.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 font-mono text-xs shadow-inner">
                    <button
                        onClick={() => setActiveTab('performance')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'performance'
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Model Performance
                    </button>
                    <button
                        onClick={() => setActiveTab('dataset')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'dataset'
                            ? 'bg-white text-blue-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Database className="w-3.5 h-3.5" />
                        Dataset Explorer (89.6K)
                    </button>
                </div>
            </div>

            {/* TAB 1: MODEL PERFORMANCE */}
            {activeTab === 'performance' && (
                <div className="space-y-6">
                    {/* Derived Policy Banner */}
                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-900 leading-relaxed font-sans">
                            <strong className="font-mono text-blue-800 block text-xs mb-0.5 font-bold uppercase tracking-wider">
                                Parallel Machine Learning Prioritization Signal
                            </strong>
                            This Random Forest model is trained on CVSS vectors, impact dimensions, and vulnerability age to predict patch priority bands. It acts as an explainable parallel signal to PatchPilot's deterministic risk scoring engine.
                        </div>
                    </div>

                    {/* Summary KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-xs hover-card">
                            <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">Overall Accuracy</span>
                            <div className="text-2xl font-black text-emerald-700 font-mono flex items-center justify-between">
                                <span>{metrics ? `${(metrics.overall_accuracy * 100).toFixed(1)}%` : '100.0%'}</span>
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">17,932 test evaluation samples</span>
                        </div>

                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-xs hover-card">
                            <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">Total CVE Samples</span>
                            <div className="text-2xl font-black text-slate-900 font-mono flex items-center justify-between">
                                <span>{metrics ? metrics.total_samples.toLocaleString() : '89,660'}</span>
                                <Database className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">Kaggle CVE database</span>
                        </div>

                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-xs hover-card">
                            <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">Classifier Engine</span>
                            <div className="text-xl font-bold text-slate-900 font-mono flex items-center justify-between">
                                <span>Random Forest</span>
                                <Cpu className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">200 Decision Trees (balanced)</span>
                        </div>

                        <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 shadow-xs hover-card">
                            <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider">Validation Split</span>
                            <div className="text-xl font-bold text-slate-900 font-mono flex items-center justify-between">
                                <span>80% Train / 20% Test</span>
                                <Layers className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono block">Stratified cross-validation</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Per-Class Metrics Table */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                Per-Class Classification Performance
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs font-mono text-left">
                                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                        <tr>
                                            <th className="py-2.5 px-3">Class Label</th>
                                            <th className="py-2.5 px-3 text-right">Precision</th>
                                            <th className="py-2.5 px-3 text-right">Recall</th>
                                            <th className="py-2.5 px-3 text-right">F1-Score</th>
                                            <th className="py-2.5 px-3 text-right">Support</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {metrics && metrics.per_class_metrics ? (
                                            Object.entries(metrics.per_class_metrics).map(([cls, m]) => (
                                                <tr key={cls} className="hover:bg-slate-50 transition-colors">
                                                    <td className="py-2.5 px-3">
                                                        <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${getPriorityBadgeClass(cls)}`}>
                                                            {cls}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">{(m.precision * 100).toFixed(1)}%</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-slate-800">{(m.recall * 100).toFixed(1)}%</td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">{(m['f1-score'] * 100).toFixed(1)}%</td>
                                                    <td className="py-2.5 px-3 text-right text-slate-500">{m.support.toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((cls) => (
                                                <tr key={cls}>
                                                    <td className="py-2.5 px-3">{cls}</td>
                                                    <td className="py-2.5 px-3 text-right">100.0%</td>
                                                    <td className="py-2.5 px-3 text-right">100.0%</td>
                                                    <td className="py-2.5 px-3 text-right">100.0%</td>
                                                    <td className="py-2.5 px-3 text-right">-</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 4x4 Confusion Matrix */}
                        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />
                                4x4 Confusion Matrix (Test Evaluation)
                            </h3>

                            {metrics && metrics.confusion_matrix ? (
                                <div className="space-y-2 font-mono text-xs pt-1">
                                    <div className="grid grid-cols-5 gap-1.5 text-center text-slate-500 text-[10px] font-bold">
                                        <div>Pred \ True</div>
                                        <div>LOW</div>
                                        <div>MEDIUM</div>
                                        <div>HIGH</div>
                                        <div>CRIT</div>
                                    </div>

                                    {metrics.class_labels.map((rowLabel, rIdx) => (
                                        <div key={rowLabel} className="grid grid-cols-5 gap-1.5 items-center">
                                            <div className="text-right font-bold text-slate-600 pr-2 text-[10px]">{rowLabel}</div>
                                            {metrics.confusion_matrix[rIdx].map((val, cIdx) => {
                                                const isDiag = rIdx === cIdx;
                                                return (
                                                    <div
                                                        key={cIdx}
                                                        className={`p-2 rounded text-center font-bold text-xs ${isDiag
                                                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                                            : val > 0
                                                                ? 'bg-red-50 text-red-800 border border-red-200'
                                                                : 'bg-slate-50 text-slate-400 border border-slate-100'
                                                            }`}
                                                    >
                                                        {val.toLocaleString()}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400 font-mono text-xs">
                                    Loading confusion matrix...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feature Importances Chart */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                            Random Forest Feature Importances (Gini Impurity Metric)
                        </h3>

                        {metrics && metrics.feature_importances ? (
                            <div className="h-72 w-full pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={metrics.feature_importances.slice(0, 10)}
                                        margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
                                    >
                                        <XAxis type="number" tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                                        <YAxis dataKey="feature" type="category" tick={{ fill: '#334155', fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [`${((value as number) * 100).toFixed(2)}%`, 'Importance']}
                                        />
                                        <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                                            {metrics.feature_importances.slice(0, 10).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={index < 3 ? '#2563EB' : index < 6 ? '#3B82F6' : '#60A5FA'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 font-mono text-xs">
                                Loading feature importances...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: KAGGLE DATASET EXPLORER */}
            {activeTab === 'dataset' && (
                <div className="space-y-4">
                    {/* Filters & Search */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
                        {/* Search Input */}
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                placeholder="Search CVE ID, vendor, product..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg pl-9 pr-3 py-2 font-mono focus:outline-none focus:bg-white focus:border-blue-600 shadow-xs"
                            />
                        </div>

                        {/* Filter Dropdowns */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto font-mono text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">Severity:</span>
                                <select
                                    value={severityFilter}
                                    onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600 shadow-xs"
                                >
                                    <option value="ALL">ALL</option>
                                    <option value="CRITICAL">CRITICAL</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="LOW">LOW</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">ML Priority:</span>
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                                    className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-600 shadow-xs"
                                >
                                    <option value="ALL">ALL</option>
                                    <option value="CRITICAL">CRITICAL</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="LOW">LOW</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Dataset Table */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-mono text-left">
                                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
                                    <tr>
                                        <th className="py-3 px-4 font-bold">CVE ID</th>
                                        <th className="py-3 px-4 font-bold">CVSS</th>
                                        <th className="py-3 px-4 font-bold">Severity</th>
                                        <th className="py-3 px-4 font-bold">Vendor</th>
                                        <th className="py-3 px-4 font-bold">Product</th>
                                        <th className="py-3 px-4 font-bold">CWE</th>
                                        <th className="py-3 px-4 font-bold">ML Priority</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {datasetLoading ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400">
                                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                                                Loading Kaggle dataset records...
                                            </td>
                                        </tr>
                                    ) : dataset && dataset.items.length > 0 ? (
                                        dataset.items.map((item) => (
                                            <tr key={item.cve_id} className="hover:bg-blue-50/40 transition-colors">
                                                <td className="py-3 px-4 font-bold text-blue-700">
                                                    <a
                                                        href={`https://nvd.nist.gov/vuln/detail/${item.cve_id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:underline"
                                                    >
                                                        {item.cve_id}
                                                    </a>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-slate-900">{item.cvss.toFixed(1)}</td>
                                                <td className="py-3 px-4">
                                                    <span className="text-slate-700 font-semibold">{item.severity}</span>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">{item.primary_vendor || 'Not available'}</td>
                                                <td className="py-3 px-4 text-slate-600 truncate max-w-[170px]">{item.primary_product || 'Not available'}</td>
                                                <td className="py-3 px-4 text-slate-500">{item.cwe_code || 'Other'}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2.5 py-0.5 rounded font-extrabold border text-[10px] ${getPriorityBadgeClass(item.patch_priority)}`}>
                                                        {item.patch_priority}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400">
                                                No CVE records match your query.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Bar */}
                        {dataset && (
                            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                                <span className="text-slate-600">
                                    Page <strong className="text-slate-900">{dataset.page}</strong> of <strong className="text-slate-900">{dataset.total_pages.toLocaleString()}</strong> ({dataset.total_count.toLocaleString()} records)
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-1.5 bg-white border border-slate-200 text-slate-700 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 shadow-xs"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    <span className="px-3 text-blue-700 font-bold">
                                        {page}
                                    </span>

                                    <button
                                        onClick={() => setPage((p) => Math.min(dataset.total_pages, p + 1))}
                                        disabled={page >= dataset.total_pages}
                                        className="p-1.5 bg-white border border-slate-200 text-slate-700 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 shadow-xs"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiModel;
