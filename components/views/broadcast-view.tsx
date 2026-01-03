
"use client";

import { useState } from 'react';
import { Megaphone, Plus, Wand2, CheckCircle2, Check, Target } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { BROADCAST_CAMPAIGNS, BRAND_NAME } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface BroadcastViewProps {
    isDarkMode: boolean;
}

export const BroadcastView = ({ isDarkMode }: BroadcastViewProps) => {
    const [isDrafting, setIsDrafting] = useState(false);
    const [draftGoal, setDraftGoal] = useState('');
    const [aiDraft, setAiDraft] = useState('');

    const generateDraft = async () => {
        if (!draftGoal) return;
        setIsDrafting(true);
        setAiDraft('');
        try {
            const prompt = `Create a short, high-engagement WhatsApp broadcast message for ${BRAND_NAME} clients. 
      Campaign Goal: ${draftGoal}. 
      Use a friendly but professional tone. Include a clear call to action. Return ONLY the message text.`;
            const result = await callGemini(prompt, "You are a senior copywriter and marketing strategist.");
            setAiDraft(result);
        } catch (err) {
            setAiDraft("Error crafting neural draft. Please try again.");
        } finally {
            setIsDrafting(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Megaphone size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Mass Reach Engine</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Broadcast Center</h1>
                </div>
                <button className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2">
                    <Plus size={16} />
                    <span>Create Campaign</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard isDarkMode={isDarkMode} className="p-0">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center rounded-t-2xl">
                            <h3 className="font-bold uppercase tracking-tight text-sm">Campaign Matrix</h3>
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Global Reach: 19.7k</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead>
                                    <tr className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                        <th className="px-8 py-4">Campaign Name</th>
                                        <th className="px-8 py-4 text-center">Delivery</th>
                                        <th className="px-8 py-4 text-center">Engagement</th>
                                        <th className="px-8 py-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                    {BROADCAST_CAMPAIGNS.map((campaign, i) => (
                                        <tr key={campaign.id} className="group transition-all hover:bg-emerald-500/5">
                                            <td className="px-8 py-5">
                                                <p className={cn("text-sm font-semibold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-800')}>{campaign.name}</p>
                                                <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wide mt-0.5">{campaign.date} • {campaign.sent.toLocaleString()} Units</p>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={cn("text-[10px] font-bold", isDarkMode ? 'text-white' : 'text-slate-700')}>{campaign.delivered}</span>
                                                    <div className={cn("h-1 w-10 rounded-full mt-1.5", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: campaign.delivered }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <div className="flex items-center justify-center space-x-3">
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wide">Read</p>
                                                        <p className={cn("text-[10px] font-bold", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>{campaign.read}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wide">Reply</p>
                                                        <p className={cn("text-[10px] font-bold", isDarkMode ? 'text-blue-400' : 'text-blue-600')}>{campaign.replied}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={cn("text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide border",
                                                    campaign.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        campaign.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse' :
                                                            'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                                )}>{campaign.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard isDarkMode={isDarkMode} className="p-6 bg-emerald-500/5 border-emerald-500/20">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center space-x-2">
                            <Wand2 size={16} className="text-emerald-500" />
                            <span>✨ AI Copilot</span>
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mb-4 leading-relaxed">Describe your campaign goal and let the neural engine craft the perfect outreach shard.</p>

                        <div className="space-y-3">
                            <input
                                type="text"
                                value={draftGoal}
                                onChange={(e) => setDraftGoal(e.target.value)}
                                placeholder="e.g. 20% Discount for New Leads"
                                className={cn("w-full border-none rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all", isDarkMode ? 'bg-black/40 text-white' : 'bg-white shadow-inner text-slate-800 border-slate-200')}
                            />
                            <button
                                onClick={generateDraft}
                                disabled={isDrafting}
                                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-wide transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                            >
                                {isDrafting ? 'CRAFTING...' : 'GENERATE TEMPLATE'}
                            </button>
                        </div>

                        {aiDraft && (
                            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-emerald-500">
                                        <CheckCircle2 size={12} />
                                        <span className="text-[9px] font-bold uppercase tracking-wide">Draft Ready</span>
                                    </div>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(aiDraft) }}
                                        className="text-[9px] font-bold uppercase tracking-wide text-slate-400 hover:text-white"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <div className={cn("p-4 rounded-xl border text-[12px] leading-relaxed font-medium italic", isDarkMode ? 'bg-white/5 border-white/10 text-white/90' : 'bg-white border-slate-100 text-slate-700 shadow-sm')}>
                                    "{aiDraft}"
                                </div>
                                <button className="w-full py-3 rounded-lg bg-white text-black font-bold uppercase text-[9px] tracking-wide hover:bg-emerald-50 transition-all flex items-center justify-center space-x-2">
                                    <Check size={14} />
                                    <span>Use This Content</span>
                                </button>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center space-x-2">
                            <Target size={16} className="text-blue-500" />
                            <span>Targeting Intelligence</span>
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Total Contacts', value: '19,742' },
                                { label: 'Unsubscribe Rate', value: '0.4%' },
                                { label: 'Optimal Send Window', value: '2 PM - 4 PM' },
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{stat.label}</span>
                                    <span className={cn("text-xs font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
