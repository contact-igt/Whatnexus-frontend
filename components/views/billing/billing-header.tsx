"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Download, FileText, Plus, Settings } from "lucide-react";
import { DateRangePicker } from "./billing-date-range-picker";

interface BillingHeaderProps {
  isDarkMode: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  onExport: () => void;
}

export const BillingHeader = ({ isDarkMode, activeTab, onTabChange, startDate, endDate, onDateChange, onExport }: BillingHeaderProps) => {
  const topTabs = ['Billings', 'Wallet & Payments'];

  const actions = [
    { label: 'Export Report', icon: Download, variant: 'primary' as const, onClick: onExport },
  ];

  return (
    <div className="relative space-y-5">
      {/* Decorative gradient orb behind header */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-500/5 via-teal-500/3 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-10 right-40 w-60 h-60 rounded-full bg-gradient-to-bl from-purple-500/3 via-blue-500/2 to-transparent blur-3xl pointer-events-none" />

      {/* Title Row */}
      <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-2xl border relative overflow-hidden group",
              isDarkMode
                ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
                : 'bg-emerald-50 border-emerald-100'
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <CreditCard className={cn("w-6 h-6 relative z-10 transition-transform duration-500 group-hover:scale-110", isDarkMode ? "text-emerald-400" : "text-emerald-600")} />
            </div>
            <div>
              <h1 className={cn("text-3xl font-black tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                Billing & Payments
              </h1>
              <p className={cn("font-medium text-sm mt-0.5", isDarkMode ? 'text-white/35' : 'text-slate-500')}>
                Meta conversation spend, template costs, broadcast billing & wallet management
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 border group",
                action.variant === 'primary'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]'
                  : isDarkMode
                    ? 'bg-white/[0.04] text-white/60 border-white/8 hover:bg-white/[0.08] hover:border-white/15 hover:text-white'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900'
              )}
            >
              <action.icon size={13} className={cn(
                "transition-transform duration-300 group-hover:scale-110",
                action.variant === 'primary' ? '' : isDarkMode ? 'text-white/40 group-hover:text-white/70' : 'text-slate-400 group-hover:text-slate-600'
              )} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className={cn("relative flex items-center gap-0 border-b", isDarkMode ? 'border-white/8' : 'border-slate-200')}>
        {topTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={cn(
              "relative px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-300",
              activeTab === tab
                ? isDarkMode ? 'text-white' : 'text-slate-900'
                : isDarkMode ? 'text-white/35 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

    </div>
  );
};
