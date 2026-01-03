
"use client";

import { LayoutDashboard, Users, MessageSquare, Users2, Calendar, Radio, Database, Brain, Smartphone, Zap, Sun, Moon } from 'lucide-react';
import { FloatingDockItem } from "@/components/ui/floating-dock-item";
import { cn } from "@/lib/utils";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, isDarkMode, toggleTheme }: SidebarProps) => {
    return (
        <aside className={cn("w-24 shrink-0 flex flex-col items-center py-10 z-[100] transition-all duration-700", isDarkMode ? 'border-r border-white/5 bg-[#0D0D0F]' : 'border-r border-slate-200 bg-white shadow-2xl')}>
            <div className="mb-14 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className={cn("w-14 h-14 rounded-[1.6rem] flex flex-col items-center justify-center transition-all duration-700 group cursor-pointer overflow-hidden relative shadow-2xl border border-transparent hover:rotate-12", isDarkMode ? 'bg-white' : 'bg-slate-900')}>
                    <div className={cn("text-[9px] font-black tracking-tighter transition-colors mb-0.5", isDarkMode ? 'text-emerald-600' : 'text-white')}>AI</div>
                    <Zap className={cn("transition-transform duration-700 group-hover:scale-125", isDarkMode ? 'text-emerald-600' : 'text-white')} size={22} fill="currentColor" />
                </div>
            </div>

            <nav className="flex-1 flex flex-col space-y-6 px-4 overflow-y-auto no-scrollbar">
                <FloatingDockItem isDarkMode={isDarkMode} icon={LayoutDashboard} label="Neural Hub" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <FloatingDockItem isDarkMode={isDarkMode} icon={Users} label="Lead Pool" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
                <FloatingDockItem isDarkMode={isDarkMode} icon={MessageSquare} label="Shared Inbox" active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} urgent={true} />
                <FloatingDockItem isDarkMode={isDarkMode} icon={Users2} label="Agent Matrix" active={activeTab === 'team'} onClick={() => setActiveTab('team')} />
                <FloatingDockItem isDarkMode={isDarkMode} icon={Calendar} label="Follow-ups" active={activeTab === 'followups'} onClick={() => setActiveTab('followups')} />
                <FloatingDockItem isDarkMode={isDarkMode} icon={Radio} label="Broadcasts" active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} />
                <FloatingDockItem isDarkMode={isDarkMode} icon={Database} label="Knowledge" active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} />
                <FloatingDockItem isDarkMode={isDarkMode} icon={Brain} label="AI Logic" active={activeTab === 'logic'} onClick={() => setActiveTab('logic')} />
                <FloatingDockItem isDarkMode={isDarkMode} icon={Smartphone} label="Governance" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
            </nav>

            <div className="mt-auto space-y-6 flex flex-col items-center">
                <button onClick={toggleTheme} className={cn("p-4 rounded-2xl transition-all border group relative", isDarkMode ? 'border-white/5 hover:bg-white/5 text-emerald-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500')}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border cursor-pointer hover:rotate-6 transition-transform", isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-900 text-white border-slate-700')}>JD</div>
            </div>
        </aside>
    );
};
