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

export const PulseMetric = ({ label, value, trend, color, isDarkMode = true, percent, icon: Icon }: PulseMetricProps) => {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        if (percent !== undefined) {
          const timer = setTimeout(() => setWidth(percent), 500);
          return () => clearTimeout(timer);
        }
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
    const isNeutral = trend === '—' || trend === '0' || trend === '0%' || trend.toLowerCase() === 'neutral';

    return (
        <div className={cn(
            "relative group p-6 cursor-default h-full flex flex-col justify-between min-h-[160px] rounded-[24px] border transition-all duration-500",
            isDarkMode 
                ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10" 
                : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
        )}>
            <div className={cn(
                "absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000",
                colorMap[color] || 'bg-emerald-500',
                "bg-opacity-5"
            )} />
            
            {/* Top glass reflection */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1 h-full flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>{label}</p>
                        <div className={cn(
                            "p-2 rounded-xl transition-all duration-500 border overflow-hidden relative", 
                            isDarkMode 
                                ? 'bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/20' 
                                : 'bg-white border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100'
                        )}>
                            <div className={cn(
                                "absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                                colorMap[color]
                            )} />
                            {Icon ? (
                                <Icon size={14} className={cn("relative z-10 transition-transform duration-500 group-hover:scale-110", isDarkMode ? 'text-white/70' : 'text-slate-600')} />
                            ) : (
                                <TrendingUp size={14} className={cn("relative z-10 transition-transform duration-500 group-hover:scale-110", isPositive ? 'text-emerald-500' : 'text-rose-500')} />
                            )}
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <h3 className={cn("text-3xl font-black tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {value}
                        </h3>
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all duration-300", 
                            isNeutral
                                ? isDarkMode ? 'bg-white/5 text-white/40 border-white/10' : 'bg-slate-100 text-slate-400 border-slate-200'
                                : isPositive 
                                    ? isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                    : isDarkMode ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200'
                        )}>{trend}</span>
                    </div>
                </div>
                
                {percent !== undefined && percent > 0 && (
                  <div className="mt-auto pt-6">
                      <div className={cn("w-full h-1 rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                          <div
                              className={cn(
                                  "h-full transition-all duration-[2000ms] ease-out relative",
                                  colorMap[color] || 'bg-emerald-500',
                                  shadowMap[color] || 'shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                              )}
                              style={{ width: `${width}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          </div>
                      </div>
                  </div>
                )}
            </div>
        </div>
    );
};

