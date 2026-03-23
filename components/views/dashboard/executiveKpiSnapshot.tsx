"use client";

import React, { useEffect, useState } from 'react';
import {
    Users, UserPlus, MessageCircle,
    Brain, PhoneForwarded, CalendarCheck,
    TrendingUp, TrendingDown, FileText, Megaphone
} from 'lucide-react';
import { glassCard, glassInner, tx, trackBg, fs } from './glassStyles';
import { useTemplates } from '@/hooks/useTemplates';
import { useCampaigns } from '@/hooks/useCampaigns';
import { NoDataFound } from './noDataFound';

interface ExecutiveKPILayerProps { 
    isDarkMode?: boolean; 
    kpisData?: any;
}

const statusBadge: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
    great: { label: '✓ Great', bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
    good:  { label: '↑ Good',  bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)', dot: '#3b82f6' },
    watch: { label: '! Watch', bg: 'rgba(244,63,94,0.12)',   color: '#fb7185', border: 'rgba(244,63,94,0.25)',  dot: '#f43f5e' },
};

const KPICard = ({ kpi, index, isDarkMode, show }: { kpi: any; index: number; isDarkMode: boolean; show: boolean }) => {
    const Icon = kpi.icon;
    const badge = statusBadge[kpi.status] ?? statusBadge.good;
    const t = tx(isDarkMode);
    return (
        <div className="rounded-xl p-5 flex flex-col gap-3 relative transition-all duration-300 border hover:border-zinc-300 dark:hover:border-zinc-700"
            style={{
                ...glassCard(isDarkMode),
                opacity: show ? 1 : 0,
                transform: show ? 'translateY(0)' : 'translateY(8px)',
                transition: `opacity 0.4s ease ${index * 40}ms, transform 0.4s ease ${index * 40}ms`,
            }}
        >
            <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center border"
                    style={{ background: isDarkMode ? `${kpi.color}15` : `${kpi.color}10`, color: kpi.color, borderColor: isDarkMode ? `${kpi.color}30` : `${kpi.color}20` }}>
                    <Icon size={18} />
                </div>
                <span className="px-2 py-0.5 rounded-md flex items-center gap-1.5"
                    style={{ background: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 600, border: `1px solid ${badge.border}` }}>
                    <div className="w-1 h-1 rounded-full" style={{ background: badge.dot }} />
                    {badge.label}
                </span>
            </div>

            <div className="mt-1">
                <p style={{ fontSize: '13px', fontWeight: 500, color: t.secondary, marginBottom: 4 }}>
                    {kpi.label}
                </p>
                <h4 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: t.value }}>
                    {kpi.value}
                </h4>
            </div>

            <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                    {kpi.up ? <TrendingUp size={12} style={{ color: kpi.color }} /> : <TrendingDown size={12} style={{ color: kpi.color }} />}
                    <span style={{ fontSize: '12px', fontWeight: 500, color: kpi.color }}>{kpi.trend}</span>
                </div>
                <span style={{ fontSize: '12px', color: t.micro }}>• {kpi.sub}</span>
            </div>
            
            <div className="h-1 w-full rounded-full overflow-hidden mt-3" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }}>
                <div className="h-full rounded-full"
                    style={{
                        width: show ? `${kpi.barW}%` : '0%',
                        background: kpi.color,
                        transition: `width 1000ms cubic-bezier(0.22,1,0.36,1) ${index * 50 + 200}ms`,
                    }}
                />
            </div>
        </div>
    );
};

const SkeletonCard = ({ isDarkMode }: { isDarkMode: boolean }) => (
    <div className="rounded-xl p-5 flex flex-col gap-4 border" style={{ background: isDarkMode ? '#09090b' : '#ffffff', borderColor: isDarkMode ? '#27272a' : '#e4e4e7' }}>
        <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-16 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="space-y-3 mt-2">
            <div className="w-24 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            <div className="w-20 h-8 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="w-32 h-3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mt-2" />
        <div className="h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse mt-3" />
    </div>
);

const trendText = (trend: number | null, suffix = '% vs prev') => {
    if (trend === null || trend === undefined) return 'Live monitoring';
    return `${trend > 0 ? '+' : ''}${trend}${suffix}`;
};



