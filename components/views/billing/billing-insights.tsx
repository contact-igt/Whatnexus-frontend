import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { FileText, Megaphone, ArrowUpRight, Users } from "lucide-react";
import { TOP_TEMPLATES, TOP_CAMPAIGNS } from "./billing-mock-data";

interface BillingInsightsProps {
  isDarkMode: boolean;
}

const categoryColor: Record<string, string> = {
  Marketing: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  Utility: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  Authentication: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

const categoryColorLight: Record<string, string> = {
  Marketing: 'bg-purple-50 text-purple-600 border-purple-200',
  Utility: 'bg-orange-50 text-orange-600 border-orange-200',
  Authentication: 'bg-rose-50 text-rose-600 border-rose-200',
};

const categoryBarColor: Record<string, string> = {
  Marketing: 'from-purple-500 to-purple-400',
  Utility: 'from-orange-500 to-orange-400',
  Authentication: 'from-rose-500 to-rose-400',
};

export const BillingInsights = ({ isDarkMode }: BillingInsightsProps) => {
  const maxTemplateCost = Math.max(...TOP_TEMPLATES.map(t => parseFloat(t.cost.replace(/[$,]/g, ''))));

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Template & Broadcast Insights
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Templates by Spend */}
        <GlassCard isDarkMode={isDarkMode} delay={1200} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={cn("font-bold text-sm uppercase tracking-wide flex items-center space-x-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                <FileText size={16} className="text-emerald-500" />
                <span>Top Templates by Spend</span>
              </h3>
              <p className={cn("text-[10px] font-medium mt-1 ml-6", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                Cost ranked by billable template sends
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {TOP_TEMPLATES.map((t, i) => {
              const costVal = parseFloat(t.cost.replace(/[$,]/g, ''));
              const costPct = (costVal / maxTemplateCost) * 100;
              return (
                <div key={i} className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all duration-300 group cursor-default",
                  isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50'
                )}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={cn(
                      "text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg shrink-0",
                      i < 3
                        ? isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                        : isDarkMode ? 'bg-white/5 text-white/20' : 'bg-slate-50 text-slate-400'
                    )}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-xs font-bold truncate group-hover:translate-x-0.5 transition-transform", isDarkMode ? 'text-white/90' : 'text-slate-800')}>{t.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md border", isDarkMode ? categoryColor[t.category] : categoryColorLight[t.category])}>{t.category}</span>
                        <span className={cn("text-[9px] font-medium", isDarkMode ? 'text-white/25' : 'text-slate-400')}>{t.sent.toLocaleString()} msgs</span>
                        <span className={cn("text-[9px] font-medium", isDarkMode ? 'text-white/25' : 'text-slate-400')}>{t.costPerMsg}/msg</span>
                      </div>
                      {/* Cost contribution bar */}
                      <div className={cn("h-0.5 w-full rounded-full overflow-hidden mt-2", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                        <div
                          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-[1200ms] ease-out", categoryBarColor[t.category] || 'from-emerald-500 to-teal-500')}
                          style={{ width: `${costPct}%`, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  </div>
                  <span className={cn("text-sm font-black tabular-nums shrink-0 ml-4", isDarkMode ? 'text-white' : 'text-slate-800')}>{t.cost}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Top Campaigns by Cost */}
        <GlassCard isDarkMode={isDarkMode} delay={1300} className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={cn("font-bold text-sm uppercase tracking-wide flex items-center space-x-2", isDarkMode ? 'text-white' : 'text-slate-800')}>
                <Megaphone size={16} className="text-emerald-500" />
                <span>Top Broadcasts by Cost</span>
              </h3>
              <p className={cn("text-[10px] font-medium mt-1 ml-6", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                Campaign-level billing impact
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {TOP_CAMPAIGNS.map((c, i) => (
              <div key={i} className={cn(
                "p-4 rounded-xl transition-all duration-300 group cursor-default border",
                isDarkMode ? 'hover:bg-white/[0.04] border-white/5 hover:border-white/10' : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <p className={cn("text-xs font-bold group-hover:translate-x-0.5 transition-transform", isDarkMode ? 'text-white/90' : 'text-slate-800')}>{c.name}</p>
                  <span className={cn("text-sm font-black tabular-nums", isDarkMode ? 'text-white' : 'text-slate-800')}>{c.cost}</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn("text-[9px] font-medium", isDarkMode ? 'text-white/25' : 'text-slate-400')}>Template: {c.template}</span>
                  <span className={cn("text-[9px] font-medium flex items-center gap-1", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
                    <Users size={8} />
                    {c.recipients.toLocaleString()} recipients
                  </span>
                  <span className={cn("text-[9px] font-medium", isDarkMode ? 'text-white/25' : 'text-slate-400')}>{c.costPerRecipient}/rcpt</span>
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                    isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                  )}>
                    {c.deliveryRate} delivered
                  </span>
                </div>
                {/* Cost bar */}
                <div className={cn("h-1 w-full rounded-full mt-3 overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-[1500ms] ease-out group-hover:shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                    style={{ width: `${(parseFloat(c.cost.replace(/[$,]/g, '')) / 700) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className={cn("text-[9px] font-medium mt-4 italic", isDarkMode ? 'text-white/15' : 'text-slate-400')}>
            Note: A broadcast = N individual template messages. Meta bills per message, not per campaign.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};
