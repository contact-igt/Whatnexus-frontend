"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface ColumnDef<T> {
    field: string;
    headerName: ReactNode | string;
    width?: string | number;
    minWidth?: string | number;
    align?: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
    flex?: number;
    sortable?: boolean;
    renderCell?: (params: { row: T; value: any; index: number }) => ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    isDarkMode: boolean;
    onRowClick?: (row: T) => void;
    emptyState?: ReactNode;
    className?: string; // Additional classes for the wrapper
}

export function DataTable<T>({
    data,
    columns,
    isLoading,
    isDarkMode,
    onRowClick,
    emptyState,
    className
}: DataTableProps<T>) {
    return (
        <div className={cn(
            "w-full overflow-hidden transition-all duration-200", // Removed default border/bg
            className
        )}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-full">
                    <thead>
                        <tr className={cn(
                            "text-[10px] font-bold uppercase tracking-wider border-b",
                            isDarkMode ? 'text-white/30 border-white/5 bg-white/8' : 'text-slate-400 border-slate-200 bg-slate-50'
                        )}>
                            {columns.map((col, index) => (
                                <th
                                    key={col.field + index}
                                    className={cn(
                                        "px-6 py-4",
                                        col.headerAlign === 'center' && "text-center",
                                        col.headerAlign === 'right' && "text-right",
                                        col.headerAlign === 'left' && "text-left" // Default
                                    )}
                                    style={{
                                        width: col.width,
                                        minWidth: col.minWidth,
                                        flex: col.flex
                                    }}
                                >
                                    {col.headerName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className={cn(isDarkMode ? 'border-b border-white/5' : 'border-b border-slate-100')}>
                                    {columns.map((col, j) => (
                                        <td key={j} className="px-6 py-5">
                                            <div className="relative overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-4 rounded-md",
                                                        isDarkMode ? 'bg-white/5' : 'bg-slate-100',
                                                    )}
                                                    style={{
                                                        width: j === 0
                                                            ? `${70 + (i * 5)}%` // First column varies 70-90%
                                                            : j === columns.length - 1
                                                                ? '60px' // Actions column fixed
                                                                : `${50 + (i * 7)}%` // Other columns vary 50-85%
                                                    }}
                                                >
                                                    {/* Shimmer effect */}
                                                    <div
                                                        className={cn(
                                                            "absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]",
                                                            isDarkMode
                                                                ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                                                                : 'bg-gradient-to-r from-transparent via-white/60 to-transparent'
                                                        )}
                                                        style={{
                                                            animationDelay: `${i * 0.1}s`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data?.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center">
                                    {emptyState || (
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                                No data found
                                            </p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            data?.map((row: any, rowIndex) => ( // Using any for row access to simplify dynamic field access
                                <tr
                                    key={row.id || rowIndex}
                                    onClick={() => onRowClick?.(row)}
                                    className={cn(
                                        "group transition-all duration-200 border-b last:border-b-0",
                                        isDarkMode ? 'border-white/5 hover:bg-emerald-500/5' : 'border-slate-100 hover:bg-emerald-500/5', // Changed hover to emerald
                                        onRowClick ? "cursor-pointer" : ""
                                    )}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={`${row.id || rowIndex}-${col.field}`}
                                            className={cn(
                                                "px-6 py-5",
                                                col.align === 'center' && "text-center",
                                                col.align === 'right' && "text-right",
                                                col.align === 'left' && "text-left"
                                            )}
                                        >
                                            <div className={cn(
                                                "text-sm",
                                                isDarkMode ? 'text-white' : 'text-slate-800' // Changed text color for better contrast
                                            )}>
                                                {col.renderCell
                                                    ? col.renderCell({ row, value: row[col.field], index: rowIndex })
                                                    : row[col.field]
                                                }
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
