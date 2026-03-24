import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from "@/lib/utils";
import { GlobalCommandBar } from './dashboard/globalCommandBar';
import { ExecutiveKPILayer } from './dashboard/executiveKpiSnapshot';
import { LiveOperationsCenter } from './dashboard/liveOperationsCenter';
import { CampaignIntelligence } from './dashboard/campaignIntelligence';
import { AgentPerformance } from './dashboard/agentPerformance';
import { AppointmentsToday } from './dashboard/appointmentsToday';
import { MessagingAnalytics } from './dashboard/messagingAnalytics';
import { ActivityFeed } from './dashboard/activityFeed';
import { MessagingLimitTracker } from './dashboard/messagingLimitTracker';
import { BillingSummary } from './dashboard/billingSummary';
import { DoctorOverview } from './dashboard/doctorOverview';
import { KnowledgeHealth } from './dashboard/knowledgeHealth';
import { ContactOverview } from './dashboard/contactOverview';
import { tx } from './dashboard/glassStyles';
import {
    BarChart3, Inbox, MessageCircle,
    CalendarCheck, Activity, Layers3,
    RefreshCcw, AlertCircle, CreditCard,
    Stethoscope, BookOpen, Users
} from 'lucide-react';
import { useGetWhatsappDashboardQuery } from '@/hooks/useWhatsappDashboardQuery';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { ThemedLoader } from '@/components/ui/themedLoader';

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
    const isManagement = user?.role === 'super_admin' || user?.role === 'platform_admin';
    const [period, setPeriod] = useState<string>("30days");
    const { data: dashboardResult, isLoading, isError, refetch } = useGetWhatsappDashboardQuery(period);

    const dashboardData = dashboardResult?.data;



    if (isLoading) {
        return (
            <div className={cn("min-h-screen flex items-center justify-center p-6", isDarkMode ? "bg-[#09090b]" : "bg-[#f8fafc]")}>
                <ThemedLoader 
                    isDarkMode={isDarkMode} 
                    text="Initializing Neural Hub" 
                    subtext="Processing live data streams" 
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

    return (
        <div
            className="relative h-full overflow-y-auto pb-32"
            style={{ background: isDarkMode ? '#09090b' : '#f8fafc' }}
        >

            <div className="relative z-10 p-4 sm:p-6 sm:px-8 max-w-[1600px] mx-auto space-y-8">

                {/* 1. Command Bar */}
                <GlobalCommandBar
                    isDarkMode={isDarkMode}
                    headerData={dashboardData?.header}
                    wabaInfo={dashboardData?.wabaInfo}
                    period={period}
                    setPeriod={setPeriod}
                    isManagement={isManagement}
                />

                {/* 2. Messaging Limit Tracker (CRITICAL) */}
                {!isManagement && dashboardData?.wabaInfo && (
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
                                limit: dashboardData.wabaInfo.tier === 'TIER_10K' ? 10000 : dashboardData.wabaInfo.tier === 'TIER_100K' ? 100000 : dashboardData.wabaInfo.tier === 'TIER_UNLIMITED' ? Infinity : 1000,
                                used: dashboardData.wabaInfo?.rolling24hUsed ?? 0,
                                sevenDayUnique: dashboardData.wabaInfo?.sevenDayUnique ?? 0,
                                quality: dashboardData.wabaInfo.quality
                            }}
                        />
                    </section>
                )}

                {/* 3. KPI Cards — 4 per row */}
                <section>
                    <SectionHeader
                        icon={<BarChart3 size={18} />}
                        title="Key Performance Indicators"
                        subtitle="Business health at a glance — period-filtered analytics & live metrics"
                        accentColor="#10b981"
                        isDarkMode={isDarkMode}
                    />
                    <ExecutiveKPILayer isDarkMode={isDarkMode} kpisData={dashboardData?.kpis} periodLabel={dashboardData?.period || '30 Days'} />
                </section>

                {/* Main 3/5 + 2/5 grid */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

                    {/* Left column (3/5) */}
                    <div className="xl:col-span-3 space-y-8">

                        {/* 3. Campaigns + Agent Performance */}
                        <section>
                            <SectionHeader
                                icon={<Inbox size={18} />}
                                title={`Campaigns & Team Performance — ${dashboardData?.period || '30 Days'}`}
                                subtitle="WhatsApp broadcast results and agent workload"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <div className="flex flex-col gap-6">
                                <CampaignIntelligence isDarkMode={isDarkMode} campaignsData={dashboardData?.campaigns} />
                                <AgentPerformance isDarkMode={isDarkMode} agentData={dashboardData?.agentPerformance} />
                            </div>
                        </section>

                        {/* 5. Messaging Analytics (full width in left col) */}
                        <section>
                            <SectionHeader
                                icon={<CalendarCheck size={18} />}
                                title={`Messaging Volume & Analytics — ${dashboardData?.period || '30 Days'}`}
                                subtitle="Communication trends and delivery stats (chart: last 7 days)"
                                accentColor="#f59e0b"
                                isDarkMode={isDarkMode}
                            />
                            <MessagingAnalytics isDarkMode={isDarkMode} messagingData={dashboardData?.messagingAnalytics} />
                        </section>

                        {/* Knowledge Base Health */}
                        <section>
                            <SectionHeader
                                icon={<BookOpen size={18} />}
                                title="Knowledge Base Health"
                                subtitle="AI knowledge sources and training data"
                                accentColor="#10b981"
                                isDarkMode={isDarkMode}
                            />
                            <KnowledgeHealth isDarkMode={isDarkMode} knowledgeData={dashboardData?.knowledgeHealth} />
                        </section>

                        {/* Contacts & Audience */}
                        <section>
                            <SectionHeader
                                icon={<Users size={18} />}
                                title="Contacts & Audience"
                                subtitle="Contact base, groups and segments overview"
                                accentColor="#f59e0b"
                                isDarkMode={isDarkMode}
                            />
                            <ContactOverview isDarkMode={isDarkMode} contactData={dashboardData?.contactOverview} />
                        </section>

                    </div>

                    {/* Right sidebar (2/5) */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* 6. Live Operations */}
                        <section>
                            <SectionHeader
                                icon={<MessageCircle size={18} />}
                                title="Live Operations"
                                subtitle="Real-time chat queue & agent status"
                                accentColor="#f43f5e"
                                isDarkMode={isDarkMode}
                            />
                            <LiveOperationsCenter isDarkMode={isDarkMode} liveOpsData={dashboardData?.liveOperations} />
                        </section>

                        {/* 7. Appointments Today */}
                        <section>
                            <AppointmentsToday isDarkMode={isDarkMode} followUpsData={dashboardData?.followUps} />
                        </section>

                        {/* Billing & Spend */}
                        <section>
                            <SectionHeader
                                icon={<CreditCard size={18} />}
                                title={`Billing & Spend — ${dashboardData?.period || '30 Days'}`}
                                subtitle="Cost breakdown and message usage"
                                accentColor="#8b5cf6"
                                isDarkMode={isDarkMode}
                            />
                            <BillingSummary isDarkMode={isDarkMode} billingData={dashboardData?.billingSummary} periodLabel={dashboardData?.period || '30 Days'} />
                        </section>

                        {/* Doctor Overview */}
                        <section>
                            <DoctorOverview isDarkMode={isDarkMode} doctorData={dashboardData?.doctorOverview} />
                        </section>

                        {/* 8. Recent Activity */}
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
                    </div>
                </div>
            </div>
        </div>
    );
};
