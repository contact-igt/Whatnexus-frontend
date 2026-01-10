
"use client";

import { useState } from 'react';
import { Brain, ShieldCheck, Sliders, Zap, Activity, Cpu } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { NEURAL_RULES } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";
import { useTheme } from '@/hooks/useTheme';


export const LogicView = () => {
    const {isDarkMode} = useTheme();
    const [isUpdatingPersona, setIsUpdatingPersona] = useState(false);
    const [personaDescription, setPersonaDescription] = useState('Helpful, expert, and efficient SaaS consultant.');
    const [personaResult, setPersonaResult] = useState<string | null>(null);
    const [simQuery, setSimQuery] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [simResult, setSimResult] = useState<string | null>(null);

    const updatePersona = async () => {
        setIsUpdatingPersona(true);
        setPersonaResult(null);
        try {
            const prompt = `Create a system persona description for an AI Receptionist based on this input: "${personaDescription}". 
      Return a set of 3 bullet points defining its tone, key values, and boundary rules.`;
            const result = await callGemini(prompt, "You are a neural architect.");
            setPersonaResult(result);
        } catch (err) {
            setPersonaResult("Error architecting persona.");
        } finally {
            setIsUpdatingPersona(false);
        }
    };

    const simulateLogic = async () => {
        setIsSimulating(true);
        setSimResult(null);
        try {
            const activeRules = NEURAL_RULES.filter(r => r.active).map(r => r.name + ": " + r.description).join('\n');
            const prompt = `Simulate how the neural engine would handle this message based on active logic rules.
      Message: "${simQuery}"
      Rules:\n${activeRules}
      
      Decide: Should it respond or escalate? Why?`;
            const result = await callGemini(prompt, "You are the WhatsNexus Logic Core.");
            setSimResult(result);
        } catch (err) {
            setSimResult("Logic loop failure. Retry simulation.");
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Brain size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Neural Reasoning Layer</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>AI Neural Logic</h1>
                </div>
                <button className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">Save Matrix</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-6 flex items-center space-x-2">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span>Escalation Protocols</span>
                        </h3>
                        <div className="space-y-3">
                            {NEURAL_RULES.map((rule, i) => (
                                <div key={rule.id} className={cn("p-4 rounded-xl border transition-all flex items-center justify-between", isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm')}>
                                    <div className="flex items-center space-x-3">
                                        <div className={cn("p-2 rounded-lg", isDarkMode ? 'bg-white/5' : 'bg-white', rule.active ? 'text-emerald-500' : 'text-slate-500')}>
                                            <rule.icon size={18} />
                                        </div>
                                        <div>
                                            <p className={cn("text-xs font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>{rule.name}</p>
                                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">{rule.description}</p>
                                        </div>
                                    </div>
                                    <button className={cn("w-9 h-5 rounded-full relative transition-all duration-300", rule.active ? 'bg-emerald-600' : 'bg-slate-700')}>
                                        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300", rule.active ? 'right-0.5' : 'left-0.5')} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6 bg-emerald-500/5 border-emerald-500/20">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center space-x-2">
                            <Sliders size={16} className="text-emerald-500" />
                            <span>✨ Persona Architect</span>
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mb-4 leading-relaxed uppercase tracking-wider">Describe the vibe of your receptionist in natural language.</p>
                        <textarea
                            value={personaDescription}
                            onChange={(e) => setPersonaDescription(e.target.value)}
                            className={cn("w-full border-none rounded-xl p-3 text-xs h-20 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all", isDarkMode ? 'bg-black/40 text-white' : 'bg-white shadow-inner text-slate-800 border-slate-200')}
                        />
                        <button
                            onClick={updatePersona}
                            disabled={isUpdatingPersona}
                            className="w-full py-3 mt-4 rounded-xl bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-wide transition-all active:scale-95"
                        >
                            {isUpdatingPersona ? 'RE-PROGRAMMING...' : 'UPDATE BEHAVIOR'}
                        </button>

                        {personaResult && (
                            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center space-x-2 mb-2 text-emerald-500">
                                    <Zap size={12} fill="currentColor" />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Update Live</span>
                                </div>
                                <div className={cn("text-[11px] leading-relaxed font-medium whitespace-pre-wrap", isDarkMode ? 'text-white/80' : 'text-slate-700')}>
                                    {personaResult}
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>

                <div className="space-y-6">
                    <GlassCard isDarkMode={isDarkMode} className="p-6 h-full flex flex-col">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center space-x-2">
                            <Activity size={16} className="text-blue-500" />
                            <span>Logic Simulation</span>
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mb-6 leading-relaxed uppercase tracking-wider">Test an incoming message against your active escalation matrix.</p>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">Simulate Message</p>
                                <textarea
                                    value={simQuery}
                                    onChange={(e) => setSimQuery(e.target.value)}
                                    placeholder="e.g. This is terrible service, I want to talk to a person!"
                                    className={cn("w-full border-none rounded-xl p-4 text-xs h-32 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all", isDarkMode ? 'bg-black/20 text-white' : 'bg-slate-50 shadow-inner text-slate-800 border-slate-200')}
                                />
                                <button
                                    onClick={simulateLogic}
                                    disabled={isSimulating}
                                    className={cn("w-full py-3 rounded-xl font-bold uppercase text-[10px] tracking-wide transition-all active:scale-95 shadow-lg", isDarkMode ? 'bg-white text-black' : 'bg-slate-900 text-white')}
                                >
                                    {isSimulating ? 'RUNNING LOGIC LOOPS...' : '✨ TEST REASONING'}
                                </button>
                            </div>

                            {simResult && (
                                <div className={cn("p-4 rounded-xl border-2 animate-in fade-in zoom-in-95 duration-500", isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-white shadow-xl')}>
                                    <div className="flex items-center space-x-2 mb-2 text-blue-500">
                                        <Cpu size={14} />
                                        <span className="text-[9px] font-bold uppercase tracking-wide">Reasoning Output</span>
                                    </div>
                                    <p className={cn("text-[11px] leading-relaxed font-medium", isDarkMode ? 'text-white/90' : 'text-slate-800')}>
                                        {simResult}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-[9px] font-bold uppercase text-slate-500">Confidence Score</span>
                                        <span className="text-xs font-bold text-emerald-500">98.4%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
