"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glassCard";
import { cn } from "@/lib/utils";
import {
  Cpu,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  IndianRupee,
  Sparkles,
  Activity,
  Zap,
  Loader2,
  PieChart,
  BarChart3,
  Bot,
  MessageSquare,
  Search,
  FileText,
  Wand2,
  Brain,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetAiTokenUsageQuery } from "@/hooks/useBillingQuery";

interface AiApiTokensUsageProps {
  isDarkMode: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

// Animated counter hook
const useAnimatedValue = (target: number, duration: number = 2000) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  return value;
};

export const AiApiTokensUsage = ({ isDarkMode, startDate, endDate }: AiApiTokensUsageProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: response, isLoading } = useGetAiTokenUsageQuery(
    startDate?.toISOString(),
    endDate?.toISOString()
  );

  const tokenData = response?.data;
  const summary = tokenData?.summary || { totalPromptTokens: 0, totalCompletionTokens: 0, totalTokens: 0, totalCostInr: 0, totalCostUsd: 0, totalCalls: 0 };
  const recentCalls = tokenData?.recentCalls || [];
  const byModel = tokenData?.byModel || [];
  const bySource = tokenData?.bySource || [];
  // INR values come directly from backend (final_cost_inr column) — no conversion on frontend

  // Source display config
  const sourceConfig: Record<string, { label: string; icon: any; color: string }> = {
    whatsapp: { label: 'WhatsApp Auto-Reply', icon: MessageSquare, color: 'emerald' },
    whatsapp_retry: { label: 'WhatsApp Retry', icon: MessageSquare, color: 'teal' },
    classifier: { label: 'Response Classifier', icon: Brain, color: 'violet' },
    playground: { label: 'AI Playground', icon: Wand2, color: 'blue' },
    knowledge: { label: 'Knowledge Search', icon: Search, color: 'cyan' },
    language_detect: { label: 'Language Detection', icon: FileText, color: 'amber' },
  };

  // Model color config
  const modelColors = ['violet', 'cyan', 'blue', 'emerald', 'amber', 'rose', 'indigo'];

  // Helper to clean model name by removing date suffix (e.g., "gpt-4.1-nano-2025-04-14" -> "gpt-4.1-nano")
  const cleanModelName = (name: string) => name?.replace(/-\d{4}-\d{2}-\d{2}$/, '') || name;

  // Export to CSV functionality
  const exportToCSV = () => {
    if (recentCalls.length === 0) return;
    const headers = ['Date/Time', 'Source', 'Model', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Cost (USD)', 'Cost (INR)'];
    const rows = recentCalls.map((row: any) => {
      const dateValue = row.created_at || row.createdAt;
      const parsedDate = dateValue ? new Date(dateValue) : null;
      const formattedDate = parsedDate && !isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : 'N/A';
      const costUsd = parseFloat(row.estimated_cost) || 0;
      const costInr = parseFloat(row.final_cost_inr) || 0;
      return [
        formattedDate,
        row.source || '',
        cleanModelName(row.model) || '',
        row.prompt_tokens || 0,
        row.completion_tokens || 0,
        row.total_tokens || 0,
        costUsd.toFixed(6),
        costInr.toFixed(4)
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ai-token-usage-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const inputTokens = summary.totalPromptTokens;
  const outputTokens = summary.totalCompletionTokens;
  const totalTokens = summary.totalTokens || 1;
  const amountSpent = summary.totalCostInr;

  const animatedInput = useAnimatedValue(inputTokens);
  const animatedOutput = useAnimatedValue(outputTokens);
  const animatedTotal = useAnimatedValue(totalTokens);
  const animatedAmount = useAnimatedValue(Math.round(amountSpent * 100)) / 100;

  const inputPercent = totalTokens > 0 ? Math.round((inputTokens / totalTokens) * 100) : 50;
  const outputPercent = 100 - inputPercent;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Overall Used Tokens — Hero Banner */}
      <GlassCard isDarkMode={isDarkMode} delay={0} className="p-0 overflow-hidden">
        <div className="relative p-8">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-blue-500/5 to-cyan-500/8" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-500/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-cyan-500/8 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-3 rounded-2xl border relative overflow-hidden group",
                      isDarkMode
                        ? "bg-gradient-to-br from-violet-500/15 to-blue-500/15 border-violet-500/20"
                        : "bg-violet-50 border-violet-100"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Sparkles
                      className={cn(
                        "w-6 h-6 relative z-10 transition-transform duration-500 group-hover:scale-110",
                        isDarkMode ? "text-violet-400" : "text-violet-600"
                      )}
                    />
                  </div>
                  <div>
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isDarkMode ? "text-white/40" : "text-slate-400"
                      )}
                    >
                      Overall AI Usage
                    </p>
                    <h2
                      className={cn(
                        "text-lg font-bold tracking-tight",
                        isDarkMode ? "text-white" : "text-slate-900"
                      )}
                    >
                      Total Tokens Consumed
                    </h2>
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <h1
                    className={cn(
                      "text-5xl lg:text-6xl font-black tracking-tighter tabular-nums",
                      isDarkMode ? "text-white" : "text-slate-900"
                    )}
                  >
                    {animatedTotal.toLocaleString()}
                  </h1>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDarkMode ? "text-white/30" : "text-slate-400"
                    )}
                  >
                    tokens
                  </span>
                </div>

                {/* Token ratio bar */}
                <div className="max-w-md space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className={cn(isDarkMode ? "text-cyan-400/70" : "text-cyan-600")}>
                      Input {inputPercent}%
                    </span>
                    <span className={cn(isDarkMode ? "text-violet-400/70" : "text-violet-600")}>
                      Output {outputPercent}%
                    </span>
                  </div>
                  <div
                    className={cn(
                      "w-full h-2.5 rounded-full overflow-hidden flex",
                      isDarkMode ? "bg-white/5" : "bg-slate-100"
                    )}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-[2000ms] ease-out rounded-l-full"
                      style={{ width: `${inputPercent}%` }}
                    />
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-[2000ms] ease-out rounded-r-full"
                      style={{ width: `${outputPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right side — Amount badge */}
              <div
                className={cn(
                  "flex flex-col items-center gap-2 p-6 rounded-2xl border",
                  isDarkMode
                    ? "bg-white/[0.03] border-white/5"
                    : "bg-slate-50 border-slate-200"
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isDarkMode ? "text-white/35" : "text-slate-400"
                  )}
                >
                  Total Spent
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-3xl font-black tracking-tighter tabular-nums",
                      isDarkMode ? "text-emerald-400" : "text-emerald-600"
                    )}
                  >
                    ₹{animatedAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-ping" />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider",
                      isDarkMode ? "text-emerald-400/70" : "text-emerald-600"
                    )}
                  >
                    Live tracking
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Token Detail Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Input Tokens */}
        <GlassCard isDarkMode={isDarkMode} delay={100} className="p-0">
          <div className="relative group p-6 cursor-default h-full flex flex-col justify-between">
            <div
              className={cn(
                "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl",
                "bg-cyan-500/5"
              )}
            />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isDarkMode ? "text-white/40" : "text-slate-400"
                  )}
                >
                  Input Tokens
                </p>
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors duration-300",
                    isDarkMode
                      ? "bg-white/5 group-hover:bg-cyan-500/10"
                      : "bg-slate-100 group-hover:bg-cyan-50"
                  )}
                >
                  <ArrowDownToLine
                    size={12}
                    className={cn(isDarkMode ? "text-cyan-400" : "text-cyan-600")}
                  />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3
                  className={cn(
                    "text-3xl font-black tracking-tighter tabular-nums",
                    isDarkMode ? "text-white" : "text-slate-800"
                  )}
                >
                  {animatedInput.toLocaleString()}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    isDarkMode ? "text-cyan-400/60" : "text-cyan-600"
                  )}
                >
                  tokens
                </span>
              </div>
              <div
                className={cn(
                  "w-full h-1.5 mt-4 rounded-full overflow-hidden",
                  isDarkMode ? "bg-white/5" : "bg-slate-100"
                )}
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-[2000ms] ease-out shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                  style={{ width: `${inputPercent}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Output Tokens */}
        <GlassCard isDarkMode={isDarkMode} delay={200} className="p-0">
          <div className="relative group p-6 cursor-default h-full flex flex-col justify-between">
            <div
              className={cn(
                "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl",
                "bg-violet-500/5"
              )}
            />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isDarkMode ? "text-white/40" : "text-slate-400"
                  )}
                >
                  Output Tokens
                </p>
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors duration-300",
                    isDarkMode
                      ? "bg-white/5 group-hover:bg-violet-500/10"
                      : "bg-slate-100 group-hover:bg-violet-50"
                  )}
                >
                  <ArrowUpFromLine
                    size={12}
                    className={cn(isDarkMode ? "text-violet-400" : "text-violet-600")}
                  />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3
                  className={cn(
                    "text-3xl font-black tracking-tighter tabular-nums",
                    isDarkMode ? "text-white" : "text-slate-800"
                  )}
                >
                  {animatedOutput.toLocaleString()}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    isDarkMode ? "text-violet-400/60" : "text-violet-600"
                  )}
                >
                  tokens
                </span>
              </div>
              <div
                className={cn(
                  "w-full h-1.5 mt-4 rounded-full overflow-hidden",
                  isDarkMode ? "bg-white/5" : "bg-slate-100"
                )}
              >
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-[2000ms] ease-out shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                  style={{ width: `${outputPercent}%` }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Total Tokens */}
        <GlassCard isDarkMode={isDarkMode} delay={300} className="p-0">
          <div className="relative group p-6 cursor-default h-full flex flex-col justify-between">
            <div
              className={cn(
                "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl",
                "bg-blue-500/5"
              )}
            />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isDarkMode ? "text-white/40" : "text-slate-400"
                  )}
                >
                  Total Tokens
                </p>
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors duration-300",
                    isDarkMode
                      ? "bg-white/5 group-hover:bg-blue-500/10"
                      : "bg-slate-100 group-hover:bg-blue-50"
                  )}
                >
                  <Layers
                    size={12}
                    className={cn(isDarkMode ? "text-blue-400" : "text-blue-600")}
                  />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3
                  className={cn(
                    "text-3xl font-black tracking-tighter tabular-nums",
                    isDarkMode ? "text-white" : "text-slate-800"
                  )}
                >
                  {animatedTotal.toLocaleString()}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    isDarkMode ? "text-blue-400/60" : "text-blue-600"
                  )}
                >
                  tokens
                </span>
              </div>
              <div
                className={cn(
                  "w-full h-1.5 mt-4 rounded-full overflow-hidden",
                  isDarkMode ? "bg-white/5" : "bg-slate-100"
                )}
              >
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-[2000ms] ease-out shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Amount in Rupees */}
        <GlassCard isDarkMode={isDarkMode} delay={400} className="p-0">
          <div className="relative group p-6 cursor-default h-full flex flex-col justify-between">
            <div
              className={cn(
                "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl",
                "bg-emerald-500/5"
              )}
            />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-1">
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isDarkMode ? "text-white/40" : "text-slate-400"
                  )}
                >
                  Amount (INR)
                </p>
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors duration-300",
                    isDarkMode
                      ? "bg-white/5 group-hover:bg-emerald-500/10"
                      : "bg-slate-100 group-hover:bg-emerald-50"
                  )}
                >
                  <IndianRupee
                    size={12}
                    className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-600")}
                  />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <h3
                  className={cn(
                    "text-3xl font-black tracking-tighter tabular-nums",
                    isDarkMode ? "text-white" : "text-slate-800"
                  )}
                >
                  ₹{animatedAmount.toFixed(2)}
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    isDarkMode ? "text-emerald-400/60" : "text-emerald-600"
                  )}
                >
                  spent
                </span>
              </div>
              <div
                className={cn(
                  "w-full h-1.5 mt-4 rounded-full overflow-hidden",
                  isDarkMode ? "bg-white/5" : "bg-slate-100"
                )}
              >
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-[2000ms] ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  style={{ width: "45%" }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Usage Breakdown Table */}
      <GlassCard isDarkMode={isDarkMode} delay={700} className="p-0 overflow-hidden">
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-xl border",
                  isDarkMode
                    ? "bg-gradient-to-br from-violet-500/10 to-blue-500/10 border-violet-500/20"
                    : "bg-violet-50 border-violet-100"
                )}
              >
                <Activity
                  size={14}
                  className={cn(isDarkMode ? "text-violet-400" : "text-violet-600")}
                />
              </div>
              <div>
                <h3
                  className={cn(
                    "text-sm font-bold tracking-tight",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  API Request Transactions
                </h3>
                <p
                  className={cn(
                    "text-[10px] font-medium",
                    isDarkMode ? "text-white/30" : "text-slate-400"
                  )}
                >
                  Recent API usage logs
                </p>
              </div>
            </div>
            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={recentCalls.length === 0}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-300",
                recentCalls.length === 0
                  ? (isDarkMode ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed" : "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed")
                  : (isDarkMode
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30"
                    : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200")
              )}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={cn(
                    "border-b text-left",
                    isDarkMode ? "border-white/5" : "border-slate-100"
                  )}
                >
                  {["Date / Time", "Input Tokens", "Output Tokens", "Total", "Cost (₹)"].map(
                    (header) => (
                      <th
                        key={header}
                        className={cn(
                          "text-[9px] font-black uppercase tracking-widest py-3 px-4",
                          isDarkMode ? "text-white/30" : "text-slate-400"
                        )}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recentCalls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className={cn("flex flex-col items-center gap-2", isDarkMode ? "text-white/20" : "text-slate-300")}>
                        <Activity size={24} />
                        <p className="text-xs font-bold uppercase tracking-wider">No AI calls recorded yet</p>
                      </div>
                    </td>
                  </tr>
                ) : recentCalls.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row: any, i: number) => {
                  const colors = ["violet", "cyan", "blue", "emerald"];
                  const color = colors[i % colors.length];
                  // Handle date parsing - backend may return created_at or createdAt
                  const dateValue = row.created_at || row.createdAt;
                  const parsedDate = dateValue ? new Date(dateValue) : null;
                  const formattedDate = parsedDate && !isNaN(parsedDate.getTime())
                    ? parsedDate.toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                    : 'N/A';
                  return (
                    <tr
                      key={row.id || i}
                      className={cn(
                        "border-b transition-colors duration-300 group/row",
                        isDarkMode
                          ? "border-white/[0.03] hover:bg-white/[0.02]"
                          : "border-slate-50 hover:bg-slate-50/50"
                      )}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              color === "violet"
                                ? "bg-violet-500"
                                : color === "cyan"
                                  ? "bg-cyan-500"
                                  : color === "blue"
                                    ? "bg-blue-500"
                                    : "bg-emerald-500"
                            )}
                          />
                          <div>
                            <span
                              className={cn(
                                "text-xs font-bold block",
                                isDarkMode ? "text-white/80" : "text-slate-700"
                              )}
                            >
                              {formattedDate}
                            </span>
                            <span className={cn("text-[9px] font-medium", isDarkMode ? "text-white/30" : "text-slate-400")}>
                              {row.source} · {cleanModelName(row.model)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "py-3.5 px-4 text-xs font-semibold tabular-nums",
                          isDarkMode ? "text-cyan-400/70" : "text-cyan-700"
                        )}
                      >
                        {(row.prompt_tokens || 0).toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          "py-3.5 px-4 text-xs font-semibold tabular-nums",
                          isDarkMode ? "text-violet-400/70" : "text-violet-700"
                        )}
                      >
                        {(row.completion_tokens || 0).toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          "py-3.5 px-4 text-xs font-bold tabular-nums",
                          isDarkMode ? "text-white/60" : "text-slate-600"
                        )}
                      >
                        {(row.total_tokens || 0).toLocaleString()}
                      </td>
                      <td
                        className={cn(
                          "py-3.5 px-4 text-xs font-bold tabular-nums",
                          isDarkMode ? "text-emerald-400/70" : "text-emerald-700"
                        )}
                      >
                        ₹{(parseFloat(row.final_cost_inr) || 0).toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {recentCalls.length > itemsPerPage && (
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <span className={cn("text-[10px] font-bold", isDarkMode ? "text-white/30" : "text-slate-400")}>
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, recentCalls.length)} of {recentCalls.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "p-2 rounded-xl border transition-all duration-300",
                    currentPage === 1
                      ? (isDarkMode ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed" : "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed")
                      : (isDarkMode ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")
                  )}
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.ceil(recentCalls.length / itemsPerPage) }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === Math.ceil(recentCalls.length / itemsPerPage) || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <span key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className={cn("px-1 text-[10px]", isDarkMode ? "text-white/20" : "text-slate-400")}>...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-xs font-bold transition-all duration-300",
                            currentPage === page
                              ? (isDarkMode ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-violet-100 text-violet-600 border border-violet-200")
                              : (isDarkMode ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100")
                          )}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(recentCalls.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(recentCalls.length / itemsPerPage)}
                  className={cn(
                    "p-2 rounded-xl border transition-all duration-300",
                    currentPage === Math.ceil(recentCalls.length / itemsPerPage)
                      ? (isDarkMode ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed" : "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed")
                      : (isDarkMode ? "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")
                  )}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Model & Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Model */}
        <GlassCard isDarkMode={isDarkMode} delay={800} className="p-0 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={cn(
                  "p-2 rounded-xl border",
                  isDarkMode
                    ? "bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20"
                    : "bg-blue-50 border-blue-100"
                )}
              >
                <BarChart3 size={14} className={cn(isDarkMode ? "text-blue-400" : "text-blue-600")} />
              </div>
              <div>
                <h3 className={cn("text-sm font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                  Usage by Model
                </h3>
                <p className={cn("text-[10px] font-medium", isDarkMode ? "text-white/30" : "text-slate-400")}>
                  Token consumption per AI model
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {byModel.length === 0 ? (
                <div className={cn("flex flex-col items-center justify-center py-8 gap-2", isDarkMode ? "text-white/20" : "text-slate-300")}>
                  <BarChart3 size={24} />
                  <p className="text-xs font-bold uppercase tracking-wider">No model data yet</p>
                </div>
              ) : byModel.map((model: any, i: number) => {
                const color = modelColors[i % modelColors.length];
                const percent = totalTokens > 0 ? Math.round((model.totalTokens / totalTokens) * 100) : 0;
                const costInr = parseFloat(model.costInr) || 0;
                return (
                  <div key={model.model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          color === 'violet' ? 'bg-violet-500' :
                            color === 'cyan' ? 'bg-cyan-500' :
                              color === 'blue' ? 'bg-blue-500' :
                                color === 'emerald' ? 'bg-emerald-500' :
                                  color === 'amber' ? 'bg-amber-500' :
                                    color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'
                        )} />
                        <span className={cn("text-xs font-bold", isDarkMode ? "text-white/80" : "text-slate-700")}>
                          {cleanModelName(model.model)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("text-[10px] font-semibold", isDarkMode ? "text-white/40" : "text-slate-400")}>
                          {model.totalTokens?.toLocaleString()} tokens
                        </span>
                        <span className={cn("text-[10px] font-bold", isDarkMode ? "text-emerald-400/70" : "text-emerald-600")}>
                          ₹{costInr.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className={cn("w-full h-2 rounded-full overflow-hidden", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          color === 'violet' ? 'bg-gradient-to-r from-violet-500 to-violet-400' :
                            color === 'cyan' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' :
                              color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                                color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                  color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                    color === 'rose' ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className={cn("text-[9px] font-medium", isDarkMode ? "text-white/20" : "text-slate-400")}>
                        {model.calls} calls
                      </span>
                      <span className={cn("text-[9px] font-bold", isDarkMode ? "text-white/40" : "text-slate-500")}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* Usage by Source */}
        <GlassCard isDarkMode={isDarkMode} delay={900} className="p-0 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div
                className={cn(
                  "p-2 rounded-xl border",
                  isDarkMode
                    ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
                    : "bg-emerald-50 border-emerald-100"
                )}
              >
                <PieChart size={14} className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-600")} />
              </div>
              <div>
                <h3 className={cn("text-sm font-bold tracking-tight", isDarkMode ? "text-white" : "text-slate-900")}>
                  Usage by Feature
                </h3>
                <p className={cn("text-[10px] font-medium", isDarkMode ? "text-white/30" : "text-slate-400")}>
                  Where your AI tokens are used
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {bySource.length === 0 ? (
                <div className={cn("flex flex-col items-center justify-center py-8 gap-2", isDarkMode ? "text-white/20" : "text-slate-300")}>
                  <PieChart size={24} />
                  <p className="text-xs font-bold uppercase tracking-wider">No source data yet</p>
                </div>
              ) : bySource.map((source: any, i: number) => {
                const config = sourceConfig[source.source] || { label: source.source, icon: Bot, color: 'slate' };
                const Icon = config.icon;
                const percent = totalTokens > 0 ? Math.round((source.totalTokens / totalTokens) * 100) : 0;
                const costInr = parseFloat(source.costInr) || 0;
                return (
                  <div
                    key={source.source}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 group/source",
                      isDarkMode
                        ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      config.color === 'emerald' ? (isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50') :
                        config.color === 'teal' ? (isDarkMode ? 'bg-teal-500/10' : 'bg-teal-50') :
                          config.color === 'violet' ? (isDarkMode ? 'bg-violet-500/10' : 'bg-violet-50') :
                            config.color === 'blue' ? (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50') :
                              config.color === 'cyan' ? (isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50') :
                                config.color === 'amber' ? (isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50') :
                                  (isDarkMode ? 'bg-slate-500/10' : 'bg-slate-100')
                    )}>
                      <Icon size={14} className={cn(
                        config.color === 'emerald' ? 'text-emerald-500' :
                          config.color === 'teal' ? 'text-teal-500' :
                            config.color === 'violet' ? 'text-violet-500' :
                              config.color === 'blue' ? 'text-blue-500' :
                                config.color === 'cyan' ? 'text-cyan-500' :
                                  config.color === 'amber' ? 'text-amber-500' : 'text-slate-500'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn("text-xs font-bold truncate", isDarkMode ? "text-white/80" : "text-slate-700")}>
                          {config.label}
                        </span>
                        <span className={cn("text-[10px] font-bold", isDarkMode ? "text-white/50" : "text-slate-500")}>
                          {percent}%
                        </span>
                      </div>
                      <div className={cn("w-full h-1.5 rounded-full overflow-hidden", isDarkMode ? "bg-white/5" : "bg-slate-100")}>
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out",
                            config.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                              config.color === 'teal' ? 'bg-gradient-to-r from-teal-500 to-teal-400' :
                                config.color === 'violet' ? 'bg-gradient-to-r from-violet-500 to-violet-400' :
                                  config.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                                    config.color === 'cyan' ? 'bg-gradient-to-r from-cyan-500 to-cyan-400' :
                                      config.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                                        'bg-gradient-to-r from-slate-500 to-slate-400'
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className={cn("text-[9px] font-medium", isDarkMode ? "text-white/20" : "text-slate-400")}>
                          {source.totalTokens?.toLocaleString()} tokens · {source.calls} calls
                        </span>
                        <span className={cn("text-[9px] font-bold", isDarkMode ? "text-emerald-400/60" : "text-emerald-600")}>
                          ₹{costInr.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
