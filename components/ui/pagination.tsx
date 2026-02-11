"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    itemsPerPage?: number;
    isDarkMode: boolean;
    className?: string;
    showItemsCount?: boolean;
}

export const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    itemsPerPage,
    isDarkMode,
    className,
    showItemsCount = true
}: PaginationProps) => {
    // Determine start and end index for "Showing X-Y of Z"
    const startIndex = (currentPage - 1) * (itemsPerPage || 10);
    const endIndex = Math.min(startIndex + (itemsPerPage || 10), totalItems || 0);

    return (
        <div className={cn("flex items-center justify-between", className)}>
            {showItemsCount && totalItems !== undefined ? (
                <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-500')}>
                    Showing {startIndex + 1}-{endIndex} of {totalItems} items
                </p>
            ) : <div />} {/* Spacer if no count shown */}

            <div className="flex gap-2">
                {/* First Page */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={cn(
                        "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                    )}
                    title="First Page"
                >
                    <ChevronsLeft size={16} />
                </button>

                {/* Previous Page */}
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                        "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                    )}
                    title="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>

                <span className={cn(
                    "text-xs font-medium px-2 flex items-center",
                    isDarkMode ? 'text-white/70' : 'text-slate-600'
                )}>
                    Page {currentPage} of {totalPages}
                </span>

                {/* Next Page */}
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                        "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                    )}
                    title="Next Page"
                >
                    <ChevronRight size={16} />
                </button>

                {/* Last Page */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={cn(
                        "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                    )}
                    title="Last Page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};
