"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Brain, Wifi, Bell, Layers, Shield } from 'lucide-react';
import { glassCard, tx } from './glassStyles';
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

const PERIOD_OPTIONS: { value: string; label: string }[] = [
    { value: '7days',   label: '7 Days'  },
    { value: '30days',  label: '30 Days' },
    { value: 'alltime', label: 'All Time' },
];

export const GlobalCommandBar = ({ 
    isDarkMode = true, 
    headerData, 
    wabaInfo,
    period = "30days",
    setPeriod,
    isManagement = false
}: GlobalCommandBarProps) => {
    const t = tx(isDarkMode);
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuth();
    
    const [unreadCount, setUnreadCount] = useState(headerData?.needsAttention || 0);
    const pathnameRef = useRef(pathname);

    useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

    useEffect(() => {
        if (!user?.tenant_id) return;
        
        if (!socket.connected) {
            socket.connect();
        } else {
            // Already connected, emit join immediately
            socket.emit('join-tenant', user.tenant_id);
        }

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
        { icon: <Wifi size={14} />, label: 'WhatsApp', status: wabaInfo?.status === 'Live' ? 'online' : 'offline', value: wabaInfo?.status || 'Offline' },
        { icon: <Brain size={14} />, label: 'AI Engine', status: 'online', value: 'Running' },
        { icon: <Shield size={14} />, label: 'Quality', status: wabaInfo?.quality === 'GREEN' ? 'online' : wabaInfo?.quality === 'YELLOW' ? 'warning' : 'offline', value: wabaInfo?.quality || '—' },
    ] as const).filter(s => {
        if (isManagement && (s.label === 'WhatsApp' || s.label === 'Quality')) return false;
        return true;
    }) as Array<{ icon: any; label: string; status: 'online' | 'offline' | 'warning'; value: string }>;

    return (
        <div className="rounded-xl border transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="px-5 py-3.5 flex items-center justify-between gap-3 flex-wrap">

                {/* Left: Logo / Brand + WABA number */}
                <div className="flex items-center gap-4">
                    {/* Live indicator + Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: isDarkMode ? 'rgba(16,185,129,0.12)' : '#ecfdf5', border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.25)' : '#a7f3d0'}` }}>
                            <div className="relative">
                                <Layers size={16} style={{ color: '#10b981' }} />
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-emerald-400 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '16px', fontWeight: 700, color: t.primary, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                Dashboard
                            </h1>
                            <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>
                                Real-time overview
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    {!isManagement && wabaInfo?.number && (
                        <>
                            <div style={{ width: 1, height: 32, background: isDarkMode ? '#27272a' : '#e4e4e7' }} className="hidden md:block" />

                            {/* WABA number */}
                            <div className="hidden md:flex items-center gap-2.5">
                                <div className="flex items-center gap-2">
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary, fontVariantNumeric: 'tabular-nums' }}>
                                        +{wabaInfo.number}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded" style={{
                                        fontSize: '10px', fontWeight: 700,
                                        background: `${qualityHex}15`, color: qualityHex,
                                        letterSpacing: '0.02em'
                                    }}>
                                        {wabaInfo.quality}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded" style={{
                                        fontSize: '10px', fontWeight: 600,
                                        background: isDarkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff',
                                        color: isDarkMode ? '#60a5fa' : '#2563eb'
                                    }}>
                                        {wabaInfo.tier?.replace('TIER_', '') || wabaInfo.tier}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Center: System health pills */}
                <div className="hidden xl:flex items-center gap-2">
                    {systemHealth.map((s, i) => {
                        const cfg = STATUS[s.status];
                        return (
                            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                                style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                <div className="flex items-center gap-1.5" style={{ color: t.secondary }}>
                                    {React.cloneElement(s.icon, { size: 13 })}
                                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{s.label}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.dot }}>{s.value}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right: Period toggle + Alert bell + Refresh */}
                <div className="flex items-center gap-2.5">
                    {/* Period toggle */}
                    <div className="flex items-center gap-0.5 p-0.5 rounded-lg border" style={{
                        background: isDarkMode ? '#18181b' : '#f4f4f5',
                        borderColor: isDarkMode ? '#27272a' : '#e4e4e7'
                    }}>
                        {PERIOD_OPTIONS.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => setPeriod?.(value)}
                                className="rounded-md px-3 py-1.5 transition-all"
                                style={{
                                    fontSize: '12px',
                                    fontWeight: period === value ? 600 : 500,
                                    ...(period === value
                                        ? { background: '#10b981', color: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }
                                        : { color: t.secondary, background: 'transparent' })
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Alert bell */}
                    <button onClick={() => { setUnreadCount(0); router.push('/shared-inbox/live-chats'); }}
                        className="relative w-9 h-9 rounded-lg border flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        style={{ 
                            borderColor: unreadCount > 0 ? (isDarkMode ? 'rgba(244,63,94,0.3)' : 'rgba(244,63,94,0.2)') : (isDarkMode ? '#27272a' : '#e4e4e7'),
                            background: unreadCount > 0 ? (isDarkMode ? 'rgba(244,63,94,0.08)' : 'rgba(244,63,94,0.04)') : 'transparent'
                        }}>
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 flex items-center justify-center border-2 px-0.5"
                                style={{ borderColor: isDarkMode ? '#09090b' : '#ffffff' }}>
                                <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                            </div>
                        )}
                        <Bell size={15} style={{ color: unreadCount > 0 ? '#f43f5e' : t.secondary }} />
                    </button>
                </div>
            </div>
        </div>
    );
};
