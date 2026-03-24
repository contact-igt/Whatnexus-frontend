"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Wallet, CreditCard, Download, Plus, RefreshCw, Calendar, Loader2, Settings, Zap } from "lucide-react";
import { useGetWalletBalanceQuery, useGetWalletTransactionsQuery, useGetAutoRechargeSettingsQuery, useUpdateAutoRechargeSettingsMutation } from "@/hooks/useBillingQuery";

interface BillingWalletProps {
  isDarkMode: boolean;
  onRecharge?: () => void;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const BillingWallet = ({ isDarkMode, onRecharge, startDate, endDate }: BillingWalletProps) => {
  const sStr = startDate?.toISOString();
  const eStr = endDate?.toISOString();

  const [showAutoRechargeConfig, setShowAutoRechargeConfig] = useState(false);
  const [localThreshold, setLocalThreshold] = useState<string>("");
  const [localAmount, setLocalAmount] = useState<string>("");

  const { data: balanceResponse, isLoading: isLoadingBalance } = useGetWalletBalanceQuery();
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useGetWalletTransactionsQuery({
    limit: 10,
    startDate: sStr,
    endDate: eStr
  });
  const { data: autoRechargeResponse } = useGetAutoRechargeSettingsQuery();
  const updateAutoRecharge = useUpdateAutoRechargeSettingsMutation();

  const balance = balanceResponse?.data?.balance || 0;
  const currency = balanceResponse?.data?.currency || 'INR';
  const balanceStatus = balanceResponse?.data?.balanceStatus || 'healthy';
  const currencySymbol = currency === 'INR' ? '₹' : currency;
  const transactions = transactionsResponse?.data?.transactions || [];

  const autoRecharge = autoRechargeResponse?.data || { enabled: false, threshold: 100, amount: 500 };

  const balancePercent = Math.min((balance / 10000) * 100, 100);

  return (
    <div>
      <h2 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2", isDarkMode ? 'text-white/25' : 'text-slate-400')}>
        <div className="w-4 h-px bg-emerald-500/50" />
        Wallet & Payments
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Wallet */}
        <div className={cn(
          "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
          isDarkMode
            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
            : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
        )}>
          {/* Subtle Background Glow */}
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-xl transition-all duration-500 border",
                    isDarkMode
                      ? 'bg-white/5 border-white/10 group-hover:bg-white/10'
                      : 'bg-white border-slate-100 group-hover:bg-emerald-50'
                  )}>
                    <Wallet size={16} className="text-emerald-500" />
                  </div>
                  <h3 className={cn("font-bold text-sm uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>Platform Wallet</h3>
                </div>
              </div>

              <div className={cn("text-4xl font-black tracking-tight mb-2", isDarkMode ? 'text-white' : 'text-slate-900')}>
                {isLoadingBalance ? (
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                ) : (
                  `${currencySymbol}${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                )}
              </div>
              <p className={cn("text-[10px] font-black uppercase tracking-widest mb-4 opacity-40")}>Available credits</p>

              {/* Balance bar */}
              <div className={cn("h-1 w-full rounded-full overflow-hidden mb-6", isDarkMode ? 'bg-white/5' : 'bg-slate-100')}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-[2000ms] ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)] relative"
                  style={{ width: `${balancePercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { label: 'Currency', value: currency, color: '' },
                  { label: 'Status', value: balanceStatus === 'critical' ? 'Critical' : balanceStatus === 'low' ? 'Low Balance' : 'Active', color: balanceStatus === 'critical' ? 'text-red-500' : balanceStatus === 'low' ? 'text-amber-500' : 'text-emerald-500' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-1">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-30")}>{item.label}</span>
                    <span className={cn("text-[11px] font-black tracking-tight", item.color || (isDarkMode ? 'text-white/80' : 'text-slate-700'))}>{item.value}</span>
                  </div>
                ))}

                {/* Auto-Recharge Toggle */}
                <div className="flex justify-between items-center px-1">
                  <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-30")}>Auto-Recharge</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowAutoRechargeConfig(!showAutoRechargeConfig);
                        setLocalThreshold(String(autoRecharge.threshold));
                        setLocalAmount(String(autoRecharge.amount));
                      }}
                      className={cn("p-1 rounded-lg transition-all", isDarkMode ? "hover:bg-white/10" : "hover:bg-slate-100")}
                    >
                      <Settings size={12} className={cn("transition-colors", autoRecharge.enabled ? "text-emerald-500" : "opacity-30")} />
                    </button>
                    <button
                      onClick={() => updateAutoRecharge.mutate({ enabled: !autoRecharge.enabled })}
                      disabled={updateAutoRecharge.isPending}
                      className={cn(
                        "relative w-9 h-5 rounded-full transition-all duration-300 border",
                        autoRecharge.enabled
                          ? "bg-emerald-500 border-emerald-600"
                          : isDarkMode ? "bg-white/10 border-white/20" : "bg-slate-200 border-slate-300"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300",
                        autoRecharge.enabled ? "translate-x-4" : "translate-x-0.5"
                      )} />
                    </button>
                  </div>
                </div>

                {/* Auto-Recharge Config Panel */}
                {showAutoRechargeConfig && (
                  <div className={cn(
                    "mt-2 p-4 rounded-2xl border space-y-3 transition-all",
                    isDarkMode ? "bg-white/[0.03] border-white/10" : "bg-white border-slate-200"
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={12} className="text-amber-500" />
                      <span className={cn("text-[9px] font-black uppercase tracking-widest", isDarkMode ? "text-white/50" : "text-slate-500")}>Auto-Recharge Settings</span>
                    </div>
                    <div>
                      <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1", isDarkMode ? "text-white/30" : "text-slate-400")}>
                        Threshold ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={localThreshold}
                        onChange={(e) => setLocalThreshold(e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl text-sm font-bold border outline-none transition-all",
                          isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-emerald-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500"
                        )}
                      />
                      <p className={cn("text-[8px] mt-1 opacity-40")}>Recharge when balance drops below this</p>
                    </div>
                    <div>
                      <label className={cn("text-[9px] font-black uppercase tracking-widest block mb-1", isDarkMode ? "text-white/30" : "text-slate-400")}>
                        Recharge Amount ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="100"
                        value={localAmount}
                        onChange={(e) => setLocalAmount(e.target.value)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl text-sm font-bold border outline-none transition-all",
                          isDarkMode ? "bg-white/5 border-white/10 text-white focus:border-emerald-500/50" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500"
                        )}
                      />
                      <p className={cn("text-[8px] mt-1 opacity-40")}>Min ₹100</p>
                    </div>
                    <button
                      onClick={() => {
                        updateAutoRecharge.mutate({
                          threshold: parseFloat(localThreshold),
                          amount: parseFloat(localAmount),
                        });
                        setShowAutoRechargeConfig(false);
                      }}
                      disabled={updateAutoRecharge.isPending}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                    >
                      {updateAutoRecharge.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save Settings"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={onRecharge}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={14} strokeWidth={3} />
              Add Credits
            </button>
          </div>
        </div>

        {/* Payment Method */}
        <div className={cn(
          "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
          isDarkMode
            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
            : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
        )}>
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-500 border",
                  isDarkMode
                    ? 'bg-white/5 border-white/10 group-hover:bg-white/10'
                    : 'bg-white border-slate-100 group-hover:bg-blue-50'
                )}>
                  <CreditCard size={16} className={isDarkMode ? "text-blue-400" : "text-blue-600"} />
                </div>
                <h3 className={cn("font-bold text-sm uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>Payments</h3>
              </div>

              <div className={cn("rounded-[20px] p-5 mb-6 border transition-all duration-500", isDarkMode ? 'bg-white/[0.03] border-white/8 group-hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-200')}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={cn(
                    "w-12 h-8 rounded-xl flex items-center justify-center font-black text-[10px] tracking-widest shadow-xl",
                    isDarkMode ? 'bg-gradient-to-br from-white/15 to-white/5 text-white border border-white/10' : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white'
                  )}>UPI</div>
                  <div>
                    <p className={cn("text-sm font-black tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Razorpay Secure</p>
                    <p className={cn("text-[9px] font-black uppercase tracking-widest opacity-40")}>Enterprise Ready</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center px-1">
                  <span className={cn("text-[8px] font-black uppercase tracking-widest opacity-30")}>Gateways</span>
                  <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20")}>SECURE</span>
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className={cn("text-[8px] font-black uppercase tracking-widest opacity-30")}>Compliance</span>
                  <span className={cn("text-[9px] font-black tracking-widest opacity-60")}>GST READY</span>
                </div>
              </div>
            </div>

            <button
              onClick={onRecharge}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                isDarkMode ? 'border-white/10 text-white/50 hover:bg-white/10 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white'
              )}>
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
              Manage Wallet
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className={cn(
          "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
          isDarkMode
            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
            : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
        )}>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-xl transition-all duration-500 border",
                  isDarkMode
                    ? 'bg-white/5 border-white/10 group-hover:bg-white/10'
                    : 'bg-white border-slate-100 group-hover:bg-purple-50'
                )}>
                  <Calendar size={16} className={isDarkMode ? "text-purple-400" : "text-purple-600"} />
                </div>
                <h3 className={cn("font-bold text-sm uppercase tracking-[0.2em]", isDarkMode ? 'text-white/30' : 'text-slate-400')}>Timeline</h3>
              </div>
              <span className={cn(
                "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                isDarkMode ? 'bg-white/[0.03] text-white/40 border border-white/5' : 'bg-slate-100 text-slate-500 border border-slate-200'
              )}>
                {transactions.length} Records
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 no-scrollbar min-h-[250px]">
              {isLoadingTransactions ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-20">
                  <Calendar size={32} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Records</p>
                </div>
              ) : transactions.map((tx: any, i: number) => (
                <div key={i} className={cn(
                  "p-4 rounded-[20px] transition-all duration-500 group/item cursor-default border",
                  isDarkMode ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10' : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-emerald-200'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-[9px] font-black tracking-widest opacity-40 group-hover/item:opacity-70 transition-opacity")}>#{tx.reference_id?.slice(-8) || tx.id}</span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all duration-300",
                      tx.type === 'credit'
                        ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover/item:bg-emerald-500 group-hover/item:text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover/item:bg-emerald-500 group-hover/item:text-white')
                        : (isDarkMode ? 'bg-white/5 text-white/40 border-white/10 group-hover/item:bg-slate-200 group-hover/item:text-slate-900' : 'bg-slate-50 text-slate-500 border-slate-200 group-hover/item:bg-slate-800 group-hover/item:text-white')
                    )}>{tx.type === 'credit' ? 'Reload' : 'Usage'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className={cn("text-[11px] font-black tracking-tight transition-colors", isDarkMode ? "text-white/80 group-hover/item:text-white" : "text-slate-900")}>{tx.description}</span>
                      <span className={cn("text-[9px] font-black uppercase tracking-widest opacity-20")}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={cn(
                      "text-sm font-black tabular-nums transition-transform duration-300 group-hover/item:scale-110",
                      tx.type === 'credit' ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : (isDarkMode ? 'text-white' : 'text-slate-900')
                    )}>
                      {tx.type === 'credit' ? '+' : '-'}{currencySymbol}{parseFloat(tx.amount).toFixed(2)}
                    </span>
                  </div>
                  {tx.type === 'credit' && (
                    <button className={cn(
                      "flex items-center gap-1.5 mt-4 text-[8px] font-black uppercase tracking-widest transition-all duration-500 opacity-20 hover:opacity-100 hover:translate-x-1",
                      isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                    )}>
                      <Download size={10} strokeWidth={3} />
                      Export Invoice
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
