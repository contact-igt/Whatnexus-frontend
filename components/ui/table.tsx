
"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TableProps {
    isDarkMode: boolean;
    children: ReactNode;
    className?: string;
}

interface TableHeaderProps {
    isDarkMode: boolean;
    children: ReactNode;
}

interface TableBodyProps {
    children: ReactNode;
}

interface TableRowProps {
    isDarkMode: boolean;
    children: ReactNode;
    isLast?: boolean;
    onClick?: () => void;
}

interface TableHeadProps {
    isDarkMode: boolean;
    children: ReactNode;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

interface TableCellProps {
    children: ReactNode;
    align?: 'left' | 'center' | 'right';
    width?: string;
}

interface TablePaginationProps {
    isDarkMode: boolean;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    startIndex: number;
    endIndex: number;
    totalItems: number;
}

export const Table = ({ isDarkMode, children, className }: TableProps) => {
    return (
        <div className={cn(
            "rounded-xl border overflow-hidden",
            isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200',
            className
        )}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    {children}
                </table>
            </div>
        </div>
    );
};

export const TableHeader = ({ isDarkMode, children }: TableHeaderProps) => {
    return (
        <thead className={cn(
            "border-b",
            isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
        )}>
            {children}
        </thead>
    );
};

export const TableBody = ({ children }: TableBodyProps) => {
    return <tbody>{children}</tbody>;
};

export const TableRow = ({ isDarkMode, children, isLast, onClick }: TableRowProps) => {
    return (
        <tr
            onClick={onClick}
            className={cn(
                "border-b transition-colors",
                isDarkMode
                    ? "border-white/10 hover:bg-white/5"
                    : "border-slate-200 hover:bg-slate-50",
                isLast && "border-b-0",
                onClick && "cursor-pointer"
            )}
        >
            {children}
        </tr>
    );
};

export const TableHead = ({ isDarkMode, children, align = 'left', width }: TableHeadProps) => {
    return (
        <th
            className={cn(
                "px-6 py-4 text-xs font-semibold",
                align === 'left' && "text-left",
                align === 'center' && "text-center",
                align === 'right' && "text-right",
                isDarkMode ? "text-white/70" : "text-slate-700"
            )}
            style={width ? { width } : undefined}
        >
            {children}
        </th>
    );
};

export const TableCell = ({ children, align = 'left', width }: TableCellProps) => {
    return (
        <td
            className={cn(
                "px-6 py-4",
                align === 'left' && "text-left",
                align === 'center' && "text-center",
                align === 'right' && "text-right"
            )}
            style={width ? { width } : undefined}
        >
            {children}
        </td>
    );
};

export const TablePagination = ({
    isDarkMode,
    currentPage,
    totalPages,
    onPageChange,
    startIndex,
    endIndex,
    totalItems
}: TablePaginationProps) => {
    // Temporarily disabled auto-hide for debugging
    // if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-2 py-4 border-t border-transparent">
            <div className={cn(
                "text-xs font-medium",
                isDarkMode ? 'text-white/50' : 'text-slate-500'
            )}>
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={cn(
                        "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                    )}
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                        "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                    )}
                >
                    <ChevronLeft size={16} />
                </button>
                <span className={cn(
                    "text-xs font-medium px-2",
                    isDarkMode ? 'text-white/70' : 'text-slate-600'
                )}>
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                        "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                    )}
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={cn(
                        "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                        isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                    )}
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};
