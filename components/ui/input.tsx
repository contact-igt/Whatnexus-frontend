
"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    isDarkMode: boolean;
    label?: string;
    error?: string;
    required?: boolean;
    icon?: LucideIcon;

    variant?: 'default' | 'secondary';
    wrapperClassName?: string;
}

export const Input = ({
    isDarkMode,
    label,
    error,
    required,
    icon: Icon,
    className,
    variant = 'default',
    wrapperClassName,
    ...props
}: InputProps) => {
    return (
        <div className={cn("w-full", wrapperClassName)}>
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
                        "absolute left-3 top-1/2 -translate-y-1/2",
                        isDarkMode ? "text-white/30" : "text-slate-400"
                    )}>
                        <Icon size={16} />
                    </div>
                )}
                <input
                    autoComplete='new-password'
                    {...props}
                    onChange={(e) => {
                        const isMobile = 
                            props.name?.toLowerCase().includes('mobile') || 
                            props.name?.toLowerCase().includes('phone') ||
                            label?.toLowerCase().includes('mobile') ||
                            label?.toLowerCase().includes('phone') ||
                            props.type === 'number';
                            
                        if (isMobile) {
                            e.target.value = e.target.value.replace(/\s+/g, '');
                        }
                        
                        props.onChange?.(e);
                    }}
                    required={required}
                    className={cn(
                        "w-full py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                        Icon ? "pl-10 pr-4" : "px-4",
                        variant === 'default' && (isDarkMode
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'),
                        variant === 'secondary' && (isDarkMode
                            ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:bg-white/10 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50'),
                        error && 'border-red-500',
                        props.disabled && 'opacity-60 cursor-not-allowed',
                        className
                    )}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>
            )}
        </div>
    );
};