"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { COUNTRY_SPEND } from "./billingMockData";
import { useGetBillingSpendChartQuery } from "@/hooks/useBillingQuery";
import { Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glassCard";

interface BillingAnalyticsProps {
  isDarkMode: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const BillingAnalytics = ({ isDarkMode, startDate, endDate }: BillingAnalyticsProps) => {

  const { data: responseData, isLoading } = useGetBillingSpendChartQuery(
    startDate?.toISOString(),
    endDate?.toISOString()
  );
  const rawData = responseData?.data || [];

  // Map backend daily data to chart format
  const chartData = rawData.length > 0 ? rawData.map((d: any) => ({
    label: new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    marketing: d.marketing || 0,
    utility: d.utility || 0,
    auth: d.auth || 0
  })) : [{ label: 'No Data', marketing: 0, utility: 0, auth: 0 }];

  const maxVal = Math.max(...chartData.map((d: any) => d.marketing + d.utility + d.auth), 1); // Avoid div by 0
  const totalSpend = chartData.reduce((sum: number, d: any) => sum + d.marketing + d.utility + d.auth, 0);
  const avgSpend = chartData.length > 0 ? Math.round(totalSpend / chartData.length) : 0;
  
  // Find peak day
  const peakDay = chartData.reduce((max: any, d: any) => 
    (d.marketing + d.utility + d.auth) > (max.marketing + max.utility + max.auth) ? d : max
  , chartData[0]);

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Billing Analytics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Trend Chart */}
        <GlassCard isDarkMode={isDarkMode} delay={600} className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={cn("font-bold text-sm uppercase tracking-wide flex items-center space-x-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                <BarChart3 size={16} className="text-emerald-500" />
                <span>Spend by Category</span>
              </h3>
              <p className={cn("text-[10px] font-medium mt-1 ml-6", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                Conversation-based cost breakdown
              </p>
            </div>
            <div className={cn("flex p-0.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider", isDarkMode ? 'bg-white/[0.03] border-white/5 text-emerald-500' : 'bg-slate-50 border-slate-200 text-emerald-600')}>
              Daily Spend
            </div>
          </div>

          {/* Stacked Bar Chart */}
          <div className="flex items-end gap-1.5 h-[220px] px-1 relative">
            {isLoading ? (
               <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
               </div>
            ) : chartData.map((d: any, i: number) => {
              const total = d.marketing + d.utility + d.auth;
              const mH = (d.marketing / maxVal) * 100;
              const uH = (d.utility / maxVal) * 100;
              const aH = (d.auth / maxVal) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                  <div className={cn("text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0", isDarkMode ? 'text-white' : 'text-slate-700')}>
                    ₹{total.toFixed(2)}
                  </div>
                  <div className="w-full flex flex-col gap-[2px] items-stretch rounded-t-lg overflow-hidden" style={{ height: `${((total / maxVal) * 100)}%` }}>
                    <div className="rounded-t-md bg-gradient-to-t from-purple-600 to-purple-400 transition-all duration-500 group-hover:brightness-125 group-hover:shadow-[0_0_12px_rgba(147,51,234,0.3)]" style={{ flex: mH }} />
                    <div className="bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-500 group-hover:brightness-125 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.3)]" style={{ flex: uH }} />
                    <div className="rounded-b-md bg-gradient-to-t from-rose-500 to-rose-400 transition-all duration-500 group-hover:brightness-125 group-hover:shadow-[0_0_12px_rgba(244,63,94,0.3)]" style={{ flex: aH }} />
                  </div>
                  <span className={cn("text-[9px] font-semibold mt-1", isDarkMode ? 'text-white/25' : 'text-slate-400')}>{d.label.split(' ').pop()}</span>
                </div>
              );
            })}
          </div>

          {/* Legend + Summary Stats */}
          <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-dashed gap-3", isDarkMode ? 'border-white/7' : 'border-slate-200')}>
            <div className="flex items-center gap-5">
              {[
                { label: 'Marketing', color: 'bg-purple-500' },
                { label: 'Utility', color: 'bg-orange-500' },
                { label: 'Authentication', color: 'bg-rose-500' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-sm", l.color)} />
                  <span className={cn("text-[10px] font-semibold", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{l.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/25' : 'text-slate-400')}>Total:</span>
                <span className={cn("text-[10px] font-black tabular-nums", isDarkMode ? 'text-white/70' : 'text-slate-700')}>₹{totalSpend}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/25' : 'text-slate-400')}>Avg:</span>
                <span className={cn("text-[10px] font-black tabular-nums", isDarkMode ? 'text-white/70' : 'text-slate-700')}>₹{avgSpend}/day</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={cn("text-[9px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/25' : 'text-slate-400')}>Peak:</span>
                <span className={cn("text-[10px] font-black tabular-nums", isDarkMode ? 'text-emerald-400/80' : 'text-emerald-600')}>{peakDay?.label}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Country Spend Breakdown */}
        <GlassCard isDarkMode={isDarkMode} delay={700} className="p-6">
          <h3 className={cn("font-bold text-sm uppercase tracking-wide flex items-center space-x-2 mb-1", isDarkMode ? 'text-white' : 'text-slate-800')}>
            <Sparkles size={16} className="text-emerald-500" />
            <span>Top Countries by Spend</span>
          </h3>
          <p className={cn("text-[10px] font-medium mb-5 ml-6", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
            Rate card varies by region
          </p>
          <div className="space-y-4">
            {COUNTRY_SPEND.map((c, i) => {
              const maxSpend = parseFloat(COUNTRY_SPEND[0].spend.replace(/[$,]/g, ''));
              const pct = (parseFloat(c.spend.replace(/[$,]/g, '')) / maxSpend) * 100;
              return (
                <div key={i} className="space-y-1.5 group cursor-default hover:translate-x-0.5 transition-transform duration-300">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                        isDarkMode ? 'bg-white/5 text-white/60' : 'bg-slate-100 text-slate-600'
                      )}>{c.code}</span>
                      <span className={cn("text-xs font-medium", isDarkMode ? 'text-white/40' : 'text-slate-500')}>{c.country}</span>
                    </div>
                    <span className={cn("text-xs font-bold tabular-nums", isDarkMode ? 'text-white' : 'text-slate-800')}>{c.spend}</span>
                  </div>
                  <div className={cn("h-1.5 w-full rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-[1500ms] ease-out group-hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className={cn("text-[9px] font-medium", isDarkMode ? 'text-white/20' : 'text-slate-400')}>{c.messages.toLocaleString()} msgs</span>
                    <span className={cn("text-[9px] font-medium", isDarkMode ? 'text-white/20' : 'text-slate-400')}>Rate: {c.rate}/msg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
