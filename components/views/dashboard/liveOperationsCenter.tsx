"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, MessageSquareOff, AlertTriangle, UserCheck, ChevronRight } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from './glassStyles';
import { AgentWorkload, HotLead } from '@/services/whatsappDashboard';

interface LiveOperationsCenterProps { 
    isDarkMode?: boolean; 
    liveOpsData?: {
        hotLeads: HotLead[];
        metrics: { unassigned: number; escalated: number };
        agentWorkload: AgentWorkload[];
    };
}

// Colours cycling for agent bars
const agentColors = [
    { from: '#10b981', to: '#14b8a6', dot: '#22c55e' },
    { from: '#6366f1', to: '#8b5cf6', dot: '#f59e0b' },
    { from: '#3b82f6', to: '#6366f1', dot: '#64748b' },
    { from: '#f59e0b', to: '#f97316', dot: '#fbbf24' },
    { from: '#a855f7', to: '#c084fc', dot: '#c084fc' },
];

import { NoDataFound } from './noDataFound';

export const LiveOperationsCenter = ({ isDarkMode = true, liveOpsData }: LiveOperationsCenterProps) => {
    const [bars, setBars] = useState(false);
    const [show, setShow] = useState(false);
    const t = tx(isDarkMode);
    const router = useRouter();

    useEffect(() => {
        const t1 = setTimeout(() => setShow(true), 100);
        const t2 = setTimeout(() => setBars(true), 200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [liveOpsData]);

    const hasData = liveOpsData && (liveOpsData.hotLeads.length > 0 || liveOpsData.metrics.unassigned > 0 || liveOpsData.metrics.escalated > 0);

    if (liveOpsData && !hasData) {
        return (
            <div className="rounded-2xl p-5 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#f43f5e' }} />
                        <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>Live Operations</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="Quiet Operations"
                        description="No urgent leads or escalated chats detected at the moment."
                        icon={<Flame size={32} />}
                        className="bg-transparent border-none shadow-none py-12"
                    />
                </div>
            </div>
        );
    }

    const topLead = liveOpsData?.hotLeads?.[0];
    const agentWorkload = liveOpsData?.agentWorkload ?? [];

    // Heat chip colour: hot → orange-red, warm → amber
    const heatChipStyle = (heatState?: string) => {
        const isHot = heatState === 'hot';
        const hex = isHot ? '#f97316' : '#f59e0b';
        return { background: `${hex}18`, border: `1px solid ${hex}30`, color: hex };
    };

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-5" style={glassCard(isDarkMode)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#f43f5e' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>Live Operations</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                    style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.25)' }}>
                    <div className="relative w-2 h-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute inset-[1px] z-10" />
                        <div className="absolute inset-0 rounded-full animate-live-ring" style={{ background: '#f43f5e', opacity: 0.7 }} />
                    </div>
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Live</span>
                </div>
            </div>

            {/* Hot Lead card */}
            <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-orange-400">
                    <Flame size={12} className="fill-orange-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Urgent Priority</span>
                    <span className="ml-auto text-[8px] font-black px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', color: '#f97316' }}>
                        Score {topLead?.score ?? 0}
                    </span>
                </div>
                {!liveOpsData ? (
                    <div className="h-16 w-full sk rounded-xl" />
                ) : topLead ? (
                    <div onClick={() => router.push(topLead.phone ? `/shared-inbox?phone=${topLead.phone}` : '/shared-inbox')} className="p-3.5 rounded-xl flex items-center justify-between group cursor-pointer"
                        style={{ ...glassInner(isDarkMode), opacity: show ? 1 : 0, transition: 'opacity 0.4s ease 0.1s' }}>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg"
                                style={{ background: 'linear-gradient(135deg,#10b981,#14b8a6)' }}>
                                {topLead.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight leading-none" style={{ color: t.primary }}>{topLead.name}</p>
                                <p className="text-[10px] font-semibold text-slate-500 mt-1">{topLead.phone}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {/* status chip — coloured by heatState */}
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                                        style={heatChipStyle(topLead.heatState)}>
                                        {topLead.status}
                                    </span>
                                    {/* waiting — pre-formatted, render as-is */}
                                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: t.label }}>
                                        Waiting {topLead.waiting}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={14} style={{ color: t.micro }} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                ) : (
                    <div className="p-4 rounded-xl flex items-center justify-center text-[10px] uppercase font-black tracking-widest opacity-40 border border-dashed border-white/10">
                        No Urgent Leads
                    </div>
                )}
            </div>

            {/* Status tiles — unassigned / escalated */}
            <div className="grid grid-cols-2 gap-2">
                {[
                    { icon: <MessageSquareOff size={13} />, label: 'Unassigned', count: liveOpsData?.metrics.unassigned ?? 0, hex: '#f59e0b' },
                    { icon: <AlertTriangle size={13} />, label: 'Escalated', count: liveOpsData?.metrics.escalated ?? 0, hex: '#f43f5e' },
                ].map((tile, i) => (
                    <div key={i} className="p-3 rounded-xl flex flex-col gap-2"
                        style={{ background: `${tile.hex}18`, border: `1px solid ${tile.hex}30` }}>
                        <div className="w-fit p-1.5 rounded-lg" style={{ background: `${tile.hex}20`, color: tile.hex }}>
                            {tile.icon}
                        </div>
                        <div>
                            <p className="text-lg font-black leading-none" style={{ color: tile.hex }}>{tile.count}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: t.label }}>{tile.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Agent Workload — from API agentWorkload array */}
            <div className="space-y-3">
                <div className="flex items-center gap-1.5" style={{ color: '#818cf8' }}>
                    <UserCheck size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Agent Workload</span>
                </div>
                {!liveOpsData ? (
                    Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 w-full sk rounded-lg" />)
                ) : agentWorkload.length === 0 ? (
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center py-3">No active agents</p>
                ) : (
                    agentWorkload.map((a, i) => {
                        const c = agentColors[i % agentColors.length];
                        return (
                            <div key={i} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
                                        <span className="text-[11px] font-bold" style={{ color: t.secondary }}>{a.name}</span>
                                    </div>
                                    {/* chatCount → append " chats" */}
                                    <span className="text-[10px] font-black text-emerald-500">{a.chatCount} chats</span>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                    <div className="h-full rounded-full"
                                        style={{
                                            // percentage field → bar fill width
                                            width: bars ? `${a.percentage}%` : '0%',
                                            background: `linear-gradient(90deg,${c.from},${c.to})`,
                                            boxShadow: `0 0 8px ${c.from}60`,
                                            transition: `width 800ms cubic-bezier(0.22,1,0.36,1) ${i * 100}ms`
                                        }} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
