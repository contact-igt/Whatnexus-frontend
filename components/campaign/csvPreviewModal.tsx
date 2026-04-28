"use client";

import { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';
import type { CSVRecipient } from '@/services/campaign/campaign.types';

interface CSVPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: CSVRecipient[]) => void;
    csvData: CSVRecipient[];
    fileName: string;
    validation: {
        isValid: boolean;
        validRows: CSVRecipient[];
        errors: Array<any>;
    };
    expectedVariableColumns?: string[]; // e.g. ['customer_name','date']
    templateName?: string;              // used in the format guide header and download button
    onAutoFix?: () => void;
    onSkipErrors?: () => void;
    onDownloadErrors?: () => void;
    onDownloadTemplate?: () => void;    // lets user grab the correct template right from the guide
}

export const CSVPreviewModal = ({
    isOpen,
    onClose,
    onConfirm,
    csvData,
    fileName,
    validation,
    expectedVariableColumns = [],
    templateName,
    onAutoFix, onSkipErrors, onDownloadErrors, onDownloadTemplate
}: CSVPreviewModalProps) => {
    const { isDarkMode } = useTheme();
    const [showInstructions, setShowInstructions] = useState(false);
    const [showErrors, setShowErrors] = useState(true);

    // Build a per-row (0-based index) → error messages map from the flat errors array
    // validateCSVRowsDetailed uses rowIndex = dataRowIndex + 2 (header = row 1)
    // validateCSVData uses field = "Row N" where N = dataRowIndex + 2
    const rowErrorMap: Record<number, string[]> = {};
    (validation.errors || []).forEach((err: any) => {
        let zeroIdx: number | null = null;
        if (typeof err.rowIndex === 'number' && err.rowIndex >= 2) {
            zeroIdx = err.rowIndex - 2;
        } else if (typeof err.field === 'string' && err.field.startsWith('Row ')) {
            const n = parseInt(err.field.replace('Row ', ''), 10);
            if (!isNaN(n) && n >= 2) zeroIdx = n - 2;
        }
        if (zeroIdx !== null) {
            if (!rowErrorMap[zeroIdx]) rowErrorMap[zeroIdx] = [];
            rowErrorMap[zeroIdx].push(err.message);
        }
    });

    const hasHeaderErrors = (validation.errors || []).some(
        (e: any) => e.field === 'Header' || (typeof e.rowIndex === 'number' && e.rowIndex === 0)
    );

    const handleConfirm = () => {
        if (validation.isValid) {
            onConfirm(validation.validRows);
            onClose();
        }
    };

    if (!isOpen) return null;

    const totalContacts = csvData.length;
    const validContacts = validation.validRows.length;
    const invalidContacts = totalContacts - validContacts;
    const hasErrors = validation.errors.length > 0;

    // Separate header-level errors (can't be fixed by Auto-fix or Skip) from row-level errors
    const headerErrors = (validation.errors || []).filter(
        (e: any) => e.field === 'Header' || (typeof e.rowIndex === 'number' && e.rowIndex === 0)
    );
    const rowErrors = (validation.errors || []).filter(
        (e: any) => e.field !== 'Header' && !(typeof e.rowIndex === 'number' && e.rowIndex === 0)
    );
    const onlyHeaderErrors = hasErrors && rowErrors.length === 0;
    // Auto-fix can only help when there are row-level data errors
    const canAutoFix = rowErrors.length > 0 && !!onAutoFix;
    // Skip is only useful when some rows are valid and some aren't
    const canSkip = validContacts > 0 && invalidContacts > 0 && !!onSkipErrors;
    const canDownload = validation.errors.length > 0 && !!onDownloadErrors;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h2 className={cn("text-2xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            CSV Preview
                        </h2>
                        <p className={cn("text-sm mt-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            {fileName} • {totalContacts} contacts loaded
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                        )}
                    >
                        <X size={20} className={isDarkMode ? 'text-white/60' : 'text-slate-600'} />
                    </button>
                </div>

                {/* Validation Summary */}
                <div className={cn(
                    "px-6 py-3 border-b border-white/10",
                    hasErrors ? (isDarkMode ? 'bg-red-500/5' : 'bg-red-50') : (isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-50')
                )}>
                    {/* Single row: status left, all actions right */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">

                        {/* Left — icon + summary text */}
                        <div className="flex items-center gap-3 min-w-0">
                            {hasErrors
                                ? <AlertCircle size={18} className="text-red-500 shrink-0" />
                                : <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            }
                            <div className="min-w-0">
                                <p className={cn("text-sm font-bold leading-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {hasErrors ? 'CSV Validation Issues Found' : 'All Rows Valid ✓'}
                                </p>
                                <p className={cn("text-xs mt-0.5", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    {hasErrors ? (
                                        <>
                                            <span className="text-emerald-500 font-semibold">{validContacts} valid</span>
                                            {' • '}
                                            <span className="text-red-400 font-semibold">{invalidContacts} invalid row{invalidContacts !== 1 ? 's' : ''}</span>
                                            {headerErrors.length > 0 && (
                                                <> • <span className="text-amber-400 font-semibold">{headerErrors.length} header error{headerErrors.length !== 1 ? 's' : ''}</span></>
                                            )}
                                            {rowErrors.length > 0 && (
                                                <> • <span className="text-red-400">{rowErrors.length} row error{rowErrors.length !== 1 ? 's' : ''}</span></>
                                            )}
                                        </>
                                    ) : (
                                        <>{validContacts} contact{validContacts !== 1 ? 's' : ''} ready to submit</>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Right — action buttons + format guide, all on same baseline */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">

                            {/* Auto-fix: only useful for row-level data errors, not header issues */}
                            <button
                                onClick={() => canAutoFix && onAutoFix!()}
                                disabled={!canAutoFix}
                                title={
                                    !onAutoFix ? 'Auto-fix not available'
                                    : onlyHeaderErrors ? 'Cannot auto-fix missing header columns — re-download the template'
                                    : 'Trim whitespace and fix phone number formatting'
                                }
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                    canAutoFix
                                        ? isDarkMode
                                            ? 'bg-white/8 border-white/15 text-white hover:bg-white/15'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        : 'opacity-40 cursor-not-allowed ' + (isDarkMode ? 'bg-white/5 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-400')
                                )}
                            >
                                Auto-fix CSV
                            </button>

                            {/* Skip: only useful when there are valid rows to keep */}
                            <button
                                onClick={() => canSkip && onSkipErrors!()}
                                disabled={!canSkip}
                                title={
                                    !onSkipErrors ? 'Skip not available'
                                    : validContacts === 0 ? 'No valid rows to keep after skipping'
                                    : invalidContacts === 0 ? 'No invalid rows to skip'
                                    : `Remove ${invalidContacts} invalid row${invalidContacts !== 1 ? 's' : ''}, keep ${validContacts} valid`
                                }
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                    canSkip
                                        ? isDarkMode
                                            ? 'bg-white/8 border-white/15 text-white hover:bg-white/15'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        : 'opacity-40 cursor-not-allowed ' + (isDarkMode ? 'bg-white/5 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-400')
                                )}
                            >
                                {canSkip ? `Skip ${invalidContacts} invalid` : 'Skip invalid rows'}
                            </button>

                            {/* Download errors: available whenever errors exist */}
                            <button
                                onClick={() => canDownload && onDownloadErrors!()}
                                disabled={!canDownload}
                                title={canDownload ? 'Download a CSV of errored rows with error messages' : 'No errors to download'}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                    canDownload
                                        ? isDarkMode
                                            ? 'bg-white/8 border-white/15 text-white hover:bg-white/15'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        : 'opacity-40 cursor-not-allowed ' + (isDarkMode ? 'bg-white/5 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-400')
                                )}
                            >
                                Download errors
                            </button>

                            {/* Divider */}
                            <div className={cn("h-5 w-px", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />

                            {/* Format Guide toggle */}
                            <button
                                onClick={() => setShowInstructions(p => !p)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                                    showInstructions
                                        ? isDarkMode ? 'bg-blue-500/15 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'
                                        : isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                )}
                            >
                                <Info size={13} />
                                Format Guide
                                {showInstructions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                        </div>
                    </div>

                    {/* CSV Format Guide — template-aware */}
                    {showInstructions && (() => {
                        const allCols = ['country_code', 'mobile_number', ...expectedVariableColumns];
                        const exampleValues: Record<string, string> = {
                            country_code: '91',
                            mobile_number: '9876543210',
                        };
                        expectedVariableColumns.forEach((col, i) => {
                            const lower = col.toLowerCase();
                            if (/name|customer|patient|client/.test(lower)) exampleValues[col] = 'John Doe';
                            else if (/date|day|schedule/.test(lower)) exampleValues[col] = '2024-12-25';
                            else if (/time|slot/.test(lower)) exampleValues[col] = '10:30 AM';
                            else if (/email/.test(lower)) exampleValues[col] = 'john@example.com';
                            else if (/phone|mobile/.test(lower)) exampleValues[col] = '9876543210';
                            else if (/amount|price|fee/.test(lower)) exampleValues[col] = '499';
                            else if (/code|otp/.test(lower)) exampleValues[col] = '123456';
                            else exampleValues[col] = `Value ${i + 1}`;
                        });

                        return (
                            <div className={cn(
                                "mt-3 p-4 rounded-xl border",
                                isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'
                            )}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <FileSpreadsheet size={16} className="text-blue-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0 space-y-3">
                                            <div>
                                                <p className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                    Required Format{templateName ? ` for "${templateName}"` : ''}
                                                </p>
                                                <p className={cn("text-xs mt-0.5", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                                    Your CSV must have these exact column headers in row 1:
                                                </p>
                                            </div>

                                            {/* Exact column header preview */}
                                            <div className={cn("rounded-lg overflow-hidden border text-xs font-mono", isDarkMode ? 'border-white/10' : 'border-slate-200')}>
                                                {/* Header row */}
                                                <div className={cn("flex divide-x overflow-x-auto", isDarkMode ? 'bg-emerald-900/20 divide-white/10' : 'bg-emerald-50 divide-emerald-200')}>
                                                    {allCols.map((col, i) => (
                                                        <div key={col} className={cn(
                                                            "px-3 py-1.5 whitespace-nowrap font-bold",
                                                            i < 2
                                                                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
                                                                : isDarkMode ? 'text-blue-400' : 'text-blue-700'
                                                        )}>
                                                            {col}
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Example data row */}
                                                <div className={cn("flex divide-x overflow-x-auto", isDarkMode ? 'bg-black/20 divide-white/10' : 'bg-white divide-slate-100')}>
                                                    {allCols.map((col) => (
                                                        <div key={col} className={cn(
                                                            "px-3 py-1.5 whitespace-nowrap",
                                                            isDarkMode ? 'text-white/60' : 'text-slate-600'
                                                        )}>
                                                            {exampleValues[col]}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Column legend */}
                                            <div className="flex flex-wrap gap-2 text-[10px]">
                                                <span className={cn("flex items-center gap-1 px-2 py-1 rounded border font-semibold", isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700')}>
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                                    country_code, mobile_number — required phone columns
                                                </span>
                                                {expectedVariableColumns.length > 0 && (
                                                    <span className={cn("flex items-center gap-1 px-2 py-1 rounded border font-semibold", isDarkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700')}>
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                                                        {expectedVariableColumns.join(', ')} — template variable{expectedVariableColumns.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Download template button */}
                                    {onDownloadTemplate && (
                                        <button
                                            onClick={onDownloadTemplate}
                                            className={cn(
                                                "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all",
                                                isDarkMode
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                            )}
                                        >
                                            <FileSpreadsheet size={13} />
                                            Download Template
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Smart Error Diagnosis */}
                {hasErrors && (() => {
                    // Detect specific error patterns to give targeted fix guidance
                    const errorMessages = (validation.errors || []).map((e: any) => (e.message || '').toLowerCase());
                    const allMessages = errorMessages.join(' ');

                    const isErrorReportFile = (validation.errors || []).some(
                        (e: any) => /duplicate.*error_message|error_message.*duplicate/i.test(e.message || '')
                    ) || /csv_errors?_/.test(fileName.toLowerCase());

                    const missingCols = (validation.errors || [])
                        .filter((e: any) => /missing required column/i.test(e.message || ''))
                        .map((e: any) => {
                            const m = (e.message || '').match(/missing required column:\s*(\S+)/i);
                            return m ? m[1] : null;
                        }).filter(Boolean) as string[];

                    const missingVarCols = (validation.errors || [])
                        .filter((e: any) => /missing variable column/i.test(e.message || ''))
                        .map((e: any) => {
                            const m = (e.message || '').match(/missing variable column:\s*(\S+)/i);
                            return m ? m[1] : null;
                        }).filter(Boolean) as string[];

                    const duplicateCols = (validation.errors || [])
                        .filter((e: any) => /duplicate header/i.test(e.message || ''))
                        .map((e: any) => {
                            const m = (e.message || '').match(/duplicate header name:\s*(\S+)/i);
                            return m ? m[1] : null;
                        }).filter(Boolean) as string[];

                    const hasPhoneErrors = /invalid.*country code|invalid.*mobile|invalid.*phone|invalid.*local number/i.test(allMessages);
                    const hasEmptyVarErrors = /empty value|one or more dynamic variables are empty/i.test(allMessages);

                    // Build fix steps based on detected patterns
                    type FixStep = { label: string; detail: string; severity: 'error' | 'warn' };
                    const fixSteps: FixStep[] = [];

                    if (isErrorReportFile) {
                        fixSteps.push({
                            label: 'Wrong file uploaded',
                            detail: 'You uploaded an error-report CSV, not a campaign CSV. Download the correct template below and fill it with your recipient data.',
                            severity: 'error',
                        });
                    }
                    if (duplicateCols.filter(c => c !== 'error_message').length > 0) {
                        fixSteps.push({
                            label: `Duplicate column${duplicateCols.length > 1 ? 's' : ''}: ${duplicateCols.join(', ')}`,
                            detail: 'Each column name must be unique. Remove or rename the duplicate columns.',
                            severity: 'error',
                        });
                    }
                    if (missingCols.length > 0) {
                        fixSteps.push({
                            label: `Missing required column${missingCols.length > 1 ? 's' : ''}: ${missingCols.join(', ')}`,
                            detail: `Add ${missingCols.map(c => `"${c}"`).join(' and ')} as the first column${missingCols.length > 1 ? 's' : ''} in your CSV header row (row 1).`,
                            severity: 'error',
                        });
                    }
                    if (missingVarCols.length > 0) {
                        fixSteps.push({
                            label: `Missing template variable column${missingVarCols.length > 1 ? 's' : ''}: ${missingVarCols.join(', ')}`,
                            detail: `Your selected template needs ${missingVarCols.map(c => `"${c}"`).join(', ')} column${missingVarCols.length > 1 ? 's' : ''} in the CSV. Add ${missingVarCols.length > 1 ? 'them' : 'it'} after the mobile_number column.`,
                            severity: 'error',
                        });
                    }
                    if (hasPhoneErrors && !isErrorReportFile) {
                        fixSteps.push({
                            label: 'Invalid phone number format',
                            detail: 'country_code must be 1–4 digits (e.g. 91). mobile_number must be 7–12 digits with no spaces or dashes. Use Auto-fix CSV to clean formatting automatically.',
                            severity: 'warn',
                        });
                    }
                    if (hasEmptyVarErrors) {
                        fixSteps.push({
                            label: 'Empty template variable values',
                            detail: 'Every variable cell must have a value — no blanks allowed. Fill in the missing values or use Skip invalid rows to exclude those rows.',
                            severity: 'warn',
                        });
                    }
                    // Fallback for errors that don't match any known pattern
                    if (fixSteps.length === 0) {
                        fixSteps.push({
                            label: `${validation.errors.length} validation error${validation.errors.length !== 1 ? 's' : ''} found`,
                            detail: 'See the raw error details below.',
                            severity: 'error',
                        });
                    }

                    return (
                        <div className="px-6 py-4 border-b border-white/10 space-y-3">
                            {/* Diagnosis heading + toggle */}
                            <button
                                onClick={() => setShowErrors(p => !p)}
                                className="flex items-center justify-between w-full"
                            >
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={15} className="text-red-500" />
                                    <span className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                        {validation.errors.length} Validation Error{validation.errors.length !== 1 ? 's' : ''} — What to fix
                                    </span>
                                </div>
                                {showErrors
                                    ? <ChevronUp size={15} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                                    : <ChevronDown size={15} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />}
                            </button>

                            {showErrors && (
                                <div className="space-y-2">
                                    {/* Fix steps — smart diagnosis */}
                                    {fixSteps.map((step, i) => (
                                        <div key={i} className={cn(
                                            "p-3 rounded-lg border text-xs",
                                            step.severity === 'error'
                                                ? isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
                                                : isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
                                        )}>
                                            <div className="flex items-start gap-2">
                                                <span className={cn(
                                                    "shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5",
                                                    step.severity === 'error'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-amber-500 text-white'
                                                )}>
                                                    {i + 1}
                                                </span>
                                                <div>
                                                    <p className={cn("font-bold leading-tight", step.severity === 'error' ? 'text-red-500' : 'text-amber-500')}>
                                                        {step.label}
                                                    </p>
                                                    <p className={cn("mt-0.5 leading-relaxed", isDarkMode ? 'text-white/70' : 'text-slate-600')}>
                                                        {step.detail}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Raw error list collapsed under "Show all N raw errors" */}
                                    <details className="group">
                                        <summary className={cn(
                                            "text-[10px] cursor-pointer select-none list-none flex items-center gap-1",
                                            isDarkMode ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
                                        )}>
                                            <ChevronDown size={11} className="group-open:rotate-180 transition-transform" />
                                            Show all {validation.errors.length} raw error{validation.errors.length !== 1 ? 's' : ''}
                                        </summary>
                                        <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                                            {validation.errors.map((error: any, idx: number) => (
                                                <div key={idx} className={cn(
                                                    "px-3 py-2 rounded border text-[11px]",
                                                    isDarkMode ? 'bg-white/3 border-white/10' : 'bg-slate-50 border-slate-200'
                                                )}>
                                                    <span className="text-red-500 font-bold">
                                                        {error.field || error.column || (error.rowIndex ? `Row ${error.rowIndex}` : null) || 'Error'}:
                                                    </span>
                                                    {' '}
                                                    <span className={isDarkMode ? 'text-white/70' : 'text-slate-700'}>{error.message}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Table */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider border-b",
                                    isDarkMode ? 'text-white/40 border-white/10' : 'text-slate-500 border-slate-200'
                                )}>
                                    <th className="px-4 py-3 w-12">#</th>
                                    <th className="px-4 py-3">PHONE NUMBER</th>
                                    <th className="px-4 py-3">VARIABLES</th>
                                    <th className="px-4 py-3 w-36">STATUS / ERROR</th>
                                </tr>
                            </thead>
                            <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                {csvData.map((row, index) => {
                                    const isValid = validation.validRows.some(v => v.mobile_number === row.mobile_number);
                                    const thisRowErrors = rowErrorMap[index] || [];
                                    // When only header errors exist, individual rows have no rowErrors but are still "Error"
                                    const failedDueToHeaders = !isValid && thisRowErrors.length === 0 && hasHeaderErrors;
                                    const vars = Array.isArray(row.dynamic_variables) ? row.dynamic_variables : [];
                                    return (
                                        <tr
                                            key={index}
                                            className={cn(
                                                "transition-all",
                                                !isValid && (isDarkMode ? 'bg-red-500/5' : 'bg-red-50')
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <span className={cn("text-sm font-medium", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-sm font-mono", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                    {row.mobile_number}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {vars.length > 0 ? (
                                                        vars.map((variable: any, vidx: number) => (
                                                            <span
                                                                key={vidx}
                                                                className={cn(
                                                                    "px-2 py-1 rounded text-xs font-medium",
                                                                    !variable
                                                                        ? 'bg-red-500/10 text-red-500'
                                                                        : isDarkMode ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'
                                                                )}
                                                            >
                                                                {variable || '(empty)'}
                                                            </span>
                                                        ))
                                                    ) : expectedVariableColumns.length > 0 ? (
                                                        // Expected variables but CSV has no variable columns
                                                        <span className="text-xs text-red-400 italic">
                                                            Missing: {expectedVariableColumns.join(', ')}
                                                        </span>
                                                    ) : (
                                                        <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                                            No variables
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {isValid ? (
                                                    <div className="flex items-center gap-1">
                                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                                        <span className="text-xs text-emerald-500 font-semibold">Valid</span>
                                                    </div>
                                                ) : failedDueToHeaders ? (
                                                    <div className="flex items-center gap-1">
                                                        <AlertCircle size={14} className="text-amber-500" />
                                                        <span className="text-xs text-amber-500 font-semibold">Header issue</span>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                                                            <span className="text-xs text-red-500 font-semibold">Error</span>
                                                        </div>
                                                        {thisRowErrors.slice(0, 2).map((msg, ei) => (
                                                            <p key={ei} className={cn("text-[10px] leading-tight", isDarkMode ? 'text-red-400/80' : 'text-red-600')}>
                                                                {msg}
                                                            </p>
                                                        ))}
                                                        {thisRowErrors.length > 2 && (
                                                            <p className={cn("text-[10px]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                                                +{thisRowErrors.length - 2} more
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-between items-center gap-3">
                    <div className={cn("text-xs", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                        {hasErrors ? (
                            onlyHeaderErrors
                                ? <p>Fix the column headers in your CSV and re-upload, or <strong>download the template</strong> to get the correct format.</p>
                                : canSkip
                                    ? <p>Use <strong>Skip {invalidContacts} invalid</strong> to proceed with {validContacts} valid row{validContacts !== 1 ? 's' : ''}, or fix the errors and re-upload.</p>
                                    : <p>Fix the errors above or use <strong>Auto-fix CSV</strong> to auto-correct formatting issues.</p>
                        ) : (
                            <p>All rows validated. Ready to create campaign!</p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                                isDarkMode
                                    ? 'text-white/60 hover:bg-white/10'
                                    : 'text-slate-600 hover:bg-slate-100'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!validation.isValid || validContacts === 0}
                            className={cn(
                                "px-6 py-2 rounded-xl text-sm font-semibold transition-all",
                                validation.isValid && validContacts > 0
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : isDarkMode
                                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            )}
                        >
                            {validation.isValid && validContacts > 0
                                ? `Submit ${validContacts} Contact${validContacts !== 1 ? 's' : ''}`
                                : 'Fix Errors to Continue'
                            }
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
