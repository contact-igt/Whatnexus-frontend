import React, { useState } from 'react';
import { User, Search, Check, UserPlus, ChevronDown, ShieldCheck, Lock, Loader2, Brain, History as HistoryIcon, Bot, BotOff, Pencil, X } from 'lucide-react';
import { useUpdateContactMutation } from '@/hooks/useContactQuery';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getDateLabel } from './ChatUtils';
import { LeadSummarySidebar } from '../leadSummarySidebar';

interface ChatDetailsProps {
    isDarkMode: boolean;
    selectedChat: any;
    isAdmin: boolean;
    isAssigning: boolean;
    agentSearch: string;
    setAgentSearch: (text: string) => void;
    filteredAgents: any[];
    assignAgentMutate: (params: any) => void;
    setSelectedChat: React.Dispatch<React.SetStateAction<any>>;
    user: any;
    claimChatMutate: (contactId: string) => void;
    isClaiming: boolean;
    summarizeChat: () => void;
    isSummarizing: boolean;
    setIsWeeklySummaryOpen: (isOpen: boolean) => void;
    toggleSilenceAiMutate: (params: any) => void;
    isTogglingSilence: boolean;
    isNeuralSummaryEnabled?: boolean;
    openNeuralSummarySidebar: () => void;
}

export const ChatDetails: React.FC<ChatDetailsProps> = ({
    isDarkMode,
    selectedChat,
    isAdmin,
    isAssigning,
    agentSearch,
    setAgentSearch,
    filteredAgents,
    assignAgentMutate,
    setSelectedChat,
    user,
    claimChatMutate,
    isClaiming,
    summarizeChat,
    isSummarizing,
    setIsWeeklySummaryOpen,
    toggleSilenceAiMutate,
    isTogglingSilence,
    isNeuralSummaryEnabled = true,
    openNeuralSummarySidebar,
}) => {
    const queryClient = useQueryClient();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const { mutate: updateContactMutate, isPending: isUpdatingName } = useUpdateContactMutation();

    const handleEditName = () => {
        setEditedName(selectedChat?.name || '');
        setIsEditingName(true);
    };

    const handleSaveName = () => {
        if (!editedName.trim()) return;
        updateContactMutate(
            { contactId: selectedChat.contact_id, data: { name: editedName.trim() } },
            {
                onSuccess: () => {
                    setSelectedChat((prev: any) => ({ ...prev, name: editedName.trim() }));
                    setIsEditingName(false);
                    queryClient.invalidateQueries({ queryKey: ['livechats'] });
                    queryClient.invalidateQueries({ queryKey: ['chats'] });
                    queryClient.invalidateQueries({ queryKey: ['historychats'] });
                },
            }
        );
    };

    const handleCancelEdit = () => {
        setIsEditingName(false);
        setEditedName('');
    };

    return (
        <div className={cn("w-1/4 min-w-[280px] border-l flex flex-col shrink-0", isDarkMode ? "bg-[#111b21] border-white/5" : "bg-white border-slate-200")}>
            <div className="p-4 flex flex-col items-center border-b space-y-3">
                <div className={cn("w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl overflow-hidden shadow-inner", isDarkMode ? 'bg-[#3b4a54] text-slate-300' : 'bg-slate-200 text-slate-500')}>
                    {selectedChat?.name ? selectedChat?.name?.split("")[0].toUpperCase() : <User size={40} />}
                </div>
                <div className="text-center w-full px-2">
                    {isEditingName ? (
                        <div className="flex items-center justify-center gap-2">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveName();
                                    if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                                className={cn(
                                    "w-full px-2 py-1 text-center font-bold text-base rounded-lg border focus:outline-none focus:ring-2",
                                    isDarkMode
                                        ? "bg-[#2a3942] text-white border-white/10 focus:ring-emerald-500/50"
                                        : "bg-white text-slate-900 border-slate-200 focus:ring-emerald-500/50"
                                )}
                                placeholder="Enter name"
                            />
                            <button
                                onClick={handleSaveName}
                                disabled={isUpdatingName || !editedName.trim()}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors disabled:opacity-50",
                                    isDarkMode ? "hover:bg-emerald-500/20 text-emerald-400" : "hover:bg-emerald-50 text-emerald-600"
                                )}
                            >
                                {isUpdatingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    isDarkMode ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-50 text-red-600"
                                )}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-2">
                            <h3 className={cn("font-bold text-base", isDarkMode ? "text-white" : "text-slate-900")}>
                                {selectedChat?.name || selectedChat?.phone}
                            </h3>
                            <button
                                onClick={handleEditName}
                                className={cn(
                                    "p-1 rounded-lg transition-colors opacity-60 hover:opacity-100",
                                    isDarkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"
                                )}
                                title="Edit name"
                            >
                                <Pencil size={14} />
                            </button>
                        </div>
                    )}
                    <p className={cn("text-[11px] mt-0.5", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                        {selectedChat?.phone}
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
                {/* Agent Assignment Section */}
                <div className="space-y-3">
                    <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.15em] opacity-60", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                        Agent Assignment
                    </h4>

                    <div className="space-y-3">
                        {isAdmin && (
                            <>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            disabled={isAssigning}
                                            className={cn(
                                                "w-full rounded-xl py-3 px-3 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-sm border",
                                                !selectedChat?.assigned_admin_id
                                                    ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-100 text-emerald-600")
                                                    : (isDarkMode ? "bg-[#202c33] text-slate-200 border-white/5" : "bg-white text-slate-700 border-slate-200")
                                            )}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <UserPlus size={14} className={isDarkMode ? "text-slate-500" : "text-slate-400"} />
                                                <span className="truncate">
                                                    {selectedChat?.assigned_agent_name || "Unassigned"}
                                                </span>
                                            </div>
                                            <ChevronDown className={cn("shrink-0", isDarkMode ? "text-slate-500" : "text-slate-400")} size={14} />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        isDarkMode={isDarkMode}
                                        align="start"
                                        className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden rounded-2xl border shadow-2xl"
                                    >
                                        <div className={cn("p-2 border-b", isDarkMode ? "border-white/5 bg-white/5 text-white" : "border-slate-100 bg-slate-50")}>
                                            <Input
                                                isDarkMode={isDarkMode}
                                                placeholder="Search agents..."
                                                value={agentSearch}
                                                onChange={(e) => setAgentSearch(e.target.value)}
                                                variant="secondary"
                                                className="h-8 text-xs py-1"
                                                icon={Search}
                                            />
                                        </div>
                                        <div className="max-h-[420px] overflow-y-auto p-2 custom-scrollbar">
                                            <button
                                                onClick={() => {
                                                    if (!selectedChat?.assigned_admin_id) return;
                                                    assignAgentMutate({ contact_id: selectedChat.contact_id, agent_id: "" });
                                                    setSelectedChat((prev: any) => ({ ...prev, assigned_admin_id: "", assigned_agent_name: "Unassigned" }));
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-4 rounded-xl text-xs font-medium transition-colors",
                                                    !selectedChat?.assigned_admin_id
                                                        ? (isDarkMode ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-rose-50 text-rose-600 border border-rose-100")
                                                        : (isDarkMode ? "hover:bg-white/5 text-slate-400" : "hover:bg-slate-50 text-slate-600")
                                                )}
                                            >
                                                <span>Unassigned</span>
                                                {!selectedChat?.assigned_admin_id && <Check size={14} />}
                                            </button>
                                            {filteredAgents.map((agent: any) => (
                                                <button
                                                    key={agent.tenant_user_id}
                                                    onClick={() => {
                                                        if (selectedChat?.assigned_admin_id === agent.tenant_user_id) return;
                                                        assignAgentMutate({ contact_id: selectedChat.contact_id, agent_id: agent.tenant_user_id });
                                                        setSelectedChat((prev: any) => ({
                                                            ...prev,
                                                            assigned_admin_id: agent.tenant_user_id,
                                                            assigned_agent_name: agent.username
                                                        }));
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-3 py-3.5 rounded-xl text-xs font-semibold transition-all group",
                                                        selectedChat?.assigned_admin_id === agent.tenant_user_id
                                                            ? (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                                                            : (isDarkMode ? "hover:bg-white/5 text-slate-300" : "hover:bg-slate-50 text-slate-700")
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 border",
                                                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                                                    )}>
                                                        {agent.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col items-start min-w-0 flex-1">
                                                        <span className="truncate w-full text-left">{agent.username}</span>
                                                        <Badge isDarkMode={isDarkMode} variant="default" size="sm" className="mt-0.5 text-[8px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                                                            {agent.role}
                                                        </Badge>
                                                    </div>
                                                    {selectedChat?.assigned_admin_id === agent.tenant_user_id && <Check size={14} className="shrink-0" />}
                                                </button>
                                            ))}
                                            {filteredAgents.length === 0 && (
                                                <div className="p-4 text-center text-[10px] opacity-40">No agents found</div>
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <p className={cn("text-[10px] italic opacity-60 px-1", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                                    Admins can reassign leads to any team member.
                                </p>
                            </>
                        )}

                        {selectedChat?.assigned_admin_id === user?.tenant_user_id ? (
                            <div className={cn("relative overflow-hidden flex items-center justify-between px-4 py-3 rounded-xl border transition-all", isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm")}>
                                <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className={cn("p-1.5 rounded-lg", isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100")}>
                                        <ShieldCheck size={16} className={isDarkMode ? "text-emerald-400" : "text-emerald-600"} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200">
                                        Assigned to You
                                    </span>
                                </div>
                            </div>
                        ) : selectedChat?.assigned_admin_id ? (
                            <div className={cn("flex items-center justify-between px-4 py-3 rounded-xl border transition-all", isDarkMode ? "bg-[#202c33]/80 border-white/5 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700 shadow-sm")}>
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border", isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-slate-200 text-slate-600 shadow-sm")}>
                                        {selectedChat?.assigned_agent_name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-0.5">Assigned To</span>
                                        <span className={cn("text-xs font-bold", isDarkMode ? "text-white" : "text-slate-900")}>{selectedChat?.assigned_agent_name}</span>
                                    </div>
                                </div>
                                <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                                    <Lock size={12} className={isDarkMode ? "text-slate-400" : "text-slate-500"} />
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    claimChatMutate(selectedChat.contact_id);
                                    // Optimistic update
                                    setSelectedChat((prev: any) => ({
                                        ...prev,
                                        assigned_admin_id: user?.tenant_user_id,
                                        assigned_agent_name: user?.username
                                    }));
                                }}
                                disabled={isClaiming}
                                className={cn(
                                    "w-full h-10 cursor-pointer flex items-center justify-center space-x-2 px-4 rounded-xl text-xs font-bold uppercase transition-all shadow-lg disabled:opacity-50",
                                    isDarkMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30" : "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100"
                                )}
                            >
                                {isClaiming ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                                <span className='text-[11px]'>Claim Lead</span>
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <h4 className={cn("text-[10px] font-bold uppercase tracking-[0.15em] mb-3 opacity-60", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                        Contact Details
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-start gap-4">
                            <span className={cn("text-[11px] shrink-0 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Phone</span>
                            <span className={cn("text-[11px] font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>{selectedChat?.phone}</span>
                        </div>
                        <div className="flex justify-between items-start gap-4">
                            <span className={cn("text-[11px] shrink-0 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>Last Active</span>
                            <span className={cn("text-[11px] font-semibold text-right", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                                {selectedChat?.last_message_time ? getDateLabel(selectedChat.last_message_time) : "N/A"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                    <div className="space-y-3">
                        <button
                            onClick={isNeuralSummaryEnabled ? openNeuralSummarySidebar : undefined}
                            disabled={isSummarizing || !isNeuralSummaryEnabled}
                            title={!isNeuralSummaryEnabled ? "Neural Summary is disabled in settings" : undefined}
                            className={cn(
                                "w-full h-10 flex items-center px-4 rounded-xl text-xs font-bold uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
                                !isNeuralSummaryEnabled
                                    ? (isDarkMode ? "bg-slate-800/50 text-slate-500 border border-white/5" : "bg-slate-100 text-slate-400 border border-slate-200")
                                    : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            )}
                        >
                            {/* Symmetric Spacers */}
                            {!isNeuralSummaryEnabled && <div className="w-4 shrink-0" />}
                            <div className="flex-1 flex items-center justify-center gap-2">
                                {isSummarizing ? (
                                    <Loader2 size={15} className="animate-spin" />
                                ) : (
                                    <Brain size={15} />
                                )}
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
                        <button
                            onClick={() => {
                                const newState = !selectedChat.is_ai_silenced;
                                toggleSilenceAiMutate({ contact_id: selectedChat.contact_id, is_ai_silenced: newState });
                                setSelectedChat((prev: any) => ({ ...prev, is_ai_silenced: newState }));
                            }}
                            disabled={isTogglingSilence}
                            className={cn(
                                "w-full h-10 cursor-pointer flex items-center justify-center space-x-2 px-4 rounded-xl text-xs font-bold uppercase transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50",
                                selectedChat?.is_ai_silenced
                                    ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-400"
                                    : "bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400"
                            )}
                        >
                            {selectedChat?.is_ai_silenced ? (
                                <>
                                    <Bot size={15} />
                                    <span>Unsilence AI</span>
                                </>
                            ) : (
                                <>
                                    <BotOff size={15} />
                                    <span>Silence AI</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};