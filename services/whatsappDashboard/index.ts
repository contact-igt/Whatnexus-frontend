import { _axios } from "@/helper/axios";

// ── Funnel row ─────────────────────────────────────────────────────────────────
export interface FunnelRow {
  stage: string;
  count: number;
  pctOfTotal: number;    // → bar width
  pctOfPrevious: number; // → right % label (green)
  dropOff: number;       // always ≤ 0 → red badge
}

// ── KPI item ───────────────────────────────────────────────────────────────────
export interface KpiItem {
  value: number;
  trend: number | null;
  status: "great" | "good" | "watch";
}

// ── Hot lead ───────────────────────────────────────────────────────────────────
export interface HotLead {
  name: string;
  phone: string;
  score: number;
  heatState: "hot" | "warm";
  status: string;   // "Hot Lead" | "Warm Lead" — chip label
  waiting: string;  // pre-formatted → render as-is
}

// ── Agent workload (Live Ops panel) ────────────────────────────────────────────
export interface AgentWorkload {
  name: string;
  chatCount: number;    // → append " chats"
  percentage: number;   // → bar fill width
}

// ── Campaign ───────────────────────────────────────────────────────────────────
export interface Campaign {
  name: string;
  status: "completed" | "running" | "scheduled" | "paused";
  audience: number;    // → .toLocaleString()
  delivered: number;   // → .toLocaleString()
  readPct: number;     // Read Rate %  → append %
  replyPct: number;    // Reply Rate % → append %
}

// ── Activity event ─────────────────────────────────────────────────────────────
export interface ActivityEvent {
  event: string;   // emoji + title — render as-is
  detail: string;
  details?: string;
  time: string;    // pre-formatted — render as-is (Rule 5)
  type: "urgent" | "missing_knowledge" | "out_of_scope" | "sentiment";
  status: "pending" | "act_on" | "resolved" | "ignored";
}

// ── Agent performance (Campaigns & Team section) ───────────────────────────────
export interface AgentPerformanceAgent {
  name: string;
  role: string;
  onlineStatus: "online" | "offline"; // → status badge colour
  chatCount: number;                   // shown right of name
  responseTime: string;                // pre-formatted → render as-is
  barPct: number;                      // → progress bar width
}

export interface AgentPerformanceData {
  agents: AgentPerformanceAgent[];
  summary: {
    peakTime: string;     // pre-formatted → render as-is
    active: string;       // "6/8" → render as-is
    satisfaction: string; // "N/A" placeholder → render as-is
  };
}

// ── Follow-ups ─────────────────────────────────────────────────────────────────
export interface FollowUpAppointment {
  name: string;
  time: string;    // "HH:MM:SS" → format to "12:00 PM" in UI
  type: "Pending" | "Confirmed";
  contact: string;
}

export interface FollowUpsData {
  dueToday: number;
  completedToday: number;
  overdue: number;
  handledBy: {
    aiAutomated: number;  // % → bar width + label
    agentManual: number;  // % → bar width + label
  };
  upcomingToday: FollowUpAppointment[];
  nurtureEfficiency: {
    value: number; // % number → display as "94%"
    grade: string; // pre-computed grade string → render as-is
  };
}

// ── Messaging analytics ────────────────────────────────────────────────────────
export interface DailyVolume {
  day: string;      // "Mon" "Tue" … → X-axis label
  date: string;
  total: number;    // TOTAL VOLUME line → Y value
  aiHandled: number; // AI HANDLED line → Y value
}

export interface MessagingAnalyticsData {
  totalMessages: number;    // → .toLocaleString()
  trendVsLastWeek: number;  // % → prefix "+" if positive → badge
  responseRate: number;     // % → append %
  avgPerDay: number;
  msgsPerHour: number;
  deliveryRate: number;     // % → append %
  failedRate: number;       // % → append %, colour red
  dailyVolume: DailyVolume[];
}

