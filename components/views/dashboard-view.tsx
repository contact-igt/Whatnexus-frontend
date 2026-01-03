
"use client";

import { useState, useEffect } from 'react';
import { Activity, Layers, UserCheck, AlertCircle, Brain, Smartphone } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { PulseMetric } from "@/components/ui/pulse-metric";
import { BRAND_NAME, KPI_DATA } from "@/lib/data";
import { cn } from "@/lib/utils";

interface DashboardViewProps {
    isDarkMode: boolean;
}

export const DashboardView = ({ isDarkMode }: DashboardViewProps) => {
    const [hasAnimated, setHasAnimated] = useState(false);
    useEffect(() => {
        setHasAnimated(true);
    }, []);

    return (
        <div className="h-full overflow-y-auto p-8 space-y-8 animate-in fade-in zoom-in-95 duration-500 no-scrollbar pb-32">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Neural Overview</h1>
                    <p className={cn("font-medium text-sm mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{BRAND_NAME} AI is handling 84% of conversations today.</p>
                </div>
                <GlassCard isDarkMode={isDarkMode} className="px-5 py-2 flex items-center space-x-3 rounded-xl">
                    <Activity size={16} className="text-emerald-500 animate-pulse" />
                    <span className={cn("text-xs font-semibold tracking-wide uppercase", isDarkMode ? 'text-white' : 'text-slate-700')}>System Health: Peak</span>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {KPI_DATA.map((kpi, i) => (
                    <GlassCard key={i} isDarkMode={isDarkMode} delay={i * 100} className="p-0">
                        <PulseMetric {...kpi} isDarkMode={isDarkMode} />
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <GlassCard isDarkMode={isDarkMode} delay={400} className="lg:col-span-2 p-6 h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className={cn("font-bold text-sm uppercase tracking-wide flex items-center space-x-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                            <Layers size={16} className="text-emerald-500" />
                            <span>Conversion Funnel</span>
                        </h3>
                        <div className="flex space-x-2">
                            {['Daily', 'Weekly'].map(t => (
                                <button key={t} className={cn("px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all", t === 'Daily' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white')}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        {[
                            { label: 'Ads Clicks', count: '12.4k', percent: 100, color: 'bg-emerald-500/20' },
                            { label: 'WhatsApp Open', count: '8.2k', percent: 75, color: 'bg-emerald-500/40' },
                            { label: 'AI Qualified', count: '2.4k', percent: 45, color: 'bg-emerald-500/70' },
                            { label: 'Converted', count: '482', percent: 15, color: 'bg-emerald-500' },
                        ].map((step, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    <span>{step.label}</span>
                                    <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>{step.count}</span>
                                </div>
                                <div className={cn("h-2 w-full rounded-full", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-[1500ms] ease-out shadow-sm", step.color)}
                                        style={{ width: hasAnimated ? `${step.percent}%` : '0%' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard isDarkMode={isDarkMode} delay={600} className="p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={cn("font-bold text-sm uppercase tracking-wide", isDarkMode ? 'text-white' : 'text-slate-800')}>Live Escalations</h3>
                            <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse border border-rose-500/20">4 CRITICAL</span>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: UserCheck, text: "Hot lead waiting: Rahul Khanna", time: "2m", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                { icon: AlertCircle, text: "Escalated chat: #LD-442", time: "14m", color: "text-rose-500", bg: "bg-rose-500/10" },
                                { icon: Brain, text: "New Knowledge shard learned", time: "1h", color: "text-blue-500", bg: "bg-blue-500/10" },
                                { icon: Smartphone, text: "WhatsApp Link Stabilized", time: "3h", color: "text-purple-500", bg: "bg-purple-500/10" },
                            ].map((alert, i) => (
                                <div key={i} className="flex items-start space-x-3 group cursor-pointer hover:translate-x-1 transition-transform">
                                    <div className={cn("p-2 rounded-lg", alert.bg, alert.color)}>
                                        <alert.icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn("text-xs font-medium leading-tight", isDarkMode ? 'text-white/90' : 'text-slate-800')}>{alert.text}</p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wide">{alert.time} ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className={cn("w-full mt-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide border transition-all", isDarkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-200 hover:bg-slate-50')}>View All Alerts</button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
