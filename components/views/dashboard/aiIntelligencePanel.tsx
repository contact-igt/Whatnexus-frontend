"use client";

import React, { useEffect, useState } from 'react';
import { Brain, AlertCircle, BookOpen, Ban, Frown, CheckCircle2 } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg, fs } from './glassStyles';
import { NoDataFound } from './noDataFound';

interface AiPerformanceData {
    autoResolvedPct: number;
    urgentCount: number;
    missingKnowledge: number;
    outOfScope: number;
    sentimentAlerts: number;
    hubStatus: string;
}

interface AIIntelligencePanelProps { 
    isDarkMode?: boolean; 
    aiData?: AiPerformanceData;
}



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
            <div className="rounded-xl p-5 flex flex-col gap-5 h-full border transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <div className="flex items-center gap-2">
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>AI Performance</h3>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <NoDataFound 
                        isDarkMode={isDarkMode}
                        title="No AI Neural Activity"
                        description="Automation metrics and intent analytics will appear as AI handles more chats."
                        icon={<Brain size={36} />}
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
        <div className="rounded-xl p-5 border flex flex-col gap-6 h-full transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: t.primary }}>AI Performance</h3>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors"
                    style={{ 
                        background: isHubActive ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.1)', 
                        color: isHubActive ? '#10b981' : '#94a3b8' 
                    }}>
                    <Brain size={13} />
                    <span style={{ fontSize: '12px', fontWeight: 500 }}>
                        {isHubActive ? 'Hub Active' : 'Hub Offline'}
                    </span>
                </div>
            </div>

            {/* Auto-resolved progress */}
            <div className="space-y-3">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <p style={{ fontSize: '13px', fontWeight: 600, color: t.secondary }}>Auto-Resolved</p>
                        <CheckCircle2 size={24} className="text-emerald-500" style={{ opacity: aiData ? 1 : 0.2 }} />
                    </div>
                    {!aiData ? (
                        <div className="w-20 h-10 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-md" />
                    ) : (
                        <span style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, color: t.primary }}>
                            {aiData.autoResolvedPct}%
                        </span>
                    )}
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                    <div className="h-full rounded-full"
                        style={{
                            width: `${barW}%`,
                            background: '#10b981',
                            transition: 'width 1000ms ease-out 0ms',
                        }} />
                </div>
                <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>
                    Chats resolved without human intervention
                </p>
            </div>

            {/* Alert stat grid */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                {!aiData ? (
                    Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl" />)
                ) : (
                    alertStats.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <div key={i} className="p-3 rounded-xl border flex flex-col gap-3 transition-all"
                                style={{
                                    background: isDarkMode ? '#18181b' : '#fafafa',
                                    borderColor: isDarkMode ? '#27272a' : '#e4e4e7',
                                    opacity: show ? 1 : 0, 
                                    transform: show ? 'translateY(0)' : 'translateY(4px)',
                                    transition: `opacity 0.3s ease ${i * 50 + 100}ms, transform 0.3s ease ${i * 50 + 100}ms`
                                }}>
                                <div className="flex items-center gap-2" style={{ color: s.hex }}>
                                    <Icon size={16} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: t.secondary }}>{s.label}</span>
                                </div>
                                <div>
                                    <p style={{ fontSize: '20px', fontWeight: 600, color: t.primary, lineHeight: 1 }}>{s.value}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
