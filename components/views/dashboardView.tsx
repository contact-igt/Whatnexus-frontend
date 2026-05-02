import React, { useState, useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from "@/lib/utils";
import { GlobalCommandBar } from './dashboard/globalCommandBar';
import { ExecutiveKPILayer } from './dashboard/executiveKpiSnapshot';
import { LiveOperationsCenter } from './dashboard/liveOperationsCenter';
import { CampaignIntelligence } from './dashboard/campaignIntelligence';
import { AppointmentsToday } from './dashboard/appointmentsToday';
import { ActivityFeed } from './dashboard/activityFeed';
import { MessagingLimitTracker } from './dashboard/messagingLimitTracker';
import { BillingSummary } from './dashboard/billingSummary';
import { DoctorOverview } from './dashboard/doctorOverview';
import { tx } from './dashboard/glassStyles';
import { WhatsAppConnectionPlaceholder } from './whatsappConfiguration/whatsappConnectionPlaceholder';
import {
    BarChart3, Inbox, MessageCircle,
    Activity, Layers3,
    RefreshCcw, AlertCircle, CreditCard,
    Stethoscope,
    ArrowRight, X, Settings
} from 'lucide-react';
import { useGetWhatsappDashboardQuery } from '@/hooks/useWhatsappDashboardQuery';
import { DateRange, today, todayEnd, buildPresets, getActivePresetLabel } from './dashboard/dashboardDateFilter';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { ThemedLoader } from '@/components/ui/themedLoader';
import { useRouter } from 'next/navigation';

// ─── Section Header ─────────────────────────────────────────────────────────
interface SectionHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    accentColor?: string;
    isDarkMode: boolean;
}

const SectionHeader = ({ icon, title, subtitle, accentColor = '#3b82f6', isDarkMode }: SectionHeaderProps) => {
    const t = tx(isDarkMode);
    return (
        <div className="flex items-center gap-3 px-1 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ 
                    background: isDarkMode ? `${accentColor}15` : `${accentColor}10`,
                    color: accentColor,
                    border: `1px solid ${accentColor}25`
                }}>
                {icon}
            </div>
            <div className="flex flex-col">
                <h2 style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.2, color: t.primary }}>
                    {title}
                </h2>
                <p style={{ fontSize: '12px', fontWeight: 400, color: t.secondary, marginTop: 1 }}>
                    {subtitle}
                </p>
            </div>
        </div>
    );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────


