
"use client";

import { useState } from 'react';
import { Upload, FileText, FileSearch, Trash2, Radio, CheckCircle2 } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { KNOWLEDGE_SOURCES } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface KnowledgeViewProps {
    isDarkMode: boolean;
}

export const KnowledgeView = ({ isDarkMode }: KnowledgeViewProps) => {
    const [summarizingId, setSummarizingId] = useState<number | null>(null);
    const [summary, setSummary] = useState<{ id: number; text: string } | null>(null);
    const [testQuery, setTestQuery] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<string | null>(null);

    const summarizeShard = async (source: typeof KNOWLEDGE_SOURCES[0]) => {
        setSummarizingId(source.id);
        try {
            const prompt = `Summarize the following knowledge base shard content for WhatsNexus AI Receptionist. Keep it extremely concise (max 20 words). 
      Shard Name: ${source.name}
      Content: ${source.content}`;
            const result = await callGemini(prompt, "You are a data analyst.");
            setSummary({ id: source.id, text: result });
        } catch (err) {
            setSummary({ id: source.id, text: "Unable to summarize shard." });
        } finally {
            setSummarizingId(null);
        }
    };

    const runTest = async () => {
        if (!testQuery) return;
        setIsTesting(true);
        setTestResult(null);
        try {
            const allContext = KNOWLEDGE_SOURCES.map(s => `${s.name}: ${s.content}`).join('\n');
            const prompt = `Answer this user query based on the following Knowledge Base:\n${allContext}\n\nUser Query: ${testQuery}\n\nIf you don't know, state that information is missing.`;
            const result = await callGemini(prompt, "You are the WhatsNexus AI Receptionist.");
            setTestResult(result);
        } catch (err) {
            setTestResult("Error processing neural query.");
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Radio size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Neural Vector DB</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Knowledge Hub</h1>
                </div>
                <button className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2">
                    <Upload size={16} />
                    <span>Inject Shard</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlassCard isDarkMode={isDarkMode} className="lg:col-span-2 p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? 'text-white/20 bg-white/5' : 'text-slate-400 bg-slate-50')}>
                                    <th className="px-8 py-4">Knowledge Shard</th>
                                    <th className="px-8 py-4">AI Summary</th>
                                    <th className="px-8 py-4 text-center">Status</th>
                                    <th className="px-8 py-4 text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                {KNOWLEDGE_SOURCES.map(source => (
                                    <tr key={source.id} className="group transition-all hover:bg-emerald-500/5">
                                        <td className="px-8 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className={cn("p-2.5 rounded-xl", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                                                    <FileText size={16} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className={cn("text-sm font-semibold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-800')}>{source.name}</p>
                                                    <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wide mt-0.5">{source.tokens} tokens • {source.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            {summary?.id === source.id ? (
                                                <div className="text-[10px] font-medium text-emerald-500 max-w-[200px] animate-in fade-in">
                                                    {summary.text}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => summarizeShard(source)}
                                                    className={cn("text-[9px] font-bold uppercase tracking-wide flex items-center space-x-1.5 transition-colors", isDarkMode ? 'text-white/20 hover:text-emerald-400' : 'text-slate-400 hover:text-emerald-600')}
                                                >
                                                    {summarizingId === source.id ? (
                                                        <div className="flex space-x-1">
                                                            <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                                                            <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <FileSearch size={12} />
                                                            <span>✨ Summarize</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className={cn("text-[9px] font-bold uppercase tracking-wide border px-2 py-1 rounded-lg", source.active ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-slate-500 border-slate-200')}>
                                                {source.active ? 'ACTIVE' : 'IDLE'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <button className="p-2 hover:text-rose-500 text-slate-400"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                <div className="space-y-6">
                    <GlassCard isDarkMode={isDarkMode} className="p-6 bg-emerald-500/5 border-emerald-500/20">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center space-x-2">
                            <Radio size={16} className="text-emerald-500" />
                            <span>✨ Neural Sandbox</span>
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mb-4 leading-relaxed">Ask anything about your business based on the knowledge base shards above.</p>
                        <textarea
                            value={testQuery}
                            onChange={(e) => setTestQuery(e.target.value)}
                            placeholder="e.g. How much is the Enterprise plan?"
                            className={cn("w-full border-none rounded-xl p-4 text-xs h-24 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all", isDarkMode ? 'bg-black/40 text-white placeholder:text-white/20' : 'bg-white shadow-inner text-slate-800 border-slate-200')}
                        />
                        <button
                            onClick={runTest}
                            disabled={isTesting}
                            className="w-full py-3 mt-6 rounded-xl bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-wide transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                            {isTesting ? 'QUERYING MESH...' : '✨ ASK NEURAL HUB'}
                        </button>

                        {testResult && (
                            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-500">
                                <div className="flex items-center space-x-2 mb-2 text-emerald-500">
                                    <CheckCircle2 size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">AI Result</span>
                                </div>
                                <p className={cn("text-[11px] leading-relaxed font-medium", isDarkMode ? 'text-white/90' : 'text-slate-800')}>{testResult}</p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