// ── Full dashboard data ────────────────────────────────────────────────────────
export interface DashboardData {
  period: string;
  isLiveMode: boolean; // true when endDate >= today (enables Live & Today KPIs + live sections)

  wabaInfo: {
    number: string;
    status: string;  // "Live" | "inactive" | "Unknown"
    quality: string; // "GREEN" | "YELLOW" | "RED"
    region: string;
    tier: string;
    rolling24hUsed: number;
    sevenDayUnique: number;
    thirtyDayUnique: number;
  };

  kpis: {
    // Always present (all date ranges)
    totalLeads: KpiItem & { allTime: number };
    aiAutoResolved: KpiItem;
    totalCampaigns: number;
    totalFaqs: KpiItem;
    approvedTemplates: KpiItem;
    // Period-filtered KPIs (always present, 0 when nothing in range)
    knowledgeSources: KpiItem;
    totalContacts: KpiItem;
    totalGroups: KpiItem;
    // Live & Today only (present when isLiveMode=true, absent otherwise)
    newLeadsToday?: KpiItem;
    activeChats?: KpiItem;
    escalatedToAgent?: KpiItem;
    appointmentsToday?: KpiItem;
  };

  campaigns: Campaign[];

  billingSummary: {
    totalSpent: number;
    marketing: number;
    utility: number;
    authentication: number;
    service: number;
    totalMessages: number;
    billable: number;
    free: number;
  };

  doctorOverview: {
    statusBreakdown: { status: string; count: number }[];
    totalDoctors: number;
    specializations: number;
  };

  // Live-mode sections — null when isLiveMode=false
  liveOperations: {
    hotLeads: HotLead[];
    metrics: { unassigned: number; escalated: number };
    agentWorkload: AgentWorkload[];
  } | null;

  followUps: {
    dueToday: number;
    completedToday: number;
    overdue: number;
    upcomingToday: { name: string; time: string; type: string; contact: string }[];
  } | null;

  recentActivity: ActivityEvent[];
}

export interface DashboardResponse {
  status: string;
  data: DashboardData;
}

// ── Weekly Summary Types ───────────────────────────────────────────────────────
export interface WeeklySummaryItem {
  weekNumber: number;
  startDate: string;
  endDate: string;
  summary: string;
  totalChats: number;
  newLeads: number;
  responseRate: number;
  appointments?: number;
  resolvedChats?: number;
  uniqueConversations?: number;
}

export interface WeeklySummaryResponse {
  success: boolean;
  data: {
    weeks: WeeklySummaryItem[];
    totalWeeks: number;
    generatedAt: string;
  };
}

export interface ContactWeeklySummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  summary: string;
  messageCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  avgResponseTime: string;
  keyTopics: string[];
  actionItems: string[];
  engagementScore: number;
  changeFromPrevious: number;
}

export interface ContactWeeklySummaryResponse {
  success: boolean;
  data: {
    contact: {
      contact_id?: string;
      name?: string;
      phone: string;
      email?: string;
    };
    totalMessages: number;
    avgEngagement: number;
    totalWeeks: number;
    totalActionItems: number;
    weeks: ContactWeeklySummary[];
  };
}

export class DashboardApiData {
  getDashboardData = async (tenantId: string, startDate: string, endDate: string) => {
    return await _axios("get", "/whatsapp/dashboard", undefined, "application/json", {
      tenantId,
      startDate,
      endDate,
    });
  };

  // Weekly Summary APIs
  getWeeklySummary = async () => {
    return await _axios("get", "/whatsapp/weekly-summary");
  };

  getContactWeeklySummary = async (contactId?: string, phone?: string) => {
    const params: Record<string, string> = {};
    if (phone) params.phone = phone;

    const endpoint = contactId
      ? `/whatsapp/weekly-summary/contact/${contactId}`
      : `/whatsapp/weekly-summary/contact`;

    return await _axios("get", endpoint, undefined, "application/json", params);
  };
}