import { _axios } from "@/helper/axios";

// ── KPI Interfaces ─────────────────────────────────────────────────────────
export interface SuperAdminKpiItem {
    value: number;
    trend: number | null;
    status: "great" | "good" | "watch";
}

export interface TenantKpi extends SuperAdminKpiItem {
    active: number;
    inactive: number;
}

export interface MessageKpi extends SuperAdminKpiItem {
    today: number;
}

export interface LeadKpi extends SuperAdminKpiItem {
    total: number;
    today: number;
}

export interface AdminKpi extends SuperAdminKpiItem {
    superAdmins: number;
    platformAdmins: number;
}

export interface TenantUserKpi extends SuperAdminKpiItem {
    byRole: { role: string; count: number }[];
}

export interface CampaignKpi extends SuperAdminKpiItem {
    byStatus: { status: string; count: number }[];
}

export interface WhatsAppAccountKpi {
    connected: number;
    disconnected: number;
    total: number;
    trend: number | null;
    status: "great" | "good" | "watch";
}

export interface LiveChatKpi {
    active: number;
    totalInPeriod: number;
    trend: number | null;
    status: "great" | "good" | "watch";
}

// ── Top Tenant ─────────────────────────────────────────────────────────────
export interface TopTenant {
    tenantId: string;
    companyName: string;
    status: string;
    messageCount: number;
}

// ── Recent Tenant ──────────────────────────────────────────────────────────
export interface RecentTenant {
    tenantId: string;
    companyName: string;
    ownerName: string;
    ownerEmail: string;
    status: string;
    plan: string;
    createdAt: string;
}

// ── Daily Message Volume ───────────────────────────────────────────────────
export interface DailyMessage {
    date: string;
    day: string;
    total: number;
}

// ── Platform Health ────────────────────────────────────────────────────────
export interface PlatformHealth {
    appointments: { totalInPeriod: number; today: number };
    knowledgeBase: { total: number; active: number };
    walletBalance: number;
    aiAnalysis: { total: number; byType: { type: string; count: number }[] };
}

// ── Subscription Health ────────────────────────────────────────────────────
export interface SubscriptionHealth {
    distribution: { status: string; count: number }[];
    expiringSoon: { tenantId: string; companyName: string; expiresAt: string; status: string }[];
}

// ── Revenue Intelligence ───────────────────────────────────────────────────
export interface RevenueData {
    totalRevenue: number;
    byCategory: { category: string; total: number; count: number }[];
    topTenants: { tenantId: string; companyName: string; revenue: number }[];
}

// ── Platform Live Ops ──────────────────────────────────────────────────────
export interface PlatformLiveOps {
    activeChatsNow: number;
    escalationsToday: number;
    totalAgents: number;
    agentUtilization: number;
    topActiveTenants: { tenantId: string; companyName: string; activeChats: number }[];
}

// ── WhatsApp Quality ───────────────────────────────────────────────────────
export interface WhatsAppQuality {
    distribution: { quality: string; count: number }[];
    warningAccounts: { tenantId: string; companyName: string; number: string; quality: string; status: string }[];
}

// ── AI Usage ───────────────────────────────────────────────────────────────
export interface AiUsage {
    byModel: { model: string; inputTokens: number; outputTokens: number; totalTokens: number; cost: number }[];
    topConsumers: { tenantId: string; companyName: string; tokensUsed: number; cost: number }[];
    totalTokens: number;
    totalCost: number;
}

// ── Tenant Growth ──────────────────────────────────────────────────────────
export interface TenantGrowthItem {
    month: string;
    label: string;
    newTenants: number;
}

// ── Alerts ─────────────────────────────────────────────────────────────────
export interface PlatformAlerts {
    expiredSubscriptions: number;
    lowWalletTenants: number;
    disconnectedWhatsApp: number;
    total: number;
}

// ── Platform Activity ──────────────────────────────────────────────────────
export interface PlatformActivityEvent {
    event: string;
    detail: string;
    time: string;
    type: string;
    severity: "success" | "warning" | "critical" | "info";
}

// ── Full Dashboard Data ────────────────────────────────────────────────────
export interface SuperAdminDashboardData {
    period: string;
    kpis: {
        totalTenants: TenantKpi;
        totalMessages: MessageKpi;
        totalLeads: LeadKpi;
        platformAdmins: AdminKpi;
        totalTenantUsers: TenantUserKpi;
        totalCampaigns: CampaignKpi;
        whatsappAccounts: WhatsAppAccountKpi;
        liveChats: LiveChatKpi;
    };
    topTenants: TopTenant[];
    recentTenants: RecentTenant[];
    platformHealth: PlatformHealth;
    dailyMessages: DailyMessage[];
    subscriptionHealth: SubscriptionHealth;
    revenue: RevenueData;
    platformLiveOps: PlatformLiveOps;
    whatsappQuality: WhatsAppQuality;
    aiUsage: AiUsage;
    tenantGrowth: TenantGrowthItem[];
    alerts: PlatformAlerts;
    platformActivity: PlatformActivityEvent[];
}

export interface SuperAdminDashboardResponse {
    status: string;
    data: SuperAdminDashboardData;
}

export class SuperAdminDashboardApiData {
    getDashboardData = async (period: string = "30days") => {
        return await _axios("get", "/management/dashboard", undefined, "application/json", {
            period,
        });
    };
}
