"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Brain, Wifi, Users, MessageSquare, Bell, Clock, CheckCircle, AlertTriangle, TrendingUp, Layers } from 'lucide-react';
import { glassCard, glassInner, tx, fs } from './glassStyles';
import { cn } from "@/lib/utils";
import { socket } from '@/utils/socket';
import { useAuth } from '@/redux/selectors/auth/authSelector';

interface GlobalCommandBarProps { 
    isDarkMode?: boolean;
    headerData?: any;
    wabaInfo?: any;
    period?: string;
    setPeriod?: (p: string) => void;
    isManagement?: boolean;
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

const qualityColor: Record<string, string> = {
    GREEN:  '#10b981',
    YELLOW: '#f59e0b',
    RED:    '#f43f5e',
};

const MESSAGING_LEVELS = [
    { id: '1k', label: '1k', val: 1000 },
    { id: '10k', label: '10k', val: 10000 },
    { id: '100k', label: '100k', val: 100000 },
    { id: 'Unlimited', label: 'Unlimited', val: Infinity },
];

const MessagingLimitScale = ({ tier = 'Tier 1', isDarkMode }: { tier?: string; isDarkMode: boolean }) => {
    const t = tx(isDarkMode);
    // Convert "Tier 1", "Tier 2" etc to index
    const currentTierIndex = parseInt(tier?.split(' ')?.[1] || '1') - 1;

    return (
        <div className="flex flex-col gap-2 min-w-[280px]">
            <div className="flex flex-col">
                <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }}>
                    Messaging limit
                </span>
                <span style={{ fontSize: '11px', color: t.secondary, marginTop: '2px' }}>
                    Messages you can send in 24 hours
                </span>
            </div>
            
