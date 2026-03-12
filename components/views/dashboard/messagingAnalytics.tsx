"use client";

import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
    MessageSquare, TrendingUp, ArrowUpRight,
    Bot, Send
} from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from './glassStyles';
import { MessagingAnalyticsData } from '@/services/whatsappDashboard';

interface MessagingAnalyticsProps {
    isDarkMode?: boolean;
    messagingData?: MessagingAnalyticsData;
}

const CustomTooltip = ({ active, payload, label, isDark }: any) => {
    if (!active || !payload?.length) return null;
    const t = tx(isDark);
    return (
        <div style={{
            background: isDark ? 'rgba(8,11,18,0.97)' : 'rgba(255,255,255,0.98)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(203,213,225,0.9)'}`,
            borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}>
            <p style={{ color: t.label, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.stroke || p.fill }} />
                    <span style={{ color: t.secondary, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{p.name}</span>
                    <span style={{ color: t.value, fontSize: 11, fontWeight: 900, marginLeft: 'auto' }}>{p.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

export const MessagingAnalytics = ({ isDarkMode = true, messagingData }: MessagingAnalyticsProps) => {
    const [show, setShow] = useState(false);
    const [tab, setTab] = useState<'trend' | 'stats'>('trend');
    const t = tx(isDarkMode);

    useEffect(() => {
        if (messagingData) {
            const t1 = setTimeout(() => setShow(true), 300);
            return () => clearTimeout(t1);
        }
    }, [messagingData]);

    // totalMessages → .toLocaleString()
    const totalMsg = messagingData?.totalMessages?.toLocaleString() ?? '—';
    // trendVsLastWeek → prefix "+" if positive
    const trend = messagingData?.trendVsLastWeek ?? 0;
    const trendLabel = `${trend >= 0 ? '+' : ''}${trend}% this week`;

    // Chart data — dailyVolume: use `total` and `aiHandled` fields
    const chartData = messagingData?.dailyVolume ?? [];

    const topKPIs = messagingData ? [
        {
            label: 'Total Messages',
            // totalMessages → .toLocaleString()
            value: messagingData.totalMessages.toLocaleString(),
            sub: trendLabel,
            color: '#34d399',
            icon: <Send size={12} />,
        },
        {
            label: 'Response Rate',
            // responseRate → append %
            value: `${messagingData.responseRate}%`,
            sub: 'AI + Agents',
            color: '#818cf8',
            icon: <Bot size={12} />,
        },
        {
            label: 'Avg / Day',
            value: messagingData.avgPerDay.toLocaleString(),
            sub: `${messagingData.msgsPerHour} msgs/hr`,
            color: '#fbbf24',
            icon: <TrendingUp size={12} />,
        },
    ] : [];

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-5 h-fit" style={glassCard(isDarkMode)}>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#3b82f6' }} />
                        <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>
                            Messaging Analytics
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        {/* totalMessages → .toLocaleString() */}
                        <h3 className="text-2xl font-black tracking-tighter tabular-nums" style={{ color: t.value }}>{totalMsg}</h3>
                        {/* trendVsLastWeek → prefix + if positive */}
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                            <TrendingUp size={9} className="text-emerald-400" />
                            <span className="text-[9px] font-black text-emerald-400">{trendLabel}</span>
                        </div>
                    </div>
                    <p className="text-[9px] font-medium mt-0.5" style={{ color: t.micro }}>Total messages this period</p>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 rounded-xl p-1" style={{ ...glassInner(isDarkMode) }}>
                    {(['trend', 'stats'] as const).map(tb => (
                        <button key={tb} onClick={() => setTab(tb)}
                            className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all"
                            style={tab === tb
                                ? { background: '#2563eb', color: '#fff', boxShadow: '0 2px 10px rgba(59,130,246,0.35)' }
                                : { color: t.secondary }
                            }>
                            {tb === 'trend' ? 'Trend' : 'Stats'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top KPI strip */}
            <div className="grid grid-cols-3 gap-2">
                {!messagingData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 sk rounded-xl" />)
                ) : topKPIs.map((kpi, i) => (
                    <div key={i} className="p-3 rounded-xl flex flex-col gap-1.5"
                        style={{
                            ...glassInner(isDarkMode),
                            opacity: show ? 1 : 0,
                            transform: show ? 'translateY(0)' : 'translateY(6px)',
                            transition: `opacity 0.35s ease ${i * 80}ms, transform 0.35s ease ${i * 80}ms`,
                        }}>
                        <div className="flex items-center gap-1.5" style={{ color: kpi.color }}>
                            {kpi.icon}
                            <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: t.label }}>{kpi.label}</span>
                        </div>
                        <p className="text-[15px] font-black tabular-nums tracking-tight" style={{ color: kpi.color }}>{kpi.value}</p>
                        <div className="flex items-center gap-1">
                            <ArrowUpRight size={8} style={{ color: kpi.color }} />
                            <p className="text-[8px] font-medium" style={{ color: t.secondary }}>{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content panel */}
            <div style={{ opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}>
                {tab === 'trend' ? (
                    <div>
                        {!messagingData ? (
                            <div className="h-36 sk rounded-xl" />
                        ) : (
                            <>
                                <div style={{ height: 155 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        {/* dailyVolume → total (TOTAL VOLUME line) + aiHandled (AI HANDLED line) */}
                                        <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="msgGradTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={isDarkMode ? 0.35 : 0.25} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                                                </linearGradient>
                                                <linearGradient id="msgGradAI" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={isDarkMode ? 0.28 : 0.18} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3"
                                                stroke={isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)'}
                                                vertical={false} />
                                            {/* day field → X-axis label */}
                                            <XAxis dataKey="day" axisLine={false} tickLine={false}
                                                tick={{ fontSize: 9, fontWeight: 700, fill: isDarkMode ? 'rgba(255,255,255,0.28)' : '#94a3b8' }}
                                                dy={6} />
                                            <YAxis axisLine={false} tickLine={false}
                                                tick={{ fontSize: 8, fontWeight: 600, fill: isDarkMode ? 'rgba(255,255,255,0.18)' : '#cbd5e1' }} />
                                            <Tooltip content={<CustomTooltip isDark={isDarkMode} />} />
                                            {/* total → TOTAL VOLUME line */}
                                            <Area type="monotone" dataKey="total" name="Total Volume"
                                                stroke="#3b82f6" strokeWidth={2.5}
                                                fill="url(#msgGradTotal)" dot={false}
                                                activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
                                                isAnimationActive animationBegin={200} animationDuration={900} animationEasing="ease-out" />
                                            {/* aiHandled → AI HANDLED line */}
                                            <Area type="monotone" dataKey="aiHandled" name="AI Handled"
                                                stroke="#10b981" strokeWidth={2.5}
                                                fill="url(#msgGradAI)" dot={false}
                                                activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
                                                isAnimationActive animationBegin={350} animationDuration={900} animationEasing="ease-out" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-5 mt-2">
                                    {[{ label: 'Total Volume', hex: '#3b82f6' }, { label: 'AI Handled', hex: '#10b981' }].map((l, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div style={{ width: 22, height: 2.5, background: l.hex, borderRadius: 99, boxShadow: `0 0 6px ${l.hex}80` }} />
                                            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: t.label }}>{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    /* Stats view */
                    <div className="space-y-3">
                        {!messagingData ? (
                            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 sk rounded-lg" />)
                        ) : [
                            { label: 'Response Rate',    value: `${messagingData.responseRate}%`,  hex: '#818cf8', pct: messagingData.responseRate },
                            { label: 'Delivery Rate',    value: `${messagingData.deliveryRate}%`,  hex: '#34d399', pct: messagingData.deliveryRate },
                            // failedRate → append %, colour red
                            { label: 'Failed / Bounced', value: `${messagingData.failedRate}%`,    hex: '#fb7185', pct: messagingData.failedRate   },
                            { label: 'Msgs / Hour',      value: messagingData.msgsPerHour.toString(), hex: '#fbbf24', pct: Math.min(100, messagingData.msgsPerHour / 2) },
                        ].map((s, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: t.label }}>{s.label}</span>
                                    <span className="text-[9px] font-black" style={{ color: s.hex }}>{s.value}</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                    <div className="h-full rounded-full"
                                        style={{
                                            width: `${s.pct}%`, background: s.hex, opacity: 0.8,
                                            boxShadow: `0 0 8px ${s.hex}60`,
                                            transition: `width 800ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`
                                        }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer stats — msgsPerHour / deliveryRate / failedRate */}
            <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: `1px solid ${t.divider}` }}>
                {!messagingData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 sk rounded-xl" />)
                ) : [
                    { label: 'Msgs / Hour',      value: messagingData.msgsPerHour.toString(),  color: '#34d399' },
                    { label: 'Delivery Rate',    value: `${messagingData.deliveryRate}%`,       color: t.primary },
                    // failedRate → append %, colour red
                    { label: 'Failed / Bounced', value: `${messagingData.failedRate}%`,         color: '#fb7185' },
                ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 p-2.5 rounded-xl" style={glassInner(isDarkMode)}>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-center" style={{ color: t.label }}>{s.label}</p>
                        <p className="text-sm font-black tabular-nums tracking-tight" style={{ color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
