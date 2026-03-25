"use client";

import React from 'react';
import { Building2, Mail, Calendar, CheckCircle, Clock } from 'lucide-react';
import { glassCard, glassInner, tx } from '../dashboard/glassStyles';

interface RecentTenantsProps {
    isDarkMode?: boolean;
    recentTenants?: any[];
}

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    active: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)', icon: CheckCircle },
    inactive: { bg: 'rgba(244,63,94,0.12)', text: '#fb7185', border: 'rgba(244,63,94,0.25)', icon: Clock },
};

const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
};

export const RecentTenantsList = ({ isDarkMode = true, recentTenants = [] }: RecentTenantsProps) => {
    const t = tx(isDarkMode);

    if (recentTenants.length === 0) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex items-center justify-center py-8">
                    <p style={{ fontSize: '13px', color: t.secondary }}>No recent registrations</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            <div className="space-y-3">
                {recentTenants.map((tenant, i) => {
                    const sc = statusConfig[tenant.status] ?? statusConfig.inactive;
                    const StatusIcon = sc.icon;

                    return (
                        <div key={tenant.tenantId}
                            className="rounded-lg p-3.5 border transition-all hover:scale-[1.01]"
                            style={glassInner(isDarkMode)}>
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: isDarkMode ? 'rgba(139,92,246,0.12)' : '#f5f3ff', border: `1px solid ${isDarkMode ? 'rgba(139,92,246,0.25)' : '#c4b5fd'}` }}>
                                    <Building2 size={15} style={{ color: '#8b5cf6' }} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary }} className="truncate">
                                            {tenant.companyName}
                                        </span>
                                        <span className="px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1"
                                            style={{ fontSize: '9px', fontWeight: 700, background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <StatusIcon size={8} />
                                            {tenant.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-1">
                                            <Mail size={10} style={{ color: t.micro }} />
                                            <span style={{ fontSize: '11px', color: t.secondary }} className="truncate">
                                                {tenant.ownerEmail}
                                            </span>
                                        </div>
                                        {tenant.plan && (
                                            <span className="px-1.5 py-0.5 rounded"
                                                style={{ fontSize: '9px', fontWeight: 600, background: isDarkMode ? 'rgba(59,130,246,0.1)' : '#eff6ff', color: isDarkMode ? '#60a5fa' : '#2563eb' }}>
                                                {tenant.plan}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="shrink-0 flex items-center gap-1">
                                    <Calendar size={10} style={{ color: t.micro }} />
                                    <span style={{ fontSize: '10px', color: t.micro, fontWeight: 500 }}>
                                        {timeAgo(tenant.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
