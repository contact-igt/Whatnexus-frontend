
"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    isDarkMode: boolean;
    label?: string;
    error?: string;
    required?: boolean;
    icon?: LucideIcon;
    showCharCount?: boolean;
    maxLength?: number;
}

export const Textarea = ({
    isDarkMode,
    label,
    error,
    required,
    icon: Icon,
    showCharCount,
    maxLength,
    className,
    value,
    ...props
}: TextareaProps) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
        <div className="w-full">
            {label && (
                <label className={cn(
                    "text-xs font-semibold mb-2 block ml-1",
                    isDarkMode ? 'text-white/70' : 'text-slate-700'
                )}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className={cn(
                        "absolute left-3 top-3",
                        isDarkMode ? "text-white/30" : "text-slate-400"
                    )}>
                        <Icon size={16} />
                    </div>
                )}
                <textarea
                    {...props}
                    value={value}
                    maxLength={maxLength}
                    className={cn(
                        "w-full py-3 rounded-xl text-sm border transition-all focus:outline-none resize-none custom-scrollbar",
                        Icon ? "pl-10 pr-4" : "px-4",
                        isDarkMode
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30',
                        error && 'border-red-500',
                        props.disabled && 'opacity-60 cursor-not-allowed',
                        className
                    )}
                />
            </div>
            <div className="flex justify-between items-center mt-1">
                {error ? (
                    <p className="text-xs text-red-500 ml-1">{error}</p>
                ) : (
                    <div />
                )}
                {showCharCount && maxLength && (
                    <p className={cn(
                        "text-xs ml-1",
                        isDarkMode ? 'text-white/40' : 'text-slate-400'
                    )}>
                        {currentLength} / {maxLength}
                    </p>
                )}
            </div>
        </div>
    );
};
