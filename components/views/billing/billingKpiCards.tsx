"use client";
import { GlassCard } from "@/components/ui/glassCard";
import { PulseMetric } from "@/components/ui/pulseMetric";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, Megaphone, Zap, ShieldCheck, MessageCircle, Send, CheckCircle, BarChart3, Loader2 } from "lucide-react";
import { useGetBillingKpiQuery } from "@/hooks/useBillingQuery";

interface BillingKpiCardsProps {
  isDarkMode: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const BillingKpiCards = ({ isDarkMode, startDate, endDate }: BillingKpiCardsProps) => {
  const { data: responseData, isLoading, error } = useGetBillingKpiQuery(
    startDate?.toISOString(),
    endDate?.toISOString()
  );
  
  // Unwrap the API response
  const kpiData = responseData?.data || {
    totalSpentEstimated: 0,
    marketingSpent: 0,
    utilitySpent: 0,
    authSpent: 0,
    totalMessagesSent: 0,
    billableConversations: 0,
    freeConversations: 0,
    walletBalance: 0,
    currency: 'INR'
  };

  // Convert raw values into the UI format
  const total = kpiData.totalSpentEstimated || 1; // Avoid div by 0
  
  const currencySymbol = kpiData.currency === 'INR' ? '₹' : kpiData.currency;
  
  const kpis = [
    { label: 'Wallet Balance', value: `${currencySymbol}${kpiData.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: '—', color: 'emerald', icon: Wallet },
    { label: 'Total Estimated Spend', value: `${currencySymbol}${kpiData.totalSpentEstimated.toFixed(2)}`, trend: '—', color: 'blue', icon: TrendingUp },
    { label: 'Marketing Spend', value: `${currencySymbol}${kpiData.marketingSpent.toFixed(2)}`, trend: '—', percent: total > 1 ? Math.round((kpiData.marketingSpent / total) * 100) : 0, color: 'purple', icon: Megaphone },
    { label: 'Utility Spend', value: `${currencySymbol}${kpiData.utilitySpent.toFixed(2)}`, trend: '—', percent: total > 1 ? Math.round((kpiData.utilitySpent / total) * 100) : 0, color: 'orange', icon: Zap },
    { label: 'Auth Spend', value: `${currencySymbol}${kpiData.authSpent.toFixed(2)}`, trend: '—', percent: total > 1 ? Math.round((kpiData.authSpent / total) * 100) : 0, color: 'rose', icon: ShieldCheck },
    { label: 'Free Tier Campaigns', value: (kpiData.freeConversations || 0).toLocaleString(), trend: '—', color: 'emerald', icon: MessageCircle },
    { label: 'Messages Sent', value: kpiData.totalMessagesSent.toLocaleString(), trend: '—', color: 'blue', icon: Send },
  ];


  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10 w-full col-span-full">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, i) => (
        <PulseMetric 
          key={i}
          label={kpi.label} 
          value={kpi.value} 
          trend={kpi.trend} 
          color={kpi.color} 
          isDarkMode={isDarkMode} 
          percent={kpi.percent}
          icon={kpi.icon}
        />
      ))}

      {/* Enhanced Billing Status Card */}
      <div className={cn(
        "relative group p-6 cursor-default h-full flex flex-col justify-between min-h-[160px] rounded-[24px] border transition-all duration-500",
        isDarkMode 
            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10" 
            : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
      )}>
        <div className={cn(
            "absolute inset-0 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-emerald-500 bg-opacity-5"
        )} />
        
        <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>Billing Status</p>
              <div className={cn(
                "p-2 rounded-xl transition-all duration-500 border relative overflow-hidden", 
                isDarkMode 
                    ? 'bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:border-white/20' 
                    : 'bg-white border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100'
              )}>
                <CheckCircle size={14} className="text-emerald-500" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className={cn("text-3xl font-black tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Active</h3>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <div className="relative">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-wider", isDarkMode ? "text-emerald-400" : "text-emerald-600")}>
                All systems operational
              </span>
            </div>
          </div>

          <div className={cn("mt-auto pt-4 flex items-center justify-between border-t", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
            <div className="space-y-0.5">
              <p className={cn("text-[8px] font-bold uppercase tracking-wider opacity-40")}>Billable Convos</p>
              <p className={cn("text-xs font-black tracking-tight", isDarkMode ? "text-white/80" : "text-slate-900")}>{kpiData.billableConversations.toLocaleString()}</p>
            </div>
            <div className="text-right space-y-0.5">
              <p className={cn("text-[8px] font-bold uppercase tracking-wider opacity-40")}>Avg Cost/Conv</p>
              <p className={cn("text-xs font-black tracking-tight", isDarkMode ? "text-white/80" : "text-slate-900")}>
                ₹{kpiData.billableConversations > 0 ? (kpiData.totalSpentEstimated / kpiData.billableConversations).toFixed(4) : "0.0000"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
