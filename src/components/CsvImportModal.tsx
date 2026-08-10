import React, { useState, useRef } from 'react';
import {
    X,
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    FileText,
    Layers,
    Trash2,
    Database,
    Cpu,
    ArrowRight,
    Sparkles,
    Check
} from 'lucide-react';
import { useVulnerability, ImportSummary } from '../context/VulnerabilityContext';

export const CsvImportModal: React.FC = () => {
    const { isCsvModalOpen, setIsCsvModalOpen, importDatasetFiles, isImporting, importProgress } = useVulnerability();

    const [mode, setMode] = useState<'single' | 'multi'>('single');

    // Files state
    const [cveFile, setCveFile] = useState<File | null>(null);
    const [vendorFile, setVendorFile] = useState<File | null>(null);
    const [productFile, setProductFile] = useState<File | null>(null);
    const [vendorProductFile, setVendorProductFile] = useState<File | null>(null);

    // Pre-upload validation stats
    const [cveStats, setCveStats] = useState<{
        filename: string;
        sizeBytes: number;
        totalRows: number;
        validCvss: number;
        missingCvss: number;
        duplicates: number;
        detectedCols: string[];
        isValid: boolean;
        errorMessage?: string;
    } | null>(null);

    const [generalError, setGeneralError] = useState<string | null>(null);
    const [importSuccessResult, setImportSuccessResult] = useState<ImportSummary | null>(null);

    // Drag-over states
    const [dragOverCard, setDragOverCard] = useState<string | null>(null);

    // Refs
    const cveInputRef = useRef<HTMLInputElement>(null);
    const vendorInputRef = useRef<HTMLInputElement>(null);
    const productInputRef = useRef<HTMLInputElement>(null);
    const vendorProductInputRef = useRef<HTMLInputElement>(null);

    if (!isCsvModalOpen) return null;

    // Actual sample CVE schema (labeled clearly as DEMO DATA)
    const DEMO_SAMPLE_CSV = `cve_id,cvss,severity,summary,cwe_code
CVE-DEMO-001,9.8,Critical,Critical authentication bypass in internal gateway daemon,CWE-79
CVE-DEMO-002,8.1,High,Remote code execution via unchecked network buffer,CWE-89
CVE-DEMO-003,5.5,Medium,Cross-site scripting vulnerability in user feedback module,CWE-200
CVE-DEMO-004,3.2,Low,Information disclosure in debug logging interface,CWE-399
CVE-DEMO-005,9.1,Critical,Privilege escalation in kernel driver component,CWE-264`;

    // Fast CSV pre-validator
    const validateCveFile = (file: File) => {
        setGeneralError(null);
        setImportSuccessResult(null);

        if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt')) {
            setCveStats({
                filename: file.name,
                sizeBytes: file.size,
                totalRows: 0,
                validCvss: 0,
                missingCvss: 0,
                duplicates: 0,
                detectedCols: [],
                isValid: false,
                errorMessage: 'Unsupported file type. Please upload a .csv file.'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = (e.target?.result as string) || '';
                const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);

                if (lines.length < 2) {
                    setCveStats({
                        filename: file.name,
                        sizeBytes: file.size,
                        totalRows: 0,
                        validCvss: 0,
                        missingCvss: 0,
                        duplicates: 0,
                        detectedCols: [],
                        isValid: false,
                        errorMessage: 'The uploaded CSV dataset is empty or contains no data rows.'
                    });
                    return;
                }

                // Check headers
                const rawHeaders = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
                const detectedCols = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());

                const hasCveId = rawHeaders.some((h) => ['cve_id', 'cveid', 'cve', 'cve_name'].includes(h));
                const hasCvss = rawHeaders.some((h) => ['cvss', 'cvss_score', 'score', 'cvss_base_score'].includes(h));

                if (!hasCveId) {
                    setCveStats({
                        filename: file.name,
                        sizeBytes: file.size,
                        totalRows: lines.length - 1,
                        validCvss: 0,
                        missingCvss: 0,
                        duplicates: 0,
                        detectedCols,
                        isValid: false,
                        errorMessage: "Missing required column 'cve_id'. Please upload a valid CVE dataset."
                    });
                    return;
                }

                if (!hasCvss) {
                    setCveStats({
                        filename: file.name,
                        sizeBytes: file.size,
                        totalRows: lines.length - 1,
                        validCvss: 0,
                        missingCvss: 0,
                        duplicates: 0,
                        detectedCols,
                        isValid: false,
                        errorMessage: "Missing required column 'cvss'. Please upload a valid CVE dataset."
                    });
                    return;
                }

                // Quick inspection of first 2,000 lines
                const sampleRows = lines.slice(1, 2500);
                const cveIdx = rawHeaders.findIndex((h) => ['cve_id', 'cveid', 'cve', 'cve_name'].includes(h));
                const cvssIdx = rawHeaders.findIndex((h) => ['cvss', 'cvss_score', 'score', 'cvss_base_score'].includes(h));

                let validCvssCount = 0;
                let missingCvssCount = 0;
                const seenCves = new Set<string>();
                let dupes = 0;

                sampleRows.forEach((line) => {
                    const parts = line.split(',');
                    const cve = parts[cveIdx]?.replace(/^["']|["']$/g, '').trim().toUpperCase();
                    const cvssRaw = parseFloat(parts[cvssIdx]?.replace(/^["']|["']$/g, '').trim());

                    if (cve) {
                        if (seenCves.has(cve)) dupes++;
                        else seenCves.add(cve);
                    }

                    if (!isNaN(cvssRaw) && cvssRaw >= 0 && cvssRaw <= 10) {
                        validCvssCount++;
                    } else {
                        missingCvssCount++;
                    }
                });

                // Scale estimated ratio for large datasets
                const totalRows = lines.length - 1;
                const ratio = validCvssCount / Math.max(1, sampleRows.length);
                const estimatedValid = Math.round(totalRows * ratio);
                const estimatedMissing = totalRows - estimatedValid;

                setCveStats({
                    filename: file.name,
                    sizeBytes: file.size,
                    totalRows,
                    validCvss: estimatedValid,
                    missingCvss: estimatedMissing,
                    duplicates: dupes,
                    detectedCols,
                    isValid: true
                });
            } catch (err: any) {
                setCveStats({
                    filename: file.name,
                    sizeBytes: file.size,
                    totalRows: 0,
                    validCvss: 0,
                    missingCvss: 0,
                    duplicates: 0,
                    detectedCols: [],
                    isValid: false,
                    errorMessage: `Malformed CSV file: ${err.message}`
                });
            }
        };
        reader.readAsText(file.slice(0, 1024 * 1024)); // Read first 1MB for instant validation
    };

    const handleCveFileSelect = (file: File | null) => {
        setCveFile(file);
        if (file) {
            validateCveFile(file);
        } else {
            setCveStats(null);
        }
    };

    const handleLoadSample = () => {
        const blob = new Blob([DEMO_SAMPLE_CSV], { type: 'text/csv' });
        const sampleFile = new File([blob], 'demo_sample_cve.csv', { type: 'text/csv' });
        handleCveFileSelect(sampleFile);
    };

    const handleProcessDataset = async () => {
        if (!cveFile) {
            setGeneralError('Please choose or drop a primary CVE dataset CSV file before processing.');
            return;
        }

        if (cveStats && !cveStats.isValid) {
            setGeneralError(cveStats.errorMessage || 'Please fix the CSV file errors before processing.');
            return;
        }

        setGeneralError(null);
        setImportSuccessResult(null);

        const formData = new FormData();
        formData.append('cve_file', cveFile);

        if (vendorFile) {
            formData.append('vendor_file', vendorFile);
        }
        if (productFile) {
            formData.append('product_file', productFile);
        }
        if (vendorProductFile) {
            formData.append('vendor_product_file', vendorProductFile);
        }

        const summary = await importDatasetFiles(formData);

        if (summary.success) {
            setImportSuccessResult(summary);
        } else {
            setGeneralError(summary.errorDetail || summary.message || 'The server could not process the uploaded file.');
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-page-enter">
            <div
                className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Import Vulnerability Dataset</h2>
                            <p className="text-xs text-slate-500">
                                Upload your CVE dataset. PatchPilot will automatically validate, process, and generate ML predictions.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (!isImporting) {
                                setIsCsvModalOpen(false);
                                setImportSuccessResult(null);
                                setGeneralError(null);
                            }
                        }}
                        disabled={isImporting}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs font-sans">
                    {/* Option A vs Option B Selector */}
                    <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setMode('single')}
                            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${mode === 'single'
                                ? 'bg-white text-blue-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Option A — Primary CVE Dataset
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('multi')}
                            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${mode === 'multi'
                                ? 'bg-white text-blue-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Option B — Complete Dataset (4 Files)
                        </button>
                    </div>

                    {/* Progress Bar during import */}
                    {isImporting && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-3.5 animate-page-enter">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                                    <span className="font-bold text-slate-900 text-sm">{importProgress.statusText}</span>
                                </div>
                                <span className="font-mono font-black text-blue-600 text-sm">
                                    {importProgress.progressPercent}%
                                </span>
                            </div>

                            {/* Progress bar line */}
                            <div className="h-2.5 bg-blue-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${importProgress.progressPercent}%` }}
                                />
                            </div>

                            {/* Step list */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px] text-slate-600">
                                <div className={`flex items-center gap-1.5 ${importProgress.progressPercent >= 15 ? 'text-blue-700 font-bold' : ''}`}>
                                    <Check className="w-3.5 h-3.5 text-blue-600" /> Reading CSV
                                </div>
                                <div className={`flex items-center gap-1.5 ${importProgress.progressPercent >= 35 ? 'text-blue-700 font-bold' : ''}`}>
                                    <Check className="w-3.5 h-3.5 text-blue-600" /> Validating Columns
                                </div>
                                <div className={`flex items-center gap-1.5 ${importProgress.progressPercent >= 55 ? 'text-blue-700 font-bold' : ''}`}>
                                    <Check className="w-3.5 h-3.5 text-blue-600" /> Cleaning & Joining
                                </div>
                                <div className={`flex items-center gap-1.5 ${importProgress.progressPercent >= 75 ? 'text-blue-700 font-bold' : ''}`}>
                                    <Check className="w-3.5 h-3.5 text-blue-600" /> Random Forest ML
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Import Success Notification */}
                    {importSuccessResult && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900 space-y-2 animate-page-enter">
                            <div className="flex items-center gap-2 font-bold text-sm text-emerald-700">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>Import completed successfully!</span>
                            </div>
                            <div className="text-xs text-emerald-800 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono pt-1">
                                <div className="bg-white/80 p-2 rounded border border-emerald-100">
                                    <span className="text-[10px] text-slate-500 block">PROCESSED</span>
                                    <span className="font-bold text-sm text-slate-900">
                                        {importSuccessResult.recordsProcessed.toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-white/80 p-2 rounded border border-emerald-100">
                                    <span className="text-[10px] text-slate-500 block">ML PREDICTIONS</span>
                                    <span className="font-bold text-sm text-blue-600">
                                        {importSuccessResult.predictionsGenerated.toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-white/80 p-2 rounded border border-emerald-100">
                                    <span className="text-[10px] text-slate-500 block">DUPLICATES REMOVED</span>
                                    <span className="font-bold text-sm text-slate-700">
                                        {importSuccessResult.duplicatesRemoved.toLocaleString()}
                                    </span>
                                </div>
                                <div className="bg-white/80 p-2 rounded border border-emerald-100">
                                    <span className="text-[10px] text-slate-500 block">CRITICAL PRIORITY</span>
                                    <span className="font-bold text-sm text-red-600">
                                        {importSuccessResult.priorityCounts.CRITICAL.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <p className="text-[11px] text-emerald-700 font-medium pt-1">
                                ✓ Dashboard statistics, vulnerability table, and patch queue have been automatically refreshed.
                            </p>
                        </div>
                    )}

                    {/* General Error Banner */}
                    {generalError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-900 space-y-2 animate-page-enter">
                            <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                <span>Import failed</span>
                            </div>
                            <p className="text-xs text-red-800 leading-relaxed font-mono">
                                {generalError}
                            </p>
                            <div className="pt-1">
                                <button
                                    onClick={handleProcessDataset}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold font-mono transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Mode A: Single CVE Dataset Upload */}
                    {mode === 'single' && (
                        <div className="space-y-4">
                            {/* Primary CVE Upload Dropzone */}
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOverCard('cve'); }}
                                onDragLeave={() => setDragOverCard(null)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setDragOverCard(null);
                                    if (e.dataTransfer.files?.[0]) handleCveFileSelect(e.dataTransfer.files[0]);
                                }}
                                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragOverCard === 'cve'
                                    ? 'border-blue-500 bg-blue-50/50'
                                    : cveFile
                                        ? 'border-emerald-300 bg-emerald-50/30'
                                        : 'border-slate-200 hover:border-blue-400 bg-slate-50/50'
                                    }`}
                            >
                                <input
                                    ref={cveInputRef}
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={(e) => handleCveFileSelect(e.target.files?.[0] || null)}
                                    className="hidden"
                                />

                                {cveFile ? (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center space-x-3 text-left">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-900 text-sm block">{cveFile.name}</span>
                                                <span className="text-xs text-slate-500 font-mono">
                                                    {formatBytes(cveFile.size)} • {cveStats?.totalRows ? `${cveStats.totalRows.toLocaleString()} rows detected` : 'Ready'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => cveInputRef.current?.click()}
                                                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-xs shadow-xs"
                                            >
                                                Change File
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleCveFileSelect(null)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                title="Remove file"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 py-3">
                                        <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">
                                                Drag & Drop <code className="text-blue-600">cleaned_cve.csv</code> here
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                or click below to browse from your device (.csv supported)
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center gap-3 pt-1">
                                            <button
                                                type="button"
                                                onClick={() => cveInputRef.current?.click()}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                                            >
                                                Choose File
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleLoadSample}
                                                className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-mono text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                                            >
                                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                                                Load Sample CSV
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pre-upload Validation Box */}
                            {cveStats && (
                                <div className={`p-4 rounded-xl border text-xs font-mono space-y-2 ${cveStats.isValid
                                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                    <div className="flex items-center justify-between font-bold">
                                        <span className="flex items-center gap-1.5">
                                            {cveStats.isValid ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                            )}
                                            {cveStats.isValid ? '✓ File Validated Successfully' : 'Validation Warning'}
                                        </span>
                                        <span className="text-[11px] text-slate-500">{cveStats.filename}</span>
                                    </div>

                                    {cveStats.isValid ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                            <div className="bg-white p-2 rounded border border-slate-200">
                                                <span className="text-[10px] text-slate-500 block">CVE RECORDS</span>
                                                <span className="font-bold text-slate-900 text-xs">
                                                    {cveStats.totalRows.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="bg-white p-2 rounded border border-slate-200">
                                                <span className="text-[10px] text-slate-500 block">VALID CVSS</span>
                                                <span className="font-bold text-emerald-700 text-xs">
                                                    {cveStats.validCvss.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="bg-white p-2 rounded border border-slate-200">
                                                <span className="text-[10px] text-slate-500 block">MISSING CVSS</span>
                                                <span className="font-bold text-amber-700 text-xs">
                                                    {cveStats.missingCvss.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="bg-white p-2 rounded border border-slate-200">
                                                <span className="text-[10px] text-slate-500 block">DUPLICATES</span>
                                                <span className="font-bold text-slate-700 text-xs">
                                                    {cveStats.duplicates.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-red-700 text-xs">{cveStats.errorMessage}</p>
                                    )}
                                </div>
                            )}

                            {/* Schema Help Card */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-600 space-y-1">
                                <span className="font-bold text-slate-800 block text-[11px]">Minimum Required Columns:</span>
                                <code className="text-blue-700 block text-[11px]">
                                    cve_id, cvss, severity, summary
                                </code>
                                <span className="text-[11px] text-slate-500 block mt-1">
                                    All additional Kaggle columns (mod_date, pub_date, cwe_code, access_vector, impact metrics) are detected and used automatically.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Mode B: Complete 4-Dataset Upload */}
                    {mode === 'multi' && (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-600">
                                Upload the four Kaggle datasets. PatchPilot will automatically join them on <code className="text-blue-600 font-mono">cve_id</code>.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Card 1: CVE Dataset */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOverCard('cve_multi'); }}
                                    onDragLeave={() => setDragOverCard(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOverCard(null);
                                        if (e.dataTransfer.files?.[0]) handleCveFileSelect(e.dataTransfer.files[0]);
                                    }}
                                    className={`p-4 rounded-xl border-2 border-dashed transition-all ${dragOverCard === 'cve_multi'
                                        ? 'border-blue-500 bg-blue-50/50'
                                        : cveFile
                                            ? 'border-emerald-300 bg-emerald-50/30'
                                            : 'border-slate-200 hover:border-blue-300 bg-slate-50/50'
                                        }`}
                                >
                                    <input
                                        ref={cveInputRef}
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={(e) => handleCveFileSelect(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                                📄 CVE Dataset <span className="text-red-500 font-bold">*</span>
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-mono block">
                                                {cveFile ? `${cveFile.name} (${formatBytes(cveFile.size)})` : 'Upload cleaned_cve.csv'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => cveInputRef.current?.click()}
                                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium rounded shadow-xs"
                                        >
                                            {cveFile ? 'Replace' : 'Choose File'}
                                        </button>
                                    </div>
                                </div>

                                {/* Card 2: Vendor Dataset */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOverCard('vendor'); }}
                                    onDragLeave={() => setDragOverCard(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOverCard(null);
                                        if (e.dataTransfer.files?.[0]) setVendorFile(e.dataTransfer.files[0]);
                                    }}
                                    className={`p-4 rounded-xl border-2 border-dashed transition-all ${dragOverCard === 'vendor'
                                        ? 'border-blue-500 bg-blue-50/50'
                                        : vendorFile
                                            ? 'border-emerald-300 bg-emerald-50/30'
                                            : 'border-slate-200 hover:border-blue-300 bg-slate-50/50'
                                        }`}
                                >
                                    <input
                                        ref={vendorInputRef}
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={(e) => setVendorFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                                🏢 Vendor Dataset
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-mono block">
                                                {vendorFile ? `${vendorFile.name} (${formatBytes(vendorFile.size)})` : 'Upload cleaned_vendors.csv'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => vendorInputRef.current?.click()}
                                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium rounded shadow-xs"
                                        >
                                            {vendorFile ? 'Replace' : 'Choose File'}
                                        </button>
                                    </div>
                                </div>

                                {/* Card 3: Product Dataset */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOverCard('product'); }}
                                    onDragLeave={() => setDragOverCard(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOverCard(null);
                                        if (e.dataTransfer.files?.[0]) setProductFile(e.dataTransfer.files[0]);
                                    }}
                                    className={`p-4 rounded-xl border-2 border-dashed transition-all ${dragOverCard === 'product'
                                        ? 'border-blue-500 bg-blue-50/50'
                                        : productFile
                                            ? 'border-emerald-300 bg-emerald-50/30'
                                            : 'border-slate-200 hover:border-blue-300 bg-slate-50/50'
                                        }`}
                                >
                                    <input
                                        ref={productInputRef}
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                                📦 Product Dataset
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-mono block">
                                                {productFile ? `${productFile.name} (${formatBytes(productFile.size)})` : 'Upload cleaned_products.csv'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => productInputRef.current?.click()}
                                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium rounded shadow-xs"
                                        >
                                            {productFile ? 'Replace' : 'Choose File'}
                                        </button>
                                    </div>
                                </div>

                                {/* Card 4: Vendor-Product Dataset */}
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOverCard('vendor_prod'); }}
                                    onDragLeave={() => setDragOverCard(null)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragOverCard(null);
                                        if (e.dataTransfer.files?.[0]) setVendorProductFile(e.dataTransfer.files[0]);
                                    }}
                                    className={`p-4 rounded-xl border-2 border-dashed transition-all ${dragOverCard === 'vendor_prod'
                                        ? 'border-blue-500 bg-blue-50/50'
                                        : vendorProductFile
                                            ? 'border-emerald-300 bg-emerald-50/30'
                                            : 'border-slate-200 hover:border-blue-300 bg-slate-50/50'
                                        }`}
                                >
                                    <input
                                        ref={vendorProductInputRef}
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={(e) => setVendorProductFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                                🔗 Vendor-Product Dataset
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-mono block">
                                                {vendorProductFile ? `${vendorProductFile.name} (${formatBytes(vendorProductFile.size)})` : 'Upload cleaned_vendor_product.csv'}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => vendorProductInputRef.current?.click()}
                                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-medium rounded shadow-xs"
                                        >
                                            {vendorProductFile ? 'Replace' : 'Choose File'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-slate-500 italic">
                                * Note: Only the primary CVE dataset is required. If vendor/product datasets are omitted, those attributes default to "Not available".
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1.5 font-bold"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Load Sample CSV (DEMO DATA)
                    </button>

                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCsvModalOpen(false);
                                setImportSuccessResult(null);
                                setGeneralError(null);
                            }}
                            disabled={isImporting}
                            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleProcessDataset}
                            disabled={!cveFile || isImporting}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isImporting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    <span>Processing Dataset...</span>
                                </>
                            ) : (
                                <>
                                    <span>Process Dataset</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CsvImportModal;
