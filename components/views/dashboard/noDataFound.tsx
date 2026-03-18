"use client";

import React from 'react';
import { SearchX, Inbox, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { glassCard, tx } from './glassStyles';

interface NoDataFoundProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    isDarkMode?: boolean;
    className?: string;
}

export const NoDataFound = ({ 
    title = "No Data Found", 
    description = "We couldn't find any neural signatures for this section yet.", 
    icon, 
    isDarkMode = true,
    className
}: NoDataFoundProps) => {
    const t = tx(isDarkMode);

    return (
        <div 
            className={cn(
                "flex flex-col items-center justify-center p-8 rounded-3xl text-center border animate-in fade-in zoom-in duration-500",
                className
            )}
            style={glassCard(isDarkMode)}
        >
            <div className="relative mb-4">
                <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3"
                    style={{ 
                        background: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        border: isDarkMode ? '1px border rgba(255,255,255,0.05)' : '1px border rgba(0,0,0,0.05)',
                        color: isDarkMode ? '#4ade80' : '#22c55e'
                    }}
                >
                    {icon || <SearchX size={32} strokeWidth={1.5} />}
                </div>
                {/* Ambient glow */}
                <div className="absolute inset-0 blur-2xl opacity-20 bg-emerald-500 rounded-full -z-10" />
            </div>

            <h3 className="text-sm font-black tracking-tight mb-1" style={{ color: t.primary }}>
                {title}
            </h3>
            <p className="text-[10px] font-medium leading-relaxed max-w-[200px]" style={{ color: t.secondary }}>
                {description}
            </p>
        </div>
    );
};
