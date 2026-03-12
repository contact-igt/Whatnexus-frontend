"use client";

import React, { useEffect, useState } from 'react';
import { ArrowDown, TrendingUp } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from './glassStyles';
import { FunnelRow } from '@/services/whatsappDashboard';

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
        <div className="rounded-2xl p-6 relative overflow-hidden" style={glassCard(isDarkMode)}>
            {isDarkMode && (
                <>
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 70%)' }} />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)' }} />
                </>
            )}
            <div className="relative z-10 flex flex-col gap-5">
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.24em] mb-1.5" style={{ color: t.label }}>Conversion Intelligence</p>
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-xl font-black tracking-tighter" style={{ color: t.value }}>Revenue Funnel</h3>
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-wider"
                                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)' }}>
                                <TrendingUp size={9} /> Sync Live
                            </span>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                <div className="min-h-[400px]">
                    {!funnelData ? (
                         Array.from({ length: 6 }).map((_, i) => (
                             <div key={i} className="mb-4">
                                 <div className="flex gap-4 mb-2"><div className="h-4 w-32 sk rounded" /><div className="ml-auto h-4 w-12 sk rounded" /></div>
                                 <div className="h-[7px] w-full sk rounded-full" />
                             </div>
                         ))
                    ) : (
                        activeSteps.map((step, i) => {
                            const [from, to] = stepGradients[i % stepGradients.length];
                            const barVisible = visibleBars[i];
                            
                            return (
                                <div key={i}>
                                    <div className="flex items-center justify-between py-2.5 px-2 rounded-xl">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0"
                                                style={{ ...glassInner(isDarkMode), color: t.secondary }}>
                                                {i + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black tracking-tight leading-none" style={{ color: t.primary }}>{step.stage}</p>
                                                <p className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: t.label }}>Stage Analytics</p>
                                            </div>
                                        </div>
                                        {/* Right side: count + pctOfPrevious label + dropOff badge */}
                                        <div className="flex items-center gap-3 shrink-0 ml-3 tabular-nums">
                                            <span className="text-base font-black tracking-tighter"
                                                style={{ color: t.value, opacity: barVisible ? 1 : 0, transition: `opacity 0.4s ${i * 0.13}s` }}>
                                                {step.count.toLocaleString()}
                                            </span>
                                            {/* pctOfPrevious → right % label (green) */}
                                            <span className="text-[10px] font-black text-emerald-500"
                                                style={{ opacity: barVisible ? 1 : 0, transition: `opacity 0.4s ${i * 0.13 + 0.1}s` }}>
                                                {step.pctOfPrevious}%
                                            </span>
                                            {/* dropOff → always ≤ 0, red */}
                                            {step.dropOff !== 0 && (
                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                                                    style={{ 
                                                        color: '#f87171', 
                                                        background: 'rgba(248,113,113,0.15)',
                                                        border: '1px solid rgba(248,113,113,0.25)',
                                                        opacity: barVisible ? 1 : 0, 
                                                        transition: `opacity 0.4s ${i * 0.13 + 0.2}s` 
                                                    }}>
                                                    {step.dropOff}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-2 pb-1">
                                        {/* pctOfTotal → bar width */}
                                        <div className="h-[7px] w-full rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                            <div className="h-full rounded-full"
                                                style={{
                                                    width: barVisible ? `${step.pctOfTotal}%` : '0%', 
                                                    background: `linear-gradient(90deg,${from},${to})`,
                                                    boxShadow: barVisible ? `0 0 14px ${from}80` : 'none',
                                                    transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${i * 0.12}s`
                                                }} 
                                            />
                                        </div>
                                    </div>
                                    {i < activeSteps.length - 1 && (
                                        <div className="flex justify-start pl-4 py-0.5">
                                            <ArrowDown size={9} style={{ color: t.micro, opacity: barVisible ? 1 : 0, transition: `opacity 0.3s ${i * 0.13 + 0.3}s` }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Summary — driven by funnelSummary API field */}
                <div className="pt-4 grid grid-cols-3 gap-3" style={{ borderTop: `1px solid ${t.divider}` }}>
                    {!funnelData
                        ? [0, 1, 2].map(i => <div key={i} className="h-12 rounded-xl sk" />)
                        : [
                            { 
                                label: 'Total Reach', 
                                value: funnelSummary?.totalReach?.toLocaleString() ?? activeSteps[0]?.count?.toLocaleString() ?? '0', 
                                color: t.primary 
                            },
                            { 
                                label: 'Conversion Rate', 
                                value: funnelSummary ? `${funnelSummary.conversionRate}%` : `${activeSteps[activeSteps.length-1]?.pctOfTotal || 0}%`,
                                color: '#34d399' 
                            },
                            { 
                                label: 'Revenue Est.', 
                                value: funnelSummary?.revenueEst ?? activeSteps[activeSteps.length-1]?.count?.toLocaleString() ?? '0', 
                                color: '#a78bfa' 
                            },
                        ].map((s, i) => (
                            <div key={i} className="p-2.5 rounded-xl flex flex-col gap-0.5 items-center" style={glassInner(isDarkMode)}>
                                <p className="text-[8px] font-bold uppercase tracking-wider text-center" style={{ color: t.label }}>{s.label}</p>
                                <p className="text-sm font-black tabular-nums tracking-tight" style={{ color: s.color }}>{s.value}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};
