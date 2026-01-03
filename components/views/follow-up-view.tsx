
"use client";

import { useState } from 'react';
import { Timer, ToggleRight, MessageCircle, Phone, Mail, Sparkles, History } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { FOLLOW_UPS_MOCK } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface FollowUpHubViewProps {
    isDarkMode: boolean;
}

export const FollowUpHubView = ({ isDarkMode }: FollowUpHubViewProps) => {
    const [selectedLead, setSelectedLead] = useState<typeof FOLLOW_UPS_MOCK[0] | null>(null);
    const [isPlanning, setIsPlanning] = useState(false);
    const [planResult, setPlanResult] = useState<string | null>(null);

    const generateFollowup = async (lead: typeof FOLLOW_UPS_MOCK[0]) => {
        setSelectedLead(lead);
        setIsPlanning(true);
        setPlanResult(null);
        try {
            const prompt = `Lead Profile: Name: ${lead.leadName}, Score: ${lead.score}, Status: ${lead.status}. 
      Task: Create a highly personalized, friendly WhatsApp follow-up message to re-engage this lead for WhatsNexus. Include a clear call to action. Return ONLY the message.`;
            const result = await callGemini(prompt, "You are a personalized sales outreach expert.");
            setPlanResult(result);
        } catch (err) {
            setPlanResult("Neural planning interrupted. Try again.");
        } finally {
            setIsPlanning(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Timer size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Persistence Core</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Follow-up Hub</h1>
                </div>
                <div className="flex space-x-3">
                    <GlassCard isDarkMode={isDarkMode} className="px-4 py-2 flex items-center space-x-3 rounded-xl p-0">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Auto-Persistence</span>
                        <ToggleRight className="text-emerald-500" />
                    </GlassCard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard isDarkMode={isDarkMode} className="p-0">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-2xl">
                            <h3 className="font-bold uppercase tracking-tight text-sm">Engagement Timeline</h3>
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">4 Pending Shards</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? 'text-white/20' : 'text-slate-400')}>
                                        <th className="px-8 py-4">Lead</th>
                                        <th className="px-8 py-4">Window</th>
                                        <th className="px-8 py-4 text-center">Channel</th>
                                        <th className="px-8 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                    {FOLLOW_UPS_MOCK.map((item, i) => (
                                        <tr key={item.id} className="group transition-all hover:bg-emerald-500/5">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[10px] border", isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100')}>{item.leadName[0]}</div>
                                                    <p className={cn("text-sm font-semibold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-800')}>{item.leadName}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{item.time}</p>
                                            </td>
                                            <td className="px-8 py-4 text-center">
                                                <div className="flex justify-center">
                                                    {item.type === 'WhatsApp' ? <MessageCircle size={14} className="text-emerald-500" /> : item.type === 'Call' ? <Phone size={14} className="text-blue-500" /> : <Mail size={14} className="text-orange-500" />}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button
                                                    onClick={() => generateFollowup(item)}
                                                    className={cn("text-[8px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider border transition-all",
                                                        item.status === 'Overdue' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20' :
                                                            item.status === 'Due Today' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    )}
                                                >
                                                    {item.status}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard isDarkMode={isDarkMode} className="p-6 bg-emerald-500/5 border-emerald-500/20 h-full flex flex-col">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center space-x-2">
                            <Sparkles size={16} className="text-emerald-500" />
                            <span>✨ AI Follow-up Planner</span>
                        </h3>

                        {!selectedLead ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                                <History size={32} className="mb-3" />
                                <p className="text-[10px] font-bold uppercase tracking-wide">Select a lead to generate strategy</p>
                            </div>
                        ) : (
                            <div className="space-y-5 flex-1 animate-in fade-in zoom-in-95 duration-500">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wide mb-1">Lead Targeting</p>
                                    <div className="flex justify-between items-center">
                                        <span className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>{selectedLead.leadName}</span>
                                        <span className="text-[10px] font-bold text-emerald-500">Score: {selectedLead.score}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => generateFollowup(selectedLead)}
                                    disabled={isPlanning}
                                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-wide transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                                >
                                    {isPlanning ? 'SYNTHESIZING...' : 'GENERATE PERSONALIZED MESSAGE'}
                                </button>

                                {planResult && (
                                    <div className="mt-4 space-y-3">
                                        <div className={cn("p-4 rounded-xl border text-xs leading-relaxed font-medium italic", isDarkMode ? 'bg-black/40 border-white/5 text-white/90' : 'bg-white border-slate-100 text-slate-700 shadow-sm')}>
                                            "{planResult}"
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button className="py-2.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all">Schedule Msg</button>
                                            <button className="py-2.5 rounded-lg bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider hover:scale-105 transition-all">Send Now</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
