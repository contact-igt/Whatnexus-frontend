"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CalendarClock, CheckCircle, AlertCircle,
    Cpu, User, Sparkles, Clock, ArrowRight, TrendingUp
} from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from './glassStyles';
import { FollowUpsData } from '@/services/whatsappDashboard';

interface FollowUpHubProps {
    isDarkMode?: boolean;
    followUpsData?: FollowUpsData;
}

// Parse "HH:MM:SS" → "12:00 PM"
function parseTime(timeStr: string): string {
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = mStr ?? '00';
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m} ${period}`;
}

import { NoDataFound } from './noDataFound';

export const FollowUpHub = ({ isDarkMode = true, followUpsData }: FollowUpHubProps) => {
    const [bars, setBars] = useState(false);
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        if (followUpsData) {
            const t1 = setTimeout(() => setShow(true), 150);
            const t2 = setTimeout(() => setBars(true), 300);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [followUpsData]);

    const hasData = followUpsData && (followUpsData.dueToday > 0 || followUpsData.completedToday > 0 || followUpsData.overdue > 0);

    if (followUpsData && !hasData) {
        return (
            <div className="rounded-xl p-5 border flex flex-col gap-5 h-full transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <div className="flex items-center justify-between">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Follow-up Intelligence</h3>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No Follow-Ups Tasked"
                        description="Your scheduled tasks and follow-up activities will be tracked here."
                        icon={<CalendarClock size={32} />}
                        className="bg-transparent border-none shadow-none"
                    />
                </div>
            </div>
        );
    }

    const tiles = followUpsData ? [
        { icon: <CalendarClock size={16} />, label: 'Due Today',  value: followUpsData.dueToday,       hex: '#f59e0b', note: 'Act now'    },
        { icon: <CheckCircle size={16} />,   label: 'Completed',  value: followUpsData.completedToday, hex: '#10b981', note: 'Done today' },
        { icon: <AlertCircle size={16} />,   label: 'Overdue',    value: followUpsData.overdue,        hex: '#ef4444', note: 'Urgent!'   },
    ] : [];

    const aiPct    = followUpsData?.handledBy.aiAutomated ?? 67;
    const agentPct = followUpsData?.handledBy.agentManual ?? 33;
    const upcoming = followUpsData?.upcomingToday ?? [];
    const nurture  = followUpsData?.nurtureEfficiency;

    return (
        <div className="rounded-xl p-5 border flex flex-col gap-5 transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Follow-up Intelligence</h3>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>Live</span>
                </div>
            </div>

            {/* Counter tiles */}
            <div className="grid grid-cols-3 gap-3">
                {!followUpsData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />)
                ) : tiles.map((tile, i) => (
                    <div key={i}
                        className="p-3.5 rounded-xl border flex flex-col gap-1 items-center relative overflow-hidden transition-all"
                        style={{
                            background: isDarkMode ? '#18181b' : '#fafafa',
                            borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                            opacity: show ? 1 : 0, transform: show ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(4px)',
                            transition: `opacity 0.3s ease ${i * 60}ms, transform 0.3s ease ${i * 60}ms`,
                        }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 shadow-sm"
                            style={{ background: `${tile.hex}15`, color: tile.hex }}>
                            {tile.icon}
                        </div>
                        <p style={{ fontSize: '22px', fontWeight: 600, color: t.primary, lineHeight: 1 }}>{tile.value}</p>
                        <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{tile.label}</p>
                    </div>
                ))}
            </div>

            {/* Automation split */}
            <div className="border rounded-xl p-4 transition-all" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: t.secondary, marginBottom: 12 }}>Follow-up Handled By</p>
                <div className="space-y-4 mt-3">
                    {[
                        { label: 'AI Automated', icon: <Cpu size={14} />, pct: aiPct,    hex: '#6366f1', delay: 0   },
                        { label: 'Agent Manual', icon: <User size={14} />, pct: agentPct, hex: '#475569', delay: 100 },
                    ].map((bar, i) => (
                        <div key={i} className="space-y-2 flex flex-col justify-start">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2" style={{ color: t.primary }}>
                                    <span style={{ color: bar.hex }}>{bar.icon}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{bar.label}</span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary }}>{bar.pct}%</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                <div className="h-full rounded-full"
                                    style={{
                                        width: bars ? `${bar.pct}%` : '0%',
                                        background: bar.hex,
                                        transition: `width 900ms ease-out ${bar.delay}ms`,
                                    }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming appointments */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Clock size={16} style={{ color: t.secondary }} />
                        <p style={{ fontSize: '13px', fontWeight: 600, color: t.primary }}>Upcoming Tasks</p>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10">
                        {upcoming.length} pending
                    </span>
                </div>
                <div className="space-y-2">
                    {!followUpsData ? (
                        Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />)
                    ) : upcoming.map((task, i) => {
                        const isPending   = task.type === 'Pending';
                        const typeHex     = isPending ? '#f59e0b' : '#10b981';
                        return (
                            <div key={i}
                                onClick={() => router.push('/followups')}
                                className="flex items-center gap-3 p-3 rounded-xl border hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-colors"
                                style={{
                                    background: isDarkMode ? '#09090b' : '#ffffff',
                                    borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                    opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-6px)',
                                    transition: `opacity 0.3s ease ${i * 50 + 100}ms, transform 0.3s ease ${i * 50 + 100}ms`,
                                }}>
                                <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: typeHex }} />
                                <div className="flex-1 min-w-0">
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: t.primary }} className="truncate">{task.name}</p>
                                    <div className="flex items-center mt-1">
                                        <span style={{ fontSize: '11px', fontWeight: 500, color: typeHex, background: `${typeHex}15`, padding: '2px 6px', borderRadius: '4px' }}>
                                            {task.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }} className="tabular-nums">
                                        {parseTime(task.time)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Nurture efficiency */}
            <div className="flex items-center justify-between p-4 rounded-xl border transition-all mt-2"
                style={{ background: isDarkMode ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.03)', borderColor: isDarkMode ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.2)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500/10">
                        <Sparkles size={16} className="text-emerald-500" />
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>Nurture Efficiency</p>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: '#10b981', marginTop: '2px' }}>
                            {nurture?.grade ?? 'High — A+ Grade'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span style={{ fontSize: '20px', fontWeight: 600, color: '#10b981' }}>{nurture?.value ?? 0}%</span>
                </div>
            </div>
        </div>
    );
};
