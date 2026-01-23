"use client";

import { useState } from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface DropdownItem {
    label: string;
    onClick: () => void;
    icon: LucideIcon;
    route: string
}

interface FloatingDockDropdownProps {
    icon: LucideIcon;
    label: string;
    isDarkMode?: boolean;
    isExpanded?: boolean;
    items: DropdownItem[];
}

export const FloatingDockDropdown = ({
    icon: Icon,
    label,
    isDarkMode = true,
    isExpanded = false,
    items,
}: FloatingDockDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const handleToggle = () => {
        if (isExpanded) {
            setIsOpen(!isOpen);
        }
    };
    const isParentActive = items.some(item => item.route === pathname);
    console.log("pathname", pathname)
    return (
        <div className="relative">
            {/* Main Button */}
            <div
                role="button"
                tabIndex={0}
                onClick={handleToggle}
                onKeyDown={(e) => e.key === "Enter" && handleToggle()}
                className={cn(
                    "relative rounded-2xl cursor-pointer transition-all duration-300 group flex items-center gap-3 overflow-hidden w-full",
                    isExpanded ? "px-4 py-4 justify-start" : "p-5 justify-center",
                )}
            >
                <Icon size={20} strokeWidth={2.5} className="shrink-0" />

                {/* Inline label when expanded */}
                <span className={cn(
                    "font-semibold text-sm whitespace-nowrap transition-all duration-300 flex-1 text-left",
                    isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute"
                )}>
                    {label}
                </span>

                {/* Chevron icon when expanded */}
                {isExpanded && (
                    <ChevronDown
                        size={16}
                        className={cn(
                            "transition-transform duration-300 shrink-0",
                            isOpen && "rotate-180"
                        )}
                    />
                )}

                {/* Tooltip label when collapsed */}
                {!isExpanded && (
                    <div className={cn(
                        "absolute left-20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] translate-x-4 group-hover:translate-x-0"
                    )}>
                        <div className={cn(
                            "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap border shadow-2xl",
                            isDarkMode ? 'bg-white text-black border-white/10' : 'bg-slate-900 text-white border-slate-700'
                        )}>
                            {label}
                        </div>
                        {/* Sub-items in tooltip */}
                        <div className="mt-2 space-y-1">
                            {items?.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        item.onClick();
                                    }}
                                    className={cn(
                                        "w-full px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all border",
                                        item?.route === pathname
                                            ? (isDarkMode ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-emerald-600 text-white border-emerald-500')
                                            : (isDarkMode ? 'bg-white/90 text-slate-900 border-white/10 hover:bg-white' : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700')
                                    )}
                                >
                                    {item?.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {isParentActive && (
                    <div className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full shadow-lg",
                        isDarkMode ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-emerald-600 shadow-emerald-600/50'
                    )} />
                )}
            </div>

            {isExpanded && (
                <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                )}>
                    <div className="space-y-1 pl-4">
                        {items.map((item, index) => {
                            console.log("route", item.route)
                            const active =
                                pathname === item.route ||
                                pathname.startsWith(item.route + "/");
                            console.log("active", active)
                            return (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-all flex items-center gap-3",
                                        active
                                            ? (isDarkMode
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                : "bg-emerald-100 text-emerald-700 border border-emerald-200")
                                            : (isDarkMode
                                                ? "text-white/60 hover:text-white hover:bg-white/5"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100")
                                    )}
                                >
                                    <item.icon size={16} strokeWidth={2.5} />
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};