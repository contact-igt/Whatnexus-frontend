
"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface BadgeProps {
    children: React.ReactNode;
    isDarkMode: boolean;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md' | 'lg';
    removable?: boolean;
    onRemove?: () => void;
    className?: string;
}

export const Badge = ({
    children,
    isDarkMode,
    variant = 'default',
    size = 'md',
    removable = false,
    onRemove,
    className
}: BadgeProps) => {
    const variantStyles = {
        default: isDarkMode
            ? 'bg-white/10 text-white/70 border-white/20'
            : 'bg-slate-100 text-slate-700 border-slate-200',
        primary: isDarkMode
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        success: isDarkMode
            ? 'bg-green-500/20 text-green-400 border-green-500/30'
            : 'bg-green-50 text-green-700 border-green-200',
        warning: isDarkMode
            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            : 'bg-yellow-50 text-yellow-700 border-yellow-200',
        danger: isDarkMode
            ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : 'bg-red-50 text-red-700 border-red-200',
        info: isDarkMode
            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            : 'bg-blue-50 text-blue-700 border-blue-200'
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border font-medium transition-all",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
        >
            {children}
            {removable && onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className={cn(
                        "ml-1 rounded-full p-0.5 transition-all hover:bg-black/10",
                        isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
                    )}
                >
                    <X size={12} />
                </button>
            )}
        </span>
    );
};
