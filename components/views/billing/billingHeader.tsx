"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Download, Wallet } from "lucide-react";
import { DateRangePicker } from "./billingDateRangePicker";

interface BillingHeaderProps {
  isDarkMode: boolean;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  onExport: () => void;
  onRecharge: () => void;
  isSuperAdmin?: boolean;
  viewMode?: 'tenant' | 'admin';
}

export const BillingHeader = ({ 
  isDarkMode, 
  startDate, 
  endDate, 
  onDateChange, 
  onExport, 
  onRecharge,
  isSuperAdmin,
  viewMode
}: BillingHeaderProps) => {

  const actions = [
    { label: 'Recharge Wallet', icon: Wallet, variant: 'primary' as const, onClick: onRecharge, hide: isSuperAdmin },
    { label: 'Export Report', icon: Download, variant: 'secondary' as const, onClick: onExport },
  ].filter(a => !a.hide);

  return (
    <div className="relative space-y-5">
      {/* Decorative gradient orb behind header */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-40 w-60 h-60 rounded-full bg-gradient-to-bl from-purple-500/5 via-blue-500/3 to-transparent blur-3xl pointer-events-none" />

      {/* Title Row */}
      <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-[24px] border relative overflow-hidden group transition-all duration-700",
              isDarkMode
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/30 shadow-2xl shadow-emerald-500/10'
                : 'bg-emerald-50 border-emerald-100 shadow-xl shadow-emerald-500/5'
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-transparent to-teal-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CreditCard className={cn("w-6 h-6 relative z-10 transition-transform duration-700 group-hover:scale-110", isDarkMode ? "text-emerald-400" : "text-emerald-600")} />
            </div>
            <div>
              <h1 className={cn("text-3xl font-black tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                Billing & Payments
              </h1>
              <p className={cn("font-medium text-[11px] uppercase tracking-widest mt-1 opacity-40", isDarkMode ? 'text-white' : 'text-slate-500')}>
                CONVERSATION SPEND · TEMPLATE COSTS · USAGE ANALYTICS
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Picker */}
          <DateRangePicker
            isDarkMode={isDarkMode}
            startDate={startDate}
            endDate={endDate}
            onDateChange={onDateChange}
          />

          <div className={cn("w-px h-6 mx-1", isDarkMode ? 'bg-white/8' : 'bg-slate-200')} />

          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border group",
                action.variant === 'primary'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/20 shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/30 hover:scale-[1.05] active:scale-[0.98]'
                  : isDarkMode
                    ? 'bg-white/[0.03] text-white/50 border-white/8 hover:bg-white/10 hover:border-white/20 hover:text-white'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm'
              )}
            >
              <action.icon size={14} strokeWidth={3} className={cn(
                "transition-transform duration-500 group-hover:scale-110",
                action.variant === 'primary' ? 'animate-pulse' : ''
              )} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
