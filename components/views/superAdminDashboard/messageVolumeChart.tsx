"use client";

import React from 'react';
import { glassCard, tx, trackBg } from '../dashboard/glassStyles';

interface MessageVolumeChartProps {
    isDarkMode?: boolean;
    dailyMessages?: any[];
}

export const MessageVolumeChart = ({ isDarkMode = true, dailyMessages = [] }: MessageVolumeChartProps) => {
    const t = tx(isDarkMode);
    const maxTotal = Math.max(...dailyMessages.map(d => d.total), 1);

    if (dailyMessages.length === 0) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex items-center justify-center py-8">
                    <p style={{ fontSize: '13px', color: t.secondary }}>No volume data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            {/* Summary row */}
            <div className="flex items-center gap-4 mb-5 flex-wrap">
                <div>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                        {dailyMessages.reduce((sum, d) => sum + d.total, 0).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '12px', color: t.secondary, marginLeft: 6 }}>total messages (7d)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md"
                    style={{ background: isDarkMode ? 'rgba(16,185,129,0.1)' : '#ecfdf5', border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.2)' : '#a7f3d0'}` }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>
                        Avg {Math.round(dailyMessages.reduce((sum, d) => sum + d.total, 0) / Math.max(dailyMessages.length, 1)).toLocaleString()}/day
                    </span>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-2 h-40">
                {dailyMessages.map((day, i) => {
                    const height = maxTotal > 0 ? (day.total / maxTotal) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            {/* Value label */}
                            <span style={{ fontSize: '10px', fontWeight: 600, color: t.secondary, fontVariantNumeric: 'tabular-nums' }}>
                                {day.total > 0 ? day.total.toLocaleString() : ''}
                            </span>

                            {/* Bar */}
                            <div className="w-full rounded-t-md transition-all duration-700 relative group cursor-default"
                                style={{
                                    height: `${Math.max(height, 2)}%`,
                                    background: `linear-gradient(180deg, #8b5cf6 0%, ${isDarkMode ? '#4c1d95' : '#c4b5fd'} 100%)`,
                                    minHeight: 4,
                                }}>
                                {/* Hover tooltip */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-xs font-bold whitespace-nowrap z-10"
                                    style={{ background: isDarkMode ? '#18181b' : '#fff', color: t.primary, border: `1px solid ${isDarkMode ? '#27272a' : '#e4e4e7'}`, fontSize: '10px' }}>
                                    {day.total.toLocaleString()} messages
                                </div>
                            </div>

                            {/* Day label */}
                            <span style={{ fontSize: '10px', fontWeight: 600, color: t.micro, marginTop: 2 }}>
                                {day.day}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
