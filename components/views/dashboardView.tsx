"use client";

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from "@/lib/utils";
import { GlobalCommandBar } from './dashboard/globalCommandBar';
import { ExecutiveKPILayer } from './dashboard/executiveKpiSnapshot';
import { ConversionFunnel } from './dashboard/conversionFunnel';
import { LiveOperationsCenter } from './dashboard/liveOperationsCenter';
import { AIIntelligencePanel } from './dashboard/aiIntelligencePanel';
import { CampaignIntelligence } from './dashboard/campaignIntelligence';
import { AgentPerformance } from './dashboard/agentPerformance';
import { FollowUpHub } from './dashboard/followUpHub';
import { MessagingAnalytics } from './dashboard/messagingAnalytics';
import { ActivityFeed } from './dashboard/activityFeed';
import { tx } from './dashboard/glassStyles';
import {
    BarChart3, Inbox, Users2, MessageCircle,
    CalendarCheck, Activity, Layers3
} from 'lucide-react';

// ─── Reusable section divider ─────────────────────────────────────────────────
interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accentColor?: string;
    isDarkMode: boolean;
}

const SectionHeader = ({ icon, title, subtitle, accentColor = '#10b981', isDarkMode }: SectionHeaderProps) => (
    <div className="flex items-center gap-3 px-1 mb-4">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${accentColor}20`, color: accentColor }}>
            {icon}
        </div>
        <div>
            <h2 className="text-sm font-black tracking-tight leading-none"
                style={{ color: tx(isDarkMode).primary }}>
                {title}
            </h2>
            <p className="text-[9px] font-medium mt-0.5 uppercase tracking-[0.16em]"
                style={{ color: tx(isDarkMode).label }}>
                {subtitle}
            </p>
        </div>
        <div className="flex-1 h-px ml-2" style={{ background: tx(isDarkMode).divider }} />
    </div>
);

// ─── Main dashboard ───────────────────────────────────────────────────────────
import { useGetWhatsappDashboardQuery } from '@/hooks/useWhatsappDashboardQuery';
import { useState } from 'react';
import { Loader2, RefreshCcw, AlertCircle } from 'lucide-react';

export const DashboardView = () => {
    const { isDarkMode } = useTheme();
    const [period, setPeriod] = useState<string>("30days");
    const { data: dashboardResult, isLoading, isError, refetch } = useGetWhatsappDashboardQuery(period);

    const dashboardData = dashboardResult?.data;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500" style={{ background: isDarkMode ? '#080b12' : '#f1f5f9' }}>
                <div className="relative">
                    <Loader2 size={48} className="text-emerald-500 animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-emerald-500/20 rounded-full animate-pulse" />
                </div>
                <p className={cn("text-sm font-bold uppercase tracking-widest opacity-50", isDarkMode ? "text-white" : "text-slate-900")}>Synchronizing Neural Data...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-6" style={{ background: isDarkMode ? '#080b12' : '#f1f5f9' }}>
                <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <AlertCircle size={40} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className={cn("text-xl font-black", isDarkMode ? "text-white" : "text-slate-900")}>Connection Failed</h3>
                    <p className={cn("text-sm opacity-60 max-w-xs mx-auto", isDarkMode ? "text-white" : "text-slate-900")}>We accurately identified a neural sync error. Please check your connection and try again.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <RefreshCcw size={18} />
                    <span>Retry Sync</span>
                </button>
            </div>
        );
    }

    return (
        <div
            className="relative h-full overflow-y-auto no-scrollbar pb-32"
            style={{ background: isDarkMode ? '#080b12' : '#f1f5f9' }}
        >
            {/* Ambient background */}
            {isDarkMode && (
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
                    <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.04) 0%, transparent 70%)' }} />
                    <div className="absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
                            backgroundSize: '28px 28px',
                        }}
                    />
                </div>
            )}

            <div className="relative z-10 p-4 sm:p-6 space-y-8">

                {/* 1. Header + WABA bar */}
                <GlobalCommandBar
                    isDarkMode={isDarkMode}
                    headerData={dashboardData?.header}
                    wabaInfo={dashboardData?.wabaInfo}
                    period={period}
                    setPeriod={setPeriod}
                />

                {/* 2. KPI Cards */}
                <section>
                    <SectionHeader
                        icon={<BarChart3 size={16} />}
                        title="Key Performance Indicators"
                        subtitle="Business health at a glance — updated live"
                        accentColor="#10b981"
                        isDarkMode={isDarkMode}
                    />
                    <ExecutiveKPILayer isDarkMode={isDarkMode} kpisData={dashboardData?.kpis} />
                </section>

                {/* Main content grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Left (2/3) */}
                    <div className="xl:col-span-2 space-y-8">

                        {/* 3. Sales Funnel */}
                        <section>
                            <SectionHeader
                                icon={<Layers3 size={16} />}
                                title="Sales & Conversion Funnel"
                                subtitle="How leads move from ad click to paying customer"
                                accentColor="#3b82f6"
                                isDarkMode={isDarkMode}
                            />
                            {/* funnelData + funnelSummary both passed */}
                            <ConversionFunnel
                                isDarkMode={isDarkMode}
                                funnelData={dashboardData?.funnel}
                                funnelSummary={dashboardData?.funnelSummary}
                            />
                        </section>

                        {/* 4. Campaigns + Agent Performance */}
                        <section>
                            <SectionHeader
                                icon={<Inbox size={16} />}
                                title="Campaigns & Team Performance"
                                subtitle="WhatsApp broadcast results and agent workload"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <CampaignIntelligence isDarkMode={isDarkMode} campaignsData={dashboardData?.campaigns} />
                                {/* agentPerformance from API */}
                                <AgentPerformance isDarkMode={isDarkMode} agentData={dashboardData?.agentPerformance} />
                            </div>
                        </section>

                        {/* 5. Follow-ups + Messaging */}
                        <section>
                            <SectionHeader
                                icon={<CalendarCheck size={16} />}
                                title="Follow-Ups & Messaging Volume"
                                subtitle="Pending tasks and communication analytics"
                                accentColor="#f59e0b"
                                isDarkMode={isDarkMode}
                            />
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* followUps from API */}
                                <FollowUpHub isDarkMode={isDarkMode} followUpsData={dashboardData?.followUps} />
                                {/* messagingAnalytics from API */}
                                <MessagingAnalytics isDarkMode={isDarkMode} messagingData={dashboardData?.messagingAnalytics} />
                            </div>
                        </section>
                    </div>

                    {/* Right sidebar (1/3) */}
                    <div className="space-y-8">

                        {/* 6. Live Operations */}
                        <section>
                            <SectionHeader
                                icon={<MessageCircle size={16} />}
                                title="Live Operations"
                                subtitle="Real-time chat queue & agent status"
                                accentColor="#f43f5e"
                                isDarkMode={isDarkMode}
                            />
                            <LiveOperationsCenter isDarkMode={isDarkMode} liveOpsData={dashboardData?.liveOperations} />
                        </section>

                        {/* 7. AI Performance */}
                        <section>
                            <SectionHeader
                                icon={<Users2 size={16} />}
                                title="AI Performance"
                                subtitle="Automation rate and intent accuracy"
                                accentColor="#10b981"
                                isDarkMode={isDarkMode}
                            />
                            {/* aiPerformance — NOT aiIntelligence */}
                            <AIIntelligencePanel isDarkMode={isDarkMode} aiData={dashboardData?.aiPerformance} />
                        </section>

                        {/* 8. Recent Activity */}
                        <section>
                            <SectionHeader
                                icon={<Activity size={16} />}
                                title="Recent Activity"
                                subtitle="Latest system events — live feed"
                                accentColor="#a855f7"
                                isDarkMode={isDarkMode}
                            />
                            <ActivityFeed isDarkMode={isDarkMode} recentActivity={dashboardData?.recentActivity} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
