"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { BillingHeader } from "./billingHeader";
import { BillingKpiCards } from "./billingKpiCards";
import { BillingLedger } from "./billingLedger";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { socket } from "@/utils/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { WhatsAppConnectionPlaceholder } from "../whatsappConfiguration/whatsappConnectionPlaceholder";
import { cn } from "@/lib/utils";
import { CreditCard, Cpu } from "lucide-react";
import { AiApiTokensUsage } from "./aiApiTokenUsage";

type BillingTab = "meta" | "ai";

export const BillingView = () => {
  const { whatsappApiDetails } = useAuth();
  if (whatsappApiDetails?.status !== 'active') {
      return <WhatsAppConnectionPlaceholder />;
  }
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState<BillingTab>("meta");

  useEffect(() => {
    if (!user?.tenant_id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const joinAndListen = () => {
      console.log("✅ Billing connected to socket:", socket.id);
      socket.emit("join-tenant", user.tenant_id);
    };

    socket.on("connect", joinAndListen);
    
    // If already connected, join immediately
    if (socket.connected) {
      joinAndListen();
    }

    const handleUpdate = () => {
      console.log("💳 Billing/Payment update received, refreshing data...");
      queryClient.invalidateQueries({ queryKey: ['billing-kpi'] });
      queryClient.invalidateQueries({ queryKey: ['billing-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['billing-spend-chart'] });
    };

    socket.on("billing-update", handleUpdate);
    socket.on("payment-update", handleUpdate);

    return () => {
      socket.off("connect", joinAndListen);
      socket.off("billing-update", handleUpdate);
      socket.off("payment-update", handleUpdate);
    };
  }, [user?.tenant_id, queryClient]);

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleExport = () => {
    console.warn("Export will use live ledger data once the API is wired.");
  };

  const tabs = [
    {
      key: "meta" as BillingTab,
      label: "Meta Billing",
      icon: CreditCard,
      description: "WhatsApp Business API costs",
    },
    {
      key: "ai" as BillingTab,
      label: "AI API Tokens",
      icon: Cpu,
      description: "AI model token usage",
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-8 space-y-10 animate-in fade-in zoom-in-95 duration-500 no-scrollbar pb-32">
      <BillingHeader
        isDarkMode={isDarkMode}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onExport={handleExport}
      />

      {/* Tab Navigation */}
      <div className="relative">
        <div className={cn(
          "inline-flex items-center gap-1 p-1 rounded-2xl border backdrop-blur-xl",
          isDarkMode
            ? "bg-[#151518]/80 border-white/5"
            : "bg-white/80 border-slate-200"
        )}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 group",
                  isActive
                    ? isDarkMode
                      ? "bg-white/[0.08] text-white shadow-lg shadow-black/20 border border-white/10"
                      : "bg-white text-slate-900 shadow-lg shadow-slate-200/50 border border-slate-200"
                    : isDarkMode
                      ? "text-white/40 hover:text-white/70 hover:bg-white/[0.03] border border-transparent"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent"
                )}
              >
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 rounded-xl opacity-50",
                    tab.key === "meta"
                      ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10"
                      : "bg-gradient-to-r from-violet-500/10 to-blue-500/10"
                  )} />
                )}
                <tab.icon
                  size={14}
                  className={cn(
                    "relative z-10 transition-all duration-300",
                    isActive
                      ? tab.key === "meta"
                        ? isDarkMode ? "text-emerald-400" : "text-emerald-600"
                        : isDarkMode ? "text-violet-400" : "text-violet-600"
                      : "group-hover:scale-110"
                  )}
                />
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <div className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full",
                    tab.key === "meta"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                      : "bg-gradient-to-r from-violet-500 to-blue-500"
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "meta" ? (
        <>
          <BillingKpiCards 
            isDarkMode={isDarkMode} 
            startDate={startDate} 
            endDate={endDate} 
          />
          <BillingLedger 
            isDarkMode={isDarkMode} 
            startDate={startDate} 
            endDate={endDate} 
          />
        </>
      ) : (
        <AiApiTokensUsage isDarkMode={isDarkMode} />
      )}
    </div>
  );
};