export const DashboardView = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const isManagement = user?.role === 'super_admin' || user?.role === 'platform_admin';
    const [dateRange, setDateRange] = useState<DateRange>({ startDate: new Date(2000, 0, 1), endDate: todayEnd() });
    const [waBannerDismissed, setWaBannerDismissed] = useState(false);
    const { data: dashboardResult, isLoading, isFetching, isError, refetch } = useGetWhatsappDashboardQuery(dateRange.startDate, dateRange.endDate);
    const [loaderDone, setLoaderDone] = useState(false);

    const dashboardData = dashboardResult?.data;

    // Compute WhatsApp connection status once
    const wn = dashboardData?.wabaInfo?.number;
    const ws = dashboardData?.wabaInfo?.status;
    const wabaConnected = !!wn &&
        /^\d+$/.test(String(wn).replace(/[\s+]/g, '')) &&
        (ws === 'Live' || ws === 'active');

    const handleLoaderComplete = useCallback(() => setLoaderDone(true), []);

    // Show loader until: data has arrived AND the 100% animation finished
    if (isLoading || (!loaderDone && !isError)) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center p-6", isDarkMode ? "bg-[#09090b]" : "bg-[#f8fafc]")}>
                <ThemedLoader 
                    isDarkMode={isDarkMode} 
                    text="Initializing Neural Hub" 
                    subtext="Processing live data streams"
                    isComplete={!isLoading && !!dashboardData}
                    onComplete={handleLoaderComplete}
                />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-6"
                style={{ background: isDarkMode ? '#09090b' : '#f8fafc' }}>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                    <AlertCircle size={32} />
                </div>
                <div className="text-center space-y-2">
                    <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-zinc-100" : "text-slate-900")}>Connection Failed</h3>
                    <p className={cn("text-sm max-w-xs mx-auto", isDarkMode ? "text-zinc-400" : "text-slate-600")}>
                        We encountered a sync error. Please check your connection and try again.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                    <RefreshCcw size={16} />
                    <span>Retry Sync</span>
                </button>
            </div>
        );
    }

    // If not management and WhatsApp not connected, show only the placeholder card
    if (!isManagement && !wabaConnected) {
        return (
            <div
                className="relative h-full overflow-y-auto"
                style={{ background: isDarkMode ? '#09090b' : '#f8fafc' }}
            >
                <WhatsAppConnectionPlaceholder />
            </div>
        );
    }

    const dateLabel = getActivePresetLabel(dateRange, buildPresets());
    // True when the selected range overlaps with today (end date >= today 00:00:00)
    const includesInToday = dateRange.endDate >= today();
    // True only when "Today" or "All Time" is selected
    const shouldShowLiveData = dateLabel === 'Today' || dateLabel === 'All Time';

    return (
        <div
            className="relative h-full overflow-y-auto pb-32"
            style={{ background: isDarkMode ? '#09090b' : '#f8fafc' }}
        >

            <div className="relative z-10 p-4 sm:p-6 sm:px-8 max-w-[1600px] mx-auto space-y-8"
                style={{ opacity: isFetching ? 0.6 : 1, transition: 'opacity 0.25s ease', pointerEvents: isFetching ? 'none' : 'auto' }}
            >

                {/* 1. Command Bar */}
                <GlobalCommandBar
                    isDarkMode={isDarkMode}
                    wabaInfo={dashboardData?.wabaInfo}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    isManagement={isManagement}
                    isFetching={isFetching}
                />

                {/* 1a. Date Filter Status Indicator */}
                {isFetching && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border animate-pulse"
                        style={{
                            background: isDarkMode ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)',
                            borderColor: isDarkMode ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)',
                        }}>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: isDarkMode ? '#60a5fa' : '#2563eb'
                        }}>
                            Updating dashboard data for {dateLabel}...
                        </span>
                    </div>
                )}

                {/* 1b. WhatsApp Not Connected Banner */}
                {(() => {
                    if (isManagement || waBannerDismissed) return null;
                    if (wabaConnected) return null;

                    const steps = [
                        { label: 'Create a Meta Business Account', done: false },
                        { label: 'Register a WhatsApp Business phone number', done: false },
                        { label: 'Connect your WABA in WhatsApp Settings', done: false },
                    ];

                    return (
                        <div className="relative overflow-hidden rounded-2xl border animate-in fade-in slide-in-from-top-2 duration-500"
                            style={{
                                background: isDarkMode
                                    ? 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, rgba(249,115,22,0.05) 50%, rgba(239,68,68,0.04) 100%)'
                                    : 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(249,115,22,0.04) 100%)',
                                borderColor: isDarkMode ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.2)',
                            }}
                        >
                            {/* Subtle animated background glow */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-[0.06] blur-3xl"
                                    style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }} />
                                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-[0.04] blur-2xl"
                                    style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)' }} />
                            </div>

                            <div className="relative px-5 py-4 flex items-start gap-5 flex-wrap md:flex-nowrap">

                                {/* Icon column */}
                                <div className="shrink-0 flex flex-col items-center gap-2 pt-0.5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: isDarkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.3)',
                                        }}
                                    >
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ef4444"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                    </div>
                                    {/* Animated signal bars */}
                                    <div className="flex items-end gap-[3px] h-5">
                                        {[3, 5, 7, 9].map((h, i) => (
                                            <div key={i}
                                                className="w-1 rounded-sm opacity-30"
                                                style={{
                                                    height: `${h * 2}px`,
                                                    background: '#ef4444',
                                                    animation: `pulse ${0.8 + i * 0.15}s ease-in-out infinite alternate`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div>
                                        <h3 className="text-[15px] font-bold tracking-tight"
                                            style={{ color: isDarkMode ? '#fca5a5' : '#b91c1c' }}>
                                            WhatsApp Business Account Not Connected
                                        </h3>
                                        <p className="text-[12px] mt-0.5"
                                            style={{ color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                            Your WABA is not set up. Messages cannot be sent or received until connected.
                                        </p>
                                    </div>

                                    {/* Setup steps */}
                                    <div className="flex flex-wrap gap-2">
                                        {steps.map((step, i) => (
                                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                                                style={{
                                                    background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                                                }}
                                            >
                                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                                                    style={{
                                                        background: 'rgba(239,68,68,0.15)',
                                                        color: '#ef4444',
                                                        border: '1px solid rgba(239,68,68,0.3)'
                                                    }}
                                                >
                                                    {i + 1}
                                                </span>
                                                <span className="text-[11px] font-medium"
                                                    style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* CTA + Dismiss */}
                                <div className="flex items-center gap-2 shrink-0 self-center">
                                    <button
                                        onClick={() => router.push('/whatsapp-settings')}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all hover:brightness-110 active:scale-95"
                                        style={{
                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        }}
                                    >
                                        <Settings size={14} />
                                        Connect Now
                                        <ArrowRight size={13} />
                                    </button>
                                    <button
                                        onClick={() => setWaBannerDismissed(true)}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/10"
                                        style={{ color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
                                        title="Dismiss"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* 2. Messaging Limit Tracker (only when genuinely connected) */}
                {(() => {
                    if (!wabaConnected || isManagement) return null;

                    const tier = dashboardData!.wabaInfo.tier;
                    // WABA-level (portfolio) daily unique-user limits per Meta's current tier model
                    const tierLimits: Record<string, number> = {
                        TIER_NOT_SET: 250,
                        TIER_2K:      2000,
                        TIER_10K:     10000,
                        TIER_100K:    100000,
                        TIER_UNLIMITED: Infinity,
                    };
                    const limit = tierLimits[tier?.toUpperCase?.()] ?? 250;
                    return (
                        <section>
                            <SectionHeader
                                icon={<Layers3 size={18} />}
                                title="Account & Messaging Limits"
                                subtitle="Rolling 24-hour limit status and account upgrade protection"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <MessagingLimitTracker
                                isDarkMode={isDarkMode}
                                limitData={{
                                    limit,
                                    used: dashboardData!.wabaInfo?.rolling24hUsed ?? 0,
                                    sevenDayUnique: dashboardData!.wabaInfo?.sevenDayUnique ?? 0,
                                    thirtyDayUnique: dashboardData!.wabaInfo?.thirtyDayUnique ?? 0,
                                    quality: dashboardData!.wabaInfo.quality as 'GREEN' | 'YELLOW' | 'RED',
                                }}
                            />
                        </section>
                    );
                })()}

                {/* 3. KPI Cards — 4 per row */}
                <section>
                    <SectionHeader
                        icon={<BarChart3 size={18} />}
                        title="Key Performance Indicators"
                        subtitle="Business health at a glance — period-filtered analytics & live metrics"
                        accentColor="#10b981"
                        isDarkMode={isDarkMode}
                    />
                    <ExecutiveKPILayer
                        isDarkMode={isDarkMode}
                        kpisData={dashboardData?.kpis}
                        periodLabel={dateLabel}
                        includesInToday={includesInToday}
                        extraKpis={{
                            totalSources:      dashboardData?.kpis?.knowledgeSources?.value  ?? 0,
                            totalFaqs:         dashboardData?.kpis?.totalFaqs?.value          ?? 0,
                            totalContacts:     dashboardData?.kpis?.totalContacts?.value      ?? 0,
                            totalGroups:       dashboardData?.kpis?.totalGroups?.value        ?? 0,
                            approvedTemplates: dashboardData?.kpis?.approvedTemplates?.value  ?? 0,
                        }}
                    />
                </section>

                {/* Main 3/5 + 2/5 grid */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                    {/* Left column (3/5) */}
                    <div className="xl:col-span-3 space-y-8">

                        {/* 6. Live Operations — only when today is in range or All Time is selected */}
                        {shouldShowLiveData && (
                            <section>
                                <SectionHeader
                                    icon={<MessageCircle size={18} />}
                                    title="Live Operations"
                                    subtitle="Real-time chat queue & agent status"
                                    accentColor="#f43f5e"
                                    isDarkMode={isDarkMode}
                                />
                                <LiveOperationsCenter isDarkMode={isDarkMode} canOpenInbox={!isManagement} liveOpsData={dashboardData?.liveOperations} />
                            </section>
                        )}

                        {/* 3. Campaign Intelligence — below Live Operations */}
                        <section>
                            <SectionHeader
                                icon={<Inbox size={18} />}
                                title={`Campaign Intelligence — ${dateLabel}`}
                                subtitle="WhatsApp broadcast results and delivery analytics"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <CampaignIntelligence isDarkMode={isDarkMode} campaignsData={dashboardData?.campaigns} />
                        </section>

                    </div>

                    {/* Right sidebar (2/5) */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* 7. Appointments Today — only when today is in range or All Time is selected */}
                        {shouldShowLiveData && (
                            <section>
                                <AppointmentsToday isDarkMode={isDarkMode} followUpsData={dashboardData?.followUps} />
                            </section>
                        )}

                        {/* Billing & Spend */}
                        <section>
                            <SectionHeader
                                icon={<CreditCard size={18} />}
                                title={`Meta Billing — ${dateLabel}`}
                                subtitle="Estimated spend on Meta conversation fees"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <BillingSummary isDarkMode={isDarkMode} billingData={dashboardData?.billingSummary} periodLabel={dateLabel} />
                        </section>

                        {/* Doctor Overview */}
                        <section>
                            <DoctorOverview isDarkMode={isDarkMode} doctorData={dashboardData?.doctorOverview} />
                        </section>

                        {/* 8. Recent Activity — only when today is in range or All Time is selected */}
                        {shouldShowLiveData && (
                            <section>
                                <SectionHeader
                                    icon={<Activity size={18} />}
                                    title="Recent Activity"
                                    subtitle="Latest system events — live feed"
                                    accentColor="#a855f7"
                                    isDarkMode={isDarkMode}
                                />
                                <ActivityFeed isDarkMode={isDarkMode} recentActivity={dashboardData?.recentActivity} />
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