            <div className="flex items-stretch rounded-md border mt-1" style={{ borderColor: isDarkMode ? '#27272a' : '#e4e4e7', background: isDarkMode ? '#18181b' : '#fafafa' }}>
                {MESSAGING_LEVELS.map((level, idx) => {
                    const isCurrent = idx === currentTierIndex;
                    return (
                        <div key={level.id} className="flex-1 flex flex-col items-center justify-center relative border-r last:border-r-0"
                            style={{ 
                                borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                minHeight: '36px'
                            }}>
                            {isCurrent && (
                                <div className="absolute inset-0 -m-[1px] rounded-md border shadow-sm z-10 flex flex-col items-center justify-center transition-all"
                                    style={{ 
                                        background: isDarkMode ? 'rgba(16,185,129,0.15)' : '#d1fae5', 
                                        borderColor: isDarkMode ? 'rgba(16,185,129,0.4)' : '#a7f3d0' 
                                    }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: isDarkMode ? '#34d399' : '#047857' }}>
                                        {level.id}
                                    </span>
                                    <span style={{ fontSize: '9px', fontWeight: 600, color: isDarkMode ? '#10b981' : '#059669', opacity: 0.9 }}>
                                        Current
                                    </span>
                                </div>
                            )}
                            <span style={{ 
                                fontSize: '11px', 
                                fontWeight: 500, 
                                color: isCurrent ? 'transparent' : t.secondary,
                            }}>
                                {level.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

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
    setPeriod,
    isManagement = false
}: GlobalCommandBarProps) => {
    const { time, date, greeting } = useLiveClock();
    const t = tx(isDarkMode);
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    
    const [unreadCount, setUnreadCount] = useState(headerData?.needsAttention || 0);
    const pathnameRef = useRef(pathname);

    useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

    // Socket: listen for new messages and show unread badge
    useEffect(() => {
        if (!user?.tenant_id) return;
        if (!socket.connected) socket.connect();
        socket.on('connect', () => {
            socket.emit('join-tenant', user.tenant_id);
        });
        const handleNewMessage = () => {
            if (!pathnameRef.current?.includes('/shared-inbox')) {
                setUnreadCount((prev: number) => prev + 1);
            }
        };
        socket.on('new-message', handleNewMessage);
        return () => {
            socket.off('new-message', handleNewMessage);
            socket.off('connect');
        };
    }, [user?.tenant_id]);

    const qualityHex = qualityColor[wabaInfo?.quality] ?? '#94a3b8';

    const systemHealth: Array<{ icon: any; label: string; status: 'online' | 'offline' | 'warning'; value: string }> = ([
        { icon: <Wifi size={15} />, label: 'WhatsApp', status: wabaInfo?.status === 'Live' ? 'online' : 'offline', value: wabaInfo?.status || 'Offline' },
        { icon: <Brain size={15} />, label: 'AI Engine', status: 'online', value: 'Running' },
        { icon: <Layers size={15} />, label: 'Quality', status: wabaInfo?.quality === 'GREEN' ? 'online' : wabaInfo?.quality === 'YELLOW' ? 'warning' : 'offline', value: wabaInfo?.quality || '—' },
        { 
            icon: <Users size={15} />, 
            label: 'Tier', 
            status: 'online', 
            value: wabaInfo?.tier?.replace('TIER_', '') || '—' 
        },
    ] as const).filter(s => {
        if (isManagement && (s.label === 'WhatsApp' || s.label === 'Quality' || s.label === 'Tier')) {
            return false;
        }
        return true;
    }) as Array<{ icon: any; label: string; status: 'online' | 'offline' | 'warning'; value: string }>;

    const summaryStats = [
        { icon: <TrendingUp size={13} />, label: 'Revenue Today', value: headerData?.revenueToday ?? '₹0', color: '#34d399' },
        { icon: <Users size={13} />, label: 'New Leads', value: headerData?.newLeadsToday ?? 0, color: t.primary },
        { icon: <CheckCircle size={13} />, label: 'Resolved', value: `${headerData?.resolvedToday ?? 0} chats`, color: '#818cf8' },
        { icon: <MessageSquare size={13} />, label: 'Msgs Sent', value: headerData?.messagesSentToday ?? 0, color: t.primary },
        { icon: <AlertTriangle size={13} />, label: 'Needs Attention', value: `${headerData?.needsAttention ?? 0} alerts`, color: '#fbbf24' },
    ];

    return (
        <div className="rounded-xl border transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>

            {/* ── Row 1: Greeting + WABA info + System health ── */}
            <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4"
                style={{ borderBottom: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                <div className="flex items-center gap-6">
                    {/* Greeting + Live badge */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>
                                Live Dashboard
                            </span>
                        </div>
                        <h1 style={{ fontSize: '20px', fontWeight: 600, color: t.primary, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                            {greeting}, Admin 👋
                        </h1>
                        <p style={{ fontSize: '13px', fontWeight: 500, marginTop: '2px', color: t.secondary }}>{date}</p>
                    </div>

                    <div style={{ width: 1, height: 40, background: isDarkMode ? '#27272a' : '#e4e4e7' }} className="hidden md:block" />

                    {/* WABA number & Messaging Limit */}
                    {wabaInfo?.number && !isManagement && (
                        <div className="hidden lg:flex items-center gap-6">
                            <div className="flex flex-col gap-1">
                                <span style={{ fontSize: '12px', fontWeight: 600, color: t.secondary }}>WA Number</span>
                                <div className="flex items-center gap-2">
                                    <span style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>+{wabaInfo.number}</span>
                                    <span style={{
                                        fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                                        background: `${qualityHex}15`, color: qualityHex
                                    }}>{wabaInfo.quality}</span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>{wabaInfo.region}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: System health + Bell */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="hidden xl:flex items-center gap-3">
                        {systemHealth.map((s, i) => {
                            const cfg = STATUS[s.status];
                            return (
                                <div key={i} className="flex flex-col gap-1 px-3 py-2 rounded-lg border" 
                                    style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7', minWidth: '94px' }}>
                                    <div className="flex items-center gap-1.5" style={{ color: t.secondary }}>
                                        {React.cloneElement(s.icon, { size: 12 })}
                                        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.01em', textTransform: 'uppercase' }}>{s.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: t.primary, lineHeight: 1 }}>
                                            {s.value}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Alert Bell for Live Chats */}
                    <button onClick={() => { setUnreadCount(0); router.push('/shared-inbox/live-chats'); }}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg border group relative hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        style={{ background: isDarkMode ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.05)', borderColor: isDarkMode ? 'rgba(244,63,94,0.2)' : 'rgba(244,63,94,0.15)' }}>
                        
                        {unreadCount > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] rounded-full bg-rose-500 flex items-center justify-center border-2 border-white dark:border-zinc-950 px-1">
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                            </div>
                        )}
                        
                        <Bell size={18} className="text-rose-500 group-hover:animate-bounce" />
                        <div className="flex flex-col items-start gap-1">
                            <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary, lineHeight: 1 }}>Live Operations</span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f43f5e', lineHeight: 1 }}>{unreadCount} Unread</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* ── Row 2: Summary stats & Period Toggle ── */}
            <div className="px-5 py-3 flex items-center justify-between gap-4 flex-wrap"
                style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                
                {/* Left: Summary Stats */}
                <div className="flex items-center gap-6 flex-wrap">
                    {summaryStats.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 transition-all cursor-default">
                            <div style={{ color: s.color }}>{React.cloneElement(s.icon, { size: 14 })}</div>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                                {s.label}:
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: s.color === t.primary ? t.primary : s.color }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Right: Period Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-lg border" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary, paddingLeft: 6, paddingRight: 4 }}>
                        Period:
                    </span>
                    {PERIOD_OPTIONS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setPeriod?.(value)}
                            className="rounded px-3 py-1.5 transition-all text-[12px]"
                            style={{
                                fontWeight: period === value ? 600 : 500,
                                ...(period === value
                                    ? { background: '#10b981', color: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
                                    : { color: t.secondary, background: 'transparent' })
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
