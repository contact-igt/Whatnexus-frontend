"use client";

import { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
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
        errors: string[];
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <GlassCard
                isDarkMode={isDarkMode}
                className="w-full max-w-6xl max-h-[85vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <div>
                        <h2 className={cn("text-2xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            CSV Preview
                        </h2>
                        <p className={cn("text-sm mt-1", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            {totalContacts} contacts loaded • Country Code: +91
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

                {/* Validation Status */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                Phone Number:
                            </span>
                            <span className="text-sm text-emerald-500">
                                Valid ({validContacts} entries)
                            </span>
                        </div>

                        {csvData[0]?.dynamic_variables && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    Name:
                                </span>
                                <span className="text-sm text-emerald-500">
                                    Present ({validContacts} entries)
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <span className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                All required fields validated ✓
                            </span>
                        </div>
                    </div>

                    {invalidContacts > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={16} className="text-red-500" />
                                <span className="text-sm text-red-500 font-semibold">
                                    {invalidContacts} invalid entries found and will be skipped
                                </span>
                            </div>
                        </div>
                    )}
                </div>

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
                                    <th className="px-4 py-3">NAME</th>
                                    <th className="px-4 py-3">PHONE NUMBER</th>
                                    <th className="px-4 py-3">COUNTRY CODE</th>
                                    <th className="px-4 py-3">EMAIL</th>
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
                                                !isValid && 'opacity-50 bg-red-500/5'
                                            )}
                                        >
                                            <td className="px-4 py-3">
                                                <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-sm font-medium", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                    {row.dynamic_variables?.[0] || '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("text-sm font-mono", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                                        {row.mobile_number}
                                                    </span>
                                                    {isValid ? (
                                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                                    ) : (
                                                        <AlertCircle size={14} className="text-red-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                    +91
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                    {row.dynamic_variables?.[1] || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
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
                            "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                            validation.isValid && validContacts > 0
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                        )}
                    >
                        Submit
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};
