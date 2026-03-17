"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MoreHorizontal } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from './glassStyles';
import { AgentPerformanceData } from '@/services/whatsappDashboard';

interface AgentPerformanceProps {
    isDarkMode?: boolean;
    agentData?: AgentPerformanceData;
}

// Cycling gradient per agent row
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

// onlineStatus → badge colours
const onlineBadge = {
    online:  { bg: 'rgba(16,185,129,0.15)',  color: '#34d399',  border: 'rgba(16,185,129,0.25)',  dot: '#22c55e' },
    offline: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8',  border: 'rgba(100,116,139,0.25)', dot: '#64748b' },
};

import { NoDataFound } from './noDataFound';
import { Users2 } from 'lucide-react';

export const AgentPerformance = ({ isDarkMode = true, agentData }: AgentPerformanceProps) => {
    const [show, setShow] = useState(false);
    const [bars, setBars] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        if (agentData) {
            const t1 = setTimeout(() => setShow(true), 300);
            const t2 = setTimeout(() => setBars(true), 480);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [agentData]);

    const agents = agentData?.agents ?? [];
    const summary = agentData?.summary;

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#6366f1' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>Agent Performance</span>
                </div>
                <MoreHorizontal size={14} style={{ color: t.micro, cursor: 'pointer' }} onClick={() => router.push('/team')} />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
                {!agentData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 w-full sk rounded-xl" />)
                ) : agents.length === 0 ? (
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No Agent Records"
                        description="Team workload and response metrics will appear here."
                        icon={<Users2 size={32} />}
                        className="bg-transparent border-none shadow-none py-10"
                    />
                ) : agents.map((a, i) => {
                    const grad = agentGradients[i % agentGradients.length];
                    const barGrad = agentBarGradients[i % agentBarGradients.length];
                    const badge = onlineBadge[a.onlineStatus] ?? onlineBadge.offline;
                    // Initials from name
                    const initials = a.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

                    return (
                        <div key={i} onClick={() => router.push('/team')} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-transform hover:-translate-y-px"
                            style={{
                                ...glassInner(isDarkMode),
                                opacity: show ? 1 : 0,
                                transform: show ? 'translateX(0)' : 'translateX(-8px)',
                                transition: `opacity 0.35s ease ${i * 80}ms, transform 0.35s ease ${i * 80}ms`
                            }}>
                            {/* Avatar + online dot */}
                            <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow-lg"
                                    style={{ background: grad }}>{initials}</div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                                    style={{ background: badge.dot, borderColor: isDarkMode ? '#080b12' : '#f1f5f9' }} />
                            </div>

                            {/* Name + status chip + bar */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <p className="text-xs font-black tracking-tight leading-none" style={{ color: t.primary }}>{a.name}</p>
                                    {/* onlineStatus → "online"=green, "offline"=grey */}
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider"
                                        style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}>
                                        {a.onlineStatus}
                                    </span>
                                </div>
                                {/* barPct → progress bar width */}
                                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                    <div className="h-full rounded-full"
                                        style={{
                                            background: `linear-gradient(90deg,${barGrad.from},${barGrad.to})`,
                                            width: bars ? `${a.barPct}%` : '0%',
                                            transition: `width 800ms cubic-bezier(0.22,1,0.36,1) ${i * 80 + 150}ms`
                                        }} />
                                </div>
                            </div>

                            {/* chatCount + responseTime (pre-formatted) */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-black tabular-nums" style={{ color: t.secondary }}>{a.chatCount}</span>
                                    <span className="text-[8px]" style={{ color: t.micro }}>chats</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={9} style={{ color: t.micro }} />
                                    {/* responseTime is pre-formatted → render as-is */}
                                    <span className="text-[10px] font-black tabular-nums" style={{ color: t.secondary }}>{a.responseTime}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary bar — peakTime / active / satisfaction */}
            <div className="pt-3 grid grid-cols-3 gap-2" style={{ borderTop: `1px solid ${t.divider}` }}>
                {!agentData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 w-full sk rounded-xl" />)
                ) : [
                    { label: 'Peak Time',    value: summary?.peakTime ?? '—' },
                    { label: 'Active',       value: summary?.active ?? '—'   },
                    { label: 'Satisfaction', value: summary?.satisfaction ?? '—' },
                ].map((s, i) => (
                    <div key={i} className="p-2 rounded-xl flex flex-col items-center gap-1" style={glassInner(isDarkMode)}>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-center" style={{ color: t.label }}>{s.label}</p>
                        <p className="text-[11px] font-black" style={{ color: t.value }}>{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
