"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Eye, MessageSquare, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from './glassStyles';
import { Campaign } from '@/services/whatsappDashboard';

interface CampaignIntelligenceProps { 
    isDarkMode?: boolean; 
    campaignsData?: Campaign[];
}

// status → accent colour mapping
const statusColor: Record<string, string> = {
    completed: '#3b82f6',
    running:   '#10b981',
    scheduled: '#f59e0b',
    paused:    '#94a3b8',
};

import { NoDataFound } from './noDataFound';

export const CampaignIntelligence = ({ isDarkMode = true, campaignsData }: CampaignIntelligenceProps) => {
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();
    
    useEffect(() => { 
        if (campaignsData) {
            const tm = setTimeout(() => setShow(true), 200); 
            return () => clearTimeout(tm); 
        }
    }, [campaignsData]);

    const activeCampaigns = campaignsData || [];

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#14b8a6' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>Campaign Intelligence</span>
                </div>
                <button onClick={() => router.push('/campaign')} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-500 transition-all hover:scale-105"
                    style={glassInner(isDarkMode)}>
                    <Plus size={11} /> New
                </button>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-center">
                {!campaignsData ? (
                    Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-32 w-full sk rounded-xl" />)
                ) : activeCampaigns.length === 0 ? (
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No Active Campaigns"
                        description="Start a broadcast campaign to track metrics and performance."
                        className="bg-transparent border-none shadow-none py-12"
                    />
                ) : (
                    activeCampaigns.map((c, i) => {
                        const tagHex = statusColor[c.status] ?? '#94a3b8';
                        
                        return (
                            <div key={i} onClick={() => router.push('/campaign')} className="rounded-xl p-4 flex flex-col gap-3 group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                                style={{
                                    ...glassInner(isDarkMode), borderLeft: `2px solid ${tagHex}`,
                                    opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)',
                                    transition: `opacity 0.35s ease ${i * 120}ms, transform 0.35s ease ${i * 120}ms`
                                }}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: tagHex }}>
                                            <Send size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black tracking-tight leading-none" style={{ color: t.primary }}>{c.name}</p>
                                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block uppercase tracking-widest"
                                                style={{ background: `${tagHex}20`, color: tagHex, border: `1px solid ${tagHex}30` }}>
                                                {c.status}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={13} style={{ color: t.micro }} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>

                                {/* Stats grid — audience / delivered / readPct */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { icon: <Send size={9} />,        label: 'Audience',  value: c.audience.toLocaleString() },
                                        { icon: <Eye size={9} />,         label: 'Delivered', value: c.delivered.toLocaleString() },
                                        { icon: <MessageSquare size={9} />, label: 'Read Rate', value: `${c.readPct}%` },
                                    ].map((m, j) => (
                                        <div key={j} className="p-2.5 rounded-lg flex flex-col items-center gap-1"
                                            style={{ background: isDarkMode ? 'rgba(0,0,0,0.25)' : 'rgba(15,23,42,0.05)', border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(203,213,225,0.7)'}` }}>
                                            <div style={{ color: t.micro }}>{m.icon}</div>
                                            <p className="text-xs font-black leading-none tabular-nums" style={{ color: t.value }}>{m.value}</p>
                                            <p className="text-[8px] font-bold uppercase tracking-[0.08em]" style={{ color: t.label }}>{m.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Read Rate progress bar */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: t.label }}>Read Rate Efficiency</span>
                                        {/* readPct → append % */}
                                        <span className="text-[9px] font-black text-emerald-500">{c.readPct}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                        <div className="h-full rounded-full"
                                            style={{
                                                width: show ? `${c.readPct}%` : '0%',
                                                background: 'linear-gradient(90deg,#10b981,#34d399)',
                                                boxShadow: '0 0 10px rgba(16,185,129,0.4)',
                                                transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${i * 120 + 200}ms`
                                            }} />
                                    </div>
                                    {/* Reply rate label */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: t.label }}>Reply Rate</span>
                                        {/* replyPct → append % */}
                                        <span className="text-[9px] font-black" style={{ color: '#818cf8' }}>{c.replyPct}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-auto pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${t.divider}` }}>
                <div className="flex items-center gap-1.5 text-emerald-500">
                    <TrendingUp size={11} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Live Campaign Data</span>
                </div>
                <button onClick={() => router.push('/campaign')} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all"
                    style={{ ...glassInner(isDarkMode), color: t.secondary }}>
                    View All
                </button>
            </div>
        </div>
    );
};
