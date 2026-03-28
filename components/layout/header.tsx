
"use client";

import { Globe, Bell, Sun, Moon, Power, Flag, MessageSquare, Bell as BellIcon, Shield, Zap } from 'lucide-react';
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
    // Unknown / not connected — return neutral grey, not misleading GREEN
    return { label: '—', dot: 'bg-slate-400', text: 'text-slate-500' };
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
    const isManagement = user?.user_type === 'management';
    const wabaNumber = whatsappApiDetails?.whatsapp_number ?? whatsappApiDetails?.wabaNumber ?? null;
    const wabaStatus = whatsappApiDetails?.status ?? null;
    // Consider connected only when we have a real numeric phone number AND active status
    const isLive = wabaStatus === 'active' || wabaStatus === 'Live';
    const isWabaConnected = !!wabaNumber &&
        /^\d+$/.test(String(wabaNumber).replace(/[\s+]/g, '')) &&
        isLive;
    const quality    = formatQuality(isWabaConnected ? (whatsappApiDetails?.quality_rating ?? whatsappApiDetails?.quality) : null);
    const tierInfo   = getTierInfo(isWabaConnected ? (whatsappApiDetails?.messaging_limit_tier ?? whatsappApiDetails?.tier) : null);

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

                {isManagement ? (
                    /* ── Super Admin header info ──────────────────────────────── */
                    <div className="flex items-center gap-3">
                        {/* Role badge */}
                        <div className="flex items-center gap-1.5">
                            <IconBadge color="bg-violet-500">
                                <Shield size={10} color="white" strokeWidth={2.5} />
                            </IconBadge>
                            <span className={labelCls}>Role:</span>
                            <span className={cn('text-[10px] font-bold', isDarkMode ? 'text-violet-400' : 'text-violet-600')}>
                                {user?.role === 'super_admin' ? 'Super Admin' : 'Platform Admin'}
                            </span>
                        </div>

                        <Sep isDarkMode={isDarkMode} />

                        {/* Platform status */}
                        <div className="flex items-center gap-1.5">
                            <IconBadge color="bg-emerald-500">
                                <Zap size={10} color="white" strokeWidth={2.5} />
                            </IconBadge>
                            <span className={labelCls}>Platform:</span>
                            <span className={cn('text-[10px] font-bold flex items-center gap-1', isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                                Operational
                            </span>
                        </div>

                    </div>
                ) : (
                    /* ── Tenant WABA info pills ──────────────────────────────── */
                    <div className="flex items-center gap-3">

                    {/* ── WABA Number ── */}
                    <div className="flex items-center gap-1.5">
                        <IconBadge color={'bg-emerald-500'}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </IconBadge>
                        <span className={labelCls}>WABA Number:</span>
                        <span className={cn('text-[10px] font-bold',
                            isWabaConnected
                                ? isDarkMode ? 'text-white/80' : 'text-slate-700'
                                : 'text-[#ef4444]'
                        )}>
                            {isWabaConnected ? wabaNumber : 'Not Connected'}
                        </span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* ── Status ── */}
                    <div className="flex items-center gap-1.5">
                        <IconBadge color={isWabaConnected ? 'bg-emerald-500' : 'bg-[#ef4444]'}>
                            <Power size={10} color="white" strokeWidth={2.5} />
                        </IconBadge>
                        <span className={labelCls}>Status:</span>
                        <span className={cn('text-[10px] font-bold flex items-center gap-1',
                            isWabaConnected
                                ? isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                                : 'text-[#ef4444]'
                        )}>
                            {isWabaConnected ? (
                                <>
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                    </span>
                                    Live
                                </>
                            ) : (
                                <>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                                    Inactive
                                </>
                            )}
                        </span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* ── Quality ── */}
                    <div className="flex items-center gap-1.5">
                        <IconBadge color={
                            isWabaConnected
                                ? (quality.dot === 'bg-emerald-500' ? 'bg-emerald-500'
                                    : quality.dot === 'bg-amber-400' ? 'bg-amber-400'
                                    : quality.dot === 'bg-rose-500' ? 'bg-rose-500'
                                    : 'bg-slate-400')
                                : 'bg-slate-400'
                        }>
                            <Flag size={10} color="white" strokeWidth={2.5} />
                        </IconBadge>
                        <span className={labelCls}>Quality:</span>
                        <span className={cn('text-[10px] font-bold flex items-center gap-1',
                            isWabaConnected
                                ? isDarkMode
                                    ? quality.dot === 'bg-emerald-500' ? 'text-emerald-400' : quality.dot === 'bg-amber-400' ? 'text-amber-400' : 'text-rose-400'
                                    : quality.text
                                : isDarkMode ? 'text-white/40' : 'text-slate-400'
                        )}>
                            {isWabaConnected ? (
                                <>
                                    <span className={cn('inline-block w-1.5 h-1.5 rounded-full', quality.dot)} />
                                    {quality.label}
                                </>
                            ) : 'N/A'}
                        </span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* ── Region ── */}
                    <div className="flex items-center gap-1.5">
                        <IconBadge color={isWabaConnected ? 'bg-emerald-500' : 'bg-slate-400'}>
                            <Globe size={10} color="white" strokeWidth={2.5} />
                        </IconBadge>
                        <span className={labelCls}>Region:</span>
                        <span className={cn('text-[10px] font-bold',
                            isWabaConnected
                                ? isDarkMode ? 'text-white/80' : 'text-slate-700'
                                : isDarkMode ? 'text-white/40' : 'text-slate-400'
                        )}>
                            {isWabaConnected ? (whatsappApiDetails?.region || 'Global') : 'N/A'}
                        </span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* ── Messaging Limit ── */}
                    <div className="flex items-center gap-1.5">
                        <IconBadge color={isWabaConnected ? 'bg-emerald-500' : 'bg-slate-400'}>
                            <MessageSquare size={10} color="white" strokeWidth={2.5} />
                        </IconBadge>
                        <span className={labelCls}>Limit:</span>
                        <span className={cn('text-[10px] font-bold',
                            isWabaConnected
                                ? isDarkMode ? 'text-white/70' : 'text-slate-700'
                                : isDarkMode ? 'text-white/40' : 'text-slate-400'
                        )}>
                            {isWabaConnected
                                ? (tierInfo.limit === 'Unlimited' ? 'Unlimited' : `${tierInfo.limit.toLocaleString()} / 24h`)
                                : 'N/A'}
                        </span>
                    </div>

                    <Sep isDarkMode={isDarkMode} />

                    {/* ── Tier ── */}
                    <div className="flex items-center gap-1.5">
                        <span className={labelCls}>Tier:</span>
                        <span className={cn('text-[10px] font-bold',
                            isWabaConnected
                                ? isDarkMode ? 'text-white/70' : 'text-slate-700'
                                : isDarkMode ? 'text-white/40' : 'text-slate-400'
                        )}>
                            {isWabaConnected ? tierInfo.name : 'N/A'}
                        </span>
                    </div>

                </div>
                )}
            </div>

            {/* ── RIGHT: Theme + Org name + Avatar ────────────────────────── */}
            <div className="flex items-center gap-3">

                {/* Bell — tenant only (management has no shared-inbox) */}
                {!isManagement && (
                    <button
                        onClick={() => { setUnreadCount(0); router.push('/shared-inbox/live-chats'); }}
                        className={cn(
                            "p-2.5 rounded-xl transition-all relative",
                            isDarkMode ? 'hover:bg-white/5 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
                        )}
                    >
                        <Bell size={18} />
                        {unreadCount > 0 ? (
                            <div className="absolute top-1.5 right-1.5 min-w-4 h-4 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 flex items-center justify-center">
                                <span className="text-white text-[8px] font-black px-0.5">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            </div>
                        ) : (
                            <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                        )}
                    </button>
                )}

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
                        <div className="flex flex-col items-end">
                            <span className={cn(
                                "text-[11px] font-bold uppercase tracking-wider transition-colors",
                                isDarkMode ? 'text-white/70 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                            )}>
                                {user?.name || user?.organization_name || user?.username || 'Account'}
                            </span>
                            {isManagement && user?.email && (
                                <span className={cn('text-[8px] font-medium tracking-wide', isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                    {user.email}
                                </span>
                            )}
                        </div>

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