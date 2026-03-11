"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { PulseMetric } from "@/components/ui/pulse-metric";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, Megaphone, Zap, ShieldCheck, MessageCircle, Send, CheckCircle, BarChart3 } from "lucide-react";
import { BILLING_KPI } from "./billing-mock-data";

interface BillingKpiCardsProps {
  isDarkMode: boolean;
}

export const BillingKpiCards = ({ isDarkMode }: BillingKpiCardsProps) => {
  const kpis = [
    { label: 'Wallet Balance', ...BILLING_KPI.walletBalance, color: 'emerald', icon: Wallet },
    { label: 'Total Spend', ...BILLING_KPI.totalSpend, color: 'blue', icon: TrendingUp },
    { label: 'Marketing Spend', ...BILLING_KPI.marketingSpend, color: 'purple', icon: Megaphone },
    { label: 'Utility Spend', ...BILLING_KPI.utilitySpend, color: 'orange', icon: Zap },
    { label: 'Auth Spend', ...BILLING_KPI.authSpend, color: 'rose', icon: ShieldCheck },
    { label: 'Free Tier Messages', ...BILLING_KPI.freeTierUsage, color: 'emerald', icon: MessageCircle },
    { label: 'Messages Sent', ...BILLING_KPI.messagesSent, color: 'blue', icon: Send },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <GlassCard key={i} isDarkMode={isDarkMode} delay={i * 80} className="p-0">
          <PulseMetric label={kpi.label} value={kpi.value} trend={kpi.trend} color={kpi.color} isDarkMode={isDarkMode} percent={kpi.percent} />
        </GlassCard>
      ))}
      {/* Billing Status Card */}
      <GlassCard isDarkMode={isDarkMode} delay={560} className="p-0">
        <div className="relative group p-6 cursor-default h-full flex flex-col justify-between">
          {/* Subtle glow on hover */}
          <div className={cn(
            "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl",
            "bg-emerald-500/5"
          )} />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-1">
              <p className={cn("text-[10px] font-black uppercase tracking-widest", isDarkMode ? 'text-white/40' : 'text-slate-400')}>Billing Status</p>
              <div className={cn(
                "p-1.5 rounded-lg transition-colors duration-300",
                isDarkMode ? 'bg-white/5 group-hover:bg-emerald-500/10' : 'bg-slate-100 group-hover:bg-emerald-50'
              )}>
                <CheckCircle size={12} className="text-emerald-500" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2 mt-1">
              <h3 className={cn("text-3xl font-black tracking-tighter", isDarkMode ? 'text-white' : 'text-slate-800')}>Active</h3>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-ping" />
              </div>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>All systems operational</span>
            </div>
            {/* Extra meta stats */}
            <div className={cn("mt-4 pt-3 border-t space-y-1.5", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
              <div className="flex justify-between items-center">
                <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/25' : 'text-slate-400')}>Billable Convos</span>
                <span className={cn("text-[10px] font-bold tabular-nums", isDarkMode ? 'text-white/60' : 'text-slate-600')}>{BILLING_KPI.billableConversations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/25' : 'text-slate-400')}>Avg Cost/Conv</span>
                <span className={cn("text-[10px] font-bold tabular-nums", isDarkMode ? 'text-white/60' : 'text-slate-600')}>{BILLING_KPI.avgCostPerConversation}</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
