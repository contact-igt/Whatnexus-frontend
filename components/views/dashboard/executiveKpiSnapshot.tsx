"use client";

import React, { useEffect, useState } from 'react';
import {
    Users, UserPlus, MessageCircle,
    Brain, PhoneForwarded, CalendarCheck,
    TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react';
import { glassCard, glassInner, tx, trackBg } from './glassStyles';

interface ExecutiveKPILayerProps { 
    isDarkMode?: boolean; 
    kpisData?: any;
}

const statusBadge: Record<string, { label: string; bg: string; color: string }> = {
    great: { label: '✓ Great', bg: 'rgba(16,185,129,0.15)',  color: '#34d399' },
    good:  { label: '↑ Good',  bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
    watch: { label: '! Watch', bg: 'rgba(244,63,94,0.15)',   color: '#fb7185' },
};

const KPICard = ({ kpi, index, isDarkMode, show }: { kpi: any; index: number; isDarkMode: boolean; show: boolean }) => {
    const Icon = kpi.icon;
    const badge = statusBadge[kpi.status] ?? statusBadge.good;
    const t = tx(isDarkMode);
    return (
        <div className="rounded-2xl p-4 flex flex-col gap-3.5 relative overflow-hidden group cursor-default"
            style={{
                ...glassCard(isDarkMode),
                opacity: show ? 1 : 0,
                transform: show ? 'translateY(0)' : 'translateY(18px)',
                transition: `opacity 0.45s ease ${index * 55}ms, transform 0.45s ease ${index * 55}ms`,
            }}>
            {/* Corner glow */}
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: `${kpi.color}18`, filter: 'blur(20px)' }} />

            <div className="flex items-start justify-between relative z-10">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${kpi.color}20`, color: kpi.color }}>
                    <Icon size={18} />
                </div>
                <span className="text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                </span>
            </div>

            <div className="relative z-10">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: t.label }}>{kpi.label}</p>
                <h4 className="text-3xl font-black tracking-tighter leading-none tabular-nums" style={{ color: t.value }}>{kpi.value}</h4>
                <p className="text-[9px] font-medium mt-1.5" style={{ color: t.secondary }}>{kpi.sub}</p>
            </div>

            <div className="flex items-center gap-1.5 relative z-10">
                {kpi.up ? <TrendingUp size={11} style={{ color: kpi.color }} /> : <TrendingDown size={11} style={{ color: kpi.color }} />}
                <span className="text-[9px] font-bold" style={{ color: kpi.color }}>{kpi.trend}</span>
                <ArrowRight size={9} className="ml-auto" style={{ color: t.micro }} />
            </div>

            <div className="h-[3px] w-full rounded-full overflow-hidden relative z-10" style={{ background: trackBg(isDarkMode) }}>
                <div className="h-full rounded-full"
                    style={{
                        width: show ? `${kpi.barW}%` : '0%',
                        background: `linear-gradient(90deg,${kpi.color},${kpi.color2})`,
                        boxShadow: `0 0 10px ${kpi.color}80`,
                        transition: `width 1000ms cubic-bezier(0.22,1,0.36,1) ${index * 55 + 200}ms`,
                    }}
                />
            </div>
        </div>
    );
};

const SkeletonCard = ({ isDarkMode }: { isDarkMode: boolean }) => (
    <div className="rounded-2xl p-4 flex flex-col gap-3.5" style={glassCard(isDarkMode)}>
        <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl sk" />
            <div className="w-14 h-5 rounded-full sk" />
        </div>
        <div className="space-y-2">
            <div className="w-20 h-2.5 rounded sk" />
            <div className="w-16 h-9 rounded sk" />
            <div className="w-32 h-2.5 rounded sk" />
        </div>
        <div className="w-28 h-3 rounded sk" />
        <div className="h-[3px] w-full rounded-full sk" />
    </div>
);

// Helper: format trend text — skip if null
const trendText = (trend: number | null, suffix = '% vs prev') => {
    if (trend === null || trend === undefined) return 'Live monitoring';
    return `${trend > 0 ? '+' : ''}${trend}${suffix}`;
};

import { NoDataFound } from './noDataFound';

export const ExecutiveKPILayer = ({ isDarkMode = true, kpisData }: ExecutiveKPILayerProps) => {
    const [show, setShow] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // 6 KPI cards — exact fields from API
    const kpiList = [
        { 
            label: 'Total Leads', 
            // value is a plain number → toLocaleString
            value: kpisData?.totalLeads?.value?.toLocaleString() ?? '0', 
            icon: Users, 
            trend: trendText(kpisData?.totalLeads?.trend), 
            up: (kpisData?.totalLeads?.trend ?? 0) >= 0, 
            color: '#10b981', color2: '#34d399', 
            sub: 'All contacts captured', 
            barW: Math.min(100, kpisData?.totalLeads?.value ? (kpisData.totalLeads.value / 2000) * 100 : 0),
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
            barW: 42, 
            status: kpisData?.newLeadsToday?.status ?? 'good',
        },
        { 
            label: 'Active Chats Now', 
            value: kpisData?.activeChats?.value?.toLocaleString() ?? '0', 
            icon: MessageCircle, 
            trend: 'Live monitoring', 
            up: true, 
            color: '#a855f7', color2: '#c084fc', 
            sub: 'Conversations in progress', 
            barW: 55, 
            status: kpisData?.activeChats?.status ?? 'good',
        },
        { 
            label: 'AI Auto-Resolved', 
            // value is already a % number (e.g. 78.4) → just append %
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
            // escalatedToAgent.value is a COUNT (not a %) → show as plain number
            value: kpisData?.escalatedToAgent?.value?.toLocaleString() ?? '0', 
            icon: PhoneForwarded, 
            trend: trendText(kpisData?.escalatedToAgent?.trend),
            up: (kpisData?.escalatedToAgent?.trend ?? 0) <= 0,  // fewer escalations = good
            color: '#f43f5e', color2: '#fb7185', 
            sub: 'Required human takeover', 
            barW: Math.min(100, kpisData?.escalatedToAgent?.value ? kpisData.escalatedToAgent.value * 5 : 0),
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
            barW: 65, 
            status: kpisData?.appointmentsToday?.status ?? 'great',
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
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {!kpisData
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)
                : kpiList.map((kpi, i) => <KPICard key={i} kpi={kpi as any} index={i} isDarkMode={isDarkMode} show={show} />)
            }
        </div>
    );
};
