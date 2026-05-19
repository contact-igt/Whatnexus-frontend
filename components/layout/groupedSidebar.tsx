"use client";

import {
    User,
    Sparkles,
    LayoutDashboard,
    MessageCircle,
    Timer,
    Filter,
    Users,
    Group,
    Clock,
    Calendar,
    Zap,
    Megaphone,
    Image,
    Stethoscope,
    BadgeCheck,
    BookOpen,
    Video,
    UserCircle,
    Users2,
    Database,
    CreditCard,
    Settings,
    MessageSquare,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from "@/hooks/useTheme";
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setActiveTabData } from '@/redux/slices/auth/authSlice';
import { tenantSidebarConfig, managementSidebarConfig, SidebarGroup, SidebarItem } from './sidebarConfig';
import { SidebarGroupItem } from '@/components/ui/sidebarGroupItem';
import { useGetWhatsappConfigQuery } from '@/hooks/useWhatsappConfigQuery';
import { useFaqNotifications } from '@/hooks/useFaqNotifications';
import { useNotifications } from '@/redux/selectors/notifications/notificationSelector';
import { useFeatureAccess } from '@/redux/selectors/featureAccess/featureAccessSelector';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { TenantDynamicNavigationPayload } from '@/services/tenantDynamicNavigation';

interface GroupedSidebarProps {
    tenantDynamicNavigationData?: TenantDynamicNavigationPayload;
    isTenantDynamicNavigationSuccess?: boolean;
}

const ICON_KEY_MAP: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    chat: MessageCircle,
    history: Timer,
    leadpool: Filter,
    contacts: Users,
    groups: Group,
    followups: Clock,
    appointments: Calendar,
    templates: Zap,
    campaign: Megaphone,
    media_gallery: Image,
    doctors: Stethoscope,
    specialization: BadgeCheck,
    courses: BookOpen,
    sessions: Video,
    mentors: UserCircle,
    agent_matrix: Users2,
    knowledge: Database,
    billing_payment: CreditCard,
    general_settings: Settings,
    whatsapp_settings: MessageSquare,
};

const normalizeRoute = (route: string) => {
    const [pathname] = route.split('?');
    const normalizedPath = pathname.trim().replace(/\/+$/, '');
    return normalizedPath || '/';
};

const getStaticRouteMeta = () => {
    const exactRouteMap = new Map<string, SidebarItem>();
    const normalizedRouteMap = new Map<string, SidebarItem>();
    const normalizedRouteOrder = new Map<string, number>();
    const staticGroupOrder = new Map<string, number>();
    let routeOrder = 0;

    tenantSidebarConfig.forEach((group, groupIndex) => {
        staticGroupOrder.set(group.groupLabel, groupIndex);
        for (const item of group.items) {
            if (!exactRouteMap.has(item.route)) {
                exactRouteMap.set(item.route, item);
            }

            const normalized = normalizeRoute(item.route);
            if (!normalizedRouteMap.has(normalized)) {
                normalizedRouteMap.set(normalized, item);
            }
            if (!normalizedRouteOrder.has(normalized)) {
                normalizedRouteOrder.set(normalized, routeOrder++);
            }
        }
    });

    return {
        exactRouteMap,
        normalizedRouteMap,
        normalizedRouteOrder,
        staticGroupOrder,
    };
};

const getIconFromKey = (iconKey?: string | null) => {
    if (!iconKey) return null;
    const normalized = iconKey.trim().toLowerCase().replace(/[\s-]+/g, '_');
    return ICON_KEY_MAP[normalized] || null;
};

