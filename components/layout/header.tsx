
"use client";

import { Globe, Bell, Sun, Moon, Power, Flag, MessageSquare, Bell as BellIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useState, useEffect, useRef } from 'react';
import { UserProfileDropdown } from '@/components/ui/user-profile-dropdown';
import { useDispatch } from 'react-redux';
import { clearAuthData } from '@/redux/slices/auth/authSlice';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { socket } from '@/utils/socket';

export const META_TIER_CONFIG: Record<string, { name: string, limit: string | number }> = {
  TIER_NOT_SET: {
    name: "Trial",
    limit: 250,
  },
  TIER_50: {
    name: "Starter",
    limit: 50,
  },
  TIER_250: {
    name: "Basic",
    limit: 250,
  },
  TIER_1K: {
    name: "Tier 1K",
    limit: 1000,
  },
  TIER_10K: {
    name: "Tier 10K",
    limit: 10000,
  },
  TIER_100K: {
    name: "Tier 100K",
    limit: 100000,
  },
  TIER_UNLIMITED: {
    name: "Unlimited",
    limit: "Unlimited"
  }
};

function getTierInfo(tier: string | undefined | null) {
    const rawTier = tier ? tier.toUpperCase() : "TIER_NOT_SET";
    return META_TIER_CONFIG[rawTier] || META_TIER_CONFIG.TIER_NOT_SET;
}

/** Map quality_rating to label + dot colour */
function formatQuality(quality: string | undefined | null): { label: string; dot: string; text: string } {
    const q = (quality || '').toUpperCase();
    if (q === 'GREEN'  || q === 'HIGH')   return { label: 'GREEN',  dot: 'bg-emerald-500', text: 'text-emerald-600' };
    if (q === 'YELLOW' || q === 'MEDIUM') return { label: 'YELLOW', dot: 'bg-amber-400',   text: 'text-amber-600'  };
    if (q === 'RED'    || q === 'LOW')    return { label: 'RED',    dot: 'bg-rose-500',    text: 'text-rose-600'   };
    return { label: 'GREEN', dot: 'bg-emerald-500', text: 'text-emerald-600' };
}

// ── WhatsApp-style circular icon badge ──────────────────────────────────────
const IconBadge = ({ children, color }: { children: React.ReactNode; color: string }) => (
    <span className={cn('flex items-center justify-center w-5 h-5 rounded-full shrink-0', color)}>
        {children}
    </span>
);

// ── Thin vertical separator ──────────────────────────────────────────────────
const Sep = ({ isDarkMode }: { isDarkMode: boolean }) => (
    <div className={cn('h-4 w-px shrink-0', isDarkMode ? 'bg-white/10' : 'bg-slate-300/60')} />
);

