"use client";

import React, { useState, useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useGetSuperAdminDashboardQuery } from '@/hooks/useSuperAdminDashboardQuery';
import { ThemedLoader } from '@/components/ui/themedLoader';
import { SuperAdminCommandBar } from './superAdminCommandBar';
import { SuperAdminKPILayer } from './superAdminKpiLayer';
import { TopTenantsList } from './topTenantsList';
import { RecentTenantsList } from './recentTenantsList';
import { MessageVolumeChart } from './messageVolumeChart';
import { SubscriptionHealthPanel } from './subscriptionHealthPanel';
import { PlatformLiveOpsPanel } from './platformLiveOpsPanel';
import { TenantGrowthChart } from './tenantGrowthChart';
import { PlatformActivityFeed } from './platformActivityFeed';
import { WhatsAppQualityMap } from './whatsappQualityMap';
import { AiPlatformUsage } from './aiPlatformUsage';
import {
    BarChart3, Building2, Clock, Activity,
    TrendingUp, RefreshCcw, AlertCircle, WifiOff,
    ShieldCheck, Radio, Brain, Rss, MessageSquare,
} from 'lucide-react';
import { glassCard, tx } from '../dashboard/glassStyles';

// ─── Section Header ──────────────────────────────────────────────────────────
interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accentColor?: string;
    isDarkMode: boolean;
}

const SectionHeader = ({ icon, title, subtitle, accentColor = '#8b5cf6', isDarkMode }: SectionHeaderProps) => {
    const t = tx(isDarkMode);
    return (
        <div className="flex items-center gap-3 px-1 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                    background: isDarkMode ? `${accentColor}12` : `${accentColor}08`,
                    color: accentColor,
                    border: `1px solid ${accentColor}20`,
                }}>
                {icon}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
                <h2 style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2, color: t.primary }}>
                    {title}
                </h2>
                <p style={{ fontSize: '12px', fontWeight: 400, color: t.secondary, marginTop: 2 }}>
                    {subtitle}
                </p>
            </div>
            {/* Subtle accent line */}
            <div className="hidden sm:block flex-1 h-px ml-3"
                style={{ background: `linear-gradient(90deg, ${accentColor}20, transparent)` }} />
        </div>
    );
};

// ─── Main Super Admin Dashboard ──────────────────────────────────────────────

