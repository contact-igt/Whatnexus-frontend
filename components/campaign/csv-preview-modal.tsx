"use client";

import { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
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
        errors: Array<{ field: string; message: string }>;
    };
}

export const CSVPreviewModal = ({
    isOpen,
    onClose,
    onConfirm,
    csvData,
    fileName,
    validation
}: CSVPreviewModalProps) => {
    const { isDarkMode } = useTheme();
    const [showInstructions, setShowInstructions] = useState(false);
    const [showErrors, setShowErrors] = useState(true);

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
                    "px-6 py-4 border-b border-white/10",
                    hasErrors ? (isDarkMode ? 'bg-red-500/5' : 'bg-red-50') : (isDarkMode ? 'bg-emerald-500/5' : 'bg-emerald-50')
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {hasErrors ? (
                                <>
                                    <AlertCircle size={20} className="text-red-500" />
                                    <div>
                                        <p className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            CSV Validation Issues Found
                                        </p>
                                        <p className={cn("text-xs mt-0.5", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                            {validContacts} valid • {invalidContacts} invalid • {validation.errors.length} errors to fix
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={20} className="text-emerald-500" />
                                    <div>
                                        <p className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            All Rows Valid ✓
                                        </p>
                                        <p className={cn("text-xs mt-0.5", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                            {validContacts} contacts ready to submit
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setShowInstructions(!showInstructions)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                                isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            )}
                        >
                            <Info size={14} />
                            Format Guide
                            {showInstructions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>

                    {/* CSV Format Instructions */}
                    {showInstructions && (
                        <div className={cn(
                            "mt-4 p-4 rounded-xl border",
                            isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'
                        )}>
                            <div className="flex items-start gap-3">
                                <FileSpreadsheet size={18} className="text-blue-500 mt-0.5 shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <p className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            Required CSV Format
                                        </p>
                                        <p className={cn("text-xs mt-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                            Your CSV must follow this exact structure:
                                        </p>
                                    </div>

                                    <div className={cn(
                                        "p-3 rounded-lg font-mono text-xs",
                                        isDarkMode ? 'bg-black/20 text-emerald-400' : 'bg-white text-emerald-600'
                                    )}>
                                        <div className="font-bold mb-1">Row 1 (Header):</div>
                                        <div>mobile_number,variable_1,variable_2,...</div>
                                        <div className="font-bold mt-2 mb-1">Row 2+ (Data):</div>
                                        <div>916369441531,John Doe,john@example.com,...</div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className={cn("font-semibold", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>✓ Column 1 (Required):</span>
                                            <p className={cn(isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                Mobile number in format <code className="px-1.5 py-0.5 rounded bg-white/10">91XXXXXXXXXX</code> (12 digits starting with 91)
                                            </p>
                                        </div>
                                        <div>
                                            <span className={cn("font-semibold", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>✓ Remaining Columns:</span>
                                            <p className={cn(isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                Dynamic variables matching your template (Name, Email, etc. - cannot be empty)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Detailed Error List */}
                {hasErrors && (
                    <div className="px-6 py-4 border-b border-white/10">
                        <button
                            onClick={() => setShowErrors(!showErrors)}
                            className="flex items-center justify-between w-full group"
                        >
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                <span className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {validation.errors.length} Validation Error{validation.errors.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {showErrors ? <ChevronUp size={16} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} /> : <ChevronDown size={16} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />}
                        </button>

                        {showErrors && (
                            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                                {validation.errors.map((error, idx) => (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "p-3 rounded-lg border text-xs",
                                            isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-red-500 font-bold shrink-0">{error.field}:</span>
                                            <span className={cn(isDarkMode ? 'text-white/80' : 'text-slate-700')}>{error.message}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

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
                                    <th className="px-4 py-3 w-20">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                {csvData.map((row, index) => {
                                    const isValid = validation.validRows.some(v => v.mobile_number === row.mobile_number);
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
                                                    {row.dynamic_variables && row.dynamic_variables.length > 0 ? (
                                                        row.dynamic_variables.map((variable, vidx) => (
                                                            <span
                                                                key={vidx}
                                                                className={cn(
                                                                    "px-2 py-1 rounded text-xs font-medium",
                                                                    isDarkMode ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-700'
                                                                )}
                                                            >
                                                                {variable || <span className="text-red-500">(empty)</span>}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                                            No variables
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    {isValid ? (
                                                        <>
                                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                                            <span className="text-xs text-emerald-500 font-semibold">Valid</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertCircle size={14} className="text-red-500" />
                                                            <span className="text-xs text-red-500 font-semibold">Error</span>
                                                        </>
                                                    )}
                                                </div>
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
                            <p>Fix the errors above and re-upload your CSV to continue</p>
                        ) : (
                            <p>All rows validated successfully. Ready to create campaign!</p>
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
                                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                            )}
                        >
                            {validation.isValid ? `Submit ${validContacts} Contact${validContacts !== 1 ? 's' : ''}` : 'Fix Errors to Continue'}
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};
