
"use client";

import { useState } from 'react';
import { Search, Brain, X, ClipboardList, Info, History as HistoryIcon, Wand2, Plus, Mic, Send, Sparkles } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { MESSAGES_MOCK, CONTACTS_MOCK, AGENTS } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface ChatViewProps {
    isDarkMode: boolean;
    selectedContact: typeof CONTACTS_MOCK[0];
    setSelectedContact: (contact: typeof CONTACTS_MOCK[0]) => void;
}

export const ChatView = ({ isDarkMode, selectedContact, setSelectedContact }: ChatViewProps) => {
    const [messages, setMessages] = useState(MESSAGES_MOCK);
    const [inputValue, setInputValue] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [chatSummary, setChatSummary] = useState<string | null>(null);

    const handleSendMessage = (textOverride: string | null = null) => {
        const text = textOverride || inputValue;
        if (!text.trim()) return;
        const newMessage = {
            id: messages.length + 1,
            sender: 'John Doe',
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'outgoing'
        };
        setMessages([...messages, newMessage]);
        if (!textOverride) setInputValue('');
    };

    const suggestReply = async () => {
        setIsSuggesting(true);
        try {
            const history = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
            const prompt = `Based on this conversation history for WhatsNexus, suggest a professional and helpful short next message to send to ${selectedContact.name}. 
      History:\n${history}\n\nReturn ONLY the message text.`;
            const result = await callGemini(prompt, "You are a professional AI Receptionist for a SaaS platform.");
            setInputValue(result);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSuggesting(false);
        }
    };

    const summarizeChat = async () => {
        setIsSummarizing(true);
        setChatSummary(null);
        try {
            const history = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
            const prompt = `Summarize this conversation between a business AI receptionist and a lead named ${selectedContact.name}. 
      Highlight the key needs of the lead and any pending action items. Keep it under 40 words.
      History:\n${history}`;
            const result = await callGemini(prompt, "You are a concise business analyst.");
            setChatSummary(result);
        } catch (err) {
            setChatSummary("Unable to generate neural brief. Retry sync.");
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="flex h-full p-6 space-x-6 animate-in slide-in-from-right-8 duration-500">
            <GlassCard isDarkMode={isDarkMode} className="w-80 flex flex-col shrink-0 rounded-2xl p-0">
                <div className="p-5 space-y-5 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide text-emerald-500">Shared Hub</span>
                        <div className="flex items-center space-x-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-bold text-slate-400">4 ONLINE</span>
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-500 transition-colors" size={14} />
                        <input type="text" placeholder="Search Threads..." className={cn("w-full border rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20", isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900')} />
                    </div>
                    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                        {['All', 'Assigned', 'Unassigned'].map(f => (
                            <button key={f} className={cn("whitespace-nowrap px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border transition-all", f === 'All' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : (isDarkMode ? 'border-white/10 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50'))}>{f}</button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 space-y-1 no-scrollbar py-4">
                    {CONTACTS_MOCK.map((c, i) => (
                        <button key={c.id} onClick={() => setSelectedContact(c)} className={cn("w-full p-3 rounded-xl flex items-center space-x-3 transition-all duration-200", selectedContact.id === c.id ? (isDarkMode ? 'bg-white/10 shadow-lg' : 'bg-white shadow-md border border-emerald-100') : (isDarkMode ? 'hover:bg-white/5 opacity-60' : 'hover:bg-slate-50 opacity-80'))}>
                            <div className="relative">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border transition-all", selectedContact.id === c.id ? 'scale-105' : '', isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-slate-100 text-slate-600 border-slate-200')}>{c.name[0]}</div>
                                {c.active && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 bg-emerald-500 border-[#151518] shadow-sm shadow-emerald-500/50 animate-pulse" />}
                            </div>
                            <div className="flex-1 text-left truncate">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className={cn("text-xs font-bold block", isDarkMode ? 'text-white' : 'text-slate-900')}>{c.name}</span>
                                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", c.assignedTo ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20')}>{c.assignedTo ? 'AGENT' : 'AI'}</span>
                                </div>
                                <span className={cn("text-[10px] font-medium truncate block", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{c.lastMsg}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </GlassCard>

            <div className="flex-1 flex flex-col space-y-4 min-w-0 relative">
                {/* Chat Summary Overlay */}
                {chatSummary && (
                    <div className="absolute inset-x-8 top-20 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                        <GlassCard isDarkMode={isDarkMode} className="p-5 border-emerald-500/40 bg-emerald-500/10 shadow-2xl relative rounded-xl">
                            <button onClick={() => setChatSummary(null)} className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white">
                                <X size={14} />
                            </button>
                            <div className="flex items-center space-x-2 mb-2 text-emerald-500">
                                <Brain size={14} className="animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Neural Chat Brief</span>
                            </div>
                            <p className={cn("text-xs leading-relaxed font-medium", isDarkMode ? 'text-white/90' : 'text-slate-800')}>
                                {chatSummary}
                            </p>
                        </GlassCard>
                    </div>
                )}

                <GlassCard isDarkMode={isDarkMode} className="p-3 px-6 border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between shrink-0 rounded-xl">
                    <div className="flex items-center space-x-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mb-0.5">Controller</span>
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm shadow-blue-500/30">JD</div>
                                <span className={cn("text-xs font-bold uppercase tracking-wide", isDarkMode ? 'text-white' : 'text-slate-700')}>{selectedContact.assignedTo ? AGENTS.find(a => a.id === selectedContact.assignedTo)?.name : 'Unassigned'}</span>
                            </div>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 mb-0.5">State</span>
                            <div className="flex items-center space-x-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide">Active Monitor</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className={cn("px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border", isDarkMode ? 'bg-black/40 text-white/70 border-white/5 hover:bg-black/60' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>Silence AI</button>
                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">Claim Lead</button>
                    </div>
                </GlassCard>

                <GlassCard isDarkMode={isDarkMode} className="flex-1 flex flex-col min-h-0 relative p-0 overflow-hidden rounded-2xl">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border", isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100')}>{selectedContact.name[0]}</div>
                            <div>
                                <h3 className={cn("font-bold text-sm tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>{selectedContact.name}</h3>
                                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wide mt-0.5">Qualified Lead • Meta Ads</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={summarizeChat}
                                disabled={isSummarizing}
                                className={cn("p-2 rounded-lg transition-all", isSummarizing ? 'animate-pulse text-emerald-500 bg-emerald-500/10' : 'hover:bg-white/5 text-slate-400 hover:text-emerald-500')}
                                title="Neural Chat Summary"
                            >
                                <ClipboardList size={18} />
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><Info size={18} /></button>
                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400"><HistoryIcon size={18} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {messages.map((m, i) => (
                            <div key={m.id} className={cn("flex animate-in slide-in-from-bottom-2 fade-in duration-300", m.type === 'incoming' ? 'justify-start' : 'justify-end')} style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                                <div className="max-w-[70%] group">
                                    <div className={cn("p-3.5 rounded-[1.2rem] text-[13px] leading-relaxed transition-all shadow-sm",
                                        m.type === 'ai'
                                            ? (isDarkMode ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-medium' : 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-medium shadow-emerald-100')
                                            : m.type === 'incoming'
                                                ? (isDarkMode ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-slate-800 border border-slate-200')
                                                : (isDarkMode ? 'bg-blue-600 text-white font-medium' : 'bg-slate-900 text-white font-medium')
                                    )}>
                                        {m.type === 'ai' && (
                                            <div className="flex items-center space-x-1.5 mb-2 text-[9px] font-bold uppercase tracking-wide opacity-80 border-b border-white/20 pb-1.5">
                                                <Sparkles size={10} className="animate-pulse" />
                                                <span>AI Receptionist Layer</span>
                                            </div>
                                        )}
                                        {m.text}
                                    </div>
                                    <p className={cn("text-[9px] font-bold uppercase tracking-wide mt-2 opacity-40", m.type === 'incoming' ? 'text-left' : 'text-right', isDarkMode ? 'text-white' : 'text-slate-900')}>{m.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 shrink-0 relative">
                        <div className="flex justify-start mb-2 space-x-2">
                            <button
                                onClick={suggestReply}
                                disabled={isSuggesting}
                                className={cn("flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all", isSuggesting ? 'opacity-50' : 'hover:scale-105 active:scale-95', isDarkMode ? 'bg-white/5 text-emerald-400 border border-white/10' : 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm')}
                            >
                                {isSuggesting ? (
                                    <span className="animate-pulse">✨ Thinking...</span>
                                ) : (
                                    <>
                                        <Wand2 size={12} />
                                        <span>✨ Suggest Smart Reply</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-[1.5rem] blur opacity-10 transition-opacity duration-500 bg-gradient-to-r from-emerald-600 to-emerald-400 group-focus-within:opacity-40" />
                            <div className={cn("relative border rounded-[1.3rem] p-2 flex items-end space-x-2 transition-all duration-300", isDarkMode ? 'bg-[#1A1A1B] border-white/5 group-focus-within:border-white/20' : 'bg-white border-slate-200 group-focus-within:border-emerald-300 shadow-xl')}>
                                <button className="p-3 transition-all hover:scale-110 text-emerald-500 hover:bg-emerald-500/10 rounded-xl"><Plus size={18} /></button>
                                <textarea
                                    rows={1}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                    placeholder="Type a neural response..."
                                    className={cn("flex-1 bg-transparent border-none focus:ring-0 text-[13px] py-3 resize-none max-h-32 focus:outline-none transition-colors", isDarkMode ? 'text-white placeholder:text-white/20' : 'text-slate-900')}
                                />
                                <div className="flex items-center space-x-1 pb-1">
                                    <button className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors"><Mic size={18} /></button>
                                    <button onClick={() => handleSendMessage()} className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"><Send size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
