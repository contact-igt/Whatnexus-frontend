"use client";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import { Wallet, CreditCard, Download, Plus, RefreshCw, Calendar, Zap } from "lucide-react";
import { WALLET_DATA, INVOICES } from "./billing-mock-data";

interface BillingWalletProps {
  isDarkMode: boolean;
}

export const BillingWallet = ({ isDarkMode }: BillingWalletProps) => {
  const balancePercent = Math.min((WALLET_DATA.balance / (WALLET_DATA.balance + WALLET_DATA.autoRecharge.amount)) * 100, 100);

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Wallet & Payments
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Wallet */}
        <GlassCard isDarkMode={isDarkMode} delay={1500} className="p-0 overflow-hidden">
          {/* Top accent */}
          <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg", isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                  <Wallet size={14} className="text-emerald-500" />
                </div>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide", isDarkMode ? 'text-white' : 'text-slate-800')}>Platform Wallet</h3>
              </div>
            </div>

            <div className={cn("text-4xl font-black tracking-tighter mb-1", isDarkMode ? 'text-white' : 'text-slate-900')}>
              ${WALLET_DATA.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className={cn("text-[10px] font-medium mb-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>Available credits</div>

            {/* Balance bar */}
            <div className={cn("h-1.5 w-full rounded-full overflow-hidden mb-5", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-[2000ms] ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                style={{ width: `${balancePercent}%` }}
              />
            </div>

            <div className="space-y-2.5 mb-6">
              {[
                { label: 'Avg Daily Spend', value: `$${WALLET_DATA.avgDailySpend}`, color: '' },
                { label: 'Est. Days Left', value: `${WALLET_DATA.estimatedDaysRemaining} days`, color: isDarkMode ? 'text-emerald-400' : 'text-emerald-600' },
                { label: 'Last Top-up', value: `$${WALLET_DATA.lastTopUp.amount} on ${WALLET_DATA.lastTopUp.date}`, color: '' },
                { label: 'Auto-Recharge', value: WALLET_DATA.autoRecharge.enabled ? `ON (< $${WALLET_DATA.autoRecharge.threshold})` : 'OFF', color: isDarkMode ? 'text-emerald-400' : 'text-emerald-600' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/30' : 'text-slate-400')}>{item.label}</span>
                  <span className={cn("text-xs font-bold tabular-nums", item.color || (isDarkMode ? 'text-white/70' : 'text-slate-700'))}>{item.value}</span>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]">
              <Plus size={14} />
              Add Credits
            </button>
          </div>
        </GlassCard>

        {/* Payment Method */}
        <GlassCard isDarkMode={isDarkMode} delay={1600} className="p-0 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-30" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className={cn("p-1.5 rounded-lg", isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50')}>
                <CreditCard size={14} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
              </div>
              <h3 className={cn("font-bold text-sm uppercase tracking-wide", isDarkMode ? 'text-white' : 'text-slate-800')}>Payment Method</h3>
            </div>
            <div className={cn("rounded-xl p-4 mb-5 border", isDarkMode ? 'bg-white/[0.03] border-white/8' : 'bg-slate-50 border-slate-200')}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-12 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm",
                  isDarkMode ? 'bg-gradient-to-br from-white/10 to-white/5 text-white border border-white/10' : 'bg-gradient-to-br from-slate-800 to-slate-700 text-white'
                )}>VISA</div>
                <div>
                  <p className={cn("text-sm font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>•••• •••• •••• 4242</p>
                  <p className={cn("text-[10px] font-medium", isDarkMode ? 'text-white/35' : 'text-slate-400')}>Expires 12/2028</p>
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className={cn("space-y-2.5 mb-5 p-3 rounded-xl border", isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100')}>
              <div className="flex justify-between items-center">
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/30' : 'text-slate-400')}>Card Status</span>
                <span className={cn("text-[10px] font-bold", isDarkMode ? 'text-emerald-400' : 'text-emerald-600')}>Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={cn("text-[10px] font-semibold uppercase tracking-wider", isDarkMode ? 'text-white/30' : 'text-slate-400')}>Billing Cycle</span>
                <span className={cn("text-xs font-bold tabular-nums", isDarkMode ? 'text-white/60' : 'text-slate-700')}>Monthly</span>
              </div>
            </div>

            <button className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-300",
              isDarkMode ? 'border-white/8 text-white/60 hover:bg-white/5 hover:text-white hover:border-white/15' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}>
              <RefreshCw size={13} />
              Update Payment Method
            </button>
          </div>
        </GlassCard>

        {/* Invoice History */}
        <GlassCard isDarkMode={isDarkMode} delay={1700} className="p-0 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={cn("p-1.5 rounded-lg", isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50')}>
                  <Calendar size={14} className={isDarkMode ? "text-purple-400" : "text-purple-600"} />
                </div>
                <h3 className={cn("font-bold text-sm uppercase tracking-wide", isDarkMode ? 'text-white' : 'text-slate-800')}>Invoice History</h3>
              </div>
              <span className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full",
                isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              )}>
                {INVOICES.length} Invoices
              </span>
            </div>
            <div className="space-y-3">
              {INVOICES.map((inv, i) => (
                <div key={i} className={cn(
                  "p-3.5 rounded-xl transition-all duration-300 group cursor-default border",
                  isDarkMode ? 'border-white/5 hover:bg-white/[0.03] hover:border-white/10' : 'border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                )}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("text-xs font-bold", isDarkMode ? 'text-white/80' : 'text-slate-800')}>{inv.id}</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                      isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    )}>{inv.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[10px] font-medium", isDarkMode ? 'text-white/25' : 'text-slate-400')}>{inv.period} · {inv.messages} msgs</span>
                    <span className={cn("text-xs font-black tabular-nums", isDarkMode ? 'text-white' : 'text-slate-900')}>{inv.total}</span>
                  </div>
                  <button className={cn(
                    "flex items-center gap-1 mt-2.5 text-[9px] font-bold uppercase tracking-wider transition-all duration-300 group-hover:translate-x-0.5",
                    isDarkMode ? 'text-emerald-400/50 group-hover:text-emerald-400' : 'text-emerald-600/50 group-hover:text-emerald-600'
                  )}>
                    <Download size={10} />
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
