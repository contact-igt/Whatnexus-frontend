
"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

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