export const SuperAdminDashboardView = () => {
    const { isDarkMode } = useTheme();
    const { data: dashboardResult, isLoading, isError, refetch, isFetching } = useGetSuperAdminDashboardQuery("30days");
    const t = tx(isDarkMode);
    const [loaderDone, setLoaderDone] = useState(false);

    const dashboardData = dashboardResult?.data;

    const handleLoaderComplete = useCallback(() => setLoaderDone(true), []);

    // Show loader until: data has arrived AND the 100% animation finished
    if (isLoading || (!loaderDone && !isError)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative"
                style={{ background: isDarkMode ? '#09090b' : '#f8fafc' }}>
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <ThemedLoader
                        isDarkMode={isDarkMode}
                        text="Initializing Command Center"
                        subtext="Aggregating platform-wide data"
                        isComplete={!isLoading && !!dashboardData}
                        onComplete={handleLoaderComplete}
                    />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 relative"
                style={{ background: isDarkMode ? '#09090b' : '#f8fafc' }}>
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.03]"
                        style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }} />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                            background: isDarkMode ? 'rgba(239,68,68,0.1)' : '#fef2f2',
                            border: `1px solid ${isDarkMode ? 'rgba(239,68,68,0.2)' : '#fecaca'}`,
                        }}>
                        <WifiOff size={28} style={{ color: '#ef4444' }} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: t.primary, letterSpacing: '-0.02em' }}>
                            Connection Lost
                        </h3>
                        <p style={{ fontSize: '13px', color: t.secondary, lineHeight: 1.5 }}>
                            Unable to reach the platform API. Please verify your network and try again.
                        </p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                            boxShadow: '0 4px 12px rgba(139,92,246,0.3)',
                            fontSize: '13px',
                        }}>
                        <RefreshCcw size={15} />
                        <span>Retry Connection</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative h-full overflow-y-auto"
            style={{ background: isDarkMode ? '#09090b' : '#f8fafc' }}
        >
            {/* Ambient gradient glow behind content */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 left-1/4 w-[800px] h-[600px] rounded-full"
                    style={{
                        background: isDarkMode
                            ? 'radial-gradient(ellipse, rgba(139,92,246,0.04) 0%, transparent 70%)'
                            : 'radial-gradient(ellipse, rgba(139,92,246,0.03) 0%, transparent 70%)',
                    }} />
                <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: isDarkMode
                            ? 'radial-gradient(ellipse, rgba(99,102,241,0.03) 0%, transparent 70%)'
                            : 'radial-gradient(ellipse, rgba(99,102,241,0.02) 0%, transparent 70%)',
                    }} />
            </div>

            <div className="relative z-10 p-4 sm:p-6 sm:px-8 max-w-[1600px] mx-auto space-y-10 pb-32">

                {/* 1. Command Bar */}
                <SuperAdminCommandBar
                    isDarkMode={isDarkMode}
                    periodLabel={dashboardData?.period}
                    tenantTrend={dashboardData?.kpis?.totalTenants?.trend ?? null}
                    isFetching={isFetching}
                />

                {/* 2. KPI Cards */}
                <section>
                    <SectionHeader
                        icon={<BarChart3 size={18} />}
                        title="Platform KPIs"
                        subtitle="Key metrics across all organizations and users"
                        accentColor="#8b5cf6"
                        isDarkMode={isDarkMode}
                    />
                    <SuperAdminKPILayer
                        isDarkMode={isDarkMode}
                        kpisData={dashboardData?.kpis}
                        periodLabel={dashboardData?.period || '30 Days'}
                    />
                </section>

                {/* Main 3/5 + 2/5 grid */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

                    {/* Left column (3/5) */}
                    <div className="xl:col-span-3 space-y-10">

                        {/* Top Tenants by Messages */}
                        <section>
                            <SectionHeader
                                icon={<TrendingUp size={18} />}
                                title={`Top Organizations — ${dashboardData?.period || '30 Days'}`}
                                subtitle="Highest messaging activity across the platform"
                                accentColor="#f59e0b"
                                isDarkMode={isDarkMode}
                            />
                            <TopTenantsList isDarkMode={isDarkMode} topTenants={dashboardData?.topTenants} />
                        </section>

                        {/* Message Volume Chart */}
                        <section>
                            <SectionHeader
                                icon={<Activity size={18} />}
                                title="Message Volume — Last 7 Days"
                                subtitle="Daily message throughput across all tenants"
                                accentColor="#10b981"
                                isDarkMode={isDarkMode}
                            />
                            <MessageVolumeChart isDarkMode={isDarkMode} dailyMessages={dashboardData?.dailyMessages} />
                        </section>

                        {/* Platform Live Ops */}
                        <section>
                            <SectionHeader
                                icon={<Radio size={18} />}
                                title="Most Active Organizations"
                                subtitle="Top organizations by real-time activity"
                                accentColor="#ef4444"
                                isDarkMode={isDarkMode}
                            />
                            <PlatformLiveOpsPanel isDarkMode={isDarkMode} liveOps={dashboardData?.platformLiveOps} />
                        </section>

                        {/* Tenant Growth */}
                        <section>
                            <SectionHeader
                                icon={<Building2 size={18} />}
                                title="Organization Growth — 12 Months"
                                subtitle="Monthly new organization registrations"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <TenantGrowthChart isDarkMode={isDarkMode} tenantGrowth={dashboardData?.tenantGrowth} />
                        </section>
                    </div>

                    {/* Right sidebar (2/5) */}
                    <div className="xl:col-span-2 space-y-8">

                        {/* Subscription Health */}
                        <section>
                            <SectionHeader
                                icon={<ShieldCheck size={18} />}
                                title="Subscription Health"
                                subtitle="Plan distribution and expiring subscriptions"
                                accentColor="#10b981"
                                isDarkMode={isDarkMode}
                            />
                            <SubscriptionHealthPanel isDarkMode={isDarkMode} subscriptionHealth={dashboardData?.subscriptionHealth} />
                        </section>

                        {/* Recent Registrations */}
                        <section>
                            <SectionHeader
                                icon={<Clock size={18} />}
                                title="Recent Registrations"
                                subtitle="Newest organizations on the platform"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <RecentTenantsList isDarkMode={isDarkMode} recentTenants={dashboardData?.recentTenants} />
                        </section>

                        {/* WhatsApp Quality */}
                        <section>
                            <SectionHeader
                                icon={<MessageSquare size={18} />}
                                title="WhatsApp Quality"
                                subtitle="Account quality ratings and warnings"
                                accentColor="#22c55e"
                                isDarkMode={isDarkMode}
                            />
                            <WhatsAppQualityMap isDarkMode={isDarkMode} whatsappQuality={dashboardData?.whatsappQuality} />
                        </section>

                        {/* AI Platform Usage */}
                        <section>
                            <SectionHeader
                                icon={<Brain size={18} />}
                                title="AI Platform Usage"
                                subtitle="Token consumption by model and tenant"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <AiPlatformUsage isDarkMode={isDarkMode} aiUsage={dashboardData?.aiUsage} />
                        </section>

                        {/* Platform Activity Feed */}
                        <section>
                            <SectionHeader
                                icon={<Rss size={18} />}
                                title="Platform Activity"
                                subtitle="Recent events and system notifications"
                                accentColor="#f59e0b"
                                isDarkMode={isDarkMode}
                            />
                            <PlatformActivityFeed isDarkMode={isDarkMode} activity={dashboardData?.platformActivity} />
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};
