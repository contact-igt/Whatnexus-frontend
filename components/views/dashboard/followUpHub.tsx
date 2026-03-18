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
            const t1 = setTimeout(() => setShow(true), 300);
            const t2 = setTimeout(() => setBars(true), 480);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [followUpsData]);

    const hasData = followUpsData && (followUpsData.dueToday > 0 || followUpsData.completedToday > 0 || followUpsData.overdue > 0);

    if (followUpsData && !hasData) {
        return (
            <div className="rounded-2xl p-5 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#f59e0b' }} />
                        <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>
                            Follow-up Intelligence
                        </span>
                    </div>
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

    // Tile config uses API values
    const tiles = followUpsData ? [
        { icon: <CalendarClock size={14} />, label: 'Due Today',  value: followUpsData.dueToday,       hex: '#f59e0b', note: 'Act now'    },
        { icon: <CheckCircle size={14} />,   label: 'Completed',  value: followUpsData.completedToday, hex: '#10b981', note: 'Done today' },
        { icon: <AlertCircle size={14} />,   label: 'Overdue',    value: followUpsData.overdue,        hex: '#f43f5e', note: 'Urgent!'   },
    ] : [];

    const aiPct    = followUpsData?.handledBy.aiAutomated ?? 67;
    const agentPct = followUpsData?.handledBy.agentManual ?? 33;
    const upcoming = followUpsData?.upcomingToday ?? [];
    const nurture  = followUpsData?.nurtureEfficiency;

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-5" style={glassCard(isDarkMode)}>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#f59e0b' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>
                        Follow-up Intelligence
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Live</span>
                </div>
            </div>

            {/* Counter tiles — dueToday / completedToday / overdue */}
            <div className="grid grid-cols-3 gap-2">
                {!followUpsData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 sk rounded-xl" />)
                ) : tiles.map((tile, i) => (
                    <div key={i}
                        className="p-3.5 rounded-xl flex flex-col gap-2 items-center relative overflow-hidden"
                        style={{
                            background: `${tile.hex}18`,
                            border: `1px solid ${tile.hex}30`,
                            opacity: show ? 1 : 0,
                            transform: show ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(6px)',
                            transition: `opacity 0.3s ease ${i * 80}ms, transform 0.38s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`,
                        }}>
                        <div className="absolute inset-0 rounded-xl pointer-events-none"
                            style={{ background: `radial-gradient(circle at 50% 0%, ${tile.hex}18 0%, transparent 70%)` }} />
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center relative z-10"
                            style={{ background: `${tile.hex}25`, color: tile.hex }}>
                            {tile.icon}
                        </div>
                        <p className="text-2xl font-black leading-none relative z-10" style={{ color: tile.hex }}>{tile.value}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-center relative z-10" style={{ color: t.label }}>{tile.label}</p>
                        <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full relative z-10"
                            style={{ background: `${tile.hex}25`, color: tile.hex }}>{tile.note}</span>
                    </div>
                ))}
            </div>

            {/* Automation split — handledBy.aiAutomated / handledBy.agentManual */}
            <div style={{ ...glassInner(isDarkMode), borderRadius: 14, padding: '12px 14px' }}>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: t.label }}>
                    Follow-up Handled By
                </p>
                <div className="space-y-3">
                    {[
                        { label: 'AI Automated', icon: <Cpu size={11} />, pct: aiPct,    from: '#6366f1', to: '#8b5cf6', iconColor: '#818cf8', delay: 0   },
                        { label: 'Agent (Manual)', icon: <User size={11} />, pct: agentPct, from: '#475569', to: '#64748b', iconColor: t.secondary, delay: 100 },
                    ].map((bar, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5" style={{ color: bar.iconColor }}>
                                    {bar.icon}
                                    <span className="text-[10px] font-bold">{bar.label}</span>
                                </div>
                                {/* aiAutomated / agentManual → append % */}
                                <span className="text-[11px] font-black" style={{ color: t.value }}>{bar.pct}%</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                <div className="h-full rounded-full"
                                    style={{
                                        width: bars ? `${bar.pct}%` : '0%',
                                        background: `linear-gradient(90deg,${bar.from},${bar.to})`,
                                        boxShadow: `0 0 10px ${bar.from}55`,
                                        transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${bar.delay}ms`,
                                    }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upcoming appointments — upcomingToday */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Clock size={11} style={{ color: t.label }} />
                    <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: t.label }}>Today's Upcoming</p>
                    <span className="ml-auto text-[8px] font-black text-amber-400 px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}>
                        {upcoming.length} tasks
                    </span>
                </div>
                <div className="space-y-1.5">
                    {!followUpsData ? (
                        Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 sk rounded-xl" />)
                    ) : upcoming.map((task, i) => {
                        const isPending   = task.type === 'Pending';
                        const typeHex     = isPending ? '#f59e0b' : '#10b981';
                        return (
                            <div key={i}
                                onClick={() => router.push('/followups')}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl group cursor-pointer"
                                style={{
                                    ...glassInner(isDarkMode),
                                    opacity: show ? 1 : 0,
                                    transform: show ? 'translateX(0)' : 'translateX(-6px)',
                                    transition: `opacity 0.3s ease ${i * 70 + 200}ms, transform 0.3s ease ${i * 70 + 200}ms`,
                                }}>
                                <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: typeHex }} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold leading-none truncate" style={{ color: t.primary }}>{task.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {/* type chip — "Pending" / "Confirmed" */}
                                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded"
                                            style={{ background: `${typeHex}20`, color: typeHex }}>{task.type}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end shrink-0">
                                    {/* time → parse "HH:MM:SS" → "12:00 PM" */}
                                    <span className="text-[9px] font-black tabular-nums" style={{ color: t.secondary }}>{parseTime(task.time)}</span>
                                    <ArrowRight size={10} className="mt-0.5 group-hover:translate-x-0.5 transition-transform" style={{ color: t.micro }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Nurture efficiency — nurtureEfficiency.value / nurtureEfficiency.grade */}
            <div className="flex items-center justify-between p-3.5 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)' }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full border-2 border-emerald-500/40 flex items-center justify-center"
                        style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <Sparkles size={14} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: t.label }}>Nurture Efficiency</p>
                        {/* nurtureEfficiency.grade → pre-computed string, render as-is */}
                        <p className="text-sm font-black text-emerald-400 leading-tight">
                            {nurture?.grade ?? 'High — A+ Grade'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/40 flex items-center justify-center"
                        style={{ background: 'rgba(16,185,129,0.12)' }}>
                        {/* nurtureEfficiency.value → append % */}
                        <span className="text-[13px] font-black text-emerald-400">{nurture?.value ?? 0}%</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <TrendingUp size={9} className="text-emerald-400" />
                        <span className="text-[7px] font-black text-emerald-400">Live</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