export const Header = () => {
    const { user, whatsappApiDetails } = useAuth();
    const { setTheme, isDarkMode } = useTheme();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const pathnameRef = useRef(pathname);

    useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

    // Reset unread badge when user visits chats pages
    useEffect(() => {
        if (pathname?.includes('/shared-inbox')) {
            setUnreadCount(0);
        }
    }, [pathname]);

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
                setUnreadCount(prev => prev + 1);
            }
        };

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.off('connect');
        };
    }, [user?.tenant_id]);

    const toggleTheme = () => {
        setTheme(isDarkMode ? "light" : "dark");
    };
    const handleLogout = () => {
        dispatch(clearAuthData());
        router.replace('/login');
    };

    // ── WABA info from Redux (populated by useGetWhatsappConfigQuery) ──────────
    const wabaNumber = whatsappApiDetails?.whatsapp_number ?? whatsappApiDetails?.wabaNumber ?? null;
    const wabaStatus = whatsappApiDetails?.status ?? null;
    const isLive     = wabaStatus === 'active';
    const quality    = formatQuality(whatsappApiDetails?.quality_rating ?? whatsappApiDetails?.quality);
    const tierInfo   = getTierInfo(whatsappApiDetails?.messaging_limit_tier ?? whatsappApiDetails?.tier);

    // ── Shared text styles ───────────────────────────────────────────────────
    const labelCls = cn('text-[10px] font-semibold', isDarkMode ? 'text-white/40' : 'text-slate-400');
    const valueCls = cn('text-[10px] font-bold',     isDarkMode ? 'text-white/80' : 'text-slate-700');

    return (
        <header className={cn(
            "h-14 shrink-0 flex items-center justify-between px-6 transition-all duration-700 border-b",
            isDarkMode ? 'border-white/5 bg-[#0D0D0F]' : 'border-slate-200 bg-white'
        )}>

            {/* ── LEFT: Logo ──────────────────────────────────────────────────── */}
            <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className={cn("text-[18px] font-black tracking-tighter leading-none", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            WhatsNexus<span className="text-emerald-500">.</span>
                        </span>
                        <div className={cn("px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border",
                            isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200')}>
                            Beta
                        </div>
                    </div>
                    <span className={cn("text-[7px] font-bold tracking-[0.12em] uppercase opacity-40 mt-0.5 whitespace-nowrap",
                        isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                        Powered by Kingpin Ventures
                    </span>
                </div>

                {/* Vertical divider */}
                <div className={cn("h-8 w-px", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />

                {/* ── WABA info pills — WhatsApp-bar style ────────────────────── */}
                <div className="flex items-center gap-3">

                    {/* WABA Number */}
                    <div className="flex items-center gap-1.5">
                        <IconBadge color="bg-emerald-500">
                            {/* WhatsApp-like phone/device icon */}
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 12a19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 3.04 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
                            </svg>
                        </IconBadge>
                        <span className={labelCls}>WABA Number:</span>
                        <span className={valueCls}>{wabaNumber ?? '—'}</span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                        <IconBadge color={isLive ? 'bg-emerald-500' : 'bg-slate-400'}>
                            <Power size={10} color="white" strokeWidth={2.5} />
                        </IconBadge>
                        <span className={labelCls}>Status:</span>
                        <span className={cn('text-[10px] font-bold flex items-center gap-1',
                            isLive
                                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                                : isDarkMode ? 'text-white/40'   : 'text-slate-500'
                        )}>
                            {isLive && (
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                            )}
                            {wabaNumber
                                ? (isLive ? 'Live' : wabaStatus ? wabaStatus.charAt(0).toUpperCase() + wabaStatus.slice(1) : 'Inactive')
                                : '—'
                            }
                        </span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* Quality */}
                    <div className="flex items-center gap-1.5">
                        <IconBadge color="bg-emerald-500">
                            <Flag size={10} color="white" strokeWidth={2.5} />
                        </IconBadge>
                        <span className={labelCls}>Quality:</span>
                        <span className={cn('text-[10px] font-bold flex items-center gap-1',
                            wabaNumber
                                ? isDarkMode
                                    ? quality.dot === 'bg-emerald-500' ? 'text-emerald-400' : quality.dot === 'bg-amber-400' ? 'text-amber-400' : 'text-rose-400'
                                    : quality.text
                                : isDarkMode ? 'text-white/40' : 'text-slate-400'
                        )}>
                            {wabaNumber && (
                                <span className={cn('inline-block w-1.5 h-1.5 rounded-full', quality.dot)} />
                            )}
                            {wabaNumber ? quality.label : '—'}
                        </span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* Region */}
                    <div className="flex items-center gap-1.5 transition-all hover:scale-105">
                        <IconBadge color="bg-emerald-500">
                            <Globe size={10} color="white" strokeWidth={2.5} />
                        </IconBadge>
                        <span className={labelCls}>Region:</span>
                        <span className={valueCls}>{whatsappApiDetails?.region || 'Global'}</span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* Messaging Limit - Header Summary */}
                    <div className="flex items-center gap-1.5 transition-all hover:scale-105">
                        <IconBadge color="bg-emerald-500">
                            <MessageSquare size={10} color="white" strokeWidth={2.5} />
                        </IconBadge>
                        <span className={labelCls}>Limit:</span>
                        <span className={cn('text-[10px] font-bold',
                            wabaNumber
                                ? isDarkMode ? 'text-white/70' : 'text-slate-700'
                                : isDarkMode ? 'text-white/40' : 'text-slate-400'
                        )}>
                            {wabaNumber ? (tierInfo.limit === "Unlimited" ? "Unlimited" : `${tierInfo.limit.toLocaleString()} / 24h`) : '—'}
                        </span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* Tier */}
                    <div className="flex items-center gap-1.5 transition-all hover:scale-105">
                        <span className={labelCls}>Tier:</span>
                        <span className={cn('text-[10px] font-bold',
                            wabaNumber
                                ? isDarkMode ? 'text-white/70' : 'text-slate-700'
                                : isDarkMode ? 'text-white/40' : 'text-slate-400'
                        )}>
                            {wabaNumber ? tierInfo.name : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Bell + Theme + Org name + Avatar ─────────────────────── */}
            <div className="flex items-center gap-3">

                {/* Bell */}
                <button
                    onClick={() => { setUnreadCount(0); router.push('/shared-inbox/live-chats'); }}
                    className={cn(
                        "p-2.5 rounded-xl transition-all relative",
                        isDarkMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
                    )}
                >
                    <Bell size={18} />
                    {unreadCount > 0 ? (
                        <div className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 flex items-center justify-center">
                            <span className="text-white text-[8px] font-black px-0.5">{unreadCount > 99 ? '99+' : unreadCount}</span>
                        </div>
                    ) : (
                        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                    )}
                </button>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className={cn(
                        "p-2.5 rounded-xl transition-all",
                        isDarkMode ? 'hover:bg-white/5 text-white/50' : 'hover:bg-slate-100 text-slate-500'
                    )}
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Org / user name + avatar */}
                <div className="relative">
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2.5 cursor-pointer group"
                    >
                        <span className={cn(
                            "text-[11px] font-bold uppercase tracking-wider transition-colors",
                            isDarkMode ? 'text-white/70 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                        )}>
                            {user?.name || user?.organization_name || user?.username || 'Account'}
                        </span>

                        <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center font-black text-[12px] border-2 transition-all duration-300 shrink-0",
                            isDarkMode
                                ? 'bg-emerald-600 border-emerald-500/40 text-white'
                                : 'bg-slate-900 border-slate-700 text-white',
                            'group-hover:scale-105'
                        )}>
                            {user?.username?.split('')[0]?.toUpperCase() ?? '?'}
                        </div>
                    </div>

                    {isProfileOpen && (
                        <UserProfileDropdown
                            isDarkMode={isDarkMode}
                            user={user}
                            onClose={() => setIsProfileOpen(false)}
                            onLogout={handleLogout}
                        />
                    )}
                </div>
            </div>
        </header>
    );
};