
"use client";

import { useState } from 'react';
import { Filter, Sparkles, Lightbulb, MessageSquare, MoreHorizontal, ClipboardList, X, Brain, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { LEADS } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { callOpenAI } from "@/lib/openai";
import { cn } from "@/lib/utils";
import dayjs from "@/utils/dayjs";
import { useTheme } from '@/hooks/useTheme';
import { useLeadIntelligenceQuery, useSummarizeLeadMutation } from '@/hooks/useLeadIntelligenceQuery';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { WhatsAppConnectionPlaceholder } from './whatsappConfiguration/whatsapp-connection-placeholder';

type SummaryResponse = {
    data: {
        summary: string;
    };
};

export const LeadsView = () => {
    const { isDarkMode } = useTheme();
    const { whatsappApiDetails } = useAuth();
    console.log("whatsappApiDetails", whatsappApiDetails);
    const router = useRouter();

    if (whatsappApiDetails?.status !== 'active') {
        return <WhatsAppConnectionPlaceholder />;
    }

    const { data: leadIntelligenceData, isLoading, isError } = useLeadIntelligenceQuery();
    const summarizeLeadMutation = useSummarizeLeadMutation();
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [insight, setInsight] = useState<{ id: string; text: string } | null>(null);
    const [summarizingId, setSummarizingId] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | any | null>(null);
    const [summaryLeadId, setSummaryLeadId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // const analyzeLead = async (lead: any) => {
    //     setAnalyzingId(lead.id);
    //     try {
    //         const prompt = `Analyze this lead for WhatsNexus (AI Receptionist platform): Name: ${lead.name}, Source: ${lead.source}, Score: ${lead.score}, Status: ${lead.status}. 
    //   Provide a brief, 1-sentence strategic advice for the agent to close this lead. Keep it professional and high-level.`;
    //         const result = await callGemini(prompt, "You are an expert sales strategist.");
    //         setInsight({ id: lead.id, text: result });
    //     } catch (err) {
    //         setInsight({ id: lead.id, text: "Error generating strategy. Try again." });
    //     } finally {
    //         setAnalyzingId(null);
    //     }
    // };

    const summarizeLead = async (e: React.MouseEvent, lead: any) => {
        e.stopPropagation();
        setSummarizingId(lead.contact_id);
        setSummary(null);
        setSummaryLeadId(lead.contact_id);
        const result = await summarizeLeadMutation.mutateAsync({
            id: lead.contact_id,
            phone: lead.phone,
        });
        console.log(result);
        setSummary(result?.data?.summary ?? null)
        setSummaryLeadId(null)
        setSummarizingId(null)
        // const prompt = `Generate a concise summary (max 30 words) for this lead based on their status:
        // Name: ${lead?.name}
        // Score: ${lead?.heat_score}/100
        // Status: ${lead?.heat_state}
        // Last Active: ${formatMessageDate(lead?.last_user_message_at).date}

        // Highlight their engagement level and recommend the next best action.`;

        // const result = await callOpenAI(prompt, "You are a concise sales assistant.");
        // setSummary(result);
    };
    const getHeatStateStyles = (state: string) => {
        switch (state?.toLowerCase()) {
            case 'hot': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'warm': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'cold': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'super_cold': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const formatMessageDate = (dateString: string) => {
        if (!dateString) return { date: '-', time: '' };

        const d = dayjs.utc(dateString).tz('Asia/Kolkata');

        return {
            date: d.format('MMM D'),
            time: d.format('hh:mm A')
        };
    };

    const handleLeadOpen = (leadPhone: string) => {
        router.push(`/chats?phone=${leadPhone}`)
    }
    console.log("summary", summary);
    console.log("summaryLeadId", summaryLeadId);

    const leads = leadIntelligenceData?.data || [];
    const totalPages = Math.ceil(leads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in fade-in duration-700 no-scrollbar pb-32">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Lead Intelligence</h1>
                    <p className={cn("font-medium text-sm mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Qualified audience shards synced from Meta & Website.</p>
                </div>
                <div className="flex space-x-3">
                    <div className={cn("px-4 py-2 flex items-center space-x-2 group cursor-pointer border rounded-xl transition-all", isDarkMode ? 'bg-white/5 border-white/10 hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-emerald-500/50 shadow-sm')}>
                        <Filter size={14} className="text-emerald-500" />
                        <span className={cn("text-xs font-semibold uppercase tracking-wide", isDarkMode ? 'text-white' : 'text-slate-700')}>Filters</span>
                    </div>
                    <button className="h-10 px-5 rounded-xl bg-emerald-600 text-white font-semibold text-xs uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">Sync CRM</button>
                </div>
            </div>

            {/* Summary Overlay */}
            {summary && (
                <div className="fixed inset-x-0 top-24 z-50 flex justify-center pointer-events-none animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="pointer-events-auto">
                        <GlassCard isDarkMode={isDarkMode} className="p-5 border-emerald-500/40 bg-emerald-500/10 shadow-2xl relative rounded-xl max-w-md mx-4 backdrop-blur-xl">
                            <button
                                onClick={() => {
                                    setSummary(null);
                                    setSummaryLeadId(null);
                                }}
                                className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                            <div className="flex items-center space-x-2 mb-2 text-emerald-500">
                                <Brain size={14} className="animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Neural Lead Summary</span>
                            </div>
                            <div className="mb-2">
                                <span className={cn("text-xs font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {leadIntelligenceData?.data?.find((l: any) => l?.contact_id === summaryLeadId)?.name}
                                </span>
                            </div>
                            <p className={cn("text-xs leading-relaxed font-medium", isDarkMode ? 'text-white/90' : 'text-slate-800')}>
                                {summary}
                            </p>
                        </GlassCard>
                    </div>
                </div>
            )}

            <GlassCard isDarkMode={isDarkMode} className="overflow-hidden p-0 rounded-2xl">
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className={cn("text-xs font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/30 bg-white/5' : 'text-slate-400 bg-slate-50')}>
                                    <th className="px-6 py-4 text">Lead Identity</th>
                                    {/* <th className="px-6 py-4">Origin</th> */}
                                    <th className="px-6 py-4 text-center">Neural Score</th>
                                    <th className="px-6 py-4 text-center">Heat State</th>
                                    <th className="px-6 py-4 text-center">User Last Message</th>
                                    <th className="px-6 py-4 text-center">Admin Last Message</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className={cn("animate-pulse", isDarkMode ? 'border-b border-white/5' : 'border-b border-slate-100')}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={cn("w-10 h-10 rounded-xl", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                    <div className="space-y-2">
                                                        <div className={cn("h-3 w-24 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                        <div className={cn("h-2 w-16 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <div className={cn("h-3 w-8 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                    <div className={cn("h-1 w-12 rounded-full", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={cn("h-6 w-20 rounded-lg mx-auto", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="space-y-1 flex flex-col items-center">
                                                    <div className={cn("h-3 w-16 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                    <div className={cn("h-2 w-10 rounded", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <div className={cn("h-8 w-8 rounded-lg", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                    <div className={cn("h-8 w-8 rounded-lg", isDarkMode ? 'bg-white/10' : 'bg-slate-200')} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : !leadIntelligenceData?.data || leadIntelligenceData?.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-24">
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <div className={cn(
                                                    "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border-2",
                                                    isDarkMode
                                                        ? 'bg-emerald-500/10 border-emerald-500/20'
                                                        : 'bg-emerald-50 border-emerald-200'
                                                )}>
                                                    <Filter size={36} className="text-emerald-500" />
                                                </div>
                                                <h3 className={cn(
                                                    "text-xl font-bold mb-2",
                                                    isDarkMode ? 'text-white' : 'text-slate-900'
                                                )}>
                                                    No Leads Found
                                                </h3>
                                                <p className={cn(
                                                    "text-sm font-medium max-w-md",
                                                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                                                )}>
                                                    No lead intelligence data available. Start syncing leads from Meta & Website.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentLeads?.map((lead: any, i: number) => {

                                    // if(lead?.last_admin_reply_at){
                                    //     const { date: adminDate, time: adminTime } = formatMessageDate(lead?.last_admin_reply_at);
                                    // }
                                    return (
                                        <tr key={lead?.contact_id} className={cn("group transition-all hover:bg-emerald-500/5 animate-in slide-in-from-left-4", isDarkMode ? '' : 'hover:bg-slate-50')} style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border", isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-700')}>
                                                        {lead?.name?.charAt(0)?.toUpperCase() ?? "?"}
                                                    </div>
                                                    <div>
                                                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>{lead?.name}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">+{lead?.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* <td className={cn("px-6 py-4 text-xs font-medium uppercase tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{lead.source}</td> */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col justify-center items-center">
                                                    <span className={cn("text-xs font-bold mb-1.5", lead?.score > 80 ? 'text-emerald-500' : 'text-orange-500')}>{lead?.score}</span>
                                                    <div className={cn("h-1 w-12 rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-200')}>
                                                        <div className={cn("h-full rounded-full transition-all duration-[2000ms] ease-out", lead?.score > 80 ? 'bg-emerald-500' : 'bg-orange-500')} style={{ width: `${lead?.score}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border", getHeatStateStyles(lead.heat_state))}>
                                                    {lead?.heat_state}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center min-w-[150px]">
                                                <div className="flex flex-col">
                                                    <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white/90' : 'text-slate-700')}>{formatMessageDate(lead?.last_user_message_at)?.date}</span>
                                                    <span className={cn("text-[10px] uppercase font-medium tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{formatMessageDate(lead?.last_user_message_at)?.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center min-w-[150px]">
                                                {lead?.last_admin_reply_at ? <div className="flex flex-col">
                                                    <span className={cn("text-xs font-semibold", isDarkMode ? 'text-white/90' : 'text-slate-700')}>{formatMessageDate(lead?.last_admin_reply_at)?.date}</span>
                                                    <span className={cn("text-[10px] uppercase font-medium tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-400')}>{formatMessageDate(lead?.last_admin_reply_at)?.time}</span>
                                                </div> : <span className={cn("text-[10px] uppercase font-medium tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-400')}>-</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-center space-x-1 transition-all">
                                                    <button
                                                        onClick={(e) => summarizeLead(e, lead)}
                                                        disabled={summarizingId === lead?.contact_id}
                                                        title="Generate AI Summary"
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors",
                                                            summarizingId === lead?.contact_id
                                                                ? "text-emerald-500 bg-emerald-500/10"
                                                                : "hover:bg-white/10 hover:text-emerald-500 text-slate-400"
                                                        )}
                                                    >
                                                        {summarizingId === lead.contact_id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <ClipboardList size={16} />
                                                        )}
                                                    </button>
                                                    <button onClick={() => handleLeadOpen(lead?.phone)} className="p-2 hover:bg-white/10 rounded-lg hover:text-emerald-500 transition-colors"><MessageSquare size={16} /></button>
                                                    <button className="p-2 hover:bg-white/10 rounded-lg hover:text-rose-500 transition-colors"><MoreHorizontal size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                        <div className={cn(
                            "text-xs font-medium",
                            isDarkMode ? 'text-white/50' : 'text-slate-500'
                        )}>
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, leads.length)} of {leads.length} leads
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className={cn(
                                    "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                    isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                                )}
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={cn(
                                    "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                    isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                                )}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className={cn(
                                "text-xs font-medium px-2",
                                isDarkMode ? 'text-white/70' : 'text-slate-600'
                            )}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={cn(
                                    "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                    isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                                )}
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className={cn(
                                    "p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                    isDarkMode ? 'hover:bg-white/10 text-white/70' : 'hover:bg-slate-100 text-slate-600'
                                )}
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </GlassCard>
            {/* <GlassCard isDarkMode={isDarkMode} className="overflow-hidden p-0 rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className={cn("text-xs font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/30 bg-white/5' : 'text-slate-400 bg-slate-50')}>
                                <th className="px-6 py-4">Lead Identity</th>
                                <th className="px-6 py-4">Origin</th>
                                <th className="px-6 py-4 text-center">Neural Score</th>
                                <th className="px-6 py-4">Heat State</th>
                                <th className="px-6 py-4">Strategy Hub</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                            {LEADS.map((lead, i) => (
                                <tr key={lead.id} className={cn("group transition-all hover:bg-emerald-500/5 animate-in slide-in-from-left-4", isDarkMode ? '' : 'hover:bg-slate-50')} style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border", isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-700')}>
                                                {lead.name[0]}
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-900')}>{lead.name}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wider">{lead.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={cn("px-6 py-4 text-xs font-medium uppercase tracking-wide", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{lead.source}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={cn("text-xs font-bold mb-1.5", lead.score > 80 ? 'text-emerald-500' : 'text-orange-500')}>{lead.score}</span>
                                            <div className={cn("h-1 w-12 rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-200')}>
                                                <div className={cn("h-full rounded-full transition-all duration-[2000ms] ease-out", lead.score > 80 ? 'bg-emerald-500' : 'bg-orange-500')} style={{ width: `${lead.score}%` }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border", lead.status === 'Hot' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20')}>{lead.status}</span>
                                    </td>
                                    <td className="px-6 py-4 min-w-[250px]">
                                        {insight?.id === lead.id ? (
                                            <div className="flex items-start space-x-2 text-xs text-emerald-500 font-medium bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 animate-in fade-in zoom-in-95">
                                                <Sparkles size={14} className="shrink-0 mt-0.5" />
                                                <span>{insight.text}</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => analyzeLead(lead)}
                                                disabled={analyzingId === lead.id}
                                                className={cn("flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg transition-all", isDarkMode ? 'bg-white/5 text-white/40 hover:text-emerald-500 hover:bg-emerald-500/10' : 'bg-slate-50 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50')}
                                            >
                                                {analyzingId === lead.id ? (
                                                    <div className="flex space-x-1">
                                                        <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                                                        <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                        <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Lightbulb size={12} />
                                                        <span>Generate Strategy</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button className="p-2 hover:bg-white/10 rounded-lg hover:text-emerald-500 transition-colors"><MessageSquare size={16} /></button>
                                            <button className="p-2 hover:bg-white/10 rounded-lg hover:text-rose-500 transition-colors"><MoreHorizontal size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard> */}
        </div>
    );
};
