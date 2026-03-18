"use client";

import React, { useEffect, useState } from 'react';
import { Brain, AlertCircle, BookOpen, Ban, Frown, CheckCircle2 } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from './glassStyles';

interface AiPerformanceData {
    autoResolvedPct: number;
    urgentCount: number;
    missingKnowledge: number;
    outOfScope: number;
    sentimentAlerts: number;
    hubStatus: string; // "active"
}

interface AIIntelligencePanelProps { 
    isDarkMode?: boolean; 
    aiData?: AiPerformanceData;
}

import { NoDataFound } from './noDataFound';

export const AIIntelligencePanel = ({ isDarkMode = true, aiData }: AIIntelligencePanelProps) => {
    const [show, setShow] = useState(false);
    const [barW, setBarW] = useState(0);
    const t = tx(isDarkMode);

    useEffect(() => {
        if (aiData) {
            const t1 = setTimeout(() => setShow(true), 150);
            const t2 = setTimeout(() => setBarW(aiData.autoResolvedPct), 400);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [aiData]);

    const hasData = aiData && (aiData.autoResolvedPct > 0 || aiData.urgentCount > 0 || aiData.missingKnowledge > 0 || aiData.outOfScope > 0 || aiData.sentimentAlerts > 0);

    if (aiData && !hasData) {
        return (
            <div className="rounded-2xl p-5 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#10b981' }} />
                        <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>AI Performance</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No AI Neural Activity"
                        description="Automation metrics and intent analytics will appear as AI handles more chats."
                        icon={<Brain size={32} />}
                        className="bg-transparent border-none shadow-none py-12"
                    />
                </div>
            </div>
        );
    }

    const isHubActive = aiData?.hubStatus === 'active';

    const alertStats = aiData ? [
        { label: 'Urgent Messages',    value: aiData.urgentCount,       icon: AlertCircle,  hex: '#f43f5e' },
        { label: 'Missing Knowledge',  value: aiData.missingKnowledge,  icon: BookOpen,     hex: '#3b82f6' },
        { label: 'Out of Scope',       value: aiData.outOfScope,        icon: Ban,          hex: '#f59e0b' },
        { label: 'Negative Sentiment', value: aiData.sentimentAlerts,   icon: Frown,        hex: '#a855f7' },
    ] : [];

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-5 h-full" style={glassCard(isDarkMode)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div style={{ width: 2, height: 14, borderRadius: 9999, background: '#10b981' }} />
                    <span className="text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: t.label }}>AI Performance</span>
                </div>
                {/* hubStatus "active" → green HUB ACTIVE badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                    style={{ 
                        background: isHubActive ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)', 
                        border: `1px solid ${isHubActive ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.25)'}` 
                    }}>
                    <Brain size={10} className={isHubActive ? 'text-emerald-400' : 'text-slate-400'} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isHubActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {isHubActive ? 'Hub Active' : 'Hub Offline'}
                    </span>
                </div>
            </div>

            {/* Auto-resolved progress bar — main metric */}
            <div className="space-y-2.5">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: t.label }}>AI Auto-Resolved</p>
                        {!aiData ? (
                            <div className="w-16 h-9 sk rounded" />
                        ) : (
                            <span className="text-3xl font-black tracking-tighter leading-none tabular-nums" style={{ color: t.value }}>
                                {/* autoResolvedPct is already a % number → just append % */}
                                {aiData.autoResolvedPct}%
                            </span>
                        )}
                    </div>
                    <CheckCircle2 size={28} className="text-emerald-400 mb-1" style={{ opacity: aiData ? 1 : 0.2 }} />
                </div>
                <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                    <div className="h-full rounded-full"
                        style={{
                            width: `${barW}%`,
                            background: 'linear-gradient(90deg, #10b981, #34d399)',
                            boxShadow: '0 0 12px rgba(16,185,129,0.5)',
                            transition: 'width 1000ms cubic-bezier(0.22, 1, 0.36, 1) 0ms',
                        }} />
                </div>
                <p className="text-[9px] font-semibold" style={{ color: t.secondary }}>
                    Chats resolved without human intervention
                </p>
            </div>

            {/* Alert stat grid */}
            <div className="grid grid-cols-2 gap-2">
                {!aiData ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 w-full sk rounded-xl" />)
                ) : (
                    alertStats.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="p-3 rounded-xl flex flex-col gap-2"
                                style={{
                                    ...glassInner(isDarkMode),
                                    opacity: show ? 1 : 0, 
                                    transform: show ? 'translateY(0)' : 'translateY(6px)',
                                    transition: `opacity 0.3s ease ${i * 60 + 200}ms, transform 0.3s ease ${i * 60 + 200}ms`
                                }}>
                                <div className="w-fit p-1.5 rounded-lg" style={{ background: `${s.hex}20`, color: s.hex }}>
                                    <Icon size={12} />
                                </div>
                                <div>
                                    <p className="text-lg font-black tracking-tight leading-none tabular-nums" style={{ color: s.hex }}>{s.value}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: t.label }}>{s.label}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
