"use client";

import { cn } from "@/lib/utils";
import { useGetBillingModeQuery, useGetBillingKpiQuery } from "@/hooks/useBillingQuery";
import {
    MessageSquare,
    Cpu,
    Gauge,
    AlertTriangle,
    Loader2,
} from "lucide-react";

interface BillingUsageLimitsProps {
    isDarkMode: boolean;
}

interface LimitBarProps {
    isDarkMode: boolean;
    label: string;
    current: number;
    max: number;
    icon: typeof MessageSquare;
    color: string;
    barColor: string;
}

const LimitBar = ({
    isDarkMode,
    label,
    current,
    max,
    icon: Icon,
    color,
    barColor,
}: LimitBarProps) => {
    const percent = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const isWarning = percent >= 80;
    const isCritical = percent >= 100;

    return (
        <div
            className={cn(
                "relative p-4 rounded-[20px] border transition-all duration-500",
                isDarkMode
                    ? "border-white/5 bg-white/[0.01]"
                    : "border-slate-100 bg-white"
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div
                        className={cn(
                            "p-1.5 rounded-lg",
                            isDarkMode ? `${color}/10` : `${color}/10`
                        )}
                        style={{
                            backgroundColor: isDarkMode
                                ? `color-mix(in srgb, ${barColor} 10%, transparent)`
                                : `color-mix(in srgb, ${barColor} 8%, transparent)`,
                        }}
                    >
                        <Icon size={14} style={{ color: barColor }} />
                    </div>
                    <span
                        className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isDarkMode ? "text-white/40" : "text-slate-500"
                        )}
                    >
                        {label}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isWarning && !isCritical && (
                        <AlertTriangle size={12} className="text-amber-500" />
                    )}
                    {isCritical && (
                        <AlertTriangle size={12} className="text-red-500 animate-pulse" />
                    )}
                    <span
                        className={cn(
                            "text-xs font-black tabular-nums",
                            isCritical
                                ? "text-red-500"
                                : isWarning
                                    ? isDarkMode
                                        ? "text-amber-400"
                                        : "text-amber-600"
                                    : isDarkMode
                                        ? "text-white/80"
                                        : "text-slate-800"
                        )}
                    >
                        {current.toLocaleString()}{" "}
                        <span
                            className={cn(
                                "font-medium",
                                isDarkMode ? "text-white/20" : "text-slate-400"
                            )}
                        >
                            / {max.toLocaleString()}
                        </span>
                    </span>
                </div>
            </div>

            <div
                className={cn(
                    "h-1.5 w-full rounded-full overflow-hidden",
                    isDarkMode ? "bg-white/5" : "bg-slate-100"
                )}
            >
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${percent}%`,
                        backgroundColor: isCritical
                            ? "#ef4444"
                            : isWarning
                                ? "#f59e0b"
                                : barColor,
                    }}
                />
            </div>

            <div className="flex justify-between mt-1.5">
                <span
                    className={cn(
                        "text-[9px] font-bold tabular-nums",
                        isDarkMode ? "text-white/20" : "text-slate-400"
                    )}
                >
                    {percent.toFixed(1)}% used
                </span>
                <span
                    className={cn(
                        "text-[9px] font-bold tabular-nums",
                        isDarkMode ? "text-white/20" : "text-slate-400"
                    )}
                >
                    {Math.max(max - current, 0).toLocaleString()} remaining
                </span>
            </div>
        </div>
    );
};

export const BillingUsageLimits = ({
    isDarkMode,
}: BillingUsageLimitsProps) => {
    const { data: modeResponse, isLoading: isModeLoading } =
        useGetBillingModeQuery();
    const { data: kpiResponse, isLoading: isKpiLoading } =
        useGetBillingKpiQuery();

    const isLoading = isModeLoading || isKpiLoading;
    const modeData = modeResponse?.data || {};
    const kpiData = kpiResponse?.data || {};

    // Usage limits from tenant settings (nested under limits object)
    const tenantLimits = modeData.limits || {};
    const limits = {
        maxDailyMessages: tenantLimits.max_daily_messages || 10000,
        maxMonthlyMessages: tenantLimits.max_monthly_messages || 200000,
        maxDailyAiCalls: tenantLimits.max_daily_ai_calls || 5000,
        maxMonthlyAiCalls: tenantLimits.max_monthly_ai_calls || 100000,
    };

    // Current usage from KPI data
    const usage = {
        dailyMessages: kpiData.todayMessagesSent || 0,
        monthlyMessages: kpiData.totalMessagesSent || 0,
        dailyAiCalls: kpiData.todayAiCalls || 0,
        monthlyAiCalls: kpiData.totalAiCalls || 0,
    };

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
                Usage Limits
            </h2>

            <div
                className={cn(
                    "relative group p-6 rounded-[24px] border transition-all duration-500 overflow-hidden",
                    isDarkMode
                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5"
                )}
            >
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Gauge size={16} className="text-emerald-500" />
                        </div>
                        <div>
                            <h3
                                className={cn(
                                    "font-bold text-sm uppercase tracking-[0.2em]",
                                    isDarkMode ? "text-white" : "text-slate-800"
                                )}
                            >
                                Rate Limits
                            </h3>
                            <p className={cn("text-[10px] font-medium mt-0.5", isDarkMode ? "opacity-30 text-white" : "text-slate-500")}>
                                Daily and monthly usage caps to prevent runaway costs
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LimitBar
                            isDarkMode={isDarkMode}
                            label="Daily Messages"
                            current={usage.dailyMessages}
                            max={limits.maxDailyMessages}
                            icon={MessageSquare}
                            color="bg-blue-500"
                            barColor="#3b82f6"
                        />
                        <LimitBar
                            isDarkMode={isDarkMode}
                            label="Monthly Messages"
                            current={usage.monthlyMessages}
                            max={limits.maxMonthlyMessages}
                            icon={MessageSquare}
                            color="bg-purple-500"
                            barColor="#8b5cf6"
                        />
                        <LimitBar
                            isDarkMode={isDarkMode}
                            label="Daily AI Calls"
                            current={usage.dailyAiCalls}
                            max={limits.maxDailyAiCalls}
                            icon={Cpu}
                            color="bg-teal-500"
                            barColor="#14b8a6"
                        />
                        <LimitBar
                            isDarkMode={isDarkMode}
                            label="Monthly AI Calls"
                            current={usage.monthlyAiCalls}
                            max={limits.maxMonthlyAiCalls}
                            icon={Cpu}
                            color="bg-orange-500"
                            barColor="#f97316"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
