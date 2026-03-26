"use client";

import React from 'react';
import { Building2, TrendingUp, MessageCircle, Crown } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from '../dashboard/glassStyles';

interface TopTenantsProps {
    isDarkMode?: boolean;
    topTenants?: any[];
}

const statusColor: Record<string, { bg: string; text: string; border: string }> = {
    active: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
    inactive: { bg: 'rgba(244,63,94,0.12)', text: '#fb7185', border: 'rgba(244,63,94,0.25)' },
};

const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32', '#6366f1', '#8b5cf6'];

export const TopTenantsList = ({ isDarkMode = true, topTenants = [] }: TopTenantsProps) => {
    const t = tx(isDarkMode);
    const maxMessages = topTenants.length > 0 ? topTenants[0].messageCount : 1;

    if (topTenants.length === 0) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex items-center justify-center py-8">
                    <p style={{ fontSize: '13px', color: t.secondary }}>No tenant data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            <div className="space-y-3">
                {topTenants.map((tenant, i) => {
                    const barPct = maxMessages > 0 ? (tenant.messageCount / maxMessages * 100) : 0;
                    const sc = statusColor[tenant.status] ?? statusColor.inactive;

                    return (
                        <div key={tenant.tenantId}
                            className="rounded-lg p-3.5 border transition-all hover:scale-[1.01]"
                            style={glassInner(isDarkMode)}>
                            <div className="flex items-center gap-3">
                                {/* Rank */}
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-sm"
                                    style={{
                                        background: `${rankColors[i]}15`,
                                        color: rankColors[i],
                                        border: `1px solid ${rankColors[i]}30`,
                                    }}>
                                    {i === 0 ? <Crown size={14} /> : `#${i + 1}`}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary }} className="truncate">
                                            {tenant.companyName}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded shrink-0"
                                            style={{ fontSize: '9px', fontWeight: 700, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {tenant.status}
                                        </span>
                                    </div>

                                    {/* Bar */}
                                    <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${barPct}%`, background: rankColors[i] }} />
                                    </div>
                                </div>

                                {/* Message Count */}
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1">
                                        <MessageCircle size={11} style={{ color: t.micro }} />
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                                            {tenant.messageCount.toLocaleString()}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '10px', color: t.micro }}>messages</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
