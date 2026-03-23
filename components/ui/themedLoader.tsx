"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface ThemedLoaderProps {
    isDarkMode?: boolean;
    text?: string;
    subtext?: string;
    className?: string;
    showLogo?: boolean;
}

export const ThemedLoader = ({ 
    isDarkMode = true, 
    text = "Loading", 
    subtext = "Please wait...",
    className,
    showLogo = true
}: ThemedLoaderProps) => {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-1000 ease-out",
            className
        )}>
            {/* Centered Brand Icon (Gmail Style) */}
            {showLogo && (
                <div className="relative mb-12 group">
                    {/* Subtle outer glow */}
                    <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    
                    <div className={cn(
                        "relative w-24 h-24 rounded-3xl flex items-center justify-center font-black text-5xl tracking-tighter shadow-2xl transition-all border-b-4 border-r-4",
                        isDarkMode 
                            ? 'bg-white text-zinc-950 border-emerald-500/20 shadow-emerald-500/5' 
                            : 'bg-zinc-950 text-white border-emerald-600/30'
                    )}>
                        W<span className="text-emerald-500">.</span>
                    </div>
                </div>
            )}

            {/* Horizontal Progress Loader (Gmail Style) */}
            <div className="w-72 space-y-4">
                <div className={cn(
                    "h-1.5 w-full rounded-full overflow-hidden relative",
                    isDarkMode ? "bg-white/10" : "bg-zinc-200"
                )}>
                    {/* Filling Animation */}
                    <div className="absolute inset-0 bg-emerald-500 w-full animate-progress-fill origin-left" />
                </div>
                
                <div className="flex flex-col items-center gap-1.5 animate-pulse duration-1000">
                    <p className={cn(
                        "text-[13px] font-bold tracking-widest uppercase whitespace-nowrap",
                        isDarkMode ? "text-white/90" : "text-zinc-900"
                    )}>
                        {text}
                    </p>
                    {subtext && (
                        <p className={cn(
                            "text-[10px] font-medium tracking-tight opacity-50",
                            isDarkMode ? "text-zinc-400" : "text-zinc-500"
                        )}>
                            {subtext}
                        </p>
                    )}
                </div>
            </div>
            
            <style jsx>{`
                @keyframes progress-fill {
                    0% { transform: scaleX(0); }
                    30% { transform: scaleX(0.3); }
                    45% { transform: scaleX(0.35); }
                    70% { transform: scaleX(0.8); }
                    95% { transform: scaleX(0.98); }
                    100% { transform: scaleX(1); }
                }
                .animate-progress-fill {
                    animation: progress-fill 2.5s cubic-bezier(0.1, 0.5, 0.5, 1) infinite;
                }
            `}</style>
        </div>
    );
};
