import { useState } from "react";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { Receipt, Search, Download, Loader2 } from "lucide-react";
import { useGetBillingLedgerQuery } from "@/hooks/useBillingQuery";
import { Pagination } from "@/components/ui/pagination";


interface BillingLedgerProps {
  isDarkMode: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

const statusStyles = (isDarkMode: boolean) => ({
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
  Unknown: isDarkMode
    ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
    : 'bg-gray-50 text-gray-600 border border-gray-200',
});

const catStyles = (isDarkMode: boolean) => ({
  Marketing: isDarkMode ? 'text-purple-400' : 'text-purple-600',
  Utility: isDarkMode ? 'text-orange-400' : 'text-orange-600',
  Authentication: isDarkMode ? 'text-rose-400' : 'text-rose-600',
  Service: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
  Free: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
});

const catBorderColor: Record<string, string> = {
  Marketing: 'border-l-purple-500/40',
  Utility: 'border-l-orange-500/40',
  Authentication: 'border-l-rose-500/40',
  Service: 'border-l-emerald-500/40',
  Free: 'border-l-emerald-500/40',
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


  // Note: For Category counts in Stage 1, we pull total from the pagination count 
  // since the actual counts per category require a separate aggregation endpoint.
  // We'll show the total records matching the current filter.
  const totalCount = pagination.total;

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
              {(['All', 'Marketing', 'Utility', 'Authentication', 'Free'] as const).map(cat => {
                const filterValue = cat === 'Free' ? 'Service' : cat;
                const isActive = filterCategory === filterValue;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setFilterCategory(filterValue);
                      setPage(1);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5",
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                        : isDarkMode ? 'text-white/35 hover:text-white/60' : 'text-slate-400 hover:text-slate-700'
                    )}
                  >
                    {cat}
                    {isActive && (
                      <span className={cn(
                        "text-[8px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full tabular-nums",
                        'bg-white/20 text-white'
                      )}>
                        {totalCount}
                      </span>
                    )}
                  </button>
                );
              })}
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
                {['Date / Time', 'Category', 'Template', 'Campaign', 'Msgs', 'Country', 'Rate', 'Meta Cost', 'Markup (%)', 'Platform Fee', 'Total', 'Status'].map(h => (
                  <th key={h} className={cn(
                    "px-4 py-3.5 text-left border-b",
                    isDarkMode ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/50'
                  )}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && records.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-500" />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={12} className={cn("py-10 text-center text-xs font-semibold", isDarkMode ? "text-white/20" : "text-slate-400")}>
                    No billing records found.
                  </td>
                </tr>
              ) : (
                records.map((row: any, i: number) => {
                  const sMap = statusStyles(isDarkMode);
                  const cMap = catStyles(isDarkMode);
                  // Normalize casing from DB to mock UI style
                  const formattedCategory = row.category.charAt(0).toUpperCase() + row.category.slice(1);
                  const formattedStatus = row.status.charAt(0).toUpperCase() + row.status.slice(1);

                  return (
                    <tr
                      key={row.id || i}
                      className={cn(
                        "transition-all duration-300 border-l-2",
                        catBorderColor[formattedCategory] || 'border-l-transparent',
                        isDarkMode ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50/80'
                      )}
                    >
                      <td className={cn("px-4 py-3.5 text-[11px] font-medium tabular-nums", isDarkMode ? 'text-white/50' : 'text-slate-600')}>
                        {new Date(row.date).toLocaleString()}
                      </td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-bold", cMap[formattedCategory as keyof typeof cMap])}>{formattedCategory}</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-semibold", isDarkMode ? 'text-white/70' : 'text-slate-700')}>{row.template}</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-medium", isDarkMode ? 'text-white/35' : 'text-slate-500')}>{row.campaign}</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-bold tabular-nums", isDarkMode ? 'text-white/60' : 'text-slate-700')}>{row.messages}</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-medium", isDarkMode ? 'text-white/45' : 'text-slate-600')}>{row.country}</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-medium tabular-nums", isDarkMode ? 'text-white/45' : 'text-slate-600')}>₹{parseFloat(row.rate).toFixed(4)}</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-bold tabular-nums", isDarkMode ? 'text-white/70' : 'text-slate-700')}>₹{parseFloat(row.metaCost).toFixed(4)}</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-medium tabular-nums", isDarkMode ? 'text-white/50' : 'text-slate-600')}>{parseFloat(row.markupPercent).toFixed(1)}%</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-medium tabular-nums", isDarkMode ? 'text-white/50' : 'text-slate-600')}>₹{parseFloat(row.platformFee).toFixed(4)}</td>
                      <td className={cn("px-4 py-3.5 text-[11px] font-black tabular-nums", isDarkMode ? 'text-white' : 'text-slate-900')}>₹{parseFloat(row.total).toFixed(4)}</td>
                      <td className="px-4 py-3.5">
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", sMap[formattedStatus as keyof typeof sMap])}>{formattedStatus}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={cn("px-4 py-3 border-t", isDarkMode ? 'border-white/5' : 'border-slate-100')}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            isDarkMode={isDarkMode}
          />
        </div>
      </GlassCard>
    </div>
  );
};
