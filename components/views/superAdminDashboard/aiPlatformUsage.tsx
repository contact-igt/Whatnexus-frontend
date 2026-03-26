"use client";

import React from 'react';
import { Brain, Cpu, Building2 } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from '../dashboard/glassStyles';
import type { AiUsage } from '@/services/superAdminDashboard';

interface AiPlatformUsageProps {
    isDarkMode?: boolean;
    aiUsage?: AiUsage;
}

const modelColors: Record<string, string> = {
    'gpt-4': '#8b5cf6',
    'gpt-4o': '#6366f1',
    'gpt-4o-mini': '#a78bfa',
    'gpt-3.5-turbo': '#10b981',
    'gemini-pro': '#f59e0b',
    'gemini-1.5-flash': '#f97316',
    'claude-3': '#ec4899',
};

function getModelColor(model: string): string {
    const lower = model.toLowerCase();
    for (const [key, color] of Object.entries(modelColors)) {
        if (lower.includes(key)) return color;
    }
    return '#6366f1';
}

export const AiPlatformUsage = ({ isDarkMode = true, aiUsage }: AiPlatformUsageProps) => {
    const t = tx(isDarkMode);

    if (!aiUsage) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Brain size={24} style={{ color: t.micro }} />
                    <p style={{ fontSize: '13px', color: t.secondary }}>No AI usage data available</p>
                </div>
            </div>
        );
    }

    const maxTokens = Math.max(...(aiUsage.byModel?.map(m => m.totalTokens) || []), 1);

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            {/* Summary header */}
            <div className="flex items-center gap-4 mb-5 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.25)' }}>
                        <Brain size={16} />
                    </div>
                    <div>
                        <span style={{ fontSize: '20px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                            {(aiUsage.totalTokens || 0).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '11px', color: t.secondary, marginLeft: 6 }}>tokens</span>
                    </div>
                </div>
                <div className="px-2.5 py-1 rounded-md"
                    style={{ background: isDarkMode ? 'rgba(16,185,129,0.1)' : '#ecfdf5', border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.2)' : '#a7f3d0'}` }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>
                        ₹{(aiUsage.totalCost || 0).toLocaleString()} cost
                    </span>
                </div>
            </div>

            {/* Usage by model */}
            {aiUsage.byModel && aiUsage.byModel.length > 0 && (
                <div className="mb-5">
                    <p style={{ fontSize: '11px', fontWeight: 600, color: t.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        By Model
                    </p>
                    <div className="space-y-2.5">
                        {aiUsage.byModel.map((model) => {
                            const pct = maxTokens > 0 ? (model.totalTokens / maxTokens) * 100 : 0;
                            const color = getModelColor(model.model);
                            return (
                                <div key={model.model} className="rounded-lg p-3" style={glassInner(isDarkMode)}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Cpu size={12} style={{ color }} />
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }}>
                                                {model.model}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                                            {model.totalTokens.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, background: color }} />
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span style={{ fontSize: '10px', color: t.micro }}>
                                            In: {model.inputTokens.toLocaleString()}
                                        </span>
                                        <span style={{ fontSize: '10px', color: t.micro }}>
                                            Out: {model.outputTokens.toLocaleString()}
                                        </span>
                                        <span style={{ fontSize: '10px', color: '#10b981' }}>
                                            ₹{model.cost.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Top consumers */}
            {aiUsage.topConsumers && aiUsage.topConsumers.length > 0 && (
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: t.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        Top Consumers
                    </p>
                    <div className="space-y-2">
                        {aiUsage.topConsumers.map((tenant, i) => (
                            <div key={tenant.tenantId}
                                className="flex items-center justify-between rounded-lg px-3 py-2"
                                style={glassInner(isDarkMode)}>
                                <div className="flex items-center gap-2">
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: t.micro, width: 18, textAlign: 'center' }}>
                                        {i + 1}
                                    </span>
                                    <Building2 size={12} style={{ color: t.micro }} />
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }} className="truncate max-w-30">
                                        {tenant.companyName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: t.secondary, fontVariantNumeric: 'tabular-nums' }}>
                                        {tenant.tokensUsed.toLocaleString()} tokens
                                    </span>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                                        ₹{tenant.cost.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
