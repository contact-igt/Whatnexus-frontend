"use client";

import React, { useEffect, useState } from 'react';
import {
    Users, UserPlus, MessageCircle,
    Brain, PhoneForwarded, CalendarCheck,
    TrendingUp, TrendingDown, FileText,
    Megaphone, BookOpen, CircleHelp,
    UsersRound, LayoutGrid,
} from 'lucide-react';
import { glassCard, tx } from './glassStyles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtraKpis {
    totalSources: number;
    totalFaqs: number;
    totalContacts: number;
    totalGroups: number;
    approvedTemplates: number;
}

interface ExecutiveKPILayerProps {
    isDarkMode?: boolean;
    kpisData?: any;
    periodLabel?: string;
    includesInToday?: boolean;
    extraKpis?: ExtraKpis;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusBadge: Record<string, { label: string; bg: string; color: string; border: string; dot: string }> = {
    great: { label: '✓ Great', bg: 'rgba(16,185,129,0.12)',  color: '#34d399', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
    good:  { label: '↑ Good',  bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)', dot: '#3b82f6' },
    watch: { label: '! Watch', bg: 'rgba(244,63,94,0.12)',   color: '#fb7185', border: 'rgba(244,63,94,0.25)',  dot: '#f43f5e' },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KPICard = ({ kpi, index, isDarkMode, show }: { kpi: any; index: number; isDarkMode: boolean; show: boolean }) => {
    const Icon = kpi.icon;
    const badge = statusBadge[kpi.status] ?? statusBadge.good;
    const t = tx(isDarkMode);
    return (
        <div
            className="rounded-xl p-5 flex flex-col gap-3 relative transition-all duration-300 border hover:border-zinc-300 dark:hover:border-zinc-700"
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
                <p style={{ fontSize: '13px', fontWeight: 500, color: t.secondary, marginBottom: 6 }}>
                    {kpi.label}
                </p>
                <h4 style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: t.value }}>
                    {kpi.value}
                </h4>
            </div>

            <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                    {kpi.up
                        ? <TrendingUp  size={12} style={{ color: kpi.color }} />
                        : <TrendingDown size={12} style={{ color: kpi.color }} />}
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

// ─── Section Divider ──────────────────────────────────────────────────────────

const SectionDivider = ({ dot, label, isDarkMode }: { dot: string; label: string; isDarkMode: boolean }) => {
    const t = tx(isDarkMode);
    return (
        <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: t.secondary, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                {label}
            </span>
            <div className="flex-1 h-px" style={{ background: isDarkMode ? '#27272a' : '#e4e4e7' }} />
        </div>
    );
};

const trendText = (trend: number | null, suffix = '% vs prev') => {
    if (trend === null || trend === undefined) return 'Live monitoring';
    return `${trend > 0 ? '+' : ''}${trend}${suffix}`;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ExecutiveKPILayer = ({
    isDarkMode = true,
    kpisData,
    periodLabel = 'Selected Period',
    includesInToday = true,
    extraKpis,
}: ExecutiveKPILayerProps) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const approvedTemplates = kpisData?.approvedTemplates?.value ?? extraKpis?.approvedTemplates ?? 0;
    const totalFaqs         = kpisData?.totalFaqs?.value ?? extraKpis?.totalFaqs ?? 0;
    const totalContacts     = extraKpis?.totalContacts ?? 0;
    const totalGroups       = extraKpis?.totalGroups ?? 0;
    const totalSources      = extraKpis?.totalSources ?? 0;
    const totalCampaigns    = kpisData?.totalCampaigns ?? 0;
    
    // Determine if we're showing "All Time" data
    const isAllTime = periodLabel === 'All Time';
    const isToday = periodLabel === 'Today';
    
    // For the first card: Always show period leads (which equals all-time when All Time is selected)
    // The backend sends totalLeads.value = leads in selected period (whether that's All Time or not)
    const leadsLabel = isAllTime || isToday ? 'Total Leads' : 'New Leads in Period';
    const leadsSub   = isAllTime ? 'All time' : isToday ? 'Cumulative total' : periodLabel;
    // All Time & Today → show cumulative all-time total (allTime field from backend)
    // Any other range  → show leads created in that period (value field)
    const leadsValue = (isAllTime || isToday)
        ? (kpisData?.totalLeads?.allTime ?? kpisData?.totalLeads?.value ?? 0)
        : (kpisData?.totalLeads?.value ?? 0);

    // ── Always-visible Analytics KPIs ─────────────────────────────────────────
    const analyticsKpis = [
        {
            label: leadsLabel,
            value: leadsValue.toLocaleString(),
            icon: Users,
            trend: trendText(kpisData?.totalLeads?.trend),
            up: (kpisData?.totalLeads?.trend ?? 0) >= 0,
            color: '#10b981',
            sub: leadsSub,
            barW: leadsValue > 0 ? Math.max(2, Math.min(100, (leadsValue / 2000) * 100)) : 0,
            status: kpisData?.totalLeads?.status ?? 'great',
        },
        {
            label: 'AI Auto-Resolved',
            value: `${kpisData?.aiAutoResolved?.value ?? 0}%`,
            icon: Brain,
            trend: trendText(kpisData?.aiAutoResolved?.trend),
            up: (kpisData?.aiAutoResolved?.trend ?? 0) >= 0,
            color: '#6366f1',
            sub: `Handled without agent`,
            barW: kpisData?.aiAutoResolved?.value ?? 0,
            status: kpisData?.aiAutoResolved?.status ?? 'great',
        },
        {
            label: 'Total Campaigns',
            value: totalCampaigns.toLocaleString(),
            icon: Megaphone,
            trend: isAllTime ? 'All time campaigns' : 'Period campaigns',
            up: true,
            color: '#f59e0b',
            sub: isAllTime ? 'Active & completed' : periodLabel,
            barW: Math.min(100, (totalCampaigns / 20) * 100),
            status: totalCampaigns > 0 ? 'good' : 'watch',
        },
        {
            label: 'Approved Templates',
            value: approvedTemplates.toLocaleString(),
            icon: FileText,
            trend: 'Ready to send',
            up: true,
            color: '#14b8a6',
            sub: 'Meta-approved',
            barW: Math.min(100, (approvedTemplates / 20) * 100),
            status: approvedTemplates > 0 ? 'great' : 'watch',
        },
        {
            label: 'Knowledge Sources',
            value: totalSources.toLocaleString(),
            icon: BookOpen,
            trend: isAllTime ? 'All time sources' : 'Period sources',
            up: true,
            color: '#3b82f6',
            sub: isAllTime ? 'AI training data' : periodLabel,
            barW: Math.min(100, (totalSources / 50) * 100),
            status: totalSources > 0 ? 'great' : 'watch',
        },
        {
            label: 'Total FAQs',
            value: totalFaqs.toLocaleString(),
            icon: CircleHelp,
            trend: isAllTime ? 'All time FAQs' : 'Period FAQs',
            up: true,
            color: '#a855f7',
            sub: isAllTime ? 'Published & pending' : periodLabel,
            barW: Math.min(100, (totalFaqs / 100) * 100),
            status: totalFaqs > 0 ? 'good' : 'watch',
        },
        {
            label: 'Total Contacts',
            value: totalContacts.toLocaleString(),
            icon: UsersRound,
            trend: isAllTime ? 'All time contacts' : 'Period contacts',
            up: true,
            color: '#f97316',
            sub: isAllTime ? 'Active audience' : periodLabel,
            barW: Math.min(100, (totalContacts / 5000) * 100),
            status: totalContacts > 0 ? 'great' : 'watch',
        },
        {
            label: 'Total Groups',
            value: totalGroups.toLocaleString(),
            icon: LayoutGrid,
            trend: isAllTime ? 'All time groups' : 'Period groups',
            up: true,
            color: '#ec4899',
            sub: isAllTime ? 'Audience segments' : periodLabel,
            barW: Math.min(100, (totalGroups / 50) * 100),
            status: totalGroups > 0 ? 'good' : 'watch',
        },
    ];

    // ── Live & Today KPIs (only shown when today is included) ─────────────────
    const liveKpis = [
        {
            label: 'New Leads Today',
            value: kpisData?.newLeadsToday?.value?.toLocaleString() ?? '0',
            icon: UserPlus,
            trend: 'Inbound today',
            up: true,
            color: '#3b82f6',
            sub: 'Today only',
            barW: kpisData?.newLeadsToday?.value > 0 ? Math.max(2, Math.min(100, (kpisData.newLeadsToday.value / 50) * 100)) : 0,
            status: kpisData?.newLeadsToday?.status ?? 'good',
        },
        {
            label: 'Active Chats',
            value: kpisData?.activeChats?.value?.toLocaleString() ?? '0',
            icon: MessageCircle,
            trend: 'Live monitoring',
            up: true,
            color: '#a855f7',
            sub: 'Conversations in progress',
            barW: kpisData?.activeChats?.value > 0 ? Math.max(2, Math.min(100, (kpisData.activeChats.value / 20) * 100)) : 0,
            status: kpisData?.activeChats?.status ?? 'good',
        },
        {
            label: 'Escalated to Agent',
            value: kpisData?.escalatedToAgent?.value?.toLocaleString() ?? '0',
            icon: PhoneForwarded,
            trend: trendText(kpisData?.escalatedToAgent?.trend),
            up: (kpisData?.escalatedToAgent?.trend ?? 0) <= 0,
            color: '#f43f5e',
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
            color: '#f97316',
            sub: 'Confirmed bookings today',
            barW: kpisData?.appointmentsToday?.value > 0 ? Math.max(2, Math.min(100, (kpisData.appointmentsToday.value / 10) * 100)) : 0,
            status: kpisData?.appointmentsToday?.status ?? 'great',
        },
    ];

    const t = tx(isDarkMode);
    const isLoading = !kpisData;

    // Analytics KPIs are always shown with 8 cards
    const fullAnalyticsKpis = analyticsKpis;

    return (
        <div className="space-y-6">

            {/* ── Analytics Section (always shown) ── */}
            <div>
                <SectionDivider dot="#3b82f6" label={`Analytics — ${periodLabel}`} isDarkMode={isDarkMode} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {isLoading
                        ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)
                        : fullAnalyticsKpis.map((kpi, i) => (
                            <KPICard key={kpi.label} kpi={kpi} index={i} isDarkMode={isDarkMode} show={show} />
                        ))
                    }
                </div>
            </div>

            {/* ── Live & Today Section (only if today is in range) ── */}
            {includesInToday && (
                <div>
                    <SectionDivider dot="#10b981" label="Live &amp; Today" isDarkMode={isDarkMode} />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`live-${i}`} isDarkMode={isDarkMode} />)
                            : liveKpis.map((kpi, i) => (
                                <KPICard key={kpi.label} kpi={kpi} index={i + fullAnalyticsKpis.length} isDarkMode={isDarkMode} show={show} />
                            ))
                        }
                    </div>
                </div>
            )}
        </div>
    );
};
