"use client";

import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { Megaphone, Zap, ShieldCheck, MessageCircle, TrendingUp, TrendingDown } from "lucide-react";
import { CATEGORY_DATA } from "./billingMockData";

interface CategoryIntelligenceProps {
  isDarkMode: boolean;
}

const TrendBadge = ({ trend, isDarkMode }: { trend: string; isDarkMode: boolean }) => {
  const isPositive = trend.startsWith('+');
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-300",
      isPositive
        ? isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
        : isDarkMode ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-50 text-rose-600'
    )}>
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {trend}
    </span>
  );
};

export const CategoryIntelligence = ({ isDarkMode }: CategoryIntelligenceProps) => {
  const { marketing, utility, authentication, freeTier } = CATEGORY_DATA;

  const categories = [
    {
      title: 'Marketing',
      icon: Megaphone,
      color: 'purple',
      gradient: isDarkMode ? 'from-purple-500/10 to-purple-600/5' : 'from-purple-50 to-purple-100/50',
      borderColor: isDarkMode ? 'border-purple-500/20' : 'border-purple-200',
      iconColor: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      accentBar: 'bg-purple-500',
      metrics: [
        { label: 'Total Spend', value: marketing.totalSpend, bold: true },
        { label: 'Messages', value: marketing.messageCount },
        { label: '% of Total', value: `${marketing.percentOfTotal}%` },
        { label: 'Avg Cost/Msg', value: marketing.avgCostPerMsg },
        { label: 'Conversations', value: marketing.conversations },
      ],
      trend: marketing.trend,
      percentOfTotal: marketing.percentOfTotal,
    },
    {
      title: 'Utility',
      icon: Zap,
      color: 'orange',
      gradient: isDarkMode ? 'from-orange-500/10 to-orange-600/5' : 'from-orange-50 to-orange-100/50',
      borderColor: isDarkMode ? 'border-orange-500/20' : 'border-orange-200',
      iconColor: isDarkMode ? 'text-orange-400' : 'text-orange-600',
      accentBar: 'bg-orange-500',
      metrics: [
        { label: 'Charged Spend', value: utility.totalSpend, bold: true },
        { label: 'Charged Msgs', value: utility.chargedMessages },
        { label: 'Free (in 24h)', value: utility.freeMessages },
        { label: '% of Total', value: `${utility.percentOfTotal}%` },
        { label: 'Conversations', value: utility.conversations },
      ],
      trend: utility.trend,
      percentOfTotal: utility.percentOfTotal,
    },
    {
      title: 'Authentication',
      icon: ShieldCheck,
      color: 'rose',
      gradient: isDarkMode ? 'from-rose-500/10 to-rose-600/5' : 'from-rose-50 to-rose-100/50',
      borderColor: isDarkMode ? 'border-rose-500/20' : 'border-rose-200',
      iconColor: isDarkMode ? 'text-rose-400' : 'text-rose-600',
      accentBar: 'bg-rose-500',
      metrics: [
        { label: 'Total Spend', value: authentication.totalSpend, bold: true },
        { label: 'OTP Messages', value: authentication.messageCount },
        { label: 'Delivery Rate', value: authentication.deliveryRate },
        { label: '% of Total', value: `${authentication.percentOfTotal}%` },
        { label: 'Conversations', value: authentication.conversations },
      ],
      trend: authentication.trend,
      percentOfTotal: authentication.percentOfTotal,
    },
    {
      title: 'Free Tier (Service)',
      icon: MessageCircle,
      color: 'emerald',
      gradient: isDarkMode ? 'from-emerald-500/10 to-teal-600/5' : 'from-emerald-50 to-teal-100/50',
      borderColor: isDarkMode ? 'border-emerald-500/20' : 'border-emerald-200',
      iconColor: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
      accentBar: 'bg-emerald-500',
      metrics: [
        { label: 'Free Messages', value: freeTier.volume, bold: true },
        { label: 'Est. Savings', value: freeTier.estimatedSavings },
        { label: 'Window Usage', value: freeTier.windowUtilization },
        { label: 'Cost', value: '$0.00' },
        { label: 'Conversations', value: freeTier.conversations },
      ],
      trend: null,
      isFree: true,
      percentOfTotal: 0,
    },
  ];

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Category Billing Intelligence
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <GlassCard key={i} isDarkMode={isDarkMode} delay={800 + i * 100} className="p-0 overflow-hidden group">
            {/* Top accent bar */}
            <div className={cn("h-0.5", cat.accentBar, "opacity-60 group-hover:opacity-100 transition-opacity duration-500")} />
            <div className={cn("p-5 bg-gradient-to-br border-b", cat.gradient, cat.borderColor)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-transform duration-500 group-hover:scale-110",
                    isDarkMode ? 'bg-white/5' : 'bg-white/80'
                  )}>
                    <cat.icon size={14} className={cat.iconColor} />
                  </div>
                  <span className={cn("text-xs font-black uppercase tracking-wider", cat.iconColor)}>{cat.title}</span>
                </div>
                {cat.trend && <TrendBadge trend={cat.trend} isDarkMode={isDarkMode} />}
                {cat.isFree && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold",
                    isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                  )}>
                    FREE
                  </span>
                )}
              </div>
              <div className={cn("text-2xl font-black tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                {cat.metrics[0].value}
              </div>
              <span className={cn("text-[10px] font-medium", isDarkMode ? 'text-white/35' : 'text-slate-500')}>{cat.metrics[0].label}</span>
              {/* Percentage contribution bar */}
              {cat.percentOfTotal > 0 && (
                <div className="mt-3">
                  <div className={cn("h-1 w-full rounded-full overflow-hidden", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                    <div
                      className={cn("h-full rounded-full transition-all duration-[1500ms] ease-out", cat.accentBar)}
                      style={{ width: `${cat.percentOfTotal}%`, opacity: 0.7 }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              {cat.metrics.slice(1).map((m, j) => (
                <div key={j} className="flex justify-between items-center">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/30' : 'text-slate-400')}>{m.label}</span>
                  <span className={cn("text-xs font-bold tabular-nums", isDarkMode ? 'text-white/70' : 'text-slate-700')}>{m.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
