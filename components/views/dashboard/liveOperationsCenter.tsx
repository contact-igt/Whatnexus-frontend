"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Flame, MessageSquareOff, AlertTriangle, ChevronRight,
    MessagesSquare, Users, Zap, ArrowUpRight
} from 'lucide-react';
import { glassCard, glassInner, tx } from './glassStyles';
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

export const LiveOperationsCenter = ({ isDarkMode = true, liveOpsData }: LiveOperationsCenterProps) => {
    const [bars, setBars] = useState(false);
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        const t1 = setTimeout(() => setShow(true), 100);
        const t2 = setTimeout(() => setBars(true), 200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [liveOpsData]);

    const hasData = liveOpsData && (liveOpsData.hotLeads.length > 0 || liveOpsData.metrics.unassigned > 0 || liveOpsData.metrics.escalated > 0);

    const topLead = liveOpsData?.hotLeads?.[0];
    const remainingLeads = liveOpsData?.hotLeads?.slice(1, 4) ?? [];
    const agentWorkload = liveOpsData?.agentWorkload ?? [];

    // Computed summary
    const totalActive = (liveOpsData?.metrics.unassigned ?? 0) + (liveOpsData?.metrics.escalated ?? 0);
    const hotCount = liveOpsData?.hotLeads?.filter(l => l.heatState === 'hot').length ?? 0;
    const warmCount = liveOpsData?.hotLeads?.filter(l => l.heatState === 'warm').length ?? 0;
    const activeAgentCount = agentWorkload.length;

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
            <div className="flex items-center justify-between mb-1">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Live Operations</h3>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/shared-inbox/live-chats')}
                        className="px-2.5 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        style={{ fontSize: '12px', fontWeight: 500, color: '#3b82f6' }}>
                        Open Inbox
                    </button>
                    <div className="flex items-center gap-1.5" style={{ color: '#ef4444' }}>
                        <div className="relative flex items-center justify-center px-1">
                            <div className="w-1.5 h-1.5 rounded-full absolute bg-current opacity-75 animate-ping" />
                            <div className="w-1 h-1 rounded-full bg-current relative z-10" />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 500 }}>Live</span>
                    </div>
                </div>
            </div>

            {/* ── Quick Stats Row ── */}
            <div className="grid grid-cols-3 gap-2">
                {!liveOpsData ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-[72px] animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                    ))
                ) : (
                    [
                        { icon: <MessagesSquare size={15} />, label: 'Active Chats', value: totalActive, color: '#3b82f6' },
                        { icon: <Flame size={15} />, label: 'Hot Leads', value: hotCount, color: '#f97316' },
                        { icon: <Users size={15} />, label: 'Agents On', value: activeAgentCount, color: '#10b981' },
                    ].map((stat, i) => (
                        <div key={i} className="p-3 rounded-xl border flex flex-col gap-1.5 transition-all"
                            style={{
                                background: isDarkMode ? '#18181b' : '#fafafa',
                                borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                opacity: show ? 1 : 0,
                                transform: show ? 'translateY(0)' : 'translateY(6px)',
                                transition: `opacity 0.35s ease ${i * 60 + 80}ms, transform 0.35s ease ${i * 60 + 80}ms`,
                            }}>
                            <div className="flex items-center gap-1.5" style={{ color: stat.color }}>
                                {stat.icon}
                                <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{stat.label}</span>
                            </div>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: t.value, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
                        </div>
                    ))
                )}
            </div>

            {/* ── Status tiles (Unassigned / Escalated) ── */}
            <div className="grid grid-cols-2 gap-2.5">
                {[
                    { icon: <MessageSquareOff size={15} />, label: 'Unassigned', count: liveOpsData?.metrics.unassigned ?? 0, color: '#eab308', bg: isDarkMode ? 'rgba(234,179,8,0.06)' : '#fefce8' },
                    { icon: <AlertTriangle size={15} />, label: 'Escalated', count: liveOpsData?.metrics.escalated ?? 0, color: '#ef4444', bg: isDarkMode ? 'rgba(239,68,68,0.06)' : '#fef2f2' },
                ].map((tile, i) => (
                    <div key={i} className="p-3 rounded-xl flex items-center gap-3 border"
                        style={{ background: tile.bg, borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${tile.color}15`, color: tile.color }}>
                            {tile.icon}
                        </div>
                        <div className="flex flex-col">
                            <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{tile.label}</span>
                            <p style={{ fontSize: '20px', fontWeight: 700, color: t.value, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>{tile.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Lead Queue ── */}
            <div className="space-y-2.5 mt-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" style={{ color: isDarkMode ? '#f97316' : '#ea580c' }}>
                        <Flame size={14} className="fill-current" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Lead Queue</span>
                        {(hotCount + warmCount) > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md" style={{
                                fontSize: '11px', fontWeight: 600,
                                background: isDarkMode ? 'rgba(249,115,22,0.1)' : '#fff7ed',
                                border: isDarkMode ? '1px solid rgba(249,115,22,0.2)' : '1px solid #fed7aa',
                                color: isDarkMode ? '#fdba74' : '#c2410c',
                            }}>
                                {hotCount + warmCount}
                            </span>
                        )}
                    </div>
                    {topLead && (
                        <span className="px-2 py-0.5 rounded-md"
                            style={{ fontSize: '11px', fontWeight: 600, background: isDarkMode ? 'rgba(249,115,22,0.1)' : '#fff7ed', border: isDarkMode ? '1px solid rgba(249,115,22,0.2)' : '1px solid #fed7aa', color: isDarkMode ? '#fdba74' : '#c2410c' }}>
                            Top Score: {topLead.score}
                        </span>
                    )}
                </div>

                {!liveOpsData ? (
                    <div className="space-y-2">
                        {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-14 w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />)}
                    </div>
                ) : topLead ? (
                    <div className="space-y-1.5">
                        {/* Primary hot lead */}
                        <div onClick={() => router.push(topLead.phone ? `/shared-inbox?phone=${topLead.phone}` : '/shared-inbox')}
                            className="p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors border"
                            style={{
                                ...glassInner(isDarkMode),
                                background: isDarkMode ? 'rgba(249,115,22,0.04)' : '#fffbf5',
                                borderColor: isDarkMode ? 'rgba(249,115,22,0.15)' : '#fed7aa',
                                opacity: show ? 1 : 0,
                                transition: 'opacity 0.4s ease 0.12s, background 0.15s ease',
                            }}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs relative"
                                    style={{ background: topLead.heatState === 'hot' ? '#f97316' : '#f59e0b' }}>
                                    {topLead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 flex items-center justify-center"
                                        style={{ borderColor: isDarkMode ? '#09090b' : '#ffffff', background: topLead.heatState === 'hot' ? '#ef4444' : '#f59e0b' }}>
                                        <Zap size={7} className="text-white fill-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="truncate" style={{ fontSize: '13px', fontWeight: 600, color: t.primary }}>{topLead.name}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span style={{ fontSize: '11px', color: t.secondary }}>{topLead.phone}</span>
                                        <span className="w-1 h-1 rounded-full" style={{ background: isDarkMode ? '#3f3f46' : '#d4d4d8' }} />
                                        <span style={{ fontSize: '11px', color: '#f97316', fontWeight: 500 }}>{topLead.waiting} wait</span>
                                    </div>
                                </div>
                            </div>
                            <ArrowUpRight size={14} style={{ color: '#f97316', opacity: 0.7 }} />
                        </div>

                        {/* Secondary leads */}
                        {remainingLeads.map((lead, i) => (
                            <div key={i}
                                onClick={() => router.push(lead.phone ? `/shared-inbox?phone=${lead.phone}` : '/shared-inbox')}
                                className="px-3 py-2.5 rounded-lg flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                                style={{
                                    opacity: show ? 1 : 0,
                                    transition: `opacity 0.35s ease ${0.18 + i * 0.06}s`,
                                }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-medium"
                                        style={{ fontSize: '10px', background: lead.heatState === 'hot' ? '#f97316' : '#f59e0b' }}>
                                        {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <span className="truncate" style={{ fontSize: '12px', fontWeight: 500, color: t.primary, maxWidth: 120 }}>{lead.name}</span>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                                        style={{
                                            background: lead.heatState === 'hot' ? (isDarkMode ? 'rgba(249,115,22,0.12)' : '#fff7ed') : (isDarkMode ? 'rgba(245,158,11,0.12)' : '#fffbeb'),
                                            color: lead.heatState === 'hot' ? '#f97316' : '#d97706',
                                        }}>
                                        {lead.heatState === 'hot' ? 'HOT' : 'WARM'}
                                    </span>
                                </div>
                                <span style={{ fontSize: '11px', color: t.secondary, fontVariantNumeric: 'tabular-nums' }}>{lead.waiting}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 rounded-lg flex items-center justify-center border border-dashed"
                        style={{ fontSize: '13px', color: t.secondary, borderColor: isDarkMode ? '#3f3f46' : '#d4d4d8' }}>
                        No leads in queue
                    </div>
                )}
            </div>

            {/* ── Agent Workload ── */}
            <div className="space-y-3 mt-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" style={{ color: isDarkMode ? '#818cf8' : '#6366f1' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>Agent Workload</span>
                    </div>
                    {agentWorkload.length > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>
                            {activeAgentCount} active
                        </span>
                    )}
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
                            <div key={i} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold"
                                            style={{ fontSize: '9px', background: c.from }}>
                                            {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 500, color: t.primary }}>{a.name}</span>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-md" style={{
                                        fontSize: '11px', fontWeight: 600, color: c.from,
                                        background: `${c.from}12`,
                                    }}>{a.chatCount} chats</span>
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
