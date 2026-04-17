import React from 'react';
import { User, Brain, History as HistoryIcon, Lock, UserMinus, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { formatLastActiveConversation } from '../chats/ChatUtils';

interface HistoryDetailsProps {
    isDarkMode: boolean;
    selectedChat: any;
    setSelectedChat: React.Dispatch<React.SetStateAction<any>>;
    openNeuralSummarySidebar: () => void;
    setIsWeeklySummaryOpen: (isOpen: boolean) => void;
    isNeuralSummaryEnabled?: boolean;
    user: any;
    unclaimLead: (contactId: string) => void;
    isUnclaiming: boolean;
}

export const HistoryDetails: React.FC<HistoryDetailsProps> = ({
    isDarkMode,
    selectedChat,
    openNeuralSummarySidebar,
    setIsWeeklySummaryOpen,
    isNeuralSummaryEnabled = true,
    user,
    unclaimLead,
    isUnclaiming,
}) => {
    const lastActiveLabel = formatLastActiveConversation(selectedChat?.last_message_time);

    return (
        <div className={cn("w-1/4 min-w-[280px] border-l flex flex-col shrink-0", isDarkMode ? "bg-[#111b21] border-white/5" : "bg-white border-slate-200")}>
            <div className="p-4 flex flex-col items-center border-b space-y-3">
                <div className={cn("w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl overflow-hidden shadow-inner", isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500')}>
                    {selectedChat?.name ? selectedChat?.name?.split("")[0].toUpperCase() : <User size={40} />}
                </div>
                <div className="text-center">
                    <h3 className={cn("font-bold text-base", isDarkMode ? "text-white" : "text-slate-900")}>
                        {selectedChat?.name || selectedChat?.phone}
                    </h3>
                    <p className={cn("text-[11px] mt-0.5", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                        {selectedChat?.phone}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
                <div>
                    <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.15em] mb-4 opacity-60", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                        Contact Details
                    </h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                            <span className={cn("text-[11px] shrink-0 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Phone</span>
                            <span className={cn("text-[11px] font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>{selectedChat?.phone}</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                            <span className={cn("text-[11px] shrink-0 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Last Active Conversation</span>
                            <span className={cn("text-[11px] font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                                {lastActiveLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="space-y-3">
                        <button
                            onClick={isNeuralSummaryEnabled ? openNeuralSummarySidebar : undefined}
                            disabled={!isNeuralSummaryEnabled}
                            title={!isNeuralSummaryEnabled ? "Neural Summary is disabled in settings" : undefined}
                            className={cn(
                                "w-full h-10 flex items-center px-4 rounded-xl text-xs font-bold uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
                                !isNeuralSummaryEnabled
                                    ? (isDarkMode ? "bg-slate-800/50 text-slate-500 border border-white/5" : "bg-slate-100 text-slate-400 border border-slate-200")
                                    : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            )}
                        >
                            {!isNeuralSummaryEnabled && <div className="w-4 shrink-0" />}
                            <div className="flex-1 flex items-center justify-center gap-2">
                                <Brain size={15} />
                                <span>Neural Summary</span>
                            </div>
                            {!isNeuralSummaryEnabled && <Lock size={14} className="ml-2 shrink-0 opacity-80" />}
                        </button>
                        <button
                            onClick={isNeuralSummaryEnabled ? () => setIsWeeklySummaryOpen(true) : undefined}
                            disabled={!isNeuralSummaryEnabled}
                            title={!isNeuralSummaryEnabled ? "Neural Summary is disabled in settings" : undefined}
                            className={cn(
                                "w-full h-10 flex items-center px-4 rounded-xl text-xs font-bold uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
                                !isNeuralSummaryEnabled
                                    ? (isDarkMode ? "bg-slate-800/50 text-slate-500 border border-white/5" : "bg-slate-100 text-slate-400 border border-slate-200")
                                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            {!isNeuralSummaryEnabled && <div className="w-4 shrink-0" />}
                            <div className="flex-1 flex items-center justify-center gap-2">
                                <HistoryIcon size={15} />
                                <span>Weekly Summary</span>
                            </div>
                            {!isNeuralSummaryEnabled && <Lock size={14} className="ml-2 shrink-0 opacity-80" />}
                        </button>

                        {/* Unclaim Lead — only for staff/agent/doctor when assigned to current user */}
                        {selectedChat?.assigned_admin_id &&
                            selectedChat.assigned_admin_id === user?.tenant_user_id &&
                            user?.role !== 'tenant_admin' && (
                            <button
                                onClick={() => unclaimLead(selectedChat.contact_id)}
                                disabled={isUnclaiming}
                                className={cn(
                                    "w-full h-10 flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-bold uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                                    isDarkMode
                                        ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20"
                                        : "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                                )}
                            >
                                {isUnclaiming
                                    ? <Loader2 size={15} className="animate-spin" />
                                    : <UserMinus size={15} />
                                }
                                <span>Unclaim Lead</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
