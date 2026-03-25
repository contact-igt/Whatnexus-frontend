"use client";

import React from 'react';
import { DollarSign, TrendingUp, Building2 } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from '../dashboard/glassStyles';
import type { RevenueData } from '@/services/superAdminDashboard';

interface RevenueIntelligenceProps {
    isDarkMode?: boolean;
    revenue?: RevenueData;
}

const categoryColors: Record<string, string> = {
    subscription: '#8b5cf6',
    recharge: '#10b981',
    add_on: '#f59e0b',
    other: '#6366f1',
};

export const RevenueIntelligence = ({ isDarkMode = true, revenue }: RevenueIntelligenceProps) => {
    const t = tx(isDarkMode);

    if (!revenue) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <DollarSign size={24} style={{ color: t.micro }} />
                    <p style={{ fontSize: '13px', color: t.secondary }}>No revenue data available</p>
                </div>
            </div>
        );
    }

    const totalRevenue = revenue.totalRevenue || 0;

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            {/* Total revenue header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <DollarSign size={18} />
                    </div>
                    <div>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                            ₹{totalRevenue.toLocaleString()}
                        </span>
                        <p style={{ fontSize: '11px', color: t.secondary, marginTop: 1 }}>Total platform revenue</p>
                    </div>
                </div>
            </div>

            {/* Revenue by category */}
            {revenue.byCategory && revenue.byCategory.length > 0 && (
                <div className="mb-5">
                    <p style={{ fontSize: '11px', fontWeight: 600, color: t.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        By Category
                    </p>
                    <div className="space-y-2.5">
                        {revenue.byCategory.map((cat) => {
                            const pct = totalRevenue > 0 ? (cat.total / totalRevenue) * 100 : 0;
                            const color = categoryColors[cat.category] || '#6366f1';
                            return (
                                <div key={cat.category} className="rounded-lg p-3" style={glassInner(isDarkMode)}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary, textTransform: 'capitalize' }}>
                                                {cat.category.replace(/_/g, ' ')}
                                            </span>
                                            <span style={{ fontSize: '10px', color: t.micro }}>
                                                ({cat.count} txn{cat.count !== 1 ? 's' : ''})
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                                            ₹{cat.total.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: trackBg(isDarkMode) }}>
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, background: color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Top revenue tenants */}
            {revenue.topTenants && revenue.topTenants.length > 0 && (
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: t.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        Top Revenue Organizations
                    </p>
                    <div className="space-y-2">
                        {revenue.topTenants.map((tenant, i) => (
                            <div key={tenant.tenantId} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={glassInner(isDarkMode)}>
                                <div className="flex items-center gap-2.5">
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: t.micro, width: 18, textAlign: 'center' }}>
                                        {i + 1}
                                    </span>
                                    <Building2 size={13} style={{ color: t.micro }} />
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }} className="truncate max-w-40">
                                        {tenant.companyName}
                                    </span>
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', fontVariantNumeric: 'tabular-nums' }}>
                                    ₹{tenant.revenue.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
