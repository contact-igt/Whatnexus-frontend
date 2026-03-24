"use client";

import { cn } from "@/lib/utils";
import { FileText, Megaphone, Loader2, Users, ArrowUpRight } from "lucide-react";
import { useGetBillingTemplateStatsQuery, useGetBillingCampaignStatsQuery } from "@/hooks/useBillingQuery";

interface BillingInsightsProps {
  isDarkMode: boolean;
  startDate: Date | null;
  endDate: Date | null;
}

const categoryColor: Record<string, string> = {
  marketing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  utility: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  authentication: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  service: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const categoryBarColor: Record<string, string> = {
  marketing: 'from-purple-600 to-purple-400',
  utility: 'from-orange-500 to-orange-400',
  authentication: 'from-rose-500 to-rose-400',
  service: 'from-emerald-600 to-emerald-400',
};



export const BillingInsights = ({ isDarkMode, startDate, endDate }: BillingInsightsProps) => {
  const sStr = startDate?.toISOString();
  const eStr = endDate?.toISOString();

  const { data: templateStatsRes, isLoading: isLoadingTemplates } = useGetBillingTemplateStatsQuery(sStr, eStr);
  const { data: campaignStatsRes, isLoading: isLoadingCampaigns } = useGetBillingCampaignStatsQuery(sStr, eStr);

  const templateStats = templateStatsRes?.data || [];
  const campaignStats = campaignStatsRes?.data || [];

  const maxTemplateCost = Math.max(...templateStats.map((t: any) => t.cost), 1);
  const maxCampaignCost = Math.max(...campaignStats.map((c: any) => c.cost), 1);

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Campaign & Template Performance
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Templates by Spend */}
        <div className={cn(
          "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
          isDarkMode 
              ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10" 
              : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
        )}>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className={cn("font-bold text-sm uppercase tracking-[0.2em] flex items-center space-x-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10">
                    <FileText size={14} className="text-emerald-500" />
                  </div>
                  <span>High Spend Templates</span>
                </h3>
                <p className={cn("text-[10px] font-medium mt-1.5 opacity-30")}>
                  Cost distribution per billable message template
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {isLoadingTemplates ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
              ) : templateStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20 text-[10px] font-black uppercase tracking-widest italic" style={{ height: "400px" }}>
                  No template data
                </div>
              ) : templateStats.map((t: any, i: number) => {
                const costPct = (t.cost / maxTemplateCost) * 100;
                return (
                  <div key={i} className={cn(
                    "relative p-4 rounded-[20px] transition-all duration-500 group/item cursor-default border",
                    isDarkMode ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]' : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-emerald-200'
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={cn(
                          "text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-lg tabular-nums tracking-tighter",
                          i < 3
                            ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-emerald-50 text-emerald-600'
                            : isDarkMode ? 'bg-white/5 text-white/20' : 'bg-slate-50 text-slate-400'
                        )}>
                          {i + 1}
                        </span>
                        <p className={cn("text-xs font-black tracking-tight truncate", isDarkMode ? 'text-white/90' : 'text-slate-800')}>{t.name}</p>
                        <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-md border uppercase tracking-widest", isDarkMode ? categoryColor[t.category] : 'bg-slate-100 text-slate-500 border-slate-200')}>
                          {t.category}
                        </span>
                      </div>
                      <span className={cn("text-sm font-black tabular-nums transition-transform group-hover/item:scale-110", isDarkMode ? 'text-white' : 'text-slate-900')}>₹{t.cost.toFixed(2)}</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-30")}>{t.sent.toLocaleString()} Units</span>
                        <div className="w-px h-2 bg-white/10" />
                        <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-30")}>₹{t.costPerMsg}/Unit</span>
                      </div>
                      
                      {/* Cost Progress Bar */}
                      <div className={cn("h-1 w-full rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                        <div
                          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-[1500ms] ease-out relative", categoryBarColor[t.category] || 'from-emerald-500 to-teal-500')}
                          style={{ width: `${costPct}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Campaigns by Cost */}
        <div className={cn(
          "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
          isDarkMode 
              ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10" 
              : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
        )}>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className={cn("font-bold text-sm uppercase tracking-[0.2em] flex items-center space-x-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Megaphone size={14} className="text-blue-500" />
                  </div>
                  <span>Broadcast Impact</span>
                </h3>
                <p className={cn("text-[10px] font-medium mt-1.5 opacity-30")}>
                  Campaign-level spend analysis for recent broadcasts
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {isLoadingCampaigns ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
              ) : campaignStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20 text-[10px] font-black uppercase tracking-widest italic" style={{ height: "400px" }}>
                  No campaign data
                </div>
              ) : campaignStats.map((c: any, i: number) => (
                <div key={i} className={cn(
                  "p-5 rounded-[20px] transition-all duration-500 group/item cursor-default border",
                  isDarkMode ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]' : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-emerald-200'
                )}>
                  <div className="flex items-center justify-between mb-4">
                    <p className={cn("text-xs font-black tracking-tight pr-4", isDarkMode ? 'text-white/90' : 'text-slate-800')}>{c.name}</p>
                    <span className={cn("text-sm font-black tabular-nums transition-transform group-hover/item:scale-110", isDarkMode ? 'text-white' : 'text-slate-900')}>₹{c.cost.toFixed(2)}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="flex flex-col gap-0.5">
                      <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-20")}>Template</span>
                      <span className={cn("text-[9px] font-black truncate", isDarkMode ? 'text-white/60' : 'text-slate-700')}>{c.template}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-30")}>Reach</span>
                      <span className={cn("text-[9px] font-black", isDarkMode ? 'text-white/60' : 'text-slate-700')}>{c.recipients.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-20")}>Success</span>
                      <span className={cn("text-[9px] font-black text-emerald-500")}>{c.deliveryRate}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-20")}>Ecost</span>
                      <span className={cn("text-[9px] font-black", isDarkMode ? 'text-white/60' : 'text-slate-700')}>₹{c.costPerRecipient}</span>
                    </div>
                  </div>

                  {/* Cost Intensity bar */}
                  <div className={cn("h-1 w-full rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-400 transition-all duration-[1500ms] ease-out group-hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] relative"
                      style={{ width: `${(c.cost / maxCampaignCost) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={cn("mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3")}>
               <div className="p-1.5 rounded-lg bg-emerald-500/10 shrink-0">
                  <ArrowUpRight size={12} className="text-emerald-500" />
               </div>
               <p className={cn("text-[9px] font-black uppercase tracking-widest leading-relaxed", isDarkMode ? 'text-white/20' : 'text-slate-400')}>
                 Analytics are based on billable conversation sessions. Pricing depends on conversation category and region.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
