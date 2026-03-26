"use client";

import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";
import { useGetBillingSpendChartQuery } from "@/hooks/useBillingQuery";

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
    auth: d.auth || 0,
    service: d.service || 0
  })) : [{ label: 'No Data', marketing: 0, utility: 0, auth: 0, service: 0 }];

  const maxVal = Math.max(...chartData.map((d: any) => d.marketing + d.utility + d.auth + d.service), 1); // Avoid div by 0
  const totalSpend = chartData.reduce((sum: number, d: any) => sum + d.marketing + d.utility + d.auth + d.service, 0);
  const avgSpend = chartData.length > 0 ? Math.round(totalSpend / chartData.length) : 0;
  
  // Find peak day
  const peakDay = chartData.reduce((max: any, d: any) => 
    (d.marketing + d.utility + d.auth + d.service) > (max.marketing + max.utility + max.auth + max.service) ? d : max
  , chartData[0]);

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Billing Analytics
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {/* Spend Trend Chart */}
        <div className={cn(
          "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
          isDarkMode 
              ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10" 
              : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
        )}>
          {/* Subtle Background Glow */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className={cn("font-bold text-sm uppercase tracking-[0.2em] flex items-center space-x-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <BarChart3 size={14} className="text-emerald-500" />
                </div>
                <span>Spend Analytics</span>
              </h3>
              <p className={cn("text-[10px] font-medium mt-1.5 ml-1", isDarkMode ? 'text-white/20' : 'text-slate-400')}>
                Real-time conversation cost trend across all categories
              </p>
            </div>
            <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300", isDarkMode ? 'bg-white/[0.03] border-white/5 text-emerald-400/80 group-hover:border-white/15' : 'bg-white border-slate-200 text-emerald-600 shadow-sm')}>
              <TrendingUp size={10} />
              Daily Insights
            </div>
          </div>

          {/* Stacked Bar Chart with Grid Lines */}
          <div className="relative h-[240px] px-1 group/chart">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-b border-white/5 py-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={cn("w-full h-px border-t border-dashed", isDarkMode ? "border-white/5" : "border-slate-100")} />
              ))}
            </div>

            <div className="relative z-10 flex items-end gap-2 h-full">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              ) : chartData.map((d: any, i: number) => {
                const total = d.marketing + d.utility + d.auth + d.service;
                const mH = (d.marketing / (maxVal || 1)) * 100;
                const uH = (d.utility / (maxVal || 1)) * 100;
                const aH = (d.auth / (maxVal || 1)) * 100;
                const sH = (d.service / (maxVal || 1)) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end relative">
                    {/* Tooltip on hover */}
                    <div className={cn(
                      "absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-black tabular-nums transition-all duration-300 opacity-0 group-hover/bar:opacity-100 -translate-y-2 group-hover/bar:translate-y-0 shadow-xl z-20",
                      isDarkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"
                    )}>
                      ₹{total.toFixed(2)}
                    </div>

                    <div className="w-full flex flex-col gap-[1px] items-stretch rounded-t-xl overflow-hidden transition-all duration-500 group-hover/bar:scale-x-105 group-hover/bar:mx-0.5" style={{ height: `${((total / maxVal) * 100)}%` }}>
                      <div className="rounded-t-md bg-gradient-to-t from-purple-600 to-purple-400 transition-all duration-300 hover:brightness-110" style={{ flex: mH }} />
                      <div className="bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-300 hover:brightness-110" style={{ flex: uH }} />
                      <div className="bg-gradient-to-t from-rose-500 to-rose-400 transition-all duration-300 hover:brightness-110" style={{ flex: aH }} />
                      <div className="rounded-b-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-300 hover:brightness-110" style={{ flex: sH }} />
                    </div>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest transition-opacity duration-300", isDarkMode ? 'text-white/20 group-hover/bar:text-white/60' : 'text-slate-400')}>{d.label.split(' ').pop()}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend + Summary Stats */}
          <div className={cn("flex flex-col lg:flex-row lg:items-center justify-between mt-8 pt-6 border-t gap-6 relative z-10", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
            <div className="flex flex-wrap items-center gap-6">
              {[
                { label: 'Marketing', color: 'bg-purple-500', glow: 'shadow-[0_0_8px_rgba(147,51,234,0.4)]' },
                { label: 'Utility', color: 'bg-orange-500', glow: 'shadow-[0_0_8px_rgba(249,115,22,0.4)]' },
                { label: 'Authentication', color: 'bg-rose-500', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.4)]' },
                { label: 'Service', color: 'bg-emerald-500', glow: 'shadow-[0_0_8px_rgba(16,185,129,0.4)]' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2 group/legend cursor-default">
                  <div className={cn("w-2 h-2 rounded-full transition-shadow duration-300", l.color, l.glow)} />
                  <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors duration-300", isDarkMode ? 'text-white/30 group-hover:text-white/70' : 'text-slate-400 group-hover:text-slate-600')}>{l.label}</span>
                </div>
              ))}
            </div>

            <div className={cn("flex flex-wrap items-center gap-6 px-4 py-2 rounded-2xl", isDarkMode ? "bg-white/[0.02]" : "bg-slate-50")}>
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-30")}>Total Spend</span>
                <span className={cn("text-sm font-black tabular-nums tracking-tight", isDarkMode ? 'text-white/90' : 'text-slate-900')}>₹{totalSpend.toLocaleString()}</span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-30")}>Avg Daily</span>
                <span className={cn("text-sm font-black tabular-nums tracking-tight", isDarkMode ? 'text-white/90' : 'text-slate-900')}>₹{avgSpend.toLocaleString()}</span>
              </div>
              <div className="w-px h-6 bg-white/5" />
              <div className="flex flex-col gap-0.5">
                <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-30 text-emerald-500")}>Peak Day</span>
                <div className="flex items-center gap-1">
                  <span className={cn("text-sm font-black tracking-tight", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>{peakDay?.label}</span>
                  <ArrowUpRight size={10} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
