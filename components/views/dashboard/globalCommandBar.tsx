"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Brain, Bell, Layers, Shield } from 'lucide-react';
import { glassCard, tx } from './glassStyles';
import { socket } from '@/utils/socket';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { META_TIER_CONFIG } from '@/components/layout/header';

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
    offline: { dot: '#ef4444', ring: '#dc2626' },
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

    // A WABA is truly connected when the number is a real phone number (numeric)
    // and status is 'Live' or 'active'. Guard against backend sending default strings
    // like "Not Connected" as the number.
    const isWabaConnected = !!wabaInfo?.number &&
        /^\d+$/.test(String(wabaInfo.number).replace(/\s+/g, '')) &&
        (wabaInfo?.status === 'Live' || wabaInfo?.status === 'active');

    const systemHealth: Array<{ icon: any; label: string; status: 'online' | 'offline' | 'warning'; value: string }> = ([
        {
            icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
            label: 'WhatsApp',
            status: isWabaConnected ? 'online' : 'offline',
            value: isWabaConnected ? 'Connected' : 'Not Connected'
        },
        { icon: <Brain size={14} />, label: 'AI Engine', status: 'online', value: 'Running' },
        {
            icon: <Shield size={14} />,
            label: 'Quality',
            status: isWabaConnected
                ? (wabaInfo?.quality === 'GREEN' ? 'online' : wabaInfo?.quality === 'YELLOW' ? 'warning' : 'offline')
                : 'warning',
            value: isWabaConnected ? (wabaInfo?.quality || 'N/A') : 'N/A'
        },
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
                    {/* Only show WABA number / quality / tier when genuinely connected */}
                    {!isManagement && isWabaConnected && (
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
                                        {(() => {
                                        const rawTier = wabaInfo.tier ? wabaInfo.tier.toUpperCase() : 'TIER_NOT_SET';
                                        const tierCfg = META_TIER_CONFIG[rawTier] || META_TIER_CONFIG.TIER_NOT_SET;
                                        return `${tierCfg.name} (${tierCfg.limit}/24h)`;
                                    })()}
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
