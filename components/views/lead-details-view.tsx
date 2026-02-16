import React from 'react';
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { getHeatStateStyles } from '@/utils/lead-utils';
import dayjs from "@/utils/dayjs";
import {
    ArrowLeft,
    Edit,
    MoreVertical,
    Trash2,
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Shield,
    Globe,
    Clock,
    User,
    Sparkles,
    AlertCircle,
    Check,
    Copy,
    RefreshCw
} from 'lucide-react';
import { useSummarizeLeadMutation } from '@/hooks/useLeadIntelligenceQuery';
import { toast } from 'sonner';

interface LeadDetailsViewProps {
    lead: any;
    isDarkMode: boolean;
    onBack?: () => void;
}

export const LeadDetailsView = ({ lead, isDarkMode, onBack }: LeadDetailsViewProps) => {
    if (!lead) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return dayjs(dateString).format('MMM D, YYYY h:mm A');
    };

    const isSummaryNew = lead.summary_status === 'new';

    const { mutate: summarizeLead, isPending } = useSummarizeLeadMutation();

    const handleRefresh = (e: React.MouseEvent) => {
        e.stopPropagation();
        summarizeLead({ id: lead.lead_id }, {
            onSuccess: () => {
                toast.success("Summary updated successfully");
            }
        });
    };

    const handleCopy = () => {
        if (lead.ai_summary) {
            navigator.clipboard.writeText(lead.ai_summary);
            toast.success("Summary copied to clipboard");
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <GlassCard className="p-6 relative overflow-hidden" isDarkMode={isDarkMode}>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-6">
                    {/* Top Row: Back Button & Actions */}
                    {/* <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                        <button
                            onClick={onBack}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all group",
                                isDarkMode ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                            )}
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Leads
                        </button>

                        <div className="flex items-center gap-2">
                            <button className={cn("p-2 rounded-full transition-all", isDarkMode ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600")} title="Edit Lead">
                                <Edit size={16} />
                            </button>
                            <button className={cn("p-2 rounded-full transition-all", isDarkMode ? "hover:bg-white/10 text-white/40 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600")} title="More Options">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    </div> */}

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center space-x-6">
                            <div className={cn(
                                "w-24 h-24 rounded-2xl flex items-center justify-center font-bold text-4xl shadow-2xl relative overflow-hidden group border",
                                isDarkMode ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-800'
                            )}>
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                {lead.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>

                            <div>
                                <h1 className={cn("text-5xl font-black tracking-tight mb-2",
                                    isDarkMode ? "bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/50" : "text-slate-900"
                                )}>
                                    {lead.name}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5",
                                        getHeatStateStyles(lead.heat_state)
                                    )}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                        {lead.heat_state}
                                    </span>

                                    {isSummaryNew && (
                                        <span className={cn(
                                            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-sm flex items-center gap-1.5",
                                            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        )}>
                                            <Sparkles size={10} className="text-emerald-500" />
                                            New
                                        </span>
                                    )}

                                    <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border", isDarkMode ? "bg-white/5 border-white/10 text-white/40" : "bg-slate-100 border-slate-200 text-slate-500")}>
                                        {lead.lead_stage || 'New'}
                                    </span>

                                    <span className={cn(
                                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1.5",
                                        (lead.priority === 'High' || lead.priority === 'Urgent') ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            (lead.priority === 'Low') ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                                "bg-orange-500/10 text-orange-500 border-orange-500/20" // Default/Medium
                                    )}>
                                        <AlertCircle size={10} />
                                        {lead.priority || 'MD'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Score Card */}
                        <div className={cn(
                            "p-6 rounded-2xl border min-w-[280px] relative overflow-hidden group transition-all hover:shadow-lg",
                            isDarkMode ? "bg-black/20 border-white/10" : "bg-white border-slate-100 shadow-sm"
                        )}>
                            {/* <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                                <Sparkles size={60} />
                            </div> */}

                            <div className="flex justify-between items-end relative z-10 mb-3">
                                <span className={cn("text-xs font-bold uppercase tracking-widest flex items-center gap-2", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                    <Shield size={14} />
                                    Neural Score
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className={cn("text-5xl font-black tracking-tighter", lead.score > 80 ? 'text-emerald-500' : 'text-orange-500')}>
                                        {lead.score}
                                    </span>
                                    <span className={cn("text-sm font-bold opacity-50", isDarkMode ? "text-white" : "text-slate-600")}>/100</span>
                                </div>
                            </div>

                            <div className="relative h-4 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden shadow-inner border border-black/5 dark:border-white/5">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.4)]",
                                        lead.score > 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-orange-600 to-orange-400'
                                    )}
                                    style={{ width: `${lead.score}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Contact & Metadata */}
                <div className="space-y-8 lg:col-span-1">
                    <GlassCard className="p-6 space-y-6" isDarkMode={isDarkMode}>
                        <h3 className={cn("text-sm font-bold uppercase tracking-wide flex items-center gap-2", isDarkMode ? "text-white/90" : "text-slate-800")}>
                            <User size={18} className="text-emerald-500" />
                            Contact Details
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 p-3 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                                <div className={cn("p-2.5 rounded-lg transition-colors group-hover:bg-emerald-500/20 group-hover:text-emerald-500", isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-500")}>
                                    <Phone size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-400")}>Phone</span>
                                    <span className={cn("text-sm font-medium", isDarkMode ? "text-white" : "text-slate-900")}>+{lead.phone}</span>
                                </div>
                            </div>

                            {lead.email && (
                                <div className="flex items-center space-x-4 p-3 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                                    <div className={cn("p-2.5 rounded-lg transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-500", isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-500")}>
                                        <Mail size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-400")}>Email</span>
                                        <span className={cn("text-sm font-medium", isDarkMode ? "text-white" : "text-slate-900")}>{lead.email}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-4 p-3 rounded-xl transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 group">
                                <div className={cn("p-2.5 rounded-lg transition-colors group-hover:bg-purple-500/20 group-hover:text-purple-500", isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-500")}>
                                    <Globe size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "text-white/40" : "text-slate-400")}>Origin</span>
                                    <span className={cn("text-sm font-medium", isDarkMode ? "text-white" : "text-slate-900")}>{lead.origin || lead.source || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-6 space-y-6" isDarkMode={isDarkMode}>
                        <h3 className={cn("text-sm font-bold uppercase tracking-wide flex items-center gap-2", isDarkMode ? "text-white/90" : "text-slate-800")}>
                            <Shield size={18} className="text-emerald-500" />
                            System Info
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Lead ID</span>
                                <span className={cn("text-xs font-mono select-all", isDarkMode ? "text-white/60" : "text-slate-600")}>{lead.lead_id}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Created At</span>
                                <span className={cn("text-xs", isDarkMode ? "text-white/80" : "text-slate-700")}>{formatDate(lead.lead_created_at)}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5">
                                <span className={cn("text-xs font-medium", isDarkMode ? "text-white/40" : "text-slate-400")}>Last User Msg</span>
                                <span className={cn("text-xs", isDarkMode ? "text-white/80" : "text-slate-700")}>{formatDate(lead.last_user_message_at)}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: AI Intelligence & Recent Activity */}
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard className="p-8 relative overflow-hidden group" isDarkMode={isDarkMode}>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className={cn("text-xl font-bold flex items-center gap-3", isDarkMode ? "text-white" : "text-slate-900")}>
                                <Sparkles size={24} className="text-purple-500" />
                                AI Intelligence Summary
                            </h3>
                            {lead.summary_status && (
                                <span className={cn(
                                    "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1.5",
                                    isSummaryNew
                                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                )}>
                                    {isSummaryNew && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                                    {lead.summary_status}
                                </span>
                            )}
                        </div>

                        <div className={cn(
                            "p-5 rounded-xl border relative z-10 flex flex-col gap-4",
                            isDarkMode ? "bg-black/20 border-white/5" : "bg-slate-50 border-slate-100"
                        )}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50 rounded-l-xl" />
                            <p className={cn("text-sm leading-relaxed pl-2", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                {lead.ai_summary || "No summary available yet."}
                            </p>

                            <div className="flex items-center gap-2 self-end">
                                {lead.summary_status?.toLowerCase() === 'new' && (
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isPending}
                                        className={cn(
                                            "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                                            isDarkMode
                                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
                                                : "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 shadow-sm"
                                        )}
                                    >
                                        <RefreshCw size={12} className={cn(isPending && "animate-spin")} />
                                        <span>Update Summary</span>
                                    </button>
                                )}
                                {lead.ai_summary && (
                                    <button
                                        onClick={handleCopy}
                                        className={cn(
                                            "flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all",
                                            isDarkMode
                                                ? "bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                                                : "bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 shadow-sm border border-slate-200"
                                        )}
                                    >
                                        <Copy size={12} />
                                        Copy Summary
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Additional AI Insights if available in payload later */}
                        {lead.internal_notes && (
                            <div className="mt-6 relative z-10">
                                <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-2", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                    <AlertCircle size={12} />
                                    Internal Notes
                                </h4>
                                <div className={cn("p-4 rounded-xl text-sm italic border", isDarkMode ? "bg-orange-500/5 text-orange-200/80 border-orange-500/10" : "bg-orange-50 text-orange-800 border-orange-100")}>
                                    {lead.internal_notes}
                                </div>
                            </div>
                        )}
                    </GlassCard>

                    {/* Recent Activity / Chat UI */}
                    <GlassCard className="flex flex-col h-[400px] max-h-[420px] overflow-hidden p-0 border-0" isDarkMode={isDarkMode}>
                        {/* Header */}
                        <div className={cn(
                            "px-6 py-4 flex items-center justify-between shrink-0 border-b",
                            isDarkMode ? "bg-white/5 border-white/5" : "bg-white border-slate-100"
                        )}>
                            <h3 className={cn("text-lg font-bold flex items-center gap-3", isDarkMode ? "text-white" : "text-slate-900")}>
                                <MessageSquare size={20} className="text-blue-500" />
                                Conversation History
                            </h3>
                            <span className={cn("text-xs px-2 py-1 rounded border", isDarkMode ? "bg-white/5 border-white/10 text-white/40" : "bg-slate-100 border-slate-200 text-slate-400")}>
                                Recent Messages
                            </span>
                        </div>

                        <div
                            className={cn(
                                "flex-1 overflow-y-auto p-6 flex flex-col gap-4 relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                                isDarkMode ? 'bg-[#0b141a]' : 'bg-[#e5ddd5]'
                            )}
                            style={{
                                backgroundImage: isDarkMode
                                    ? 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%230b141a\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23ffffff\' stroke-width=\'0.5\' opacity=\'0.03\' fill=\'none\'/%3E%3C/svg%3E")'
                                    : 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23e5ddd5\'/%3E%3Cpath d=\'M20 20l5 5-5 5m15-10l5 5-5 5\' stroke=\'%23000000\' stroke-width=\'0.5\' opacity=\'0.05\' fill=\'none\'/%3E%3C/svg%3E")'
                            }}
                        >

                            {lead.last_messages && lead.last_messages.length > 0 ? (
                                lead.last_messages.map((msg: any, idx: number) => {
                                    const isBot = msg.sender === 'bot';
                                    return (
                                        <div key={idx} className={cn("flex w-full", isBot ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[80%] rounded-lg shadow-sm relative px-3 py-1.5",
                                                isBot
                                                    ? (isDarkMode ? "bg-[#005c4b] rounded-tr-none" : "bg-[#dcf8c6] rounded-tr-none")
                                                    : (isDarkMode ? "bg-[#202c33] rounded-tl-none" : "bg-white rounded-tl-none")
                                            )}>
                                                {/* Tail */}
                                                <div className={cn(
                                                    "absolute top-0 w-0 h-0 border-[6px] border-transparent",
                                                    isBot
                                                        ? (isDarkMode ? "right-[-6px] border-t-[#005c4b]" : "right-[-6px] border-t-[#dcf8c6]")
                                                        : (isDarkMode ? "left-[-6px] border-t-[#202c33]" : "left-[-6px] border-t-white")
                                                )} />

                                                <p className={cn(
                                                    "text-[13px] leading-relaxed relative z-10",
                                                    isDarkMode ? "text-white/90" : "text-[#111b21]"
                                                )}>
                                                    {msg.message}
                                                </p>

                                                <div className="flex items-center justify-end gap-1 mt-0.5 relative z-10 select-none">
                                                    <span className={cn(
                                                        "text-[10px]",
                                                        isBot
                                                            ? (isDarkMode ? "text-white/60" : "text-slate-500")
                                                            : (isDarkMode ? "text-white/50" : "text-slate-400")
                                                    )}>
                                                        {dayjs(msg.created_at).format('h:mm A')}
                                                    </span>
                                                    {isBot && (
                                                        <div className="flex ml-0.5">
                                                            <Check size={14} className={cn(isDarkMode ? 'text-[#53bdeb]' : 'text-[#53bdeb]')} />
                                                            <Check size={14} className={cn("-ml-2", isDarkMode ? 'text-[#53bdeb]' : 'text-[#53bdeb]')} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center space-y-3 opacity-50">
                                    <MessageSquare size={40} className="text-slate-500" />
                                    <p className="text-sm">No recent conversation history found.</p>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
