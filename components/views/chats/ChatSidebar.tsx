import React from 'react';
import { Search, User, MessageSquareOff } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getDateLabel } from './ChatUtils';

interface ChatSidebarProps {
    isDarkMode: boolean;
    chatSearchText: string;
    handleChatSearch: (e: any) => void;
    chatFilter: 'all' | 'read' | 'unread' | 'assigned' | 'unassigned';
    setChatFilter: (filter: any) => void;
    isAdmin: boolean;
    isChatsLoading: boolean;
    filteredChats: any[] | undefined;
    selectedChat: any;
    handleSelectChat: (chat: any) => void;
    user: any;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    isDarkMode,
    chatSearchText,
    handleChatSearch,
    chatFilter,
    setChatFilter,
    isAdmin,
    isChatsLoading,
    filteredChats,
    selectedChat,
    handleSelectChat,
    user
}) => {
    return (
        <div className={cn("w-full md:w-[320px] lg:w-[380px] flex flex-col border-r shrink-0 transition-all", isDarkMode ? "bg-[#111b21] border-white/5" : "bg-white border-slate-200")}>
            {/* Search & Filters */}
            <div className="p-2 space-y-2">
                <div className="relative group">
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", isDarkMode ? "text-slate-500 group-focus-within:text-emerald-500" : "text-slate-400 group-focus-within:text-emerald-500")} size={14} />
                    <input
                        onChange={handleChatSearch}
                        value={chatSearchText}
                        type="text"
                        placeholder="Search or start new chat"
                        className={cn(
                            "w-full rounded-2xl py-2 pl-9 pr-3 text-xs font-medium transition-all shadow-sm focus:outline-none border",
                            isDarkMode
                                ? "bg-[#202c33] text-white placeholder:text-slate-500 border-transparent focus:bg-[#2a3942] focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                                : "bg-slate-50 text-slate-900 placeholder:text-slate-500 border-slate-200 hover:border-slate-300 focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                        )}
                    />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 px-1">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'read', label: 'Read' },
                        { id: 'unread', label: 'Unread' },
                        { id: 'assigned', label: 'Assigned' },
                        ...(isAdmin ? [{ id: 'unassigned', label: 'Unassigned' }] : []),
                    ].map(f => {
                        const isActive = chatFilter === f.id;
                        return (
                            <button
                                key={f.id}
                                onClick={() => setChatFilter(f.id as any)}
                                className={cn(
                                    "whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-bold tracking-tight transition-all flex-1 text-center border-transparent border hover:border-emerald-500/20",
                                    isActive
                                        ? (isDarkMode ? "bg-[#00a884] text-[#111b21] shadow-lg shadow-emerald-500/10" : "bg-[#00a884] text-white shadow-lg shadow-emerald-500/10")
                                        : isDarkMode
                                            ? "bg-[#202c33] text-[#aebac1] hover:bg-[#2a3942]"
                                            : "bg-slate-100 text-[#54656f] hover:bg-slate-200"
                                )}
                            >
                                {f.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {isChatsLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className={cn("w-full px-2 py-2 flex items-center space-x-2 border-b", isDarkMode ? "border-white/5" : "border-gray-50")}>
                            <div className={cn("w-9 h-9 rounded-full shrink-0 animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                            <div className="flex-1 space-y-1.5 min-w-0">
                                <div className={cn("h-3 w-24 rounded animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                                <div className={cn("h-2 w-32 rounded animate-pulse", isDarkMode ? "bg-[#202c33]" : "bg-gray-100")} />
                            </div>
                        </div>
                    ))
                ) : filteredChats && filteredChats?.length > 0 ? (
                    filteredChats?.map((chat: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => handleSelectChat(chat)}
                            className={cn(
                                "w-full px-3 py-3 flex items-center space-x-3 transition-all border-b",
                                selectedChat?.phone === chat?.phone
                                    ? (isDarkMode ? 'bg-[#2a3942]' : 'bg-[#f0f2f5]')
                                    : (isDarkMode ? 'hover:bg-[#202c33] border-white/5' : 'hover:bg-gray-50 border-gray-50')
                            )}
                        >
                            <div className="relative shrink-0">
                                <div className={cn(
                                    "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all overflow-hidden",
                                    isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500'
                                )}>
                                    {chat?.name ? chat?.name?.split("")[0].toUpperCase() : <User size={16} />}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <span className={cn("text-sm font-bold truncate", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                            {chat?.name || chat.phone}
                                        </span>
                                        {chat?.assigned_admin_id ? (
                                            <div className={cn(
                                                "px-1.5 py-[2px] rounded text-[9px] font-bold flex items-center gap-1 shrink-0",
                                                chat.assigned_admin_id === user?.tenant_user_id
                                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                                    : (isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500")
                                            )}>
                                                {chat.assigned_admin_id === user?.tenant_user_id ? "Yours" : chat.assigned_agent_name}
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "px-1.5 py-[2px] rounded text-[9px] font-bold flex items-center gap-1 shrink-0",
                                                isDarkMode ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-rose-50 text-rose-600 border border-rose-100"
                                            )}>
                                                Unassigned
                                            </div>
                                        )}
                                    </div>
                                    <span className={cn("text-[10px] whitespace-nowrap ml-1 shrink-0",
                                        Number(chat?.unread_count) > 0
                                            ? (isDarkMode ? 'text-emerald-400 font-bold' : 'text-emerald-600 font-bold')
                                            : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                                    )}>
                                        {chat?.last_message_time ? getDateLabel(chat.last_message_time) : ""}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={cn("text-[12px] truncate pr-2 font-medium", isDarkMode ? 'text-slate-400' : 'text-slate-500')}>
                                        {chat.message}
                                    </span>
                                    {Number(chat?.unread_count) > 0 && (
                                        <span className="min-w-[18px] h-[18px] px-1 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shrink-0">
                                            {chat.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))) : (
                    <div className="flex flex-col items-center justify-center p-10 text-center opacity-50">
                        <MessageSquareOff size={48} className="mb-4 text-slate-500" />
                        <h3 className="text-sm font-bold">No chats found</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
