"use client";

import { User, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useState, useEffect } from 'react';
import { useTheme } from "@/hooks/useTheme";
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { setActiveTabData } from '@/redux/slices/auth/authSlice';
import { tenantSidebarConfig, managementSidebarConfig, SidebarGroup } from './sidebarConfig';
import { SidebarGroupItem } from '@/components/ui/sidebarGroupItem';
import { useGetWhatsappConfigQuery } from '@/hooks/useWhatsappConfigQuery';
import Link from 'next/link';

export const GroupedSidebar = () => {
    const { user, whatsappApiDetails } = useAuth();
    useGetWhatsappConfigQuery();
    const { isDarkMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();

    // Determine which sidebar config to use based on user role
    const isManagement = user?.user_type == 'management';
    const sidebarConfig: SidebarGroup[] = isManagement ? managementSidebarConfig : tenantSidebarConfig;

    // Check if WhatsApp is connected and active
    const isWhatsAppActive = whatsappApiDetails?.status === 'active';

    // Check if we're in local development mode (for playground visibility)
  const isLocalServer = process.env.NEXT_PUBLIC_ENV === 'local' || "ngrok";


    // Sync Redux active tab state only — navigation is driven by <Link> in SidebarGroupItem.
    const handleActiveTab = (tab: string) => {
        if (tab.includes('live-chats')) {
            dispatch(setActiveTabData('chats'));
        } else {
            dispatch(setActiveTabData('dashboard'));
        }
    }

    // Eagerly prefetch every sidebar route the moment the sidebar mounts.
    // This downloads all route bundles upfront, making every first tab-click instant.
    useEffect(() => {
        const allRoutes = [...tenantSidebarConfig, ...managementSidebarConfig]
            .flatMap((group) => group.items.map((item) => item.route));
        const unique = [...new Set(allRoutes)];
        unique.forEach((route) => router.prefetch(route));
    }, []);


    // Filter items based on user role (case-insensitive) and local environment requirement
    const filterItemsByRole = (items: any[]) => {
        return items.filter(item => {
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
                "shrink-0 flex flex-col z-[100] transition-all duration-500 ease-out relative group/sidebar",
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
                                        ? 'bg-[#18181b] border border-rose-500/20 hover:border-rose-500/40'
                                        : 'bg-rose-50 border border-rose-200 hover:border-rose-300',
                                    isExpanded ? "p-3" : "p-2.5"
                                )}
                            >
                                {/* Sweep effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 translate-x-[-100%] group-hover/status:translate-x-[100%] transition-transform duration-700" />

                                {/* Pulse ring animation */}
                                <div className={cn(
                                    "absolute inset-0 rounded-xl opacity-0 group-hover/status:opacity-100 transition-opacity duration-500",
                                    isDarkMode ? "bg-rose-500/5" : "bg-rose-500/5"
                                )} />

                                <div className={cn("flex items-center gap-2.5 relative z-10", !isExpanded && "justify-center")}>
                                    <div className="relative flex items-center justify-center">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            isDarkMode ? 'bg-rose-400' : 'bg-rose-500'
                                        )} />
                                        {/* Pulse animation for disconnected state */}
                                        <div className={cn(
                                            "absolute w-2 h-2 rounded-full animate-ping",
                                            isDarkMode ? 'bg-rose-400' : 'bg-rose-500'
                                        )} />
                                    </div>
                                    {isExpanded && (
                                        <div className="flex flex-col items-start flex-1">
                                            <span className={cn(
                                                "text-[9px] font-bold uppercase tracking-[0.15em]",
                                                isDarkMode ? 'text-rose-400' : 'text-rose-600'
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
                                                onClick={() => handleActiveTab(item.route)}
                                                isDarkMode={isDarkMode}
                                                isExpanded={isExpanded}
                                                isDisabled={isDisabled}
                                                requiresWhatsApp={item.requiresWhatsApp}
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
