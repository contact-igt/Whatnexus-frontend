"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, MessageSquareOff, AlertTriangle, UserCheck, ChevronRight, Timer } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg, fs } from './glassStyles';
import { AgentWorkload, HotLead } from '@/services/whatsappDashboard';
import { NoDataFound } from './noDataFound';

interface LiveOperationsCenterProps {
    isDarkMode?: boolean;
    liveOpsData?: {
        hotLeads: HotLead[];
        metrics: { unassigned: number; escalated: number };
        agentWorkload: AgentWorkload[];
    };
}

const agentColors = [
    { from: '#10b981', to: '#14b8a6', dot: '#22c55e' },
    { from: '#6366f1', to: '#8b5cf6', dot: '#f59e0b' },
    { from: '#3b82f6', to: '#6366f1', dot: '#64748b' },
    { from: '#f59e0b', to: '#f97316', dot: '#fbbf24' },
    { from: '#a855f7', to: '#c084fc', dot: '#c084fc' },
];

function useSessionTimer() {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, []);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}



export const LiveOperationsCenter = ({ isDarkMode = true, liveOpsData }: LiveOperationsCenterProps) => {
    const [bars, setBars] = useState(false);
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();
    const sessionTime = useSessionTimer();

    useEffect(() => {
        const t1 = setTimeout(() => setShow(true), 100);
        const t2 = setTimeout(() => setBars(true), 200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [liveOpsData]);

    const hasData = liveOpsData && (liveOpsData.hotLeads.length > 0 || liveOpsData.metrics.unassigned > 0 || liveOpsData.metrics.escalated > 0);

    const topLead = liveOpsData?.hotLeads?.[0];
    const agentWorkload = liveOpsData?.agentWorkload ?? [];

    const heatChipStyle = (heatState?: string) => {
        const isHot = heatState === 'hot';
        const hex = isHot ? '#f97316' : '#f59e0b';
        return { background: `${hex}18`, border: `1px solid ${hex}30`, color: hex };
    };

    const noDataContent = (
        <div className="flex-1 flex flex-col justify-center">
            <NoDataFound
                isDarkMode={isDarkMode}
                title="Quiet Operations"
                description="No urgent leads or escalated chats detected at the moment."
                icon={<Flame size={32} />}
                className="bg-transparent border-none shadow-none py-8"
            />
        </div>
    );

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-4" style={glassCard(isDarkMode)}>

            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Live Operations</h3>
                <div className="flex items-center gap-1.5" style={{ color: '#ef4444' }}>
                    <div className="relative flex items-center justify-center px-1">
                        <div className="w-1.5 h-1.5 rounded-full absolute bg-current opacity-75 animate-ping" />
                        <div className="w-1 h-1 rounded-full bg-current relative z-10" />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>Live Sync</span>
                </div>
            </div>

            {/* ── Big Session Timer ── */}
            <div className="rounded-xl p-6 flex flex-col justify-center items-center gap-1.5 relative border"
                style={{
                    background: isDarkMode ? '#18181b' : '#fafafa',
                    borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                }}>
                <div className="flex items-center gap-2 mb-1">
                    <Timer size={14} className={isDarkMode ? "text-zinc-400" : "text-zinc-500"} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: isDarkMode ? '#a1a1aa' : '#71717a' }}>Current Session</span>
                </div>
                <div style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                    color: t.value,
                }}>
                    {sessionTime}
                </div>
                <div className="flex items-center gap-6 mt-3">
                    <div className="flex flex-col items-center">
                        <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>Peak Load</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary, marginTop: 2 }}>12:45 PM</span>
                    </div>
                    <div className="w-px h-6 bg-current opacity-10" />
                    <div className="flex flex-col items-center">
                        <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>Efficiency</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary, marginTop: 2 }}>98.2%</span>
                    </div>
                </div>
            </div>

            {/* ── Hot Lead Card ── */}
            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" style={{ color: isDarkMode ? '#f97316' : '#ea580c' }}>
                        <Flame size={14} className="fill-current" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Urgent Queue</span>
                    </div>
                    {topLead && (
                        <span className="ml-auto px-2 py-0.5 rounded-md"
                            style={{ fontSize: '11px', fontWeight: 600, background: isDarkMode ? 'rgba(249,115,22,0.1)' : '#fff7ed', border: isDarkMode ? '1px solid rgba(249,115,22,0.2)' : '1px solid #fed7aa', color: isDarkMode ? '#fdba74' : '#c2410c' }}>
                            Score: {topLead.score}
                        </span>
                    )}
                </div>
                {!liveOpsData ? (
                    <div className="h-16 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                ) : topLead ? (
                    <div onClick={() => router.push(topLead.phone ? `/shared-inbox?phone=${topLead.phone}` : '/shared-inbox')}
                        className="p-3.5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50"
                        style={{ ...glassInner(isDarkMode), opacity: show ? 1 : 0, transition: 'opacity 0.4s ease 0.1s' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm"
                                style={{ background: '#3b82f6' }}>
                                {topLead.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex flex-col">
                                <p style={{ fontSize: '14px', fontWeight: 500, color: t.primary }}>{topLead.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span style={{ fontSize: '12px', color: t.secondary }}>{topLead.phone}</span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                                    <span style={{ fontSize: '12px', color: t.secondary }}>Wait: {topLead.waiting}</span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={16} style={{ color: t.micro }} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                ) : (
                    <div className="p-4 rounded-lg flex items-center justify-center border border-dashed"
                        style={{ fontSize: '13px', color: t.secondary, borderColor: isDarkMode ? '#3f3f46' : '#d4d4d8' }}>
                        Queue is empty
                    </div>
                )}
            </div>

            {/* ── Status tiles ── */}
            <div className="grid grid-cols-2 gap-3 my-4">
                {[
                    { icon: <MessageSquareOff size={16} />, label: 'Unassigned', count: liveOpsData?.metrics.unassigned ?? 0, color: '#eab308' },
                    { icon: <AlertTriangle size={16} />, label: 'Escalated', count: liveOpsData?.metrics.escalated ?? 0, color: '#ef4444' },
                ].map((tile, i) => (
                    <div key={i} className="p-3.5 rounded-xl flex flex-col gap-2.5 border"
                        style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <div className="flex items-center gap-2">
                            <span style={{ color: tile.color }}>{tile.icon}</span>
                            <span style={{ fontSize: '13px', fontWeight: 500, color: t.secondary }}>{tile.label}</span>
                        </div>
                        <p style={{ fontSize: '24px', fontWeight: 600, color: t.value, lineHeight: 1, paddingLeft: 2 }}>{tile.count}</p>
                    </div>
                ))}
            </div>

            {/* ── Agent Workload ── */}
            <div className="space-y-3.5 mt-2">
                <div className="flex items-center gap-2" style={{ color: isDarkMode ? '#818cf8' : '#6366f1' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Active Agents</span>
                </div>
                {!liveOpsData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />)
                ) : agentWorkload.length === 0 ? (
                    <div className="py-4 rounded-lg flex justify-center text-sm" style={{ color: t.secondary, border: isDarkMode ? '1px dashed #3f3f46' : '1px dashed #e4e4e7' }}>
                        No active agents
                    </div>
                ) : (
                    agentWorkload.map((a, i) => {
                        const c = agentColors[i % agentColors.length];
                        return (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ background: c.from }} />
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: t.primary }}>{a.name}</span>
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.secondary }}>{a.chatCount} chats</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                    <div className="h-full rounded-full"
                                        style={{
                                            width: bars ? `${a.percentage}%` : '0%',
                                            background: c.from,
                                            transition: `width 800ms cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`
                                        }} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* No data fallback */}
            {liveOpsData && !hasData && noDataContent}
        </div>
    );
};
