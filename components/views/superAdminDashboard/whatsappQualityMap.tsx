"use client";

import React from 'react';
import { Wifi, WifiOff, AlertTriangle, Building2 } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from '../dashboard/glassStyles';
import type { WhatsAppQuality } from '@/services/superAdminDashboard';

interface WhatsAppQualityMapProps {
    isDarkMode?: boolean;
    whatsappQuality?: WhatsAppQuality;
}

const qualityColors: Record<string, string> = {
    GREEN: '#10b981',
    YELLOW: '#f59e0b',
    RED: '#ef4444',
    UNKNOWN: '#6b7280',
};

export const WhatsAppQualityMap = ({ isDarkMode = true, whatsappQuality }: WhatsAppQualityMapProps) => {
    const t = tx(isDarkMode);

    if (!whatsappQuality) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <AlertTriangle size={24} style={{ color: t.micro }} />
                    <p style={{ fontSize: '13px', color: t.secondary }}>No WhatsApp quality data available</p>
                </div>
            </div>
        );
    }

    const distribution = whatsappQuality.distribution || [];
    const totalAccounts = distribution.reduce((s, d) => s + d.count, 0);
    const warningAccounts = whatsappQuality.warningAccounts || [];

    return (
        <div className="rounded-xl p-5 border" style={glassCard(isDarkMode)}>
            {/* Quality distribution */}
            {distribution.length > 0 && (
                <div className="mb-5">
                    <p style={{ fontSize: '11px', fontWeight: 600, color: t.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                        Quality Rating Distribution
                    </p>

                    {/* Stacked bar */}
                    <div className="h-3 w-full rounded-full overflow-hidden flex" style={{ background: trackBg(isDarkMode) }}>
                        {distribution.map((seg) => {
                            const pct = totalAccounts > 0 ? (seg.count / totalAccounts) * 100 : 0;
                            return (
                                <div key={seg.quality}
                                    className="h-full transition-all duration-700"
                                    style={{ width: `${pct}%`, background: qualityColors[seg.quality] || '#6b7280' }}
                                    title={`${seg.quality}: ${seg.count}`} />
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-3">
                        {distribution.map((seg) => (
                            <div key={seg.quality} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ background: qualityColors[seg.quality] || '#6b7280' }} />
                                <span style={{ fontSize: '11px', fontWeight: 600, color: t.primary }}>
                                    {seg.quality}
                                </span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>
                                    {seg.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Warning accounts */}
            {warningAccounts.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={13} style={{ color: '#f59e0b' }} />
                        <p style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Needs Attention ({warningAccounts.length})
                        </p>
                    </div>
                    <div className="space-y-2">
                        {warningAccounts.map((acc, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={glassInner(isDarkMode)}>
                                <div className="flex items-center gap-2 min-w-0">
                                    <Building2 size={12} style={{ color: t.micro }} />
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: t.primary }} className="truncate max-w-25">
                                        {acc.companyName}
                                    </span>
                                    <span style={{ fontSize: '10px', color: t.micro }} className="truncate max-w-20">
                                        {acc.number}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="px-1.5 py-0.5 rounded"
                                        style={{
                                            fontSize: '9px', fontWeight: 700,
                                            background: `${qualityColors[acc.quality] || '#6b7280'}15`,
                                            color: qualityColors[acc.quality] || '#6b7280',
                                            border: `1px solid ${qualityColors[acc.quality] || '#6b7280'}30`,
                                        }}>
                                        {acc.quality}
                                    </span>
                                    {acc.status === 'disconnected' && <WifiOff size={12} style={{ color: '#ef4444' }} />}
                                    {acc.status === 'connected' && <Wifi size={12} style={{ color: '#10b981' }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {warningAccounts.length === 0 && distribution.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
                    style={{ background: isDarkMode ? 'rgba(16,185,129,0.08)' : '#ecfdf5', border: `1px solid ${isDarkMode ? 'rgba(16,185,129,0.15)' : '#a7f3d0'}` }}>
                    <Wifi size={14} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>All accounts in good standing</span>
                </div>
            )}
        </div>
    );
};
