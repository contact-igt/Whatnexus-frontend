"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Wifi, Users, MessageSquare, Bell, Clock, CheckCircle, AlertTriangle, TrendingUp, Layers } from 'lucide-react';
import { glassCard, glassInner, tx } from './glassStyles';
import { cn } from "@/lib/utils";

interface GlobalCommandBarProps { 
    isDarkMode?: boolean;
    headerData?: any;
    wabaInfo?: any;
    period?: string;
    setPeriod?: (p: string) => void;
}

function useLiveClock() {
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');
    const [greeting, setGreeting] = useState('');
    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const h = now.getHours();
            setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
            setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
            setDate(now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);
    return { time, date, greeting };
}

const STATUS = {
    online:  { dot: '#4ade80', ring: '#22c55e' },
    warning: { dot: '#fbbf24', ring: '#f59e0b' },
    offline: { dot: '#f87171', ring: '' },
} as const;

// wabaInfo.quality → badge colour
const qualityColor: Record<string, string> = {
    GREEN:  '#22c55e',
    YELLOW: '#eab308',
    RED:    '#ef4444',
};

// Period toggle config:
// query param value → display label
// Must match exactly what the API expects in the `period` query param
const PERIOD_OPTIONS: { value: string; label: string }[] = [
    { value: '7days',   label: '7D'  },
    { value: '30days',  label: '30D' },
    { value: 'alltime', label: 'All' },
];

