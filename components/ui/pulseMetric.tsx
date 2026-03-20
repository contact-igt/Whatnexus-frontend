
"use client";

import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PulseMetricProps {
    label: string;
    value: string;
    trend: string;
    color: string;
    isDarkMode?: boolean;
    percent?: number;
    icon?: any;
}

export const PulseMetric = ({ label, value, trend, color, isDarkMode = true, percent = 70, icon: Icon }: PulseMetricProps) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setWidth(percent || 0), 500);
        return () => clearTimeout(timer);
    }, [percent]);

    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        rose: 'bg-rose-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500'
    };

    const shadowMap: Record<string, string> = {
        emerald: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
        blue: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]',
        rose: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
        purple: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
        orange: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]'
    };

    const isPositive = trend.startsWith('+') || trend.toLowerCase() === 'up';

    return (
        <div className="relative group p-6 cursor-default h-full flex flex-col justify-between min-h-[160px]">
            <div className={cn(
                "absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000",
                colorMap[color] || 'bg-emerald-500',
                "bg-opacity-5"
            )} />
            <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1 h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{label}</p>
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors duration-300", 
                            isDarkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-100 group-hover:bg-slate-200'
                        )}>
                            {Icon ? <Icon size={12} className={cn(isDarkMode ? 'text-white/60' : 'text-slate-600')} /> : <TrendingUp size={12} className={isPositive ? 'text-emerald-500' : 'text-rose-500'} />}
                        </div>
                    </div>
                    <div className="flex items-baseline space-x-2 mt-1">
                        <h3 className={cn("text-3xl font-black tracking-tighter", isDarkMode ? 'text-white' : 'text-slate-800')}>{value}</h3>
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border", 
                            isPositive 
                                ? isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                : isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200'
                        )}>{trend}</span>
                    </div>
                </div>
                
                <div className="mt-auto pt-4">
                    <div className={cn("w-full h-1.5 rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                        <div
                            className={cn(
                                "h-full transition-all duration-[2000ms] ease-out",
                                colorMap[color] || 'bg-emerald-500',
                                shadowMap[color] || 'shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            )}
                            style={{ width: `${width}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

