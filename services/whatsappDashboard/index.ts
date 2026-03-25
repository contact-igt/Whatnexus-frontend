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
  period: string; // "7 Days" | "30 Days" | "All Time"

  wabaInfo: {
    number: string;
    status: string;  // "Live" | "inactive" | "Unknown"
    quality: string; // "GREEN" | "YELLOW" | "RED"
    region: string;
    tier: string;
    rolling24hUsed: number;
    sevenDayUnique: number;
  };

  header: {
    revenueToday: string;      // ₹ already in string — Rule 6
    newLeadsToday: number;
    resolvedToday: number;
    messagesSentToday: number;
    needsAttention: number;
  };

  kpis: {
    totalLeads: KpiItem;
    newLeadsToday: KpiItem;
    activeChats: KpiItem;
    aiAutoResolved: KpiItem;    // value is already % — Rule 8
    escalatedToAgent: KpiItem;  // value is a COUNT (not %)
    appointmentsToday: KpiItem;
  };

  liveOperations: {
    hotLeads: HotLead[];
    metrics: { unassigned: number; escalated: number };
    agentWorkload: AgentWorkload[];
  };

  campaigns: Campaign[];

  recentActivity: ActivityEvent[];

  agentPerformance: AgentPerformanceData;

  followUps: FollowUpsData;

  messagingAnalytics: MessagingAnalyticsData;

  // New sections
  billingSummary: {
    totalSpent: number;
    marketing: number;
    utility: number;
    authentication: number;
    totalMessages: number;
    billable: number;
    free: number;
  };

  doctorOverview: {
    statusBreakdown: { status: string; count: number }[];
    totalDoctors: number;
    specializations: number;
  };

  knowledgeHealth: {
    totalSources: number;
    activeSources: number;
    inactiveSources: number;
    totalChunks: number;
    sourceTypes: { type: string; count: number }[];
  };

  contactOverview: {
    totalContacts: number;
    blocked: number;
    aiSilenced: number;
    totalGroups: number;
    avgGroupSize: number;
  };
}

export interface DashboardResponse {
  status: string;
  data: DashboardData;
}

export class DashboardApiData {
  getDashboardData = async (tenantId: string, period: string = "30days") => {
    return await _axios("get", "/whatsapp/dashboard", undefined, "application/json", {
      tenantId,
      period,
    });
  };
}
