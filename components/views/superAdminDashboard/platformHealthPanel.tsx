"use client";

import React from 'react';
import { Calendar, BookOpen, Wallet, Brain } from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from '../dashboard/glassStyles';

interface PlatformHealthProps {
    isDarkMode?: boolean;
    healthData?: any;
    periodLabel?: string;
}

export const PlatformHealthPanel = ({ isDarkMode = true, healthData, periodLabel = '30 Days' }: PlatformHealthProps) => {
    const t = tx(isDarkMode);

    if (!healthData) {
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Calendar size={24} style={{ color: t.micro }} />
                    <p style={{ fontSize: '13px', color: t.secondary }}>No platform health data available</p>
                </div>
            </div>
        );
    }

    const cards = [
        {
            icon: Calendar,
            label: 'Appointments',
            color: '#f59e0b',
            stats: [
                { label: 'In Period', value: healthData.appointments?.totalInPeriod?.toLocaleString() ?? '0' },
                { label: 'Today', value: healthData.appointments?.today?.toLocaleString() ?? '0' },
            ],
        },
        {
            icon: BookOpen,
            label: 'Knowledge Base',
            color: '#10b981',
            stats: [
                { label: 'Total Sources', value: healthData.knowledgeBase?.total?.toLocaleString() ?? '0' },
                { label: 'Active', value: healthData.knowledgeBase?.active?.toLocaleString() ?? '0' },
            ],
        },
        {
            icon: Wallet,
            label: 'Platform Wallets',
            color: '#8b5cf6',
            stats: [
                { label: 'Total Balance', value: `₹${(healthData.walletBalance ?? 0).toLocaleString()}` },
            ],
        },
        {
            icon: Brain,
            label: 'AI Analysis',
            color: '#6366f1',
            stats: [
                { label: 'Total Logs', value: healthData.aiAnalysis?.total?.toLocaleString() ?? '0' },
                ...(healthData.aiAnalysis?.byType?.slice(0, 2).map((t: any) => ({
                    label: t.type,
                    value: t.count.toLocaleString(),
                })) || []),
            ],
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <div key={card.label} className="rounded-xl p-4 border transition-all hover:scale-[1.01]"
                        style={glassCard(isDarkMode)}>
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `${card.color}15`, color: card.color, border: `1px solid ${card.color}25` }}>
                                <Icon size={15} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: t.primary }}>{card.label}</span>
                        </div>
                        <div className="space-y-2">
                            {card.stats.map((stat, j) => (
                                <div key={j} className="flex items-center justify-between rounded-lg px-3 py-2" style={glassInner(isDarkMode)}>
                                    <span style={{ fontSize: '11px', fontWeight: 500, color: t.secondary }}>{stat.label}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: t.value, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
