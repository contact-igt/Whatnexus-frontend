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
  TrendingUp,
  Zap,
} from "lucide-react";

interface AiApiTokensUsageProps {
  isDarkMode: boolean;
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

export const AiApiTokensUsage = ({ isDarkMode }: AiApiTokensUsageProps) => {
  // Mock data — replace with real API data later
  const inputTokens = 12480;
  const outputTokens = 8320;
  const totalTokens = inputTokens + outputTokens;
  const amountSpent = 14.56; // in rupees

  const animatedInput = useAnimatedValue(inputTokens);
  const animatedOutput = useAnimatedValue(outputTokens);
  const animatedTotal = useAnimatedValue(totalTokens);
  const animatedAmount = useAnimatedValue(amountSpent * 100) / 100;

  const inputPercent = Math.round((inputTokens / totalTokens) * 100);
  const outputPercent = 100 - inputPercent;

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
      <GlassCard isDarkMode={isDarkMode} delay={500} className="p-0 overflow-hidden">
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
                {[
                  {
                    date: "Mar 20, 2026, 14:32:01",
                    input: 412,
                    output: 298,
                    total: 710,
                    cost: 0.42,
                    color: "violet",
                  },
                  {
                    date: "Mar 20, 2026, 14:30:15",
                    input: 1024,
                    output: 800,
                    total: 1824,
                    cost: 1.09,
                    color: "cyan",
                  },
                  {
                    date: "Mar 20, 2026, 14:28:44",
                    input: 56,
                    output: 12,
                    total: 68,
                    cost: 0.04,
                    color: "blue",
                  },
                  {
                    date: "Mar 20, 2026, 14:15:22",
                    input: 890,
                    output: 450,
                    total: 1340,
                    cost: 0.80,
                    color: "emerald",
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
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
                            row.color === "violet"
                              ? "bg-violet-500"
                              : row.color === "cyan"
                                ? "bg-cyan-500"
                                : row.color === "blue"
                                  ? "bg-blue-500"
                                  : "bg-emerald-500"
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-bold",
                            isDarkMode ? "text-white/80" : "text-slate-700"
                          )}
                        >
                          {row.date}
                        </span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "py-3.5 px-4 text-xs font-semibold tabular-nums",
                        isDarkMode ? "text-cyan-400/70" : "text-cyan-700"
                      )}
                    >
                      {row.input.toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        "py-3.5 px-4 text-xs font-semibold tabular-nums",
                        isDarkMode ? "text-violet-400/70" : "text-violet-700"
                      )}
                    >
                      {row.output.toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        "py-3.5 px-4 text-xs font-bold tabular-nums",
                        isDarkMode ? "text-white/60" : "text-slate-600"
                      )}
                    >
                      {row.total.toLocaleString()}
                    </td>
                    <td
                      className={cn(
                        "py-3.5 px-4 text-xs font-bold tabular-nums",
                        isDarkMode ? "text-emerald-400/70" : "text-emerald-700"
                      )}
                    >
                      ₹{row.cost.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