export const GlobalCommandBar = ({ 
    isDarkMode = true, 
    headerData, 
    wabaInfo,
    period = "30days",
    setPeriod 
}: GlobalCommandBarProps) => {
    const { time, date, greeting } = useLiveClock();
    const t = tx(isDarkMode);
    const router = useRouter();

    const qualityHex = qualityColor[wabaInfo?.quality] ?? '#94a3b8';

    const systemHealth: Array<{ icon: any; label: string; status: 'online' | 'offline' | 'warning'; value: string }> = [
        // wabaInfo.status "Live" → green dot
        { icon: <Wifi size={14} />, label: 'WhatsApp', status: wabaInfo?.status === 'Live' ? 'online' : 'offline', value: wabaInfo?.status || 'Offline' },
        { icon: <Brain size={14} />, label: 'AI Engine', status: 'online', value: 'Running' },
        // wabaInfo.quality → coloured badge
        { icon: <Layers size={14} />, label: 'Quality', status: wabaInfo?.quality === 'GREEN' ? 'online' : wabaInfo?.quality === 'YELLOW' ? 'warning' : 'offline', value: wabaInfo?.quality || '—' },
        { icon: <Users size={14} />, label: 'Tier', status: 'online', value: wabaInfo?.tier || '—' },
    ];

    return (
        <div className="rounded-2xl overflow-hidden" style={glassCard(isDarkMode)}>
            {/* Accent stripe */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6)' }} />

            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                {/* Left */}
                <div className="flex items-center gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#10b981' }}>Live Dashboard</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tighter" style={{ color: t.value }}>
                            {greeting}, Admin 👋
                        </h1>
                        <p className="text-[11px] font-medium mt-0.5" style={{ color: t.secondary }}>{date}</p>
                    </div>

                    <div style={{ width: 1, height: 44, background: t.divider }} className="hidden md:block" />

                    {/* Clock & Period Switcher */}
                    <div className="hidden md:flex flex-col items-start translate-y-0.5">
                        <div className="flex items-center gap-1.5 mb-1 opacity-60">
                            <Clock size={10} style={{ color: t.label }} />
                            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.label }}>{time}</span>
                        </div>
                        {/* Period toggle buttons — values match API query param */}
                        <div className="flex items-center gap-1">
                            {PERIOD_OPTIONS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => setPeriod?.(value)}
                                    className={cn(
                                        "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                        period === value 
                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                            : "opacity-40 hover:opacity-100"
                                    )}
                                    style={{ color: period === value ? '#10b981' : t.label }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* WABA number + quality chip */}
                    {wabaInfo?.number && (
                        <>
                            <div style={{ width: 1, height: 44, background: t.divider }} className="hidden lg:block" />
                            <div className="hidden lg:flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: t.label }}>WA Number</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-black" style={{ color: t.primary }}>+{wabaInfo.number}</span>
                                    {/* quality badge */}
                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                                        style={{ background: `${qualityHex}20`, color: qualityHex, border: `1px solid ${qualityHex}40` }}>
                                        {wabaInfo.quality}
                                    </span>
                                </div>
                                <span className="text-[9px] font-semibold" style={{ color: t.secondary }}>{wabaInfo.region}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Right — system health chips + alerts */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="hidden xl:flex items-center gap-2.5">
                        {systemHealth.map((s, i) => {
                            const cfg = STATUS[s.status];
                            return (
                                <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/5" style={glassInner(isDarkMode)}>
                                    <div className="relative w-3 h-3 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-2 rounded-full z-10 relative" style={{ background: cfg.dot }} />
                                        {s.status !== 'offline' && (
                                            <div className="absolute inset-0 rounded-full animate-live-ring"
                                                style={{ background: cfg.ring, opacity: 0.55 }} />
                                        )}
                                    </div>
                                    <div className="flex flex-col leading-none gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span style={{ color: t.label }}>{s.icon}</span>
                                            <span className="text-[9.5px] font-bold uppercase tracking-widest" style={{ color: t.label }}>{s.label}</span>
                                        </div>
                                        <span className="text-[12px] font-black"
                                            style={{ color: s.status === 'online' ? t.primary : cfg.dot }}>
                                            {s.value}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Needs Attention bell */}
                    <button onClick={() => router.push('/shared-inbox')} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer group relative"
                        style={{ background: 'rgba(244,63,94,0.18)', border: '1px solid rgba(244,63,94,0.30)' }}>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                            <span className="text-[8px] font-black text-white">{headerData?.needsAttention ?? 0}</span>
                        </div>
                        <Bell size={14} className="text-rose-400 group-hover:animate-bounce" />
                        <div className="flex flex-col items-start leading-none gap-1">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-rose-300">Operations</span>
                            <span className="text-[11px] font-black text-rose-400">{headerData?.needsAttention ?? 0} Urgent</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Bottom summary bar — header fields */}
            <div className="px-6 py-3 flex items-center gap-6 flex-wrap"
                style={{ borderTop: `1px solid ${t.divider}`, background: isDarkMode ? 'rgba(0,0,0,0.20)' : 'rgba(241,245,249,0.80)' }}>
                {[
                    {
                        icon: <TrendingUp size={11} />,
                        label: 'Revenue today',
                        // header.revenueToday is a string with ₹ already — do NOT add ₹ again
                        value: headerData?.revenueToday ?? '₹0',
                        color: '#34d399',
                    },
                    {
                        icon: <Users size={11} />,
                        label: 'New leads today',
                        value: headerData?.newLeadsToday ?? 0,
                        color: t.primary,
                    },
                    {
                        icon: <CheckCircle size={11} />,
                        label: 'Resolved today',
                        value: `${headerData?.resolvedToday ?? 0} chats`,
                        color: '#818cf8',
                    },
                    {
                        icon: <MessageSquare size={11} />,
                        label: 'Sent today',
                        value: headerData?.messagesSentToday ?? 0,
                        color: t.primary,
                    },
                    {
                        icon: <AlertTriangle size={11} />,
                        label: 'Needs attention',
                        value: `${headerData?.needsAttention ?? 0} alerts`,
                        color: '#fbbf24',
                    },
                ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-default">
                        <div style={{ color: s.color }}>{s.icon}</div>
                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: t.label }}>{s.label}:</span>
                        <span className="text-[11px] font-black" style={{ color: s.color }}>{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
