"use client";

import { User, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "@/hooks/useTheme";
import { useDispatch } from 'react-redux';
import { setActiveTabData } from '@/redux/slices/auth/authSlice';
import { tenantSidebarConfig, managementSidebarConfig, SidebarGroup } from './sidebar-config';
import { SidebarGroupItem } from '@/components/ui/sidebar-group-item';

export const GroupedSidebar = () => {
    const { user, whatsappApiDetails } = useAuth();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const dispatch = useDispatch();

    // Determine which sidebar config to use based on user role
    const isManagement = user?.user_type == 'management';
    const sidebarConfig: SidebarGroup[] = isManagement ? managementSidebarConfig : tenantSidebarConfig;

    // Check if WhatsApp is connected and active
    const isWhatsAppActive = whatsappApiDetails?.status === 'active';

    const handleActiveTab = (tab: string) => {
        if (tab.includes('live-chats')) {
            dispatch(setActiveTabData('chats'));
        } else {
            dispatch(setActiveTabData('dashboard'));
        }
        router.push(tab);
    }

    // Filter items based on user role (case-insensitive)
    const filterItemsByRole = (items: any[]) => {
        return items.filter(item => {
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
                    ? 'bg-[#0A0A0B]/95 backdrop-blur-2xl'
                    : 'bg-white/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/5'
            )}
        >
            {/* Animated border */}
            <div className={cn(
                "absolute inset-y-0 right-0 w-px transition-all duration-500",
                isDarkMode
                    ? 'bg-gradient-to-b from-transparent via-white/10 to-transparent'
                    : 'bg-gradient-to-b from-transparent via-slate-200 to-transparent'
            )} />

            {/* Ambient glow effect */}
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-700 pointer-events-none",
                isDarkMode
                    ? "bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"
                    : "bg-gradient-to-br from-emerald-500/3 via-transparent to-teal-500/3"
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
                                ? 'bg-gradient-to-br from-white/10 to-white/5 border border-white/10'
                                : 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700',
                            !isExpanded && "hover:scale-110 hover:rotate-6"
                        )}>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000" />

                            <span className={cn(
                                "relative z-10 transition-all duration-300",
                                isDarkMode ? 'text-white' : 'text-white'
                            )}>
                                W<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">.</span>
                            </span>
                        </div>

                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500 -z-10" />
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
                            "rounded-xl p-3 transition-all duration-500 relative overflow-hidden group/status",
                            isDarkMode
                                ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20'
                                : 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200',
                            isExpanded ? "" : "flex justify-center p-2.5"
                        )}>
                            {/* Animated background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-teal-500/0 translate-x-[-100%] group-hover/status:translate-x-[100%] transition-transform duration-1000" />

                            <div className={cn("flex items-center gap-2.5 relative z-10", !isExpanded && "justify-center")}>
                                <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-ping" />
                                </div>
                                {isExpanded && (
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                            WhatsApp
                                        </span>
                                        <span className={cn(
                                            "text-[11px] font-black",
                                            isDarkMode ? 'text-white' : 'text-slate-900'
                                        )}>
                                            Connected
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleActiveTab('/settings/whatsapp-settings')}
                            className={cn(
                                "w-full rounded-xl transition-all duration-300 relative overflow-hidden group/status hover:scale-[1.02] active:scale-[0.98]",
                                isDarkMode
                                    ? 'bg-gradient-to-br from-rose-500/10 to-rose-600/10 border border-rose-500/20 hover:border-rose-500/40'
                                    : 'bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200 hover:border-rose-300',
                                isExpanded ? "p-3" : "p-2.5"
                            )}
                        >
                            {/* Sweep effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/20 to-rose-500/0 translate-x-[-100%] group-hover/status:translate-x-[100%] transition-transform duration-700" />

                            {/* Pulse ring animation */}
                            <div className={cn(
                                "absolute inset-0 rounded-xl opacity-0 group-hover/status:opacity-100 transition-opacity duration-500",
                                isDarkMode ? "bg-rose-500/5" : "bg-rose-500/10"
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
                        </button>
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
                                            "h-px relative overflow-hidden rounded-full",
                                            isDarkMode ? 'bg-white/5' : 'bg-slate-200'
                                        )}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                                        </div>
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
                        ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20'
                        : 'bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-slate-600',
                    isExpanded ? "p-3" : "p-3 flex justify-center"
                )}>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-teal-500/0 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-500" />

                    <div className={cn(
                        "flex items-center gap-3 relative z-10",
                        !isExpanded && "justify-center"
                    )}>
                        <div className={cn(
                            "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm relative overflow-hidden",
                            isDarkMode
                                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-white'
                                : 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white'
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
