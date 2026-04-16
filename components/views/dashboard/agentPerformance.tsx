"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MoreHorizontal, Users2 } from 'lucide-react';
import { tx } from './glassStyles';
import { AgentPerformanceData } from '@/services/whatsappDashboard';
import { NoDataFound } from './noDataFound';

interface AgentPerformanceProps {
    isDarkMode?: boolean;
    agentData?: AgentPerformanceData;
}

const agentGradients = [
    'linear-gradient(135deg,#10b981,#14b8a6)',
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#3b82f6,#6366f1)',
    'linear-gradient(135deg,#f59e0b,#f97316)',
];

const agentBarGradients = [
    { from: '#10b981', to: '#14b8a6' },
    { from: '#6366f1', to: '#8b5cf6' },
    { from: '#8b5cf6', to: '#ec4899' },
    { from: '#3b82f6', to: '#6366f1' },
    { from: '#f59e0b', to: '#f97316' },
];

const onlineBadge = {
    online:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399',  border: 'rgba(16,185,129,0.25)',  dot: '#22c55e' },
    offline: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8',  border: 'rgba(100,116,139,0.25)', dot: '#64748b' },
};



export const AgentPerformance = ({ isDarkMode = true, agentData }: AgentPerformanceProps) => {
    const [show, setShow] = useState(false);
    const [bars, setBars] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        if (agentData) {
            const t1 = setTimeout(() => setShow(true), 150);
            const t2 = setTimeout(() => setBars(true), 300);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [agentData]);

    const agents = [...(agentData?.agents ?? [])]
        .sort((a, b) => (b.chatCount || 0) - (a.chatCount || 0))
        .slice(0, 5);
    const summary = agentData?.summary;

    return (
        <div className="rounded-xl p-5 border flex flex-col gap-5 h-full transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Agent Performance</h3>
                </div>
                <button onClick={() => router.push('/team')}
                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ color: t.secondary }}>
                    <MoreHorizontal size={18} />
                </button>
            </div>

            <div className="space-y-2 flex-1 flex flex-col justify-start">
                {!agentData ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />)
                ) : agents.length === 0 ? (
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No Agent Records"
                        description="Team workload and response metrics will appear here."
                        icon={<Users2 size={36} />}
                        className="bg-transparent border-none shadow-none py-10"
                    />
                ) : agents.map((a, i) => {
                    const badge = onlineBadge[a.onlineStatus] ?? onlineBadge.offline;
                    const initials = a.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                    // Softer fallback colors instead of bright neon logic based on position:
                    const colorList = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                    const hex = colorList[i % colorList.length];
                    const roleLabel = a.role === 'doctor' ? 'Doctor' : a.role === 'staff' ? 'Staff' : 'Agent';

                    return (
                        <div key={i} onClick={() => router.push('/team')}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                            style={{
                                opacity: show ? 1 : 0, transform: show ? 'translateX(0)' : 'translateX(-8px)',
                                transition: `opacity 0.35s ease ${i * 60}ms, transform 0.35s ease ${i * 60}ms`
                            }}>
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm"
                                    style={{ background: hex }}>{initials}</div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2"
                                    style={{ background: badge.dot, borderColor: isDarkMode ? '#09090b' : '#ffffff' }} />
                            </div>

                            {/* Name + bar */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <p style={{ fontSize: '14px', fontWeight: 500, color: t.primary }}>{a.name}</p>
                                        <span className="px-1.5 py-0.5 rounded"
                                            style={{ fontSize: '10px', fontWeight: 600, color: t.secondary, background: isDarkMode ? '#27272a' : '#f4f4f5' }}>
                                            {roleLabel}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex items-center gap-1 text-right">
                                            <span style={{ fontSize: '14px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: t.primary }}>{a.chatCount}</span>
                                            <span style={{ fontSize: '11px', color: t.secondary }}>chats</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                        <div className="h-full rounded-full"
                                            style={{
                                                background: hex,
                                                width: bars && a.chatCount > 0 ? `${Math.max(a.barPct, 5)}%` : '0%',
                                                transition: `width 800ms cubic-bezier(0.22,1,0.36,1) ${i * 60 + 100}ms`
                                            }} />
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 w-12 justify-end">
                                        <Clock size={12} style={{ color: t.secondary }} />
                                        <span style={{ fontSize: '11px', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: t.secondary }}>{a.responseTime}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary bar */}
            <div className="pt-4 grid grid-cols-3 gap-3" style={{ borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                {!agentData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />)
                ) : (() => {
                    const totalChats = agents.reduce((sum, a) => sum + (a.chatCount || 0), 0);
                    return [
                        { label: 'Peak Time',   value: summary?.peakTime ?? '—'            },
                        { label: 'Active',      value: summary?.active ?? '—'              },
                        { label: 'Total Chats', value: totalChats.toLocaleString()         },
                    ];
                })().map((s, i) => (
                    <div key={i} className="p-3 rounded-xl flex flex-col justify-center border" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{s.label}</p>
                        <p style={{ fontSize: '16px', fontWeight: 700, color: t.value, marginTop: 2 }}>{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
