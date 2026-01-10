
"use client";

import { useState } from 'react';
import { Filter, Sparkles, Lightbulb, MessageSquare, MoreHorizontal } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { LEADS } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';

export const LeadsView = () => {
    const { isDarkMode } = useTheme();
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [insight, setInsight] = useState<{ id: string; text: string } | null>(null);

    const analyzeLead = async (lead: typeof LEADS[0]) => {
        setAnalyzingId(lead.id);
        try {
            const prompt = `Analyze this lead for WhatsNexus (AI Receptionist platform): Name: ${lead.name}, Source: ${lead.source}, Score: ${lead.score}, Status: ${lead.status}. 
      Provide a brief, 1-sentence strategic advice for the agent to close this lead. Keep it professional and high-level.`;
            const result = await callGemini(prompt, "You are an expert sales strategist.");
            setInsight({ id: lead.id, text: result });
        } catch (err) {
            setInsight({ id: lead.id, text: "Error generating strategy. Try again." });
        } finally {
            setAnalyzingId(null);
        }
    };

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

            <GlassCard isDarkMode={isDarkMode} className="overflow-hidden p-0 rounded-2xl">
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
            </GlassCard>
        </div>
    );
};
