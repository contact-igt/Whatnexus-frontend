"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BookOpen, Ban, Frown, Activity } from 'lucide-react';
import { tx } from './glassStyles';
import { ActivityEvent } from '@/services/whatsappDashboard';
import { NoDataFound } from './noDataFound';

interface ActivityFeedProps { 
    isDarkMode?: boolean; 
    recentActivity?: ActivityEvent[];
}

const typeConfig: Record<string, { icon: any; hex: string }> = {
    urgent:            { icon: AlertCircle, hex: '#f43f5e' },
    missing_knowledge: { icon: BookOpen,    hex: '#3b82f6' },
    out_of_scope:      { icon: Ban,         hex: '#eab308' },
    sentiment:         { icon: Frown,       hex: '#a855f7' },
};

const statusChipStyle: Record<string, { bg: string; color: string; label: string }> = {
    pending:  { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Pending'  },
    act_on:   { bg: 'rgba(244,63,94,0.15)',  color: '#f87171', label: 'Act On'   },
    resolved: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Resolved' },
    ignored:  { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', label: 'Ignored'  },
};



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
                }, 100 + i * 50);
            });
        }
    }, [recentActivity]);

    const hasData = recentActivity && recentActivity.length > 0;

    if (recentActivity && !hasData) {
        return (
            <div className="rounded-xl p-5 flex flex-col gap-5 h-full border transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <div className="flex items-center gap-2">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Activity Feed</h3>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No Recent Activity"
                        description="Your team's latest actions and system events will stream here."
                        icon={<Activity size={36} />}
                        className="bg-transparent border-none shadow-none py-12"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 border flex flex-col gap-4 h-full transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Activity Feed</h3>
                    {recentActivity && recentActivity.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md"
                            style={{ fontSize: '11px', fontWeight: 600, background: isDarkMode ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.06)', color: '#a855f7', border: `1px solid ${isDarkMode ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.15)'}` }}>
                            {recentActivity.filter(a => a.status === 'pending' || a.status === 'act_on').length} pending
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors"
                    style={{ background: isDarkMode ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.05)', color: '#a855f7' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>Live</span>
                </div>
            </div>

            <div className="relative space-y-4 overflow-y-auto max-h-[380px] no-scrollbar pr-1 flex-1 mt-2">
                <div className="absolute left-[15px] top-2 bottom-2 w-px pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, rgba(168,85,247,0.3), ${isDarkMode ? '#27272a' : '#e4e4e7'}, transparent)` }} />

                {!recentActivity ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />)
                ) : (
                    recentActivity.map((item, i) => {
                        const config = typeConfig[item.type] ?? { icon: Activity, hex: '#94a3b8' };
                        const Icon = config.icon;
                        const chip = statusChipStyle[item.status] ?? statusChipStyle.pending;

                        return (
                            <div key={i} className="flex items-start gap-4 group cursor-pointer"
                                style={{
                                    opacity: visible[i] ? 1 : 0, 
                                    transform: visible[i] ? 'translateX(0)' : 'translateX(-8px)',
                                    transition: `opacity 0.3s ease ${i * 40}ms, transform 0.3s ease ${i * 40}ms`
                                }}>
                                <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm"
                                    style={{ background: isDarkMode ? '#18181b' : '#ffffff', border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`, color: config.hex }}>
                                    <Icon size={14} />
                                </div>
                                <div className="flex flex-col gap-1 pt-0.5 flex-1 min-w-0">
                                    <p style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4, color: t.primary }}>{item.event}</p>
                                    <p className="truncate" style={{ fontSize: '12px', color: t.secondary }}>{item.detail}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p style={{ fontSize: '11px', fontWeight: 500, color: t.micro }}>{item.time}</p>
                                        <span className="px-1.5 py-0.5 rounded-md"
                                            style={{ fontSize: '10px', fontWeight: 600, background: chip.bg, color: chip.color }}>
                                            {chip.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <button onClick={handleViewSystemLogs}
                className="w-full py-2.5 rounded-lg border hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors mt-auto"
                style={{ fontSize: '13px', fontWeight: 500, color: t.primary, borderColor: isDarkMode ? '#27272a' : '#e4e4e7', background: isDarkMode ? '#18181b' : '#fafafa' }}>
                View System Logs
            </button>
        </div>
    );
};
