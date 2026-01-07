
"use client";

import { LayoutDashboard, Users, MessageSquare, Users2, Calendar, Radio, Database, Brain, Smartphone, Zap, Sun, Moon, User } from 'lucide-react';
import { FloatingDockItem } from "@/components/ui/floating-dock-item";
import { cn } from "@/lib/utils";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useState } from 'react';

interface SidebarProps {
    handleActiveTab: (tab:string)=> void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const Sidebar = ({ handleActiveTab, activeTab, setActiveTab, isDarkMode, toggleTheme }: SidebarProps) => {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);

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
            <div className={cn("mb-14 animate-in fade-in slide-in-from-top-4 duration-1000 transition-all", isExpanded ? "px-6" : "px-5")}>
                <div className={cn("w-14 h-14 rounded-[1.6rem] flex flex-col items-center justify-center transition-all duration-700 group cursor-pointer overflow-hidden relative shadow-2xl border border-transparent hover:rotate-12", isDarkMode ? 'bg-white' : 'bg-slate-900')}>
                    <div className={cn("text-[9px] font-black tracking-tighter transition-colors mb-0.5", isDarkMode ? 'text-emerald-600' : 'text-white')}>AI</div>
                    <Zap className={cn("transition-transform duration-700 group-hover:scale-125", isDarkMode ? 'text-emerald-600' : 'text-white')} size={22} fill="currentColor" />
                </div>
            </div>

            <nav className="flex-1 flex flex-col space-y-6 px-4 overflow-y-auto no-scrollbar">
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={LayoutDashboard} label="Neural Hub" active={activeTab === 'dashboard'} onClick={() => handleActiveTab('dashboard')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Users} label="Lead Pool" active={activeTab === 'leads'} onClick={() => handleActiveTab('leads')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={MessageSquare} label="Shared Inbox" active={activeTab === 'chats'} onClick={() => handleActiveTab('chats')} urgent={true} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Users2} label="Agent Matrix" active={activeTab === 'team'} onClick={() => handleActiveTab('team')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Calendar} label="Follow-ups" active={activeTab === 'followups'} onClick={() => handleActiveTab('followups')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Radio} label="Broadcasts" active={activeTab === 'broadcast'} onClick={() => handleActiveTab('broadcast')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Database} label="Knowledge" active={activeTab === 'knowledge'} onClick={() => handleActiveTab('knowledge')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Brain} label="AI Logic" active={activeTab === 'logic'} onClick={() => handleActiveTab('logic')} />
                <FloatingDockItem isExpanded={isExpanded} isDarkMode={isDarkMode} icon={Smartphone} label="Governance" active={activeTab === 'system'} onClick={() => handleActiveTab('system')} />
            </nav>

            <div className={cn("mt-auto space-y-6 flex flex-col transition-all duration-300", isExpanded ? "items-start px-6" : "items-center")}>
                <button onClick={toggleTheme} className={cn("p-4 rounded-2xl mt-2 transition-all border group relative", isDarkMode ? 'border-white/5 hover:bg-white/5 text-emerald-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500')}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
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
        </aside>
    );
};