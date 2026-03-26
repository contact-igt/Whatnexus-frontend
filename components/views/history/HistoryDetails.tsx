import React from 'react';
import { User, Loader2, Brain, History as HistoryIcon, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getDateLabel } from '../chats/ChatUtils';

interface HistoryDetailsProps {
    isDarkMode: boolean;
    selectedChat: any;
    summarizeChat: () => void;
    isSummarizing: boolean;
    setIsWeeklySummaryOpen: (isOpen: boolean) => void;
    isNeuralSummaryEnabled?: boolean;
}

export const HistoryDetails: React.FC<HistoryDetailsProps> = ({
    isDarkMode,
    selectedChat,
    summarizeChat,
    isSummarizing,
    setIsWeeklySummaryOpen,
    isNeuralSummaryEnabled = true
}) => {
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
                            <span className={cn("text-xs shrink-0", isDarkMode ? "text-slate-400" : "text-slate-500")}>Phone</span>
                            <span className={cn("text-xs font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>{selectedChat?.phone}</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                            <span className={cn("text-xs shrink-0", isDarkMode ? "text-slate-400" : "text-slate-500")}>Last Active</span>
                            <span className={cn("text-xs font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                                {selectedChat?.last_message_time ? getDateLabel(selectedChat.last_message_time) : "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="space-y-3">
                        <button
                            onClick={isNeuralSummaryEnabled ? summarizeChat : undefined}
                            disabled={isSummarizing || !isNeuralSummaryEnabled}
                            title={!isNeuralSummaryEnabled ? "Neural Summary is disabled in settings" : undefined}
                            className={cn(
                                "w-full h-10 flex items-center px-4 rounded-xl text-xs font-bold uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
                                !isNeuralSummaryEnabled
                                    ? (isDarkMode ? "bg-slate-800/50 text-slate-500 border border-white/5" : "bg-slate-100 text-slate-400 border border-slate-200")
                                    : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 border border-blue-500/10"
                            )}
                        >
                            <div className="flex items-center justify-center flex-1 space-x-2 mr-[-14px]">
                                {isSummarizing ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Brain size={14} />
                                )}
                                <span>Neural Summary</span>
                            </div>
                            {!isNeuralSummaryEnabled && <Lock size={12} className="ml-auto shrink-0 opacity-70" />}
                        </button>
                        <button
                            onClick={() => setIsWeeklySummaryOpen(true)}
                            className="w-full h-10 flex items-center justify-center space-x-2 bg-emerald-600/10 text-emerald-500 px-4 rounded-xl text-xs font-bold uppercase hover:bg-emerald-600/20 transition-colors"
                        >
                            <HistoryIcon size={14} />
                            <span>Full History Summary</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
