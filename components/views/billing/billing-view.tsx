"use client";

import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { BillingHeader } from "./billing-header";
import { BillingKpiCards } from "./billing-kpi-cards";
import { BillingLedger } from "./billing-ledger";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { socket } from "@/utils/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { WhatsAppConnectionPlaceholder } from "../whatsappConfiguration/whatsappConnectionPlaceholder";

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

  return (
    <div className="h-full overflow-y-auto p-8 space-y-10 animate-in fade-in zoom-in-95 duration-500 no-scrollbar pb-32">
      <BillingHeader
        isDarkMode={isDarkMode}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onExport={handleExport}
      />

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
    </div>
  );
};
