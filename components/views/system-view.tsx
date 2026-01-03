
"use client";

import { useState } from 'react';
import { Shield, ZapOff, Smartphone, Webhook, Server, Eye, ShieldCheck, Lock } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { SYSTEM_LOGS } from "@/lib/data";
import { callGemini } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface SystemGovernanceViewProps {
    isDarkMode: boolean;
}

export const SystemGovernanceView = ({ isDarkMode }: SystemGovernanceViewProps) => {
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditReport, setAuditReport] = useState<string | null>(null);

    const runSystemAudit = async () => {
        setIsAuditing(true);
        setAuditReport(null);
        try {
            const logs = SYSTEM_LOGS.map(l => `[${l.type}] ${l.event} (${l.time})`).join('\n');
            const prompt = `Review these recent system logs for WhatsNexus and provide a high-level security and performance audit summary (max 3 sentences). 
      Logs:\n${logs}
      
      Identify the most critical issue if any exists.`;
            const result = await callGemini(prompt, "You are a cyber-security and system performance auditor.");
            setAuditReport(result);
        } catch (err) {
            setAuditReport("Audit link severed. Retry system check.");
        } finally {
            setIsAuditing(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto no-scrollbar pb-32">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <Shield size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Governance Matrix</span>
                    </div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>System Governance</h1>
                </div>
                <button className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide bg-rose-600 text-white shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2">
                    <ZapOff size={16} />
                    <span>Neural Kill-Switch</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-6 flex items-center space-x-2">
                            <Smartphone size={16} className="text-emerald-500" />
                            <span>Nexus Connectivity</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={cn("p-5 rounded-2xl border", isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100')}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                        <Webhook size={18} />
                                    </div>
                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500 text-white rounded">STABLE</span>
                                </div>
                                <p className={cn("text-xs font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>WhatsApp API Bridge</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-medium">+91 98765 43210</p>
                                <button className="mt-4 text-[9px] font-bold uppercase text-emerald-500 hover:underline">Refresh Session</button>
                            </div>
                            <div className={cn("p-5 rounded-2xl border", isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100')}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                        <Server size={18} />
                                    </div>
                                    <span className="text-[9px] font-bold px-2 py-0.5 bg-blue-500 text-white rounded">LINKED</span>
                                </div>
                                <p className={cn("text-xs font-bold", isDarkMode ? 'text-white' : 'text-slate-800')}>Salesforce Webhook</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 uppercase font-medium">crm.prod.nexus/hook/v4</p>
                                <button className="mt-4 text-[9px] font-bold uppercase text-blue-500 hover:underline">Configuration</button>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-0">
                        <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center rounded-t-2xl">
                            <h3 className="font-bold uppercase tracking-tight text-sm">Audit Persistence</h3>
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">30 Day History</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? 'text-white/20' : 'text-slate-400')}>
                                        <th className="px-8 py-4">Domain</th>
                                        <th className="px-8 py-4">Event Identity</th>
                                        <th className="px-8 py-4">Pulse</th>
                                        <th className="px-8 py-4 text-right">Settings</th>
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", isDarkMode ? 'divide-white/5' : 'divide-slate-100')}>
                                    {SYSTEM_LOGS.map((log) => (
                                        <tr key={log.id} className="group transition-all hover:bg-white/5">
                                            <td className="px-8 py-4">
                                                <span className={cn("text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider",
                                                    log.level === 'Critical' ? 'bg-rose-500/10 text-rose-500' :
                                                        log.level === 'Warning' ? 'bg-orange-500/10 text-orange-500' :
                                                            'bg-emerald-500/10 text-emerald-500'
                                                )}>{log.type}</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <p className={cn("text-[11px] font-medium", isDarkMode ? 'text-white/80' : 'text-slate-700')}>{log.event}</p>
                                            </td>
                                            <td className="px-8 py-4">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{log.time}</p>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button className="p-2 text-slate-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Eye size={16} /></button>
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
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span>✨ Neural Auditor</span>
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 mb-6 leading-relaxed uppercase tracking-wider">Analyze system logs using the reasoning engine to detect architectural friction.</p>

                        <button
                            onClick={runSystemAudit}
                            disabled={isAuditing}
                            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-wide transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                            {isAuditing ? 'CALIBRATING...' : 'RUN NEURAL CHECK'}
                        </button>

                        {auditReport && (
                            <div className="mt-6 p-5 rounded-xl bg-black/40 border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center space-x-2 mb-3 text-emerald-500">
                                    <ShieldCheck size={12} />
                                    <span className="text-[9px] font-bold uppercase tracking-wide">Auditor Insight</span>
                                </div>
                                <div className={cn("text-[11px] leading-relaxed font-medium", isDarkMode ? 'text-white/80' : 'text-slate-300')}>
                                    {auditReport}
                                </div>
                            </div>
                        )}
                    </GlassCard>

                    <GlassCard isDarkMode={isDarkMode} className="p-6">
                        <h3 className="font-bold text-sm uppercase tracking-wide mb-6 flex items-center space-x-2">
                            <Lock size={16} className="text-blue-500" />
                            <span>Governance Protocols</span>
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: "GDPR Anonymization", active: true },
                                { label: "IP Filtering (Level 3)", active: true },
                                { label: "Session Encryption", active: true },
                                { label: "Data Retention (30d)", active: false },
                            ].map((proto, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wide", isDarkMode ? 'text-white/70' : 'text-slate-600')}>{proto.label}</span>
                                    <button className={cn("w-8 h-4.5 rounded-full relative transition-all", proto.active ? 'bg-blue-600' : 'bg-slate-700')}>
                                        <div className={cn("absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all", proto.active ? 'right-0.5' : 'left-0.5')} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 rounded-xl border border-white/10 text-[9px] font-bold uppercase tracking-wide hover:bg-white/5 transition-all">Review Security Key (2FA)</button>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