export const GroupedSidebar = ({
    tenantDynamicNavigationData,
    isTenantDynamicNavigationSuccess = false,
}: GroupedSidebarProps) => {
    const { user, whatsappApiDetails } = useAuth();
    const { unreadCount } = useNotifications();
    const { enabled_features, industry_type } = useFeatureAccess();
    const { pendingCount: faqPendingCount, canAccessFaqNotifications } = useFaqNotifications();
    useGetWhatsappConfigQuery();
    const { isDarkMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    const isManagement = user?.user_type == 'management';

    const staticRouteMeta = useMemo(() => getStaticRouteMeta(), []);

    const dynamicTenantSidebarConfig = useMemo(() => {
        const groups = tenantDynamicNavigationData?.navigation;
        if (!Array.isArray(groups)) return [];

        const mappedGroups: SidebarGroup[] = groups
            .map((group) => {
                const validItems = (group.items || [])
                    .filter((item) => typeof item?.label === "string" && item.label.trim() !== "" && typeof item?.route_path === "string" && item.route_path.trim() !== "")
                    .map((item) => {
                        const route = item.route_path.trim();
                        const normalizedRoute = normalizeRoute(route);
                        const staticMatch =
                            staticRouteMeta.exactRouteMap.get(route) ||
                            staticRouteMeta.normalizedRouteMap.get(normalizedRoute);

                        const iconFromKey = getIconFromKey(item.icon_key);
                        const resolvedIcon = iconFromKey || staticMatch?.icon || Sparkles;
                        const resolvedLabel = staticMatch?.label || item.label.trim();

                        return {
                            label: resolvedLabel,
                            route,
                            icon: resolvedIcon,
                            featureKey: staticMatch?.featureKey,
                            requiresWhatsApp: staticMatch?.requiresWhatsApp,
                            requiresLocal: staticMatch?.requiresLocal,
                            roles: staticMatch?.roles,
                            matchMode: staticMatch?.matchMode,
                        };
                    })
                    .sort((a, b) => {
                        const aOrder = staticRouteMeta.normalizedRouteOrder.get(normalizeRoute(a.route));
                        const bOrder = staticRouteMeta.normalizedRouteOrder.get(normalizeRoute(b.route));

                        if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
                        if (aOrder !== undefined) return -1;
                        if (bOrder !== undefined) return 1;

                        return a.label.localeCompare(b.label);
                    });

                return {
                    groupLabel: group.menu_group || "General",
                    items: validItems,
                };
            })
            .filter((group) => group.items.length > 0);

        const hasFollowUpHub = mappedGroups.some((group) =>
            group.items.some((item) => {
                const normalized = normalizeRoute(item.route);
                return normalized === "/followups" || normalized === "/followup-hub";
            }),
        );

        if (industry_type === "healthcare" && !hasFollowUpHub) {
            const followUpStaticMeta =
                staticRouteMeta.exactRouteMap.get("/followups") ||
                staticRouteMeta.normalizedRouteMap.get("/followups");

            const followUpItem: SidebarItem = {
                label: "Follow-up Hub",
                route: "/followups",
                icon: Clock,
                featureKey: followUpStaticMeta?.featureKey || "fallback",
                requiresWhatsApp: followUpStaticMeta?.requiresWhatsApp ?? true,
                requiresLocal: followUpStaticMeta?.requiresLocal,
                roles: followUpStaticMeta?.roles,
                matchMode: followUpStaticMeta?.matchMode,
            };

            const preferredGroupIndex = mappedGroups.findIndex(
                (group) => group.groupLabel?.toLowerCase() === "contacts & leads",
            );

            if (preferredGroupIndex >= 0) {
                mappedGroups[preferredGroupIndex] = {
                    ...mappedGroups[preferredGroupIndex],
                    items: [...mappedGroups[preferredGroupIndex].items, followUpItem],
                };
            } else {
                mappedGroups.push({
                    groupLabel: "Contacts & Leads",
                    items: [followUpItem],
                });
            }
        }

        mappedGroups.sort((a, b) => {
            const aOrder = staticRouteMeta.staticGroupOrder.get(a.groupLabel);
            const bOrder = staticRouteMeta.staticGroupOrder.get(b.groupLabel);

            if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
            if (aOrder !== undefined) return -1;
            if (bOrder !== undefined) return 1;

            return a.groupLabel.localeCompare(b.groupLabel);
        });

        return mappedGroups;
    }, [industry_type, tenantDynamicNavigationData, staticRouteMeta]);

    const hasValidDynamicNavigation =
        isTenantDynamicNavigationSuccess &&
        dynamicTenantSidebarConfig.some((group) => group.items.length > 0);

    const sidebarConfig: SidebarGroup[] = isManagement
        ? managementSidebarConfig
        : hasValidDynamicNavigation
            ? dynamicTenantSidebarConfig
            : tenantSidebarConfig;

    // Check if WhatsApp is connected and active
    const isWhatsAppActive = whatsappApiDetails?.status === 'active';

    // Check if we're in local development mode (for playground visibility)
    const isLocalServer = typeof window !== 'undefined' && (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('ngrok')
    );


    // Sync Redux active tab state only — navigation is driven by <Link> in SidebarGroupItem.
    const handleActiveTab = (tab: string) => {
        if (tab.includes('live-chats')) {
            dispatch(setActiveTabData('chats'));
        } else {
            dispatch(setActiveTabData('dashboard'));
        }
    }

    // Prefetch only the routes visible to the current user.
    useEffect(() => {
        const visibleRoutes = sidebarConfig
            .flatMap((group) => filterItemsByRole(group.items).map((item) => item.route));
        const uniqueRoutes = [...new Set(visibleRoutes)];
        uniqueRoutes.forEach((route) => router.prefetch(route));
    }, [router, sidebarConfig, user?.role, isLocalServer, enabled_features, isManagement]);


    // Filter items based on user role (case-insensitive) and local environment requirement
    const filterItemsByRole = (items: SidebarGroup['items']) => {
        return items.filter(item => {
            if (!isManagement && item.featureKey && !enabled_features.includes(item.featureKey)) {
                return false;
            }

            // Filter out items that require local environment when not in local mode
            if (item.requiresLocal && !isLocalServer) return false;

            if (!item.roles) return true;
            return item.roles.some((role: string) =>
                role.toUpperCase() === user?.role?.toUpperCase()
            );
        });
    };

    return (
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={cn(
                "shrink-0 h-full flex flex-col z-[100] transition-all duration-500 ease-out relative group/sidebar",
                isExpanded ? "w-72" : "w-20",
                isDarkMode
                    ? 'bg-[#09090b]'
                    : 'bg-white shadow-lg shadow-slate-900/5'
            )}
        >
            {/* Right border */}
            <div className={cn(
                "absolute inset-y-0 right-0 w-px",
                isDarkMode
                    ? 'bg-[#27272a]'
                    : 'bg-[#e4e4e7]'
            )} />

            {/* Logo Section */}
            <div className="pt-8 pb-6 px-5 relative z-10">
                <div className={cn(
                    "transition-all duration-500",
                    isExpanded ? "flex items-center gap-3" : "flex justify-center"
                )}>
                    {/* Logo Icon */}
                    <div className={cn(
                        "relative shrink-0 transition-all duration-500",
                        isExpanded ? "w-11 h-11" : "w-12 h-12"
                    )}>
                        <div className={cn(
                            "w-full h-full rounded-2xl flex items-center justify-center font-black text-lg relative overflow-hidden group/logo transition-all duration-300",
                            isDarkMode
                                ? 'bg-[#18181b] border border-[#27272a]'
                                : 'bg-slate-900 border border-slate-700',
                            !isExpanded && "hover:scale-110"
                        )}>
                            <span className={cn(
                                "relative z-10",
                                isDarkMode ? 'text-white' : 'text-white'
                            )}>
                                W<span className="text-emerald-400">.</span>
                            </span>
                        </div>

                    </div>

                    {/* Logo Text */}
                    {isExpanded && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className={cn(
                                "text-lg font-black tracking-tight leading-none",
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}>
                                WhatsNexus
                            </span>
                            <span className={cn(
                                "text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5",
                                isDarkMode ? 'text-white/30' : 'text-slate-400'
                            )}>
                                Neural Hub
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* WhatsApp Status Card - Only for tenant users */}
            {!isManagement && (
                <div className="px-4 pb-5 relative z-10">
                    {isWhatsAppActive ? (
                        <div className={cn(
                            "rounded-xl transition-all duration-300 relative overflow-hidden group/status cursor-default",
                            isDarkMode
                                ? 'bg-[#18181b] border border-emerald-500/25 hover:border-emerald-500/40'
                                : 'bg-emerald-50 border border-emerald-200 hover:border-emerald-300',
                            isExpanded ? "p-3" : "p-2.5 flex justify-center"
                        )}>
                            <div className={cn("flex items-center relative z-10", isExpanded ? "gap-2.5" : "justify-center")}>
                                {/* Status indicator — icon with ring */}
                                <div className="relative shrink-0 flex items-center justify-center">
                                    <div className={cn(
                                        "rounded-lg flex items-center justify-center",
                                        isExpanded ? "w-8 h-8" : "w-8 h-8",
                                        isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-100'
                                    )}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                    {/* Live dot */}
                                    <div className="absolute -top-0.5 -right-0.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2" style={{ borderColor: isDarkMode ? '#18181b' : '#ecfdf5' }} />
                                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-500">
                                            WhatsApp
                                        </span>
                                        <span className={cn(
                                            "text-[11px] font-black leading-tight",
                                            isDarkMode ? 'text-white' : 'text-slate-900'
                                        )}>
                                            Connected
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/settings/whatsapp-settings"
                            onClick={() => handleActiveTab('/settings/whatsapp-settings')}
                            className="block w-full"
                        >
                            <div
                                className={cn(
                                    "w-full rounded-xl transition-all duration-300 relative overflow-hidden group/status hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                                    isDarkMode
                                        ? 'bg-[#18181b] border border-red-500/20 hover:border-red-500/40'
                                        : 'bg-red-50 border border-red-200 hover:border-red-300',
                                    isExpanded ? "p-3" : "p-2.5"
                                )}
                            >
                                {/* Sweep effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover/status:translate-x-[100%] transition-transform duration-700" />

                                {/* Pulse ring animation */}
                                <div className={cn(
                                    "absolute inset-0 rounded-xl opacity-0 group-hover/status:opacity-100 transition-opacity duration-500",
                                    isDarkMode ? "bg-red-500/5" : "bg-red-500/5"
                                )} />

                                <div className={cn("flex items-center gap-2.5 relative z-10", !isExpanded && "justify-center")}>
                                    <div className="relative shrink-0 flex items-center justify-center">
                                        <div className={cn(
                                            "rounded-lg flex items-center justify-center",
                                            isExpanded ? "w-8 h-8" : "w-8 h-8",
                                            isDarkMode ? 'bg-[#ef4444]/15' : 'bg-[#ef4444]/10'
                                        )}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="flex flex-col items-start flex-1">
                                            <span className={cn(
                                                "text-[9px] font-bold uppercase tracking-[0.15em]",
                                                'text-[#ef4444]'
                                            )}>
                                                WhatsApp
                                            </span>
                                            <span className={cn(
                                                "text-[11px] font-black leading-tight",
                                                isDarkMode ? 'text-white' : 'text-slate-900'
                                            )}>
                                                Not Connected
                                            </span>
                                            <span className={cn(
                                                "text-[8px] font-medium mt-0.5 opacity-70",
                                                isDarkMode ? 'text-white' : 'text-slate-700'
                                            )}>
                                                Click to connect
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )}
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 overflow-y-auto no-scrollbar relative z-10 pb-4">
                <div className="space-y-6">
                    {sidebarConfig.map((group, groupIndex) => {
                        const filteredItems = filterItemsByRole(group.items);

                        if (filteredItems.length === 0) return null;

                        // Check if there are any more visible groups after this one
                        const hasMoreVisibleGroups = sidebarConfig
                            .slice(groupIndex + 1)
                            .some(g => filterItemsByRole(g.items).length > 0);

                        return (
                            <div key={groupIndex} className="space-y-1.5">
                                {/* Group Label */}
                                {isExpanded && (
                                    <div className={cn(
                                        "px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-2",
                                        isDarkMode ? 'text-white/25' : 'text-slate-400'
                                    )}>
                                        <Sparkles size={10} className="opacity-50" />
                                        {group.groupLabel}
                                    </div>
                                )}

                                {/* Group Items */}
                                <div className="space-y-0.5">
                                    {filteredItems.map((item, itemIndex) => {
                                        const isDisabled = item.requiresWhatsApp && !isWhatsAppActive;

                                        return (
                                            <SidebarGroupItem
                                                key={itemIndex}
                                                icon={item.icon}
                                                label={item.label}
                                                route={item.route}
                                                matchMode={item.matchMode}
                                                onClick={() => handleActiveTab(item.route)}
                                                isDarkMode={isDarkMode}
                                                isExpanded={isExpanded}
                                                isDisabled={isDisabled}
                                                requiresWhatsApp={item.requiresWhatsApp}
                                                notificationCount={
                                                    item.route === '/shared-inbox/live-chats'
                                                        ? unreadCount
                                                        : item.route === '/knowledge' && canAccessFaqNotifications
                                                            ? faqPendingCount
                                                            : 0
                                                }
                                            />
                                        );
                                    })}
                                </div>

                                {/* Divider - only show if there are more visible groups */}
                                {hasMoreVisibleGroups && (
                                    <div className="py-2 px-2">
                                        <div className={cn(
                                            "h-px",
                                            isDarkMode ? 'bg-[#27272a]' : 'bg-[#e4e4e7]'
                                        )} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 relative z-10">
                <div className={cn(
                    "rounded-2xl transition-all duration-300 relative overflow-hidden group/profile cursor-pointer",
                    isDarkMode
                        ? 'bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46]'
                        : 'bg-slate-900 border border-slate-700 hover:border-slate-600',
                    isExpanded ? "p-3" : "p-3 flex justify-center"
                )}>
                    <div className={cn(
                        "flex items-center gap-3 relative z-10",
                        !isExpanded && "justify-center"
                    )}>
                        <div className={cn(
                            "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm relative overflow-hidden",
                            isDarkMode
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-emerald-500 text-white'
                        )}>
                            {user?.username ? user?.username?.split("")[0].toUpperCase() : <User size={18} />}
                        </div>

                        {isExpanded && (
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className={cn(
                                    "text-xs font-bold truncate",
                                    isDarkMode ? 'text-white' : 'text-white'
                                )}>
                                    {user?.username || 'User'}
                                </span>
                                <span className={cn(
                                    "text-[9px] font-medium uppercase tracking-wider truncate",
                                    isDarkMode ? 'text-white/40' : 'text-white/60'
                                )}>
                                    {user?.role?.replace('_', ' ') || 'Member'}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};
