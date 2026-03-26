"use client";

import React, { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis,
    Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
    MessageSquare, TrendingUp, Send, Bot, TrendingDown, CheckCircle, Zap
} from 'lucide-react';
import { tx } from './glassStyles';
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
        <div className="rounded-xl border shadow-lg"
            style={{
                background: isDark ? '#18181b' : '#ffffff',
                borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                padding: '10px 14px',
            }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: t.secondary, marginBottom: 6 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2" style={{ marginBottom: i < payload.length - 1 ? 4 : 0 }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: p.stroke || p.fill }} />
                    <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{p.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: t.primary, marginLeft: 'auto' }}>{p.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
};

export const MessagingAnalytics = ({ isDarkMode = true, messagingData }: MessagingAnalyticsProps) => {
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);

    useEffect(() => {
        if (messagingData) {
            const t1 = setTimeout(() => setShow(true), 200);
            return () => clearTimeout(t1);
        }
    }, [messagingData]);

    const hasData = messagingData && messagingData.totalMessages > 0;

    if (messagingData && !hasData) {
        return (
            <div className="rounded-xl p-5 border flex flex-col gap-5 h-full" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Messaging Analytics</h3>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound
                        isDarkMode={isDarkMode}
                        title="No Messaging Data"
                        description="Communication volume and trends will be visualized here."
                        icon={<MessageSquare size={36} />}
                        className="bg-transparent border-none shadow-none py-12"
                    />
                </div>
            </div>
        );
    }

    const trend = messagingData?.trendVsLastWeek ?? 0;
    const trendUp = trend >= 0;
    const chartData = messagingData?.dailyVolume ?? [];

    return (
        <div className="rounded-xl border flex flex-col gap-5 transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>

            {/* Header + Summary Strip */}
            <div className="p-5 pb-0">
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary, marginBottom: 2 }}>Messaging Analytics</h3>
                        <p style={{ fontSize: '12px', color: t.secondary }}>Period totals &amp; 7-day trend chart</p>
                    </div>
                    {messagingData && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                            style={{ background: trendUp ? (isDarkMode ? 'rgba(16,185,129,0.08)' : '#ecfdf5') : (isDarkMode ? 'rgba(244,63,94,0.08)' : '#fef2f2'), border: `1px solid ${trendUp ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}` }}>
                            {trendUp ? <TrendingUp size={13} style={{ color: '#10b981' }} /> : <TrendingDown size={13} style={{ color: '#f43f5e' }} />}
                            <span style={{ fontSize: '12px', fontWeight: 600, color: trendUp ? '#10b981' : '#f43f5e' }}>
                                {trendUp ? '+' : ''}{trend}%
                            </span>
                        </div>
                    )}
                </div>

                {/* KPI row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {!messagingData ? (
                        Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[72px] rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)
                    ) : [
                        { icon: <Send size={14} />, label: 'Total Msgs', value: messagingData.totalMessages.toLocaleString(), color: '#3b82f6' },
                        { icon: <Bot size={14} />, label: 'Response Rate', value: `${messagingData.responseRate}%`, color: '#8b5cf6' },
                        { icon: <CheckCircle size={14} />, label: 'Delivery', value: `${messagingData.deliveryRate}%`, color: '#10b981' },
                        { icon: <Zap size={14} />, label: 'Avg / Day', value: messagingData.avgPerDay.toLocaleString(), color: '#f59e0b' },
                    ].map((kpi, i) => (
                        <div key={i} className="p-3 rounded-xl border flex flex-col gap-1.5"
                            style={{
                                background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(6px)',
                                transition: `all 0.35s ease ${i * 40}ms`
                            }}>
                            <div className="flex items-center gap-1.5" style={{ color: kpi.color }}>
                                {kpi.icon}
                                <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{kpi.label}</span>
                            </div>
                            <p style={{ fontSize: '18px', fontWeight: 600, color: t.value, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{kpi.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="px-5 pb-5" style={{ opacity: show ? 1 : 0, transition: 'opacity 0.5s ease 0.15s' }}>
                {!messagingData ? (
                    <div className="h-48 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                ) : (
                    <>
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="msgGradTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={isDarkMode ? 0.15 : 0.08} />
                                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="msgGradAI" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={isDarkMode ? 0.15 : 0.08} />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#27272a' : '#e4e4e7'} vertical={false} />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 500, fill: isDarkMode ? '#a1a1aa' : '#71717a' }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 500, fill: isDarkMode ? '#a1a1aa' : '#71717a' }} />
                                    <Tooltip content={<CustomTooltip isDark={isDarkMode} />} />
                                    <Area type="monotone" dataKey="total" name="Total Volume"
                                        stroke="#3b82f6" strokeWidth={2} fill="url(#msgGradTotal)" dot={false}
                                        activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                                        isAnimationActive animationDuration={500} animationEasing="ease-out" />
                                    <Area type="monotone" dataKey="aiHandled" name="AI Handled"
                                        stroke="#10b981" strokeWidth={2} fill="url(#msgGradAI)" dot={false}
                                        activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                                        isAnimationActive animationDuration={500} animationEasing="ease-out" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-3 mb-1">
                            {[{ label: 'Total Volume', hex: '#3b82f6' }, { label: 'AI Handled', hex: '#10b981' }].map((l, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div style={{ width: 12, height: 3, background: l.hex, borderRadius: 2 }} />
                                    <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
