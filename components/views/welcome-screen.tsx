
"use client";

import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { BRAND_NAME, BRAND_SUB } from '@/lib/data';
import { cn } from '@/lib/utils';

interface WelcomeScreenProps {
    onComplete: () => void;
    isDarkMode: boolean;
}

export const WelcomeScreen = ({ onComplete, isDarkMode }: WelcomeScreenProps) => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) { clearInterval(timer); return 100; }
                return prev + 1.5;
            });
        }, 30);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={cn("fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000", isDarkMode ? 'bg-[#0A0A0B]' : 'bg-slate-50')}>
            <div className={cn("absolute w-[120%] h-[120%] blur-[160px] rounded-full transition-all duration-1000 animate-pulse", isDarkMode ? 'bg-emerald-900/10' : 'bg-emerald-200/20')} />
            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-8 text-center space-y-10 animate-in zoom-in-95 duration-1000">
                <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl relative group rotate-12", isDarkMode ? 'bg-white' : 'bg-slate-900')}>
                    <Zap className={cn("transition-transform duration-1000 group-hover:scale-125", isDarkMode ? 'text-emerald-600' : 'text-emerald-400')} size={40} fill="currentColor" />
                </div>
                <div className="space-y-2">
                    <h1 className={cn("text-4xl font-black tracking-tighter", isDarkMode ? 'text-white' : 'text-slate-900')}>{BRAND_NAME}<span className="text-emerald-500">.</span></h1>
                    <p className="text-[10px] font-black tracking-[0.5em] opacity-40 uppercase text-emerald-500">{BRAND_SUB}</p>
                </div>
                <div className="w-full space-y-4">
                    <div className={cn("h-1.5 w-full rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-200')}>
                        <div className="h-full bg-emerald-500 transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(16,185,129,0.4)]" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">Neural Link Init...</span>
                        <span className={cn("text-[9px] font-bold", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{Math.floor(progress)}%</span>
                    </div>
                </div>
                <button
                    onClick={onComplete}
                    disabled={progress < 100}
                    className={cn("h-14 w-full rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-700 transform", progress === 100 ? 'opacity-100 translate-y-0 scale-100 shadow-2xl shadow-emerald-500/10' : 'opacity-0 translate-y-8 scale-95 pointer-events-none', isDarkMode ? 'bg-white text-black hover:bg-emerald-50' : 'bg-slate-900 text-white hover:bg-slate-800')}
                >
                    Enter Workspace
                </button>
            </div>
        </div>
    );
};
