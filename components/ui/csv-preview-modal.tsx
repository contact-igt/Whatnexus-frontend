"use client";

import { cn } from "@/lib/utils";
import { X, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { createPortal } from "react-dom";
import { useMemo } from "react";

export interface CSVRow {
    name?: string;
    phone?: string;
    email?: string;
    [key: string]: any;
}

interface ValidationStatus {
    field: string;
    label: string;
    isValid: boolean;
    count: number;
    message: string;
}

interface CSVPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CSVRow[]) => void;
    csvData: CSVRow[];
    countryCode: string;
    isDarkMode: boolean;
}

export const CSVPreviewModal = ({
    isOpen,
    onClose,
    onSubmit,
    csvData,
    countryCode,
    isDarkMode
}: CSVPreviewModalProps) => {

    // Validate CSV data
    const validationStatus = useMemo((): ValidationStatus[] => {
        const phoneCount = csvData.filter(row => row.phone && row.phone.toString().trim().length > 0).length;
        const nameCount = csvData.filter(row => row.name && row.name.toString().trim().length > 0).length;

        return [
            {
                field: 'phone',
                label: 'Phone Number',
                isValid: phoneCount === csvData.length && phoneCount > 0,
                count: phoneCount,
                message: phoneCount === csvData.length ? `Valid (${phoneCount} entries)` : `Missing in ${csvData.length - phoneCount} entries`
            },
            {
                field: 'name',
                label: 'Name',
                isValid: nameCount === csvData.length && nameCount > 0,
                count: nameCount,
                message: nameCount === csvData.length ? `Present (${nameCount} entries)` : `Missing in ${csvData.length - nameCount} entries`
            }
        ];
    }, [csvData]);

    const allValid = validationStatus.every(v => v.isValid);

    const handleSubmit = () => {
        if (allValid) {
            onSubmit(csvData);
            onClose();
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={cn(
                "relative w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col",
                isDarkMode
                    ? 'bg-[#1c1c21] border border-white/10'
                    : 'bg-white border border-slate-200'
            )}>
                {/* Header */}
                <div className={cn(
                    "flex items-center justify-between p-6 border-b",
                    isDarkMode ? 'border-white/5' : 'border-slate-200'
                )}>
                    <div>
                        <h2 className={cn("text-xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            CSV Preview
                        </h2>
                        <p className={cn("text-sm mt-1", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                            {csvData.length} contacts loaded • Country Code: {countryCode}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            isDarkMode
                                ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        )}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto p-6">
                    <div className={cn(
                        "rounded-lg border overflow-hidden",
                        isDarkMode ? 'border-white/10' : 'border-slate-200'
                    )}>
                        <table className="w-full">
                            <thead className={cn(
                                "sticky top-0 z-10",
                                isDarkMode ? 'bg-white/5' : 'bg-slate-50'
                            )}>
                                <tr>
                                    <th className={cn(
                                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider",
                                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                                    )}>
                                        #
                                    </th>
                                    <th className={cn(
                                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider",
                                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                                    )}>
                                        Name
                                    </th>
                                    <th className={cn(
                                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider",
                                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                                    )}>
                                        Phone Number
                                    </th>
                                    <th className={cn(
                                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider",
                                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                                    )}>
                                        Country Code
                                    </th>
                                    {csvData[0]?.email && (
                                        <th className={cn(
                                            "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider",
                                            isDarkMode ? 'text-white/70' : 'text-slate-700'
                                        )}>
                                            Email
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className={cn(
                                "divide-y",
                                isDarkMode ? 'divide-white/5' : 'divide-slate-200'
                            )}>
                                {csvData.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={cn(
                                            "transition-colors",
                                            isDarkMode
                                                ? 'hover:bg-white/5'
                                                : 'hover:bg-slate-50'
                                        )}
                                    >
                                        <td className={cn(
                                            "px-4 py-3 text-sm",
                                            isDarkMode ? 'text-white/50' : 'text-slate-500'
                                        )}>
                                            {index + 1}
                                        </td>
                                        <td className={cn(
                                            "px-4 py-3 text-sm font-medium",
                                            isDarkMode ? 'text-white' : 'text-slate-900',
                                            !row.name && (isDarkMode ? 'text-red-400' : 'text-red-600')
                                        )}>
                                            {row.name || '—'}
                                        </td>
                                        <td className={cn(
                                            "px-4 py-3 text-sm font-mono",
                                            isDarkMode ? 'text-white' : 'text-slate-900',
                                            !row.phone && (isDarkMode ? 'text-red-400' : 'text-red-600')
                                        )}>
                                            {row.phone || '—'}
                                        </td>
                                        <td className={cn(
                                            "px-4 py-3 text-sm",
                                            isDarkMode ? 'text-white/70' : 'text-slate-600'
                                        )}>
                                            {countryCode}
                                        </td>
                                        {csvData[0]?.email && (
                                            <td className={cn(
                                                "px-4 py-3 text-sm",
                                                isDarkMode ? 'text-white/70' : 'text-slate-600'
                                            )}>
                                                {row.email || '—'}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Validation Footer */}
                <div className={cn(
                    "p-6 border-t",
                    isDarkMode ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                            <p className={cn(
                                "text-xs font-semibold uppercase tracking-wider mb-3",
                                isDarkMode ? 'text-white/50' : 'text-slate-500'
                            )}>
                                Validation Status
                            </p>
                            {validationStatus.map((validation) => (
                                <div key={validation.field} className="flex items-center gap-3">
                                    {validation.isValid ? (
                                        <CheckCircle size={18} className="text-emerald-500" />
                                    ) : (
                                        <XCircle size={18} className="text-red-500" />
                                    )}
                                    <span className={cn(
                                        "text-sm font-medium",
                                        validation.isValid
                                            ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                                            : isDarkMode ? 'text-red-400' : 'text-red-600'
                                    )}>
                                        {validation.label}:
                                    </span>
                                    <span className={cn(
                                        "text-sm",
                                        isDarkMode ? 'text-white/70' : 'text-slate-600'
                                    )}>
                                        {validation.message}
                                    </span>
                                </div>
                            ))}

                            {allValid && (
                                <div className="flex items-center gap-3 pt-2 mt-2 border-t border-emerald-500/20">
                                    <CheckCircle size={18} className="text-emerald-500" />
                                    <span className={cn(
                                        "text-sm font-semibold",
                                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                                    )}>
                                        All required fields validated ✓
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!allValid}
                            className={cn(
                                "px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg ml-6",
                                allValid
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95 shadow-emerald-500/20'
                                    : 'bg-slate-600 text-white/50 cursor-not-allowed'
                            )}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
