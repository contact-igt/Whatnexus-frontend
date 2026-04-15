"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Receipt, Download, Loader2, User } from "lucide-react";
import { useGetBillingLedgerQuery } from "@/hooks/useBillingQuery";
import { Pagination } from "@/components/ui/pagination";

interface BillingLedgerProps {
  isDarkMode: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

const statusStyles = (isDarkMode: boolean): Record<string, string> => ({
  Delivered: isDarkMode
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Sent: isDarkMode
    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
    : 'bg-blue-50 text-blue-600 border border-blue-200',
  Read: isDarkMode
    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
    : 'bg-teal-50 text-teal-600 border border-teal-200',
  Pending: isDarkMode
    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
    : 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  Failed: isDarkMode
    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    : 'bg-rose-50 text-rose-600 border border-rose-200',
  Billed: isDarkMode
    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    : 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Unbilled: isDarkMode
    ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    : 'bg-slate-100 text-slate-500 border border-slate-300',
  Unpaid: isDarkMode
    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
    : 'bg-orange-50 text-orange-600 border border-orange-200',
  Unknown: isDarkMode
    ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
    : 'bg-slate-100 text-slate-500 border border-slate-300',
});

const catStyles = (isDarkMode: boolean): Record<string, string> => ({
  Marketing: isDarkMode ? 'text-purple-400' : 'text-purple-600',
  Utility: isDarkMode ? 'text-orange-400' : 'text-orange-600',
  Authentication: isDarkMode ? 'text-rose-400' : 'text-rose-600',
  Service: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
  Ai_usage: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
});

const catBorderColor: Record<string, string> = {
  Marketing: 'border-l-purple-500',
  Utility: 'border-l-orange-500',
  Authentication: 'border-l-rose-500',
  Service: 'border-l-emerald-500',
  Ai_usage: 'border-l-cyan-500',
};

export const BillingLedger = ({ isDarkMode, startDate, endDate }: BillingLedgerProps) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [page, setPage] = useState(1);

  const { data: responseData, isLoading } = useGetBillingLedgerQuery({
    category: filterCategory,
    page,
    limit: 10,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString()
  });

  const records = responseData?.data?.records || [];
  const pagination = responseData?.data?.pagination || { total: 0, page: 1, limit: 10 };
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Transaction Ledger
      </h2>

