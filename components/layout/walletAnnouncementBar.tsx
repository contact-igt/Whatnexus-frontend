"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Wallet, X, Zap, AlertTriangle } from "lucide-react";
import { useGetWalletBalanceQuery, useGetBillingModeQuery } from "@/hooks/useBillingQuery";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { useTheme } from "@/hooks/useTheme";
import { RechargeModal } from "@/components/views/billing/rechargeModal";

export const WalletAnnouncementBar = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme();
    const [dismissed, setDismissed] = useState(false);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

    const { data: walletBalanceRes } = useGetWalletBalanceQuery();
    const { data: billingModeRes } = useGetBillingModeQuery();

    const walletBalance = walletBalanceRes?.data?.balance ?? null;
    const isPostpaid = billingModeRes?.data?.billing_mode === "postpaid";
    const isManagement = user?.user_type === "management";

    const isZero = typeof walletBalance === "number" && walletBalance <= 0;
    const isLow = typeof walletBalance === "number" && walletBalance > 0 && walletBalance < 100;
    const showBar = !dismissed && !isPostpaid && !isManagement && (isZero || isLow);

    if (!showBar) return null;

    return (
        <>
            {/* ── Full-width announcement bar ─────────────────────────────── */}
            <div
                className={cn(
                    "relative z-100     w-full flex items-center justify-center gap-4 px-6 py-2.5 border-b shrink-0 overflow-hidden",
                    isDarkMode
                        ? isZero
                            ? "bg-red-500/10 border-red-500/20"
                            : "bg-amber-500/10 border-amber-500/20"
                        : isZero
                            ? "bg-red-50 border-red-200"
                            : "bg-amber-50 border-amber-200"
                )}
            >
                {/* Icon badge — same pattern as billingDashboard icon containers */}
                <div
                    className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border",
                        isDarkMode
                            ? "bg-white/5 border-white/10"
                            : isZero ? "bg-red-100 border-red-200" : "bg-amber-100 border-amber-200"
                    )}
                >
                    {isZero
                        ? <AlertTriangle size={12} className={isDarkMode ? "text-red-400" : "text-red-500"} />
                        : <Wallet size={12} className={isDarkMode ? "text-amber-400" : "text-amber-600"} />
                    }
                </div>

                {/* Status chip — exact pattern from billingDashboard */}
                <span
                    className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border shrink-0",
                        isDarkMode
                            ? isZero
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : isZero
                                ? "bg-red-100 text-red-600 border-red-200"
                                : "bg-amber-100 text-amber-700 border-amber-200"
                    )}
                >
                    {isZero ? "Zero Balance" : "Low Balance"}
                </span>

                {/* Message text */}
                <p
                    className={cn(
                        "text-[11px] font-bold whitespace-nowrap",
                        isDarkMode
                            ? isZero ? "text-red-400" : "text-amber-400"
                            : isZero ? "text-red-700" : "text-amber-800"
                    )}
                >
                    {isZero ? (
                        <>
                            Wallet is empty — all messaging is paused.{" "}
                            <span className={cn("font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                Recharge to restore services.
                            </span>
                        </>
                    ) : (
                        <>
                            Wallet balance is low —{" "}
                            <span className={cn("font-black tabular-nums", isDarkMode ? "text-white/80" : "text-slate-800")}>
                                ₹{(walletBalance as number).toFixed(2)}
                            </span>{" "}
                            <span className={cn("font-medium", isDarkMode ? "text-white/40" : "text-slate-500")}>
                                remaining. Recharge soon.
                            </span>
                        </>
                    )}
                </p>

                {/* CTA — emerald gradient, exact pattern from billingWallet "Save Settings" button */}
                <button
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 shrink-0"
                >
                    <Zap size={10} className="shrink-0" />
                    Recharge Now
                </button>

                {/* Dismiss — glass button matching header's icon buttons */}
                <button
                    onClick={() => setDismissed(true)}
                    aria-label="Dismiss"
                    className={cn(
                        "absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg border transition-all duration-200",
                        isDarkMode
                            ? "bg-white/5 border-white/10 text-white/30 hover:bg-white/10 hover:text-white/60"
                            : "bg-white border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    )}
                >
                    <X size={11} />
                </button>
            </div>

            <RechargeModal
                isOpen={isRechargeModalOpen}
                onClose={() => setIsRechargeModalOpen(false)}
                isDarkMode={isDarkMode}
            />
        </>
    );
};
