"use client";

import React from 'react';
import { Radio, Building2 } from 'lucide-react';
import { glassCard, glassInner, tx } from '../dashboard/glassStyles';
import type { PlatformLiveOps } from '@/services/superAdminDashboard';

interface PlatformLiveOpsPanelProps {
    isDarkMode?: boolean;
    liveOps?: PlatformLiveOps;
}

export const PlatformLiveOpsPanel = ({ isDarkMode = true, liveOps }: PlatformLiveOpsPanelProps) => {
    const t = tx(isDarkMode);

    if (!liveOps || !liveOps.topActiveTenants || liveOps.topActiveTenants.length === 0) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Radio size={24} style={{ color: t.micro }} />
                    <p style={{ fontSize: '13px', color: t.secondary }}>No active organizations right now</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            <div className="space-y-2">
                {liveOps.topActiveTenants.map((tenant, idx) => (
                    <div key={tenant.tenantId}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5"
                        style={glassInner(isDarkMode)}>
                        <div className="flex items-center gap-2.5">
                            <span style={{ fontSize: '10px', fontWeight: 700, color: t.micro, width: 16, textAlign: 'center' }}>
                                {idx + 1}
                            </span>
                            <Building2 size={13} style={{ color: t.micro }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }} className="truncate max-w-40">
                                {tenant.companyName}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                                {tenant.activeChats} active
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
