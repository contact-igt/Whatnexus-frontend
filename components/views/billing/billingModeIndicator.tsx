"use client";

import { cn } from "@/lib/utils";
import { useGetBillingModeQuery } from "@/hooks/useBillingQuery";
import {
    CreditCard,
    Wallet,
    Calendar,
    AlertTriangle,
    TrendingUp,
    Shield,
    Clock,
    Loader2,
} from "lucide-react";

interface BillingModeIndicatorProps {
    isDarkMode: boolean;
}

export const BillingModeIndicator = ({ isDarkMode }: BillingModeIndicatorProps) => {
    const { data: modeResponse, isLoading } = useGetBillingModeQuery();

    const modeData = modeResponse?.data || {};
    const billingMode = modeData.billing_mode || "prepaid";
    const isPrepaid = billingMode === "prepaid";

    const postpaid = modeData.postpaid || null;
    const creditLimit = postpaid?.credit_limit || 5000;
    const creditUsed = postpaid?.current_usage || 0;
    const creditPercent = creditLimit > 0 ? Math.min((creditUsed / creditLimit) * 100, 100) : 0;
    const creditRemaining = Math.max(creditLimit - creditUsed, 0);

    const cycleStart = modeData.billing_cycle_start ? new Date(modeData.billing_cycle_start).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "—";
    const cycleEnd = modeData.billing_cycle_end ? new Date(modeData.billing_cycle_end).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    const daysLeft = modeData.billing_cycle_end
        ? Math.max(0, Math.ceil((new Date(modeData.billing_cycle_end).getTime() - Date.now()) / 86400000))
        : 0;

    if (isLoading) {
        return (
            <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500 opacity-50" />
            </div>
        );
    }

    return (
        <div>
            <h2
                className={cn(
                    "text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2",
                    isDarkMode ? "text-white/25" : "text-slate-400"
                )}
            >
                <div className="w-4 h-px bg-emerald-500/50" />
                Billing Mode
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Mode Card */}
                <div
                    className={cn(
                        "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                        isDarkMode
                            ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                            : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                    )}
                >
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "p-2 rounded-xl border transition-all duration-500",
                                        isDarkMode
                                            ? "bg-white/5 border-white/10"
                                            : "bg-white border-slate-100"
                                    )}
                                >
                                    {isPrepaid ? (
                                        <Wallet size={16} className="text-emerald-500" />
                                    ) : (
                                        <CreditCard size={16} className="text-blue-500" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.2em]",
                                        isDarkMode ? "text-white/30" : "text-slate-400"
                                    )}
                                >
                                    Active Mode
                                </span>
                            </div>

                            <span
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    isPrepaid
                                        ? isDarkMode
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : "bg-emerald-50 text-emerald-600 border-emerald-200"
                                        : isDarkMode
                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            : "bg-blue-50 text-blue-600 border-blue-200"
                                )}
                            >
                                {billingMode}
                            </span>
                        </div>

                        <h3
                            className={cn(
                                "text-2xl font-black tracking-tight",
                                isDarkMode ? "text-white" : "text-slate-900"
                            )}
                        >
                            {isPrepaid ? "Prepaid" : "Postpaid"}
                        </h3>
                        <p
                            className={cn(
                                "text-xs mt-2 leading-relaxed",
                                isDarkMode ? "text-white/40" : "text-slate-500"
                            )}
                        >
                            {isPrepaid
                                ? "Real-time wallet deduction for every message and AI call. Balance must cover estimated cost."
                                : "Usage tracked in 30-day billing cycles. Invoice generated at cycle end. Pay within 15 days."}
                        </p>

                        <div
                            className={cn(
                                "mt-4 pt-4 border-t flex items-center gap-2",
                                isDarkMode ? "border-white/5" : "border-slate-100"
                            )}
                        >
                            <Shield
                                size={12}
                                className={isPrepaid ? "text-emerald-500" : "text-blue-500"}
                            />
                            <span
                                className={cn(
                                    "text-[10px] font-bold",
                                    isDarkMode ? "text-white/30" : "text-slate-400"
                                )}
                            >
                                {isPrepaid
                                    ? "No negative balance allowed"
                                    : `Credit limit: ₹${creditLimit.toLocaleString()}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cycle Info (Postpaid) or Quick Stats (Prepaid) */}
                {!isPrepaid && postpaid ? (
                    <>
                        {/* Current Cycle */}
                        <div
                            className={cn(
                                "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                                isDarkMode
                                    ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                    : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                            )}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div
                                        className={cn(
                                            "p-2 rounded-xl border",
                                            isDarkMode
                                                ? "bg-white/5 border-white/10"
                                                : "bg-white border-slate-100"
                                        )}
                                    >
                                        <Calendar size={16} className="text-blue-500" />
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em]",
                                            isDarkMode ? "text-white/30" : "text-slate-400"
                                        )}
                                    >
                                        Current Cycle
                                    </span>
                                </div>

                                <div className="flex items-baseline gap-2">
                                    <h3
                                        className={cn(
                                            "text-2xl font-black tracking-tight",
                                            isDarkMode ? "text-white" : "text-slate-900"
                                        )}
                                    >
                                        {cycleStart} – {cycleEnd}
                                    </h3>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider",
                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                            )}
                                        >
                                            Days Remaining
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={10} className="text-blue-500" />
                                            <span
                                                className={cn(
                                                    "text-sm font-black tabular-nums",
                                                    isDarkMode ? "text-white" : "text-slate-900"
                                                )}
                                            >
                                                {daysLeft}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider",
                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                            )}
                                        >
                                            Cycle Messages
                                        </span>
                                        <span
                                            className={cn(
                                                "text-sm font-black tabular-nums",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}
                                        >
                                            —
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider",
                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                            )}
                                        >
                                            Cycle AI Calls
                                        </span>
                                        <span
                                            className={cn(
                                                "text-sm font-black tabular-nums",
                                                isDarkMode ? "text-white" : "text-slate-900"
                                            )}
                                        >
                                            —
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Credit Usage */}
                        <div
                            className={cn(
                                "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                                isDarkMode
                                    ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                    : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                            )}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "p-2 rounded-xl border",
                                                isDarkMode
                                                    ? "bg-white/5 border-white/10"
                                                    : "bg-white border-slate-100"
                                            )}
                                        >
                                            <TrendingUp size={16} className="text-amber-500" />
                                        </div>
                                        <span
                                            className={cn(
                                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                            )}
                                        >
                                            Credit Usage
                                        </span>
                                    </div>
                                    {creditPercent >= 80 && (
                                        <AlertTriangle
                                            size={14}
                                            className={
                                                creditPercent >= 100
                                                    ? "text-red-500 animate-pulse"
                                                    : "text-amber-500"
                                            }
                                        />
                                    )}
                                </div>

                                <div className="flex items-baseline gap-1">
                                    <h3
                                        className={cn(
                                            "text-2xl font-black tracking-tight tabular-nums",
                                            creditPercent >= 100
                                                ? "text-red-500"
                                                : creditPercent >= 80
                                                    ? isDarkMode
                                                        ? "text-amber-400"
                                                        : "text-amber-600"
                                                    : isDarkMode
                                                        ? "text-white"
                                                        : "text-slate-900"
                                        )}
                                    >
                                        ₹{creditUsed.toFixed(2)}
                                    </h3>
                                    <span
                                        className={cn(
                                            "text-xs font-bold",
                                            isDarkMode ? "text-white/20" : "text-slate-400"
                                        )}
                                    >
                                        / ₹{creditLimit.toLocaleString()}
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4 space-y-2">
                                    <div
                                        className={cn(
                                            "h-2 w-full rounded-full overflow-hidden",
                                            isDarkMode ? "bg-white/5" : "bg-slate-100"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000 ease-out",
                                                creditPercent >= 100
                                                    ? "bg-red-500"
                                                    : creditPercent >= 80
                                                        ? "bg-amber-500"
                                                        : "bg-blue-500"
                                            )}
                                            style={{ width: `${creditPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between">
                                        <span
                                            className={cn(
                                                "text-[10px] font-bold tabular-nums",
                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                            )}
                                        >
                                            {creditPercent.toFixed(1)}% used
                                        </span>
                                        <span
                                            className={cn(
                                                "text-[10px] font-bold tabular-nums",
                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                            )}
                                        >
                                            ₹{creditRemaining.toFixed(2)} remaining
                                        </span>
                                    </div>
                                </div>

                                {creditPercent >= 80 && creditPercent < 100 && (
                                    <div
                                        className={cn(
                                            "mt-3 px-3 py-2 rounded-xl text-[10px] font-bold",
                                            isDarkMode
                                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                        )}
                                    >
                                        Approaching credit limit — services may be paused at 100%
                                    </div>
                                )}
                                {creditPercent >= 100 && (
                                    <div
                                        className={cn(
                                            "mt-3 px-3 py-2 rounded-xl text-[10px] font-bold",
                                            isDarkMode
                                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                : "bg-red-50 text-red-700 border border-red-200"
                                        )}
                                    >
                                        Credit limit reached — new messages & AI calls blocked
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    isPrepaid && (
                        <>
                            {/* Prepaid Quick Info Card 1 */}
                            <div
                                className={cn(
                                    "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                                    isDarkMode
                                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                                )}
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div
                                            className={cn(
                                                "p-2 rounded-xl border",
                                                isDarkMode
                                                    ? "bg-white/5 border-white/10"
                                                    : "bg-white border-slate-100"
                                            )}
                                        >
                                            <Shield size={16} className="text-emerald-500" />
                                        </div>
                                        <span
                                            className={cn(
                                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                            )}
                                        >
                                            How Prepaid Works
                                        </span>
                                    </div>
                                    <div
                                        className={cn(
                                            "space-y-3 text-xs leading-relaxed",
                                            isDarkMode ? "text-white/40" : "text-slate-500"
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                            <span>Every message and AI call costs are deducted instantly from your wallet</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                            <span>Operations blocked if balance is less than estimated cost</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                            <span>Enable auto-recharge to avoid service interruptions</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Prepaid Quick Info Card 2 */}
                            <div
                                className={cn(
                                    "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                                    isDarkMode
                                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                                        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                                )}
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div
                                            className={cn(
                                                "p-2 rounded-xl border",
                                                isDarkMode
                                                    ? "bg-white/5 border-white/10"
                                                    : "bg-white border-slate-100"
                                            )}
                                        >
                                            <TrendingUp size={16} className="text-emerald-500" />
                                        </div>
                                        <span
                                            className={cn(
                                                "text-[10px] font-black uppercase tracking-[0.2em]",
                                                isDarkMode ? "text-white/30" : "text-slate-400"
                                            )}
                                        >
                                            Safety Features
                                        </span>
                                    </div>
                                    <div
                                        className={cn(
                                            "space-y-3 text-xs leading-relaxed",
                                            isDarkMode ? "text-white/40" : "text-slate-500"
                                        )}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                            <span>Balance can never go negative — strict floor at ₹0</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                            <span>Low balance warning at ₹100 threshold</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                            <span>Daily and monthly usage limits prevent runaway costs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
};
