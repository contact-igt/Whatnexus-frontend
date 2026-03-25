"use client";

import React from 'react';
import { Radio, AlertCircle, Users, Building2 } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from '../dashboard/glassStyles';
import type { PlatformLiveOps } from '@/services/superAdminDashboard';

interface PlatformLiveOpsPanelProps {
    isDarkMode?: boolean;
    liveOps?: PlatformLiveOps;
}

export const PlatformLiveOpsPanel = ({ isDarkMode = true, liveOps }: PlatformLiveOpsPanelProps) => {
    const t = tx(isDarkMode);

    if (!liveOps) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Radio size={24} style={{ color: t.micro }} />
                    <p style={{ fontSize: '13px', color: t.secondary }}>No live operations data available</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Active Chats', value: liveOps.activeChatsNow, color: '#10b981', icon: Radio },
        { label: 'Escalations Today', value: liveOps.escalationsToday, color: '#ef4444', icon: AlertCircle },
        { label: 'Total Agents', value: liveOps.totalAgents, color: '#8b5cf6', icon: Users },
    ];

    const utilPct = Math.min(liveOps.agentUtilization || 0, 100);
    const utilColor = utilPct > 80 ? '#ef4444' : utilPct > 50 ? '#f59e0b' : '#10b981';

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            {/* Stat row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="rounded-lg p-3 text-center" style={glassInner(isDarkMode)}>
                            <div className="flex justify-center mb-2">
                                <div className="w-7 h-7 rounded-md flex items-center justify-center"
                                    style={{ background: `${stat.color}15`, color: stat.color, border: `1px solid ${stat.color}25` }}>
                                    <Icon size={14} />
                                </div>
                            </div>
                            <span style={{ fontSize: '18px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums', display: 'block' }}>
                                {stat.value.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: 600, color: t.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {stat.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Agent utilization bar */}
            <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: '11px', fontWeight: 600, color: t.label, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Agent Utilization
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: utilColor, fontVariantNumeric: 'tabular-nums' }}>
                        {utilPct.toFixed(0)}%
                    </span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                    <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${utilPct}%`, background: utilColor }} />
                </div>
            </div>

            {/* Top active tenants */}
            {liveOps.topActiveTenants && liveOps.topActiveTenants.length > 0 && (
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: t.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        Most Active Now
                    </p>
                    <div className="space-y-2">
                        {liveOps.topActiveTenants.map((tenant) => (
                            <div key={tenant.tenantId}
                                className="flex items-center justify-between rounded-lg px-3 py-2"
                                style={glassInner(isDarkMode)}>
                                <div className="flex items-center gap-2">
                                    <Building2 size={12} style={{ color: t.micro }} />
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }} className="truncate max-w-35">
                                        {tenant.companyName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                                        {tenant.activeChats}
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
