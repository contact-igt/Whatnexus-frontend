"use client";

import React from 'react';
import { ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from '../dashboard/glassStyles';
import type { SubscriptionHealth } from '@/services/superAdminDashboard';

interface SubscriptionHealthPanelProps {
    isDarkMode?: boolean;
    subscriptionHealth?: SubscriptionHealth;
}

const statusColors: Record<string, string> = {
    active: '#10b981',
    trial: '#f59e0b',
    expired: '#ef4444',
    cancelled: '#6b7280',
    suspended: '#f97316',
};

export const SubscriptionHealthPanel = ({ isDarkMode = true, subscriptionHealth }: SubscriptionHealthPanelProps) => {
    const t = tx(isDarkMode);

    if (!subscriptionHealth) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <ShieldCheck size={24} style={{ color: t.micro }} />
                    <p style={{ fontSize: '13px', color: t.secondary }}>No subscription data available</p>
                </div>
            </div>
        );
    }

    const distribution = subscriptionHealth.distribution || [];
    const totalSubs = distribution.reduce((sum, d) => sum + d.count, 0);
    const expiringSoon = subscriptionHealth.expiringSoon || [];

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            {/* Distribution bar */}
            {distribution.length > 0 && (
                <div className="mb-5">
                    <p style={{ fontSize: '11px', fontWeight: 600, color: t.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                        Subscription Distribution
                    </p>

                    {/* Stacked bar */}
                    <div className="h-3 w-full rounded-full overflow-hidden flex" style={{ background: trackBg(isDarkMode) }}>
                        {distribution.map((seg) => {
                            const pct = totalSubs > 0 ? (seg.count / totalSubs) * 100 : 0;
                            return (
                                <div key={seg.status}
                                    className="h-full transition-all duration-700"
                                    style={{ width: `${pct}%`, background: statusColors[seg.status] || '#6b7280' }}
                                    title={`${seg.status}: ${seg.count}`} />
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-3">
                        {distribution.map((seg) => (
                            <div key={seg.status} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: statusColors[seg.status] || '#6b7280' }} />
                                <span style={{ fontSize: '11px', fontWeight: 600, color: t.primary, textTransform: 'capitalize' }}>
                                    {seg.status}
                                </span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                                    {seg.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Expiring soon alerts */}
            {expiringSoon.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={13} style={{ color: '#f59e0b' }} />
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Expiring in 7 Days ({expiringSoon.length})
                        </p>
                    </div>
                    <div className="space-y-2">
                        {expiringSoon.map((tenant) => (
                            <div key={tenant.tenantId}
                                className="flex items-center justify-between rounded-lg px-3 py-2.5"
                                style={glassInner(isDarkMode)}>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={13} style={{ color: t.micro }} />
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }} className="truncate max-w-35">
                                        {tenant.companyName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={11} style={{ color: '#f59e0b' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b' }}>
                                        {new Date(tenant.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {expiringSoon.length === 0 && distribution.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                    style={{ background: isDarkMode ? 'rgba(16,185,129,0.08)' : '#ecfdf5', border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.15)' : '#a7f3d0'}` }}>
                    <ShieldCheck size={14} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>No subscriptions expiring soon</span>
                </div>
            )}
        </div>
    );
};
