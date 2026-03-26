"use client";

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { glassCard, tx, trackBg } from '../dashboard/glassStyles';
import type { TenantGrowthItem } from '@/services/superAdminDashboard';

interface TenantGrowthChartProps {
    isDarkMode?: boolean;
    tenantGrowth?: TenantGrowthItem[];
}

export const TenantGrowthChart = ({ isDarkMode = true, tenantGrowth = [] }: TenantGrowthChartProps) => {
    const t = tx(isDarkMode);
    const maxVal = Math.max(...tenantGrowth.map(d => d.newTenants), 1);
    const totalNew = tenantGrowth.reduce((s, d) => s + d.newTenants, 0);

    if (tenantGrowth.length === 0) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex items-center justify-center py-8">
                    <p style={{ fontSize: '13px', color: t.secondary }}>No growth data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            {/* Summary */}
            <div className="flex items-center gap-4 mb-5 flex-wrap">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontSize: '22px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                        {totalNew.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: t.secondary }}>new organizations (12 months)</span>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-1.5" style={{ height: 130 }}>
                {tenantGrowth.map((item, i) => {
                    const height = maxVal > 0 ? (item.newTenants / maxVal) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            {/* Value */}
                            <span style={{ fontSize: '9px', fontWeight: 600, color: t.secondary, fontVariantNumeric: 'tabular-nums' }}>
                                {item.newTenants > 0 ? item.newTenants : ''}
                            </span>

                            {/* Bar */}
                            <div className="w-full rounded-t-md transition-all duration-700 relative group cursor-default"
                                style={{
                                    height: `${Math.max(height, 2)}%`,
                                    background: `linear-gradient(180deg, #8b5cf6 0%, ${isDarkMode ? '#4c1d95' : '#c4b5fd'} 100%)`,
                                    minHeight: 3,
                                }}>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-xs font-bold whitespace-nowrap z-10"
                                    style={{ background: isDarkMode ? '#18181b' : '#fff', color: t.primary, border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`, fontSize: '10px' }}>
                                    {item.newTenants} new
                                </div>
                            </div>

                            {/* Month label */}
                            <span style={{ fontSize: '9px', fontWeight: 600, color: t.micro }}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
