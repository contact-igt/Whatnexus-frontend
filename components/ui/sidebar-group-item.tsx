"use client";

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';

interface SidebarGroupItemProps {
    icon: LucideIcon;
    onClick: () => void;
    label: string;
    route: string;
    isDarkMode?: boolean;
    isExpanded?: boolean;
    isDisabled?: boolean;
    requiresWhatsApp?: boolean;
}

export const SidebarGroupItem = ({
    icon: Icon,
    route,
    onClick,
    label,
    isDarkMode = true,
    isExpanded = false,
    isDisabled = false,
    requiresWhatsApp = false
}: SidebarGroupItemProps) => {
    const pathname = usePathname();
    const active = pathname === route || pathname.startsWith(route + "/");

    const handleClick = () => {
        if (!isDisabled) {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isDisabled}
            className={cn(
                "relative rounded-xl cursor-pointer transition-all duration-300 group/item flex items-center gap-3.5 overflow-hidden w-full",
                isExpanded ? "px-3.5 py-3" : "p-3 justify-center",
                isDisabled
                    ? (isDarkMode ? 'text-white/15 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed')
                    : active
                        ? (isDarkMode
                            ? 'text-white bg-gradient-to-r from-white/10 via-white/8 to-white/5 shadow-lg shadow-emerald-500/5 border border-white/10'
                            : 'text-emerald-700 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-50 shadow-md border border-emerald-200/50')
                        : (isDarkMode
                            ? 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200')
            )}
        >
            {/* Gradient sweep on hover */}
            {!isDisabled && !active && (
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/8 to-teal-500/0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500"
                )} />
            )}

            {/* Active indicator bar */}
            {active && !isDisabled && (
                <div className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full",
                    "bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50"
                )} />
            )}

            {/* Icon */}
            <div className={cn(
                "relative shrink-0 z-10 transition-transform duration-300",
                !isExpanded && !isDisabled && "group-hover/item:scale-110"
            )}>
                <Icon
                    size={19}
                    strokeWidth={active ? 2.5 : 2}
                    className={cn(
                        "shrink-0 transition-all duration-300",
                        active && !isDisabled && "drop-shadow-sm"
                    )}
                />
                {isDisabled && requiresWhatsApp && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500/90 flex items-center justify-center">
                        <Lock size={8} className="text-white" />
                    </div>
                )}
            </div>

            {/* Label */}
            <span className={cn(
                "font-semibold text-[13px] whitespace-nowrap transition-all duration-300 relative z-10",
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute",
                active && !isDisabled && "font-bold"
            )}>
                {label}
            </span>

            {/* Tooltip (collapsed state) */}
            {!isExpanded && (
                <span className={cn(
                    "absolute left-full ml-3 px-3 py-2 rounded-xl text-[11px] font-bold tracking-wide opacity-0 group-hover/item:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[150] shadow-2xl translate-x-2 group-hover/item:translate-x-0",
                    isDisabled
                        ? (isDarkMode
                            ? 'bg-gradient-to-br from-rose-500/20 to-rose-600/20 text-rose-300 border border-rose-500/30 backdrop-blur-xl'
                            : 'bg-gradient-to-br from-rose-50 to-rose-100 text-rose-700 border border-rose-200 backdrop-blur-xl')
                        : (isDarkMode
                            ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-white/10 backdrop-blur-xl'
                            : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 backdrop-blur-xl')
                )}>
                    {isDisabled && requiresWhatsApp ? (
                        <span className="flex items-center gap-1.5">
                            <AlertCircle size={12} />
                            Connect WhatsApp
                        </span>
                    ) : (
                        label
                    )}
                </span>
            )}

            {/* Disabled badge (expanded state) */}
            {isExpanded && isDisabled && requiresWhatsApp && (
                <div className={cn(
                    "ml-auto px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider relative z-10 flex items-center gap-1",
                    isDarkMode
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        : 'bg-rose-100 text-rose-600 border border-rose-200'
                )}>
                    <Lock size={9} />
                </div>
            )}
        </button>
    );
}
