"use client";

import React from 'react';
import { Building2, MessageCircle, UserPlus, CreditCard, AlertTriangle } from 'lucide-react';
import { glassCard, glassInner, tx } from '../dashboard/glassStyles';
import type { PlatformActivityEvent } from '@/services/superAdminDashboard';

interface PlatformActivityFeedProps {
    isDarkMode?: boolean;
    activity?: PlatformActivityEvent[];
}

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
    success: { color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.20)' },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)' },
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)' },
    info: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.20)' },
};

const eventIcons: Record<string, React.ElementType> = {
    new_tenant: Building2,
    new_user: UserPlus,
    payment: CreditCard,
    message_spike: MessageCircle,
    alert: AlertTriangle,
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

export const PlatformActivityFeed = ({ isDarkMode = true, activity = [] }: PlatformActivityFeedProps) => {
    const t = tx(isDarkMode);

    if (activity.length === 0) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex items-center justify-center py-8">
                    <p style={{ fontSize: '13px', color: t.secondary }}>No recent activity</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            <div className="space-y-2.5">
                {activity.map((evt, i) => {
                    const sev = severityConfig[evt.severity] || severityConfig.info;
                    const Icon = eventIcons[evt.type] || Building2;

                    return (
                        <div key={i} className="flex items-start gap-3 rounded-lg p-3 transition-all hover:scale-[1.005]" style={glassInner(isDarkMode)}>
                            {/* Icon */}
                            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: sev.bg, color: sev.color, border: `1px solid ${sev.border}` }}>
                                <Icon size={13} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }}>
                                        {evt.event}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded shrink-0"
                                        style={{
                                            fontSize: '9px', fontWeight: 700,
                                            background: sev.bg, color: sev.color,
                                            border: `1px solid ${sev.border}`,
                                            textTransform: 'uppercase', letterSpacing: '0.04em',
                                        }}>
                                        {evt.severity}
                                    </span>
                                </div>
                                <p style={{ fontSize: '11px', color: t.secondary, marginTop: 2 }} className="truncate">
                                    {evt.detail}
                                </p>
                            </div>

                            {/* Time */}
                            <span style={{ fontSize: '10px', fontWeight: 500, color: t.micro, whiteSpace: 'nowrap' }} className="shrink-0">
                                {timeAgo(evt.time)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
