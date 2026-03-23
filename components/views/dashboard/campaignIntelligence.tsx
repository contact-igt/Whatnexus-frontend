"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Eye, MessageSquare, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg, fs } from './glassStyles';
import { Campaign } from '@/services/whatsappDashboard';
import { NoDataFound } from './noDataFound';

interface CampaignIntelligenceProps { 
    isDarkMode?: boolean; 
    campaignsData?: Campaign[];
}

const statusColor: Record<string, string> = {
    completed: '#3b82f6',
    running:   '#10b981',
    scheduled: '#f59e0b',
    paused:    '#94a3b8',
};



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

    const activeCampaigns = (campaignsData || []).slice(0, 2);

    return (
        <div className="rounded-xl p-5 border flex flex-col gap-5 h-full transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>Campaign Intelligence</h3>
                </div>
                <button onClick={() => router.push('/campaign')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ fontSize: '12px', fontWeight: 500, color: '#10b981', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    <Plus size={14} /> New
                </button>
            </div>

            <div className="space-y-3 flex-1 flex flex-col justify-center">
                {!campaignsData ? (
                    Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-32 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />)
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
                            <div key={i} onClick={() => router.push('/campaign')}
                                className="rounded-xl p-3.5 flex flex-col gap-3 group cursor-pointer border hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
                                style={{
                                    background: isDarkMode ? '#18181b' : '#fafafa',
                                    borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                    opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(8px)',
                                    transition: `opacity 0.35s ease ${i * 120}ms, transform 0.35s ease ${i * 120}ms`
                                }}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: tagHex }}>
                                            <Send size={14} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: 500, color: t.primary }}>{c.name}</p>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md"
                                                style={{ fontSize: '11px', fontWeight: 500, textTransform: 'capitalize', background: `${tagHex}15`, color: tagHex }}>
                                                {c.status}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} style={{ color: t.micro }} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { icon: <Send size={12} />,        label: 'Audience',  value: c.audience.toLocaleString() },
                                        { icon: <Eye size={12} />,         label: 'Delivered', value: c.delivered.toLocaleString() },
                                        { icon: <MessageSquare size={12} />, label: 'Read R.', value: `${c.readPct}%` },
                                    ].map((m, j) => (
                                        <div key={j} className="p-2 rounded-lg flex flex-col gap-1 border"
                                            style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                            <div className="flex items-center gap-1.5" style={{ color: t.secondary }}>
                                                {m.icon}
                                                <span style={{ fontSize: '11px', fontWeight: 500 }}>{m.label}</span>
                                            </div>
                                            <p style={{ fontSize: '14px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: t.value }}>{m.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>Read Rate Efficiency</span>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>{c.readPct}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                        <div className="h-full rounded-full"
                                            style={{
                                                width: show ? `${c.readPct}%` : '0%',
                                                background: '#10b981',
                                                transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${i * 120 + 200}ms`
                                            }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-auto pt-4 flex items-center justify-between" style={{ borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                <div className="flex items-center gap-1.5 text-emerald-500">
                    <TrendingUp size={14} />
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>Live Campaign Data</span>
                </div>
                <button onClick={() => router.push('/campaign')}
                    className="px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ fontSize: '12px', fontWeight: 500, color: t.primary }}>
                    View All
                </button>
            </div>
        </div>
    );
};
