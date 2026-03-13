"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { Receipt, Search, Download } from "lucide-react";
import { LEDGER_DATA } from "./billing-mock-data";

interface BillingLedgerProps {
  isDarkMode: boolean;
}

const statusStyles = (isDarkMode: boolean) => ({
  Delivered: isDarkMode
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Pending: isDarkMode
    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
    : 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  Failed: isDarkMode
    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    : 'bg-rose-50 text-rose-600 border border-rose-200',
});

const catStyles = (isDarkMode: boolean) => ({
  Marketing: isDarkMode ? 'text-purple-400' : 'text-purple-600',
  Utility: isDarkMode ? 'text-orange-400' : 'text-orange-600',
  Authentication: isDarkMode ? 'text-rose-400' : 'text-rose-600',
  Free: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
});

const catBorderColor: Record<string, string> = {
  Marketing: 'border-l-purple-500/40',
  Utility: 'border-l-orange-500/40',
  Authentication: 'border-l-rose-500/40',
  Free: 'border-l-emerald-500/40',
};

export const BillingLedger = ({ isDarkMode }: BillingLedgerProps) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filtered = filterCategory === 'All' ? LEDGER_DATA : LEDGER_DATA.filter(l => l.category === filterCategory);

  const categoryCounts = {
    All: LEDGER_DATA.length,
    Marketing: LEDGER_DATA.filter(l => l.category === 'Marketing').length,
    Utility: LEDGER_DATA.filter(l => l.category === 'Utility').length,
    Authentication: LEDGER_DATA.filter(l => l.category === 'Authentication').length,
    Free: LEDGER_DATA.filter(l => l.category === 'Free').length,
  };

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Billing Ledger
      </h2>
      <GlassCard isDarkMode={isDarkMode} delay={1400} className="p-0 overflow-hidden">
        {/* Filter Bar */}
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
          <div className="flex items-center gap-3">
            <Receipt size={14} className="text-emerald-500 shrink-0" />
            <div className={cn("flex p-0.5 rounded-lg border", isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200')}>
              {(['All', 'Marketing', 'Utility', 'Authentication', 'Free'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5",
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                      : isDarkMode ? 'text-white/35 hover:text-white/60' : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  {cat}
                  <span className={cn(
                    "text-[8px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full tabular-nums",
                    filterCategory === cat
                      ? 'bg-white/20 text-white'
                      : isDarkMode ? 'bg-white/5 text-white/25' : 'bg-slate-200 text-slate-500'
                  )}>
                    {categoryCounts[cat as keyof typeof categoryCounts]}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-300",
              isDarkMode ? 'border-white/8 text-white/40 hover:text-white/60 hover:bg-white/5' : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            )}>
              <Download size={10} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className={cn("text-[9px] font-black uppercase tracking-wider", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                {['Date / Time', 'Category', 'Template', 'Campaign', 'Msgs', 'Country', 'Rate', 'Meta Cost', 'Platform Fee', 'Total', 'Status'].map(h => (
                  <th key={h} className={cn(
                    "px-4 py-3.5 text-left border-b",
                    isDarkMode ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/50'
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const sMap = statusStyles(isDarkMode);
                const cMap = catStyles(isDarkMode);
                return (
                  <tr
                    key={i}
                    className={cn(
                      "transition-all duration-300 border-l-2",
                      catBorderColor[row.category] || 'border-l-transparent',
                      isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/80'
                    )}
                  >
                    <td className={cn("px-4 py-3.5 text-[11px] font-medium tabular-nums", isDarkMode ? 'text-white/50' : 'text-slate-600')}>{row.date}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-bold", cMap[row.category as keyof typeof cMap])}>{row.category}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>{row.template}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-medium", isDarkMode ? 'text-white/35' : 'text-slate-500')}>{row.campaign}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-bold tabular-nums", isDarkMode ? 'text-white/60' : 'text-slate-700')}>{row.recipients}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-medium", isDarkMode ? 'text-white/45' : 'text-slate-600')}>{row.country}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-medium tabular-nums", isDarkMode ? 'text-white/45' : 'text-slate-600')}>{row.rate}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-bold tabular-nums", isDarkMode ? 'text-white/70' : 'text-slate-700')}>{row.metaCost}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-medium tabular-nums", isDarkMode ? 'text-white/35' : 'text-slate-500')}>{row.platformFee}</td>
                    <td className={cn("px-4 py-3.5 text-[11px] font-black tabular-nums", isDarkMode ? 'text-white' : 'text-slate-900')}>{row.total}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", sMap[row.status as keyof typeof sMap])}>{row.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={cn("flex items-center justify-between px-4 py-3 border-t", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
          <span className={cn("text-[10px] font-semibold", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
            Showing {filtered.length} of {LEDGER_DATA.length} records
          </span>
          <span className={cn("text-[10px] font-semibold", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
            Meta bills per conversation category × country rate card
          </span>
        </div>
      </GlassCard>
    </div>
  );
};