export const ExecutiveKPILayer = ({ isDarkMode = true, kpisData }: ExecutiveKPILayerProps) => {
    const [show, setShow] = useState(false);
    const { templates = [] } = useTemplates();
    const { pagination } = useCampaigns(false);
    const totalCampaigns = pagination?.totalCampaigns ?? 0;

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const approvedTemplates = (templates || []).filter(t => 
        t.status?.toUpperCase() === 'APPROVED' || t.status === 'approved'
    ).length;

    const kpiList = [
        { 
            label: 'Total Leads', 
            value: kpisData?.totalLeads?.value?.toLocaleString() ?? '0', 
            icon: Users, 
            trend: trendText(kpisData?.totalLeads?.trend), 
            up: (kpisData?.totalLeads?.trend ?? 0) >= 0, 
            color: '#10b981', color2: '#34d399', 
            sub: 'All contacts captured', 
            barW: kpisData?.totalLeads?.value > 0 ? Math.max(2, Math.min(100, (kpisData.totalLeads.value / 2000) * 100)) : 0,
            status: kpisData?.totalLeads?.status ?? 'great',
        },
        { 
            label: 'New Leads Today', 
            value: kpisData?.newLeadsToday?.value?.toLocaleString() ?? '0', 
            icon: UserPlus, 
            trend: trendText(kpisData?.newLeadsToday?.trend), 
            up: (kpisData?.newLeadsToday?.trend ?? 0) >= 0, 
            color: '#3b82f6', color2: '#60a5fa', 
            sub: 'Inbound today', 
            barW: kpisData?.newLeadsToday?.value > 0 ? Math.max(2, Math.min(100, (kpisData.newLeadsToday.value / 50) * 100)) : 0, 
            status: kpisData?.newLeadsToday?.status ?? 'good',
        },
        { 
            label: 'Active Chats', 
            value: kpisData?.activeChats?.value?.toLocaleString() ?? '0', 
            icon: MessageCircle, 
            trend: 'Live monitoring', 
            up: true, 
            color: '#a855f7', color2: '#c084fc', 
            sub: 'Conversations in progress', 
            barW: kpisData?.activeChats?.value > 0 ? Math.max(2, Math.min(100, (kpisData.activeChats.value / 20) * 100)) : 0, 
            status: kpisData?.activeChats?.status ?? 'good',
        },
        { 
            label: 'AI Auto-Resolved', 
            value: `${kpisData?.aiAutoResolved?.value ?? 0}%`, 
            icon: Brain, 
            trend: trendText(kpisData?.aiAutoResolved?.trend),
            up: (kpisData?.aiAutoResolved?.trend ?? 0) >= 0, 
            color: '#6366f1', color2: '#818cf8', 
            sub: 'Handled without agent', 
            barW: kpisData?.aiAutoResolved?.value ?? 0, 
            status: kpisData?.aiAutoResolved?.status ?? 'great',
        },
        { 
            label: 'Escalated to Agent', 
            value: kpisData?.escalatedToAgent?.value?.toLocaleString() ?? '0', 
            icon: PhoneForwarded, 
            trend: trendText(kpisData?.escalatedToAgent?.trend),
            up: (kpisData?.escalatedToAgent?.trend ?? 0) <= 0,
            color: '#f43f5e', color2: '#fb7185', 
            sub: 'Required human takeover', 
            barW: kpisData?.escalatedToAgent?.value > 0 ? Math.max(2, Math.min(100, (kpisData.escalatedToAgent.value / 10) * 100)) : 0,
            status: kpisData?.escalatedToAgent?.status ?? 'good',
        },
        { 
            label: 'Appointments Today', 
            value: kpisData?.appointmentsToday?.value?.toLocaleString() ?? '0', 
            icon: CalendarCheck, 
            trend: trendText(kpisData?.appointmentsToday?.trend),
            up: (kpisData?.appointmentsToday?.trend ?? 0) >= 0, 
            color: '#f97316', color2: '#fb923c', 
            sub: 'Confirmed bookings today', 
            barW: kpisData?.appointmentsToday?.value > 0 ? Math.max(2, Math.min(100, (kpisData.appointmentsToday.value / 10) * 100)) : 0, 
            status: kpisData?.appointmentsToday?.status ?? 'great',
        },
        {
            label: 'Approved Templates',
            value: approvedTemplates.toLocaleString(),
            icon: FileText,
            trend: 'Available for campaigns',
            up: true,
            color: '#14b8a6', color2: '#2dd4bf',
            sub: 'Ready to send',
            barW: Math.min(100, (approvedTemplates / 20) * 100),
            status: approvedTemplates > 0 ? 'great' : 'watch',
        },
        {
            label: 'Total Campaigns',
            value: totalCampaigns.toLocaleString(),
            icon: Megaphone,
            trend: 'Created campaigns',
            up: true,
            color: '#f59e0b', color2: '#fbbf24',
            sub: 'Active & scheduled',
            barW: Math.min(100, (totalCampaigns / 20) * 100),
            status: totalCampaigns > 0 ? 'good' : 'watch',
        },
    ];

    const hasData = kpisData && Object.values(kpisData).some((kpi: any) => kpi?.value > 0);

    if (kpisData && !hasData) {
        return (
            <NoDataFound 
                isDarkMode={isDarkMode} 
                title="KPI Snapshot Unavailable"
                description="No performance metrics detected for the selected period."
            />
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {!kpisData
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)
                : kpiList.map((kpi, i) => <KPICard key={i} kpi={kpi as any} index={i} isDarkMode={isDarkMode} show={show} />)
            }
        </div>
    );
};
