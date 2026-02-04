
"use client";

import { LayoutDashboard, Users, MessageSquare, Users2, Calendar, Radio, Database, Brain, Smartphone, Zap, Sun, Moon, User, CalendarCheck, Stethoscope, Building2, Settings, Megaphone, Timer, MessageCircle, Group } from 'lucide-react';
import { FloatingDockItem } from "@/components/ui/floating-dock-item";
import { FloatingDockDropdown } from "@/components/ui/floating-dock-dropdown";
import { cn } from "@/lib/utils";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from "@/hooks/useTheme";
import { useDispatch } from 'react-redux';
import { setActiveTabData } from '@/redux/slices/auth/authSlice';
import { RoleBasedWrapper } from "@/components/ui/role-based-wrapper";

export const Sidebar = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { isDarkMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(false);
    const dispatch = useDispatch();

    const handleActiveTab = (tab: string) => {
        if (tab.includes('live-chats')) {
            dispatch(setActiveTabData('chats'));
        } else {
            dispatch(setActiveTabData('dashboard'));
        }
        router.push(tab);
    }
    console.log("user", user)
    return (
        <aside
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={cn(
                "shrink-0 flex flex-col py-10 z-[100] transition-all duration-300 ease-in-out",
                isExpanded ? "w-64" : "w-24",
                isDarkMode ? 'border-r border-white/5 bg-[#0D0D0F]' : 'border-r border-slate-200 bg-white shadow-2xl'
            )}
        >
            <div className={cn("mb-10 animate-in fade-in slide-in-from-top-4 duration-1000 transition-all flex items-center justify-center", isExpanded ? "px-4" : "px-3")}>
                {!isExpanded ? (
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl tracking-tighter shadow-lg transition-transform hover:scale-105", isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white')}>
                        W<span className="text-emerald-500">.</span>
                    </div>
                ) : (
                    <div className={cn("flex items-center justify-center font-black text-xl tracking-tighter", isDarkMode ? 'text-white' : 'text-slate-900')}>
                        WhatsNexus<span className="text-emerald-500">.</span>
                    </div>
                )}
            </div>
            <nav className="flex-1 flex flex-col space-y-6 px-4 overflow-y-auto no-scrollbar">
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={LayoutDashboard} label="Neural Hub" route="/dashboard" onClick={() => handleActiveTab('/dashboard')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Users} label="Lead Pool" route="/leads" onClick={() => handleActiveTab('/leads')} />
                <RoleBasedWrapper allowedRoles={['admin', 'tenant_admin', 'super_admin']}>
                    <FloatingDockDropdown
                        isExpanded={isExpanded}
                        isDarkMode={isDarkMode}
                        icon={MessageSquare}
                        label="Shared Inbox"
                        items={[
                            {
                                label: 'Chats',
                                route: '/shared-inbox/live-chats',
                                icon: MessageCircle,
                                onClick: () => handleActiveTab('/shared-inbox/live-chats'),
                            },
                            {
                                label: 'History',
                                route: '/shared-inbox/history',
                                icon: Timer,
                                onClick: () => handleActiveTab('/shared-inbox/history'),
                            }
                        ]}
                    />
                </RoleBasedWrapper>
                {/* <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={MessageSquare} label="Shared Inbox" route="/chats" onClick={() => handleActiveTab('/chats')} urgent={true} /> */}
                {/* <RoleBasedWrapper allowedRoles={['admin', 'tenant_admin']}><FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Users2} label="Agent Matrix" route="/team" onClick={() => handleActiveTab('/team')} /></RoleBasedWrapper> */}
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Calendar} label="Follow-ups" route="/followups" onClick={() => handleActiveTab('/followups')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={CalendarCheck} label="Appointments" route="/appointments" onClick={() => handleActiveTab('/appointments')} />
                <RoleBasedWrapper allowedRoles={['admin', 'tenant_admin', 'super_admin']}>
                    <FloatingDockDropdown
                        isExpanded={isExpanded}
                        isDarkMode={isDarkMode}
                        icon={Users}
                        label="Contacts"
                        items={[
                            {
                                label: 'Contacts',
                                route: '/contacts/contacts',
                                icon: Users,
                                onClick: () => handleActiveTab('/contacts/contacts'),
                            },
                            {
                                label: 'Groups',
                                route: '/contacts/groups',
                                icon: Group,
                                onClick: () => handleActiveTab('/contacts/groups'),
                            }
                        ]}
                    />
                </RoleBasedWrapper>
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Zap} label="Templates" route="/templates" onClick={() => handleActiveTab('/templates')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Stethoscope} label="Doctors" route="/doctors" onClick={() => handleActiveTab('/doctors')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Megaphone} label="Campaign" route="/campaign" onClick={() => handleActiveTab('/campaign')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Database} label="Knowledge" route="/knowledge" onClick={() => handleActiveTab('/knowledge')} />
                {/* <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Brain} label="AI Logic" route="/logic" onClick={() => handleActiveTab('/logic')} /> */}
                {/* <RoleBasedWrapper allowedRoles={['admin', 'tenant_admin', 'super_admin']}>
                    <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Smartphone} label="Governance" route="/system" onClick={() => handleActiveTab('/system')} />
                </RoleBasedWrapper> */}
                <RoleBasedWrapper allowedRoles={['super_admin']}>
                    <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Building2} label="Organizations" route="/organizations" onClick={() => handleActiveTab('/organizations')} />
                </RoleBasedWrapper>
                <RoleBasedWrapper allowedRoles={['admin', 'tenant_admin', 'super_admin']}>
                    <FloatingDockDropdown
                        isExpanded={isExpanded}
                        isDarkMode={isDarkMode}
                        icon={Settings}
                        label="Settings"
                        items={[
                            {
                                label: 'WhatsApp Settings',
                                route: '/settings/whatsapp-settings',
                                icon: MessageSquare,
                                onClick: () => handleActiveTab('/settings/whatsapp-settings'),
                            }
                        ]}
                    />
                </RoleBasedWrapper>
            </nav>
            <div className={cn("mt-auto space-y-6 flex flex-col transition-all duration-300", isExpanded ? "items-start px-6" : "items-center")}>
                {/* <button onClick={toggleTheme} className={cn("p-4 rounded-2xl mt-2 transition-all border group relative", isDarkMode ? 'border-white/5 hover:bg-white/5 text-emerald-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500')}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button> */}
                <div className={cn(
                    "rounded-2xl flex items-center font-black text-xs border cursor-pointer transition-all duration-300 overflow-hidden",
                    isExpanded ? "w-full px-4 py-3 gap-3 justify-start" : "w-12 h-12 justify-center hover:rotate-6",
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-900 text-white border-slate-700'
                )}>
                    <div className={cn("shrink-0 flex items-center justify-center", isExpanded ? "w-8 h-8 rounded-lg bg-white/10" : "")}>
                        {user?.username ? user?.username?.split("")[0].toUpperCase() : <User size={20} />}
                    </div>
                    <span className={cn(
                        "whitespace-nowrap transition-all duration-300 font-semibold text-sm",
                        isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 absolute"
                    )}>
                        {user?.username ? user?.username : user?.role}
                    </span>
                </div>
            </div>
        </aside >
    );
};