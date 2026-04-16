"use client";

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SidebarGroupItemProps {
    icon: LucideIcon;
    onClick?: () => void;
    label: string;
    route: string;
    isDarkMode?: boolean;
    isExpanded?: boolean;
    isDisabled?: boolean;
    requiresWhatsApp?: boolean;
    notificationCount?: number;
}

export const SidebarGroupItem = ({
    icon: Icon,
    route,
    onClick,
    label,
    isDarkMode = true,
    isExpanded = false,
    isDisabled = false,
    requiresWhatsApp = false,
    notificationCount = 0,
}: SidebarGroupItemProps) => {
    const pathname = usePathname();
    const active = pathname === route || pathname.startsWith(route + "/");
    const hasNotificationCount = !isDisabled && notificationCount > 0;

    const handleClick = (e: React.MouseEvent) => {
        // Call onClick for state management (e.g., Redux updates)
        if (onClick) {
            onClick();
        }

        // If disabled, prevent navigation
        if (isDisabled) {
            e.preventDefault();
        }
    };

    const content = (
        <div
            className={cn(
                "relative rounded-xl cursor-pointer transition-all duration-300 group/item flex items-center gap-3.5 overflow-hidden w-full",
                isExpanded ? "px-3.5 py-3" : "p-3 justify-center",
                isDisabled
                    ? (isDarkMode ? 'text-white/15 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed')
                    : active
                        ? (isDarkMode
                            ? 'text-white bg-[#18181b] border border-[#27272a]'
                            : 'text-emerald-700 bg-emerald-50 border border-emerald-200/50')
                        : (isDarkMode
                            ? 'text-white/50 hover:text-white hover:bg-[#18181b] border border-transparent hover:border-[#27272a]'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-[#e4e4e7]')
            )}
        >
            {/* Active indicator bar */}
            {active && !isDisabled && (
                <div className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full",
                    "bg-emerald-500"
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
                            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20 backdrop-blur-xl'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 backdrop-blur-xl')
                        : (isDarkMode
                            ? 'bg-[#18181b] text-white border border-[#27272a] backdrop-blur-xl'
                            : 'bg-slate-900 text-white border border-slate-700 backdrop-blur-xl')
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

            {hasNotificationCount && (
                <div className={cn(
                    "absolute rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 flex items-center justify-center z-20",
                    isExpanded ? "top-2 right-2 min-w-[18px] h-[18px] px-1" : "top-1.5 right-1.5 min-w-4 h-4 px-0.5"
                )}>
                    <span className={cn(
                        "text-white font-black leading-none",
                        isExpanded ? "text-[9px]" : "text-[8px]"
                    )}>
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                </div>
            )}
        </div>
    );

    // If disabled, render as a div without Link
    if (isDisabled) {
        return content;
    }

    // Otherwise, wrap in Link for navigation with prefetching
    return (
        <Link
            href={route}
            onClick={handleClick}
            prefetch={true}
            scroll={false}
            className="block w-full"
        >
            {content}
        </Link>
    );
}
