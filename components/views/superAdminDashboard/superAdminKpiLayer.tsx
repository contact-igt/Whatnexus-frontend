"use client";

import React, { useEffect, useState } from 'react';
import {
    Building2, UserCog,
    Users2, Smartphone,
    TrendingUp, TrendingDown,
} from 'lucide-react';
import { glassCard, tx } from '../dashboard/glassStyles';
import { BarChart3 } from 'lucide-react';

interface SuperAdminKPILayerProps {
    isDarkMode?: boolean;
    kpisData?: any;
    periodLabel?: string;
}

const statusBadge: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
    great: { label: '✓ Great', bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
    good: { label: '↑ Good', bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', border: 'rgba(59,130,246,0.25)', dot: '#3b82f6' },
    watch: { label: '! Watch', bg: 'rgba(244,63,94,0.12)', color: '#fb7185', border: 'rgba(244,63,94,0.25)', dot: '#f43f5e' },
};

const KPICard = ({ kpi, index, isDarkMode, show }: { kpi: any; index: number; isDarkMode: boolean; show: boolean }) => {
    const Icon = kpi.icon;
    const badge = statusBadge[kpi.status] ?? statusBadge.good;
    const t = tx(isDarkMode);

    return (
        <div className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group"
            style={{
                ...glassCard(isDarkMode),
                opacity: show ? 1 : 0,
                transform: show ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
                transition: `all 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 60}ms`,
            }}>
            {/* Hover accent glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 30% 20%, ${kpi.color}08, transparent 70%)` }} />

            <div className="relative flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: isDarkMode ? `${kpi.color}12` : `${kpi.color}08`,
                        color: kpi.color,
                        border: `1px solid ${kpi.color}20`,
                        boxShadow: `0 2px 8px ${kpi.color}10`,
                    }}>
                    <Icon size={18} />
                </div>
                <span className="px-2 py-0.5 rounded-lg flex items-center gap-1.5"
                    style={{ background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: 700, border: `1px solid ${badge.border}`, letterSpacing: '0.02em' }}>
                    <div className="w-1 h-1 rounded-full" style={{ background: badge.dot }} />
                    {badge.label}
                </span>
            </div>

            <div className="relative mt-1">
                <p style={{ fontSize: '12px', fontWeight: 500, color: t.secondary, marginBottom: 6, letterSpacing: '0.01em' }}>
                    {kpi.label}
                </p>
                <h4 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: t.value }}>
                    {kpi.value}
                </h4>
            </div>

            <div className="relative flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">
                    {kpi.up ? <TrendingUp size={11} style={{ color: kpi.color }} /> : <TrendingDown size={11} style={{ color: kpi.color }} />}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: kpi.color }}>{kpi.trend}</span>
                </div>
                <span style={{ fontSize: '11px', color: t.micro }}>• {kpi.sub}</span>
            </div>

            <div className="relative h-1 w-full rounded-full overflow-hidden mt-2" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <div className="h-full rounded-full"
                    style={{
                        width: show ? `${kpi.barW}%` : '0%',
                        background: `linear-gradient(90deg, ${kpi.color}, ${kpi.color}cc)`,
                        transition: `width 1200ms cubic-bezier(0.22,1,0.36,1) ${index * 70 + 300}ms`,
                    }} />
            </div>
        </div>
    );
};

const trendText = (trend: number | null, suffix = '% vs prev') => {
    if (trend === null || trend === undefined) return 'Live monitoring';
    return `${trend > 0 ? '+' : ''}${trend}${suffix}`;
};

export const SuperAdminKPILayer = ({ isDarkMode = true, kpisData, periodLabel = '30 Days' }: SuperAdminKPILayerProps) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!kpisData) {
        const t = tx(isDarkMode);
        return (
            <div className="rounded-xl p-6 border" style={glassCard(isDarkMode)}>
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <BarChart3 size={24} style={{ color: t.micro }} />
                    <p style={{ fontSize: '13px', color: t.secondary }}>No KPI data available</p>
                </div>
            </div>
        );
    }

    const kpiList = [
        {
            label: 'Total Organizations',
            value: kpisData.totalTenants?.value?.toLocaleString() ?? '0',
            icon: Building2,
            trend: trendText(kpisData.totalTenants?.trend),
            up: (kpisData.totalTenants?.trend ?? 0) >= 0,
            color: '#8b5cf6',
            sub: `${kpisData.totalTenants?.active ?? 0} active · ${kpisData.totalTenants?.inactive ?? 0} inactive`,
            barW: Math.min(100, ((kpisData.totalTenants?.active ?? 0) / Math.max(1, kpisData.totalTenants?.value ?? 1)) * 100),
            status: kpisData.totalTenants?.status ?? 'good',
        },
        {
            label: 'System Admins',
            value: kpisData.platformAdmins?.value?.toLocaleString() ?? '0',
            icon: UserCog,
            trend: trendText(kpisData.platformAdmins?.trend),
            up: true,
            color: '#6366f1',
            sub: `${kpisData.platformAdmins?.superAdmins ?? 0} super · ${kpisData.platformAdmins?.platformAdmins ?? 0} platform`,
            barW: Math.min(100, ((kpisData.platformAdmins?.platformAdmins ?? 0) / Math.max(1, kpisData.platformAdmins?.value ?? 1)) * 100),
            status: kpisData.platformAdmins?.status ?? 'good',
        },
        {
            label: 'Tenant Users',
            value: kpisData.totalTenantUsers?.value?.toLocaleString() ?? '0',
            icon: Users2,
            trend: trendText(kpisData.totalTenantUsers?.trend),
            up: true,
            color: '#ec4899',
            sub: (kpisData.totalTenantUsers?.byRole ?? []).map((r: any) => `${r.count} ${r.role}`).join(' · ') || 'No users',
            barW: Math.min(100, (kpisData.totalTenantUsers?.value ?? 0) / 5),
            status: kpisData.totalTenantUsers?.status ?? 'good',
        },
        {
            label: 'WhatsApp Accounts',
            value: kpisData.whatsappAccounts?.total?.toLocaleString() ?? '0',
            icon: Smartphone,
            trend: trendText(kpisData.whatsappAccounts?.trend),
            up: (kpisData.whatsappAccounts?.disconnected ?? 0) === 0,
            color: '#22c55e',
            sub: `${kpisData.whatsappAccounts?.connected ?? 0} connected · ${kpisData.whatsappAccounts?.disconnected ?? 0} disconnected`,
            barW: Math.min(100, ((kpisData.whatsappAccounts?.connected ?? 0) / Math.max(1, kpisData.whatsappAccounts?.total ?? 1)) * 100),
            status: kpisData.whatsappAccounts?.status ?? 'good',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiList.map((kpi, i) => (
                <KPICard key={kpi.label} kpi={kpi} index={i} isDarkMode={isDarkMode} show={show} />
            ))}
        </div>
    );
};
