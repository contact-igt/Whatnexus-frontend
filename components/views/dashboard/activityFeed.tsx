"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BookOpen, Ban, Frown, Activity } from 'lucide-react';
import { glassCard, glassInner, tx } from './glassStyles';
import { ActivityEvent } from '@/services/whatsappDashboard';

interface ActivityFeedProps { 
    isDarkMode?: boolean; 
    recentActivity?: ActivityEvent[];
}

// type → icon + accent colour
// urgent=red, missing_knowledge=blue, out_of_scope=yellow, sentiment=purple
const typeConfig: Record<string, { icon: any; hex: string }> = {
    urgent:            { icon: AlertCircle, hex: '#f43f5e' },
    missing_knowledge: { icon: BookOpen,    hex: '#3b82f6' },
    out_of_scope:      { icon: Ban,         hex: '#eab308' },
    sentiment:         { icon: Frown,       hex: '#a855f7' },
};

// status chip styling
const statusChipStyle: Record<string, { bg: string; color: string; label: string }> = {
    pending:  { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Pending'  },
    act_on:   { bg: 'rgba(244,63,94,0.15)',  color: '#f87171', label: 'Act On'   },
    resolved: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Resolved' },
    ignored:  { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: 'Ignored'  },
};

import { NoDataFound } from './noDataFound';

export const ActivityFeed = ({ isDarkMode = true, recentActivity }: ActivityFeedProps) => {
    const [visible, setVisible] = useState<boolean[]>([]);
    const t = tx(isDarkMode);
    const router = useRouter();

    const handleViewSystemLogs = () => {
        localStorage.setItem('selectedTab', 'aiLogs');
        router.push('/knowledge');
    };

    useEffect(() => {
        if (recentActivity) {
            setVisible(recentActivity.map(() => false));
            recentActivity.forEach((_, i) => {
                setTimeout(() => {
                    setVisible(prev => { const n = [...prev]; n[i] = true; return n; });
                }, 300 + i * 100);
            });
        }
    }, [recentActivity]);

    const hasData = recentActivity && recentActivity.length > 0;

    if (recentActivity && !hasData) {
        return (
            <div className="rounded-2xl p-5 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#a855f7' }} />
                        <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>Activity Feed</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No Recent Activity"
                        description="Your team's latest actions and system events will stream here."
                        icon={<Activity size={32} />}
                        className="bg-transparent border-none shadow-none py-12"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#a855f7' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>Activity Feed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>
            </div>

            <div className="relative space-y-3.5 overflow-y-auto max-h-[370px] no-scrollbar pr-1 flex-1">
                <div className="absolute left-[13px] top-2 bottom-2 w-px pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, rgba(16,185,129,0.3), ${t.divider}, transparent)` }} />

                {!recentActivity ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 w-full sk rounded-xl" />)
                ) : (
                    recentActivity.map((item, i) => {
                        // type → accent colour / icon
                        const config = typeConfig[item.type] ?? { icon: Activity, hex: '#94a3b8' };
                        const Icon = config.icon;
                        // status chip
                        const chip = statusChipStyle[item.status] ?? statusChipStyle.pending;

                        return (
                            <div key={i} className="flex items-start gap-3 group cursor-pointer"
                                style={{
                                    opacity: visible[i] ? 1 : 0, 
                                    transform: visible[i] ? 'translateX(0)' : 'translateX(-8px)',
                                    transition: `opacity 0.3s ease ${i * 80}ms, transform 0.3s ease ${i * 80}ms`
                                }}>
                                {/* Icon dot coloured by type */}
                                <div className="relative z-10 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                                    style={{ background: `${config.hex}20`, border: `1px solid ${config.hex}30`, color: config.hex }}>
                                    <Icon size={13} />
                                </div>
                                <div className="flex flex-col gap-0.5 pt-0.5 flex-1 min-w-0">
                                    {/* event — emoji + title, render as-is */}
                                    <p className="text-xs font-black tracking-tight leading-snug" style={{ color: t.primary }}>{item.event}</p>
                                    {/* detail — 40-char snippet */}
                                    <p className="text-[9px] font-semibold truncate" style={{ color: t.secondary }}>{item.detail}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {/* time — pre-formatted string, render as-is (NO extra "ago") */}
                                        <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: t.micro }}>{item.time}</p>
                                        {/* status chip */}
                                        <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                                            style={{ background: chip.bg, color: chip.color }}>
                                            {chip.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button onClick={handleViewSystemLogs} className="w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all mt-auto"
                style={{ ...glassInner(isDarkMode), color: t.secondary }}>
                View System Logs
            </button>
        </div>
    );
};