      <div className={cn(
        "relative group rounded-[24px] border transition-all duration-500 overflow-hidden",
        isDarkMode
          ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
          : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
      )}>
        {/* Subtle Background Glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Header / Filter Bar */}
        <div className={cn("relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 border-b", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
          <div className="flex items-center gap-4">
            <div className={cn("p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20")}>
              <Receipt size={16} className="text-emerald-500" />
            </div>
            <div>
              <h3 className={cn("font-bold text-sm uppercase tracking-[0.2em]", isDarkMode ? 'text-white' : 'text-slate-800')}>Ledger</h3>
              <p className={cn("text-[10px] font-medium mt-0.5", isDarkMode ? "opacity-30 text-white" : "text-slate-500")}>Detailed conversation-level logs</p>
            </div>
          </div>

          <div className={cn("flex p-1 rounded-2xl border transition-all duration-300", isDarkMode ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-100 shadow-sm')}>
            {(['All', 'Marketing', 'Utility', 'Authentication', 'Service', 'Ai_usage'] as const).map(cat => {
              const isActive = filterCategory === cat || (cat === 'Ai_usage' && filterCategory === 'ai_usage');
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterCategory(cat === 'Ai_usage' ? 'ai_usage' : cat);
                    setPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden",
                    isActive
                      ? 'text-white bg-slate-900 shadow-xl scale-[1.05] z-10'
                      : isDarkMode ? 'text-white/20 hover:text-white/60' : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Container */}
        <div className="relative z-10 overflow-x-auto no-scrollbar">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className={cn("text-[9px] font-black uppercase tracking-[0.2em] border-b", isDarkMode ? 'text-white/20 border-white/5 bg-white/[0.01]' : 'text-slate-400 border-slate-100 bg-slate-50/50')}>
                {['Timestamp', 'Type', 'Recipient', 'Template', 'Campaign', 'Region', 'Rate ($)', 'Fee ($)', 'Total (₹)', 'Status'].map(h => (
                  <th key={h} className="px-6 py-5 text-left font-black">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {isLoading && records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 opacity-50" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-20">
                      <Receipt size={40} strokeWidth={1} />
                      <p className={cn("text-[10px] font-black uppercase tracking-[0.3em]", isDarkMode ? "text-white" : "text-slate-400")}>No Records Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((row: any, i: number) => {
                  const sMap = statusStyles(isDarkMode);
                  const cMap = catStyles(isDarkMode);
                  const formattedCategory = row.category.charAt(0).toUpperCase() + row.category.slice(1);
                  const formattedStatus = row.status.charAt(0).toUpperCase() + row.status.slice(1);

                  return (
                    <tr
                      key={row.id || i}
                      className={cn(
                        "transition-all duration-500 group/row border-l-4",
                        catBorderColor[formattedCategory] || 'border-l-transparent',
                        isDarkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-emerald-50/30'
                      )}
                    >
                      {/* Timestamp */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5">
                          <span className={cn("text-[11px] font-black tabular-nums tracking-tight", isDarkMode ? 'text-white/80' : 'text-slate-900')}>
                            {new Date(row.date).toLocaleDateString()}
                          </span>
                          <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-20", isDarkMode ? "text-white" : "text-slate-500")}>
                            {new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Type (Category) */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                            formattedCategory === 'Marketing' ? 'bg-purple-500' :
                              formattedCategory === 'Utility' ? 'bg-orange-500' :
                                formattedCategory === 'Authentication' ? 'bg-rose-500' :
                                  formattedCategory === 'Ai_usage' ? 'bg-cyan-500' : 'bg-emerald-500'
                          )} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", cMap[formattedCategory as keyof typeof cMap])}>
                            {formattedCategory === 'Ai_usage' ? 'AI Usage' : formattedCategory}
                          </span>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg bg-white/5 border border-white/5", !isDarkMode && "bg-slate-100 border-slate-200")}>
                            <User size={10} className={isDarkMode ? "text-white/40" : "text-slate-500"} />
                          </div>
                          <div className="flex flex-col">
                            <span className={cn("text-[11px] font-black tabular-nums tracking-tight", isDarkMode ? "text-white/90" : "text-slate-700")}>
                              {row.recipient}
                            </span>
                            {row.recipientName && (
                              <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-20 truncate max-w-[100px]", isDarkMode ? "text-white" : "text-slate-500")}>
                                {row.recipientName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Template */}
                      <td className="px-6 py-5">
                        <span className={cn("text-[11px] font-black tracking-tight truncate max-w-[120px] block", isDarkMode ? 'text-white/90' : 'text-slate-700')}>
                          {row.template || '—'}
                        </span>
                      </td>

                      {/* Campaign */}
                      <td className="px-6 py-5">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-30 truncate max-w-[100px] block", isDarkMode ? "text-white" : "text-slate-500")}>
                          {row.campaign || '—'}
                        </span>
                      </td>

                      {/* Region */}
                      <td className="px-6 py-5">
                        <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-40", isDarkMode ? "text-white" : "text-slate-500")}>
                          {row.country || 'Global'}
                        </span>
                      </td>

                      {/* Base Rate */}
                      <td className="px-6 py-5">
                        <span className={cn("text-[11px] font-black tabular-nums tracking-tighter opacity-40", isDarkMode ? "text-white" : "text-slate-500")}>
                          {!row.rate || row.rate === "AI Usage" || parseFloat(row.rate) === 0 ? "—" : `$${parseFloat(row.rate).toFixed(4)}`}
                        </span>
                      </td>

                      {/* Platform Fee */}
                      <td className="px-6 py-5">
                        <span className={cn("text-[11px] font-black tabular-nums tracking-tighter text-emerald-500/60")}>
                          {parseFloat(row.platformFee) > 0 ? `+$${parseFloat(row.platformFee).toFixed(4)}` : "—"}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-5">
                        <span className={cn("text-xs font-black tabular-nums tracking-tighter", isDarkMode ? 'text-white' : 'text-slate-900')}>
                          ₹{parseFloat(row.totalInr || row.total).toFixed(4)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span className={cn("px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-500", sMap[formattedStatus as keyof typeof sMap])}>
                          {formattedStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className={cn("relative z-10 px-6 py-4 border-t", isDarkMode ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/50')}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Download size={12} className="text-emerald-500" />
              </div>
              <button className={cn("text-[10px] font-black uppercase tracking-widest transition-all duration-300 hover:tracking-[0.2em]", isDarkMode ? 'text-white/40 hover:text-white' : 'text-slate-500 hover:text-slate-900')}>
                Export CSV
              </button>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
