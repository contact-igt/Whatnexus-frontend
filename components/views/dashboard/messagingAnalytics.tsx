"use client";

import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
    MessageSquare, TrendingUp, ArrowUpRight,
    Bot, Send, Activity, BarChart2, TrendingDown
} from 'lucide-react';
import { glassCard, glassInner, tx, trackBg, fs } from './glassStyles';
import { MessagingAnalyticsData } from '@/services/whatsappDashboard';
import { NoDataFound } from './noDataFound';

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
            borderRadius: 14, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}>
            <p style={{ color: t.label, fontSize: fs.label, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < payload.length - 1 ? 6 : 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.stroke || p.fill }} />
                    <span style={{ color: t.secondary, fontSize: fs.label, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{p.name}</span>
                    <span style={{ color: t.value, fontSize: fs.md, fontWeight: 900, marginLeft: 'auto' }}>{p.value.toLocaleString()}</span>
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

    const hasData = messagingData && messagingData.totalMessages > 0;

    if (messagingData && !hasData) {
        return (
            <div className="rounded-2xl p-6 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
                <div className="flex items-center gap-2">
                    <div style={{ width: 3, height: 16, borderRadius: 9999, background: '#3b82f6' }} />
                    <span style={{ fontSize: fs.label, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: t.label }}>Messaging Analytics</span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No Messaging Data"
                        description="Communication volume and activity trends will be visualized here."
                        icon={<MessageSquare size={36} />}
                        className="bg-transparent border-none shadow-none py-12"
                    />
                </div>
            </div>
        );
    }

    const totalMsg = messagingData?.totalMessages?.toLocaleString() ?? '—';
    const trend = messagingData?.trendVsLastWeek ?? 0;
    const trendLabel = `${trend >= 0 ? '+' : ''}${trend}% this week`;
    const chartData = messagingData?.dailyVolume ?? [];

    const topKPIs = messagingData ? [
        {
            label: 'Total Messages',
            value: messagingData.totalMessages.toLocaleString(),
            sub: trendLabel,
            color: '#34d399',
            icon: <Send size={14} />,
        },
        {
            label: 'Response Rate',
            value: `${messagingData.responseRate}%`,
            sub: 'AI + Agents',
            color: '#818cf8',
            icon: <Bot size={14} />,
        },
        {
            label: 'Avg / Day',
            value: messagingData.avgPerDay.toLocaleString(),
            sub: `${messagingData.msgsPerHour} msgs/hr`,
            color: '#fbbf24',
            icon: <TrendingUp size={14} />,
        },
    ] : [];

    return (
        <div className="rounded-xl p-6 flex flex-col gap-6 h-fit border transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            {/* Header */}
            <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: t.secondary, marginBottom: 4 }}>
                            Live Traffic Analysis
                        </p>
                        <h3 className="flex items-baseline gap-3">
                            <span style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.02em', color: t.value }}>
                                {totalMsg}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>Messages Today</span>
                        </h3>
                    </div>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-1 p-1 rounded-lg w-fit border" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    <button onClick={() => setTab('trend')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${tab === 'trend' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'}`}
                        style={{
                            background: tab === 'trend' ? (isDarkMode ? '#27272a' : '#ffffff') : 'transparent',
                            color: tab === 'trend' ? t.primary : t.secondary,
                            fontSize: '12px', fontWeight: 500
                        }}>
                        <Activity size={14} /> Trend
                    </button>
                    <button onClick={() => setTab('stats')}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${tab === 'stats' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'}`}
                        style={{
                            background: tab === 'stats' ? (isDarkMode ? '#27272a' : '#ffffff') : 'transparent',
                            color: tab === 'stats' ? t.primary : t.secondary,
                            fontSize: '12px', fontWeight: 500
                        }}>
                        <BarChart2 size={14} /> KPI Stats
                    </button>
                </div>
            </div>

            {/* Top KPI Strip */}
            <div className="grid grid-cols-3 gap-3">
                {!messagingData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)
                ) : topKPIs.map((kpi, i) => (
                    <div key={i} className="p-3.5 rounded-xl border flex flex-col justify-between transition-all"
                        style={{ 
                            background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                            opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)', transition: `all 0.4s ease ${i * 40}ms`
                        }}>
                        <div className="flex items-center gap-2 mb-2">
                            <span style={{ color: kpi.color }}>{kpi.icon}</span>
                            <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>{kpi.label}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '20px', fontWeight: 600, color: t.value, lineHeight: 1 }}>{kpi.value}</p>
                            <p style={{ fontSize: '11px', fontWeight: 500, color: '#10b981', marginTop: 4 }}>{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Content panel */}
            <div style={{ opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 0.2s', minHeight: '260px' }}>
                {tab === 'trend' ? (
                    <div>
                        {!messagingData ? (
                            <div className="h-48 sk rounded-xl" />
                        ) : (
                            <>
                                <div style={{ height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="msgGradTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={isDarkMode ? 0.2 : 0.1} />
                                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="msgGradAI" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={isDarkMode ? 0.2 : 0.1} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3"
                                                stroke={isDarkMode ? '#27272a' : '#e4e4e7'}
                                                vertical={false} />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false}
                                                tick={{ fontSize: 11, fontWeight: 500, fill: isDarkMode ? '#a1a1aa' : '#71717a' }}
                                                dy={8} />
                                            <YAxis axisLine={false} tickLine={false}
                                                tick={{ fontSize: 11, fontWeight: 500, fill: isDarkMode ? '#a1a1aa' : '#71717a' }} />
                                            <Tooltip content={<CustomTooltip isDark={isDarkMode} />} />
                                            <Area type="monotone" dataKey="total" name="Total Volume"
                                                stroke="#3b82f6" strokeWidth={2}
                                                fill="url(#msgGradTotal)" dot={false}
                                                activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                                                isAnimationActive animationBegin={0} animationDuration={500} animationEasing="ease-out" />
                                            <Area type="monotone" dataKey="aiHandled" name="AI Handled"
                                                stroke="#10b981" strokeWidth={2}
                                                fill="url(#msgGradAI)" dot={false}
                                                activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                                                isAnimationActive animationBegin={0} animationDuration={500} animationEasing="ease-out" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex items-center justify-center gap-6 mt-4">
                                    {[{ label: 'Total Volume', hex: '#3b82f6' }, { label: 'AI Handled', hex: '#10b981' }].map((l, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div style={{ width: 12, height: 4, background: l.hex, borderRadius: 2 }} />
                                            <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary }}>{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {!messagingData ? (
                            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg" />)
                        ) : [
                            { label: 'Response Rate',    value: `${messagingData.responseRate}%`,  hex: '#818cf8', pct: messagingData.responseRate },
                            { label: 'Delivery Rate',    value: `${messagingData.deliveryRate}%`,  hex: '#34d399', pct: messagingData.deliveryRate },
                            { label: 'Failed / Bounced', value: `${messagingData.failedRate}%`,    hex: '#fb7185', pct: messagingData.failedRate   },
                            { label: 'Msgs / Hour',      value: messagingData.msgsPerHour.toString(), hex: '#fbbf24', pct: Math.min(100, messagingData.msgsPerHour / 2) },
                        ].map((s, i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between">
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>{s.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary }}>{s.value}</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                    <div className="h-full rounded-full"
                                        style={{
                                            width: `${s.pct}%`, background: s.hex, opacity: 0.9,
                                            transition: `width 800ms cubic-bezier(0.22,1,0.36,1) ${i * 80}ms`
                                        }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer stats */}
            <div className="grid grid-cols-3 gap-3 pt-5" style={{ borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                {!messagingData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />)
                ) : [
                    { label: 'Msgs / Hour',      value: messagingData.msgsPerHour.toString(),  color: '#34d399' },
                    { label: 'Delivery Rate',    value: `${messagingData.deliveryRate}%`,       color: t.primary },
                    { label: 'Failed / Bounced', value: `${messagingData.failedRate}%`,         color: '#ef4444' },
                ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl border" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                        <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{s.label}</p>
                        <p style={{ fontSize: '16px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', color: s.color, marginTop: 2 }}>{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
