"use client";

import React, { useEffect, useState } from 'react';
import { ArrowDown, TrendingUp } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg, fs } from './glassStyles';
import { FunnelRow } from '@/services/whatsappDashboard';
import { Layers3 } from 'lucide-react';
import { NoDataFound } from './noDataFound';

interface FunnelSummary {
    totalReach: number;
    conversionRate: number;
    revenueEst: string;
}

interface ConversionFunnelProps { 
    isDarkMode?: boolean; 
    funnelData?: FunnelRow[];
    funnelSummary?: FunnelSummary;
}

const stepGradients = [
    ['#10b981', '#34d399'], ['#14b8a6', '#10b981'], ['#06b6d4', '#14b8a6'],
    ['#3b82f6', '#06b6d4'], ['#6366f1', '#3b82f6'], ['#8b5cf6', '#6366f1'],
];



export const ConversionFunnel = ({ isDarkMode = true, funnelData, funnelSummary }: ConversionFunnelProps) => {
    const [phase, setPhase] = useState<'loading' | 'ready'>('loading');
    const [visibleBars, setVisibleBars] = useState<boolean[]>([]);
    const t = tx(isDarkMode);

    useEffect(() => {
        if (funnelData) {
            setPhase('ready');
            setVisibleBars(funnelData.map(() => false));
            funnelData.forEach((_, i) => {
                setTimeout(() => setVisibleBars(prev => { 
                    const n = [...prev]; 
                    n[i] = true; 
                    return n; 
                }), 80 + i * 130);
            });
        }
    }, [funnelData]);

    const activeSteps = funnelData || [];

    return (
        <div className="rounded-xl p-6 border transition-all" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: t.secondary, marginBottom: 4 }}>
                            Conversion Intelligence
                        </p>
                        <div className="flex items-center gap-3">
                            <h3 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.02em', color: t.value }}>Revenue Funnel</h3>
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border"
                                style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', background: isDarkMode ? 'rgba(16,185,129,0.1)' : '#ecfdf5', borderColor: isDarkMode ? 'rgba(16,185,129,0.2)' : '#d1fae5' }}>
                                <TrendingUp size={11} /> Sync Live
                            </span>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div className="min-h-[380px] flex flex-col justify-center">
                    {!funnelData ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="mb-5">
                                <div className="flex gap-4 mb-2"><div className="h-5 w-36 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /><div className="ml-auto h-5 w-16 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" /></div>
                                <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-full" />
                            </div>
                        ))
                    ) : funnelData.length === 0 ? (
                        <NoDataFound 
                            isDarkMode={isDarkMode}
                            title="No Funnel Data"
                            description="Revenue and conversion flows will appear here once leads progress."
                            icon={<Layers3 size={32} />}
                            className="bg-transparent border-none shadow-none"
                        />
                    ) : (
                        activeSteps.map((step, i) => {
                            const [from, to] = stepGradients[i % stepGradients.length];
                            const barVisible = visibleBars[i];
                            
                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between py-2 px-1">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border"
                                                style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#3f3f46' : '#d4d4d8', fontSize: '12px', fontWeight: 600, color: t.secondary }}>
                                                {i + 1}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <p style={{ fontSize: '14px', fontWeight: 500, color: t.primary }}>{step.stage}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 600, color: t.value, opacity: barVisible ? 1 : 0, transition: `opacity 0.4s ${i * 0.13}s` }}>
                                                {step.count.toLocaleString()}
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#10b981', opacity: barVisible ? 1 : 0, transition: `opacity 0.4s ${i * 0.13 + 0.1}s`, minWidth: '40px', textAlign: 'right' }}>
                                                {step.pctOfPrevious}%
                                            </span>
                                            {step.dropOff !== 0 && (
                                                <span className="px-1.5 py-0.5 rounded border"
                                                    style={{ 
                                                        fontSize: '11px', fontWeight: 600,
                                                        color: '#ef4444', 
                                                        background: isDarkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                                                        borderColor: isDarkMode ? 'rgba(239,68,68,0.2)' : '#fee2e2',
                                                        opacity: barVisible ? 1 : 0, 
                                                        transition: `opacity 0.4s ${i * 0.13 + 0.2}s` 
                                                    }}>
                                                    -{step.dropOff}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-1 pb-1">
                                        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                            <div className="h-full rounded-full"
                                                style={{
                                                    width: barVisible ? `${step.pctOfTotal}%` : '0%', 
                                                    background: from,
                                                    transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    {i < activeSteps.length - 1 && (
                                        <div className="flex justify-start pl-4 py-1">
                                            <ArrowDown size={12} style={{ color: t.micro, opacity: barVisible ? 1 : 0, transition: `opacity 0.3s ${i * 0.13 + 0.3}s` }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Summary */}
                <div className="pt-4 grid grid-cols-3 gap-3" style={{ borderTop: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}` }}>
                    {!funnelData
                        ? [0, 1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)
                        : [
                            { 
                                label: 'Total Reach', 
                                value: funnelSummary?.totalReach?.toLocaleString() ?? activeSteps[0]?.count?.toLocaleString() ?? '0', 
                                color: t.primary 
                            },
                            { 
                                label: 'Conversion Rate', 
                                value: funnelSummary ? `${funnelSummary.conversionRate}%` : `${activeSteps[activeSteps.length-1]?.pctOfTotal || 0}%`,
                                color: '#10b981' 
                            },
                            { 
                                label: 'Revenue Est.', 
                                value: funnelSummary?.revenueEst ?? activeSteps[activeSteps.length-1]?.count?.toLocaleString() ?? '0', 
                                color: isDarkMode ? '#a78bfa' : '#8b5cf6' 
                            },
                        ].map((s, i) => (
                            <div key={i} className="p-3 rounded-xl flex flex-col justify-center border" style={{ background: isDarkMode ? '#18181b' : '#fafafa', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                                <p style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{s.label}</p>
                                <p style={{ fontSize: '18px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', color: s.color, marginTop: 2 }}>{s.value}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};
