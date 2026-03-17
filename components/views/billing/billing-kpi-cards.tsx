"use client";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, Megaphone, Zap, ShieldCheck, MessageCircle, Send, CheckCircle, BarChart3, Loader2 } from "lucide-react";
import { useGetBillingKpiQuery } from "@/hooks/useBillingQuery";
import { GlassCard } from "../../ui/glassCard";
import { PulseMetric } from "@/components/ui/pulseMetric";

interface BillingKpiCardsProps {
  isDarkMode: boolean;
}

export const BillingKpiCards = ({ isDarkMode }: BillingKpiCardsProps) => {
  const { data: responseData, isLoading, error } = useGetBillingKpiQuery();
  
  // Unwrap the API response
  const kpiData = responseData?.data || {
    totalSpentEstimated: 0,
    marketingSpent: 0,
    utilitySpent: 0,
    authSpent: 0,
    totalMessagesSent: 0,
    billableConversations: 0,
    freeConversations: 0
  };

  // Convert raw values into the UI format (with mock trends mapped temporarily until we build actual history comparison)
  const kpis = [
    { label: 'Wallet Balance', value: '₹0.00', trend: 'up', percent: 0, color: 'emerald', icon: Wallet },
    { label: 'Total Estimated Spend', value: `₹${kpiData.totalSpentEstimated.toFixed(2)}`, trend: 'up', percent: 70, color: 'blue', icon: TrendingUp },
    { label: 'Marketing Spend', value: `₹${kpiData.marketingSpent.toFixed(2)}`, trend: 'up', percent: 45, color: 'purple', icon: Megaphone },
    { label: 'Utility Spend', value: `₹${kpiData.utilitySpent.toFixed(2)}`, trend: 'down', percent: 20, color: 'orange', icon: Zap },
    { label: 'Auth Spend', value: `₹${kpiData.authSpent.toFixed(2)}`, trend: 'up', percent: 5, color: 'rose', icon: ShieldCheck },
    { label: 'Free Tier Campaigns', value: (kpiData.freeConversations || 0).toLocaleString(), trend: 'down', percent: 0, color: 'emerald', icon: MessageCircle },
    { label: 'Messages Sent', value: kpiData.totalMessagesSent.toLocaleString(), trend: 'up', percent: 100, color: 'blue', icon: Send },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 w-full col-span-full">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

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
                <span className={cn("text-[10px] font-bold tabular-nums", isDarkMode ? 'text-white/60' : 'text-slate-600')}>{kpiData.billableConversations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/25' : 'text-slate-400')}>Avg Cost/Conv</span>
                <span className={cn("text-[10px] font-bold tabular-nums", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                  ₹{kpiData.billableConversations > 0 ? (kpiData.totalSpentEstimated / kpiData.billableConversations).toFixed(4) : "0.0000"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
