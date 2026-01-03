
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
}

export const PulseMetric = ({ label, value, trend, color, isDarkMode = true, percent = 70 }: PulseMetricProps) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const timer = setTimeout(() => setWidth(percent), 500);
        return () => clearTimeout(timer);
    }, [percent]);

    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        rose: 'bg-rose-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500'
    };

    return (
        <div className="relative group p-6 cursor-default h-full flex flex-col justify-between">
            <div className={cn(
                "absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000",
                colorMap[color] || 'bg-emerald-500',
                "bg-opacity-5"
            )} />
            <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
                <div className="flex justify-between items-start mb-1">
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{label}</p>
                    <div className={cn("p-1.5 rounded-lg", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                        <TrendingUp size={12} className={trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'} />
                    </div>
                </div>
                <div className="flex items-baseline space-x-2">
                    <h3 className={cn("text-3xl font-black tracking-tighter", isDarkMode ? 'text-white' : 'text-slate-800')}>{value}</h3>
                    <span className={cn("text-[10px] font-bold", trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500')}>{trend}</span>
                </div>
                <div className={cn("w-full h-1.5 mt-4 rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                    <div
                        className={cn(
                            "h-full transition-all duration-[2000ms] ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]",
                            colorMap[color] || 'bg-emerald-500'
                        )}
                        style={{ width: `${width}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
