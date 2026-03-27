"use client";

import { billingApiData } from "@/services/billing";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { BillingHeader } from "./billingHeader";
import { BillingKpiCards } from "./billingKpiCards";
import { BillingLedger } from "./billingLedger";
import { RechargeModal } from "./rechargeModal";
import { BillingWallet } from "./billingWallet";
import { BillingInsights } from "./billingInsights";
import { AiApiTokensUsage } from "./aiApiTokenUsage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { socket } from "@/utils/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { WhatsAppConnectionPlaceholder } from "../whatsappConfiguration/whatsappConnectionPlaceholder";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Wallet, Cpu, AlertTriangle, X } from "lucide-react";

const billingApis = new billingApiData();

export const BillingView = () => {
  const { whatsappApiDetails, user } = useAuth();
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [lowBalanceWarning, setLowBalanceWarning] = useState<{ balance: number; message: string } | null>(null);
  const [walletSuspension, setWalletSuspension] = useState<{ balance: number; status: string; message: string } | null>(null);
  const isSuperAdmin = user?.role === 'super_admin';
  const [viewMode, setViewMode] = useState<'tenant' | 'admin'>(isSuperAdmin ? 'admin' : 'tenant');

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

    if (socket.connected) {
      joinAndListen();
    }

    const handleUpdate = (data?: any) => {
      console.log("💳 Billing/Payment update received, refreshing data...");
      queryClient.invalidateQueries({ queryKey: ['billing-kpi'] });
      queryClient.invalidateQueries({ queryKey: ['billing-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['billing-spend-chart'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    };

    const handleLowBalance = (data: any) => {
      // Validate payload structure to prevent crashes
      if (typeof data?.balance !== 'number' || typeof data?.message !== 'string') {
        console.warn("[BILLING] Invalid low-balance payload:", data);
        return;
      }
      setLowBalanceWarning(data);
      toast.warning(data.message, { duration: 8000 });
    };

    const handleAutoRechargeTrigger = (data: any) => {
      // Validate payload structure
      if (typeof data?.amount !== 'number') {
        console.warn("[BILLING] Invalid auto-recharge payload:", data);
        return;
      }
      toast.info(`Auto-recharge: Initiating ₹${data.amount.toFixed(0)} recharge...`, { duration: 5000 });
      setIsRechargeModalOpen(true);
    };

    const handleWalletSuspended = (data: any) => {
      // Validate payload structure
      if (typeof data?.message !== 'string') {
        console.warn("[BILLING] Invalid wallet-suspended payload:", data);
        return;
      }
      console.log("🚫 Wallet suspended:", data);
      setWalletSuspension(data);
      setLowBalanceWarning(null); // Clear low balance warning when suspended
      toast.error("Account Suspended: " + data.message, { duration: 10000 });
    };

    const handleWalletRestored = (data: any) => {
      // Validate payload structure
      if (!data || typeof data !== 'object') {
        console.warn("[BILLING] Invalid wallet-restored payload:", data);
        return;
      }
      console.log("✅ Wallet restored:", data);
      setWalletSuspension(null);
      toast.success(data.message || "Services restored!", { duration: 5000 });
      // Refresh all billing data
      queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-status'] });
      queryClient.invalidateQueries({ queryKey: ['billing-kpi'] });
    };

    const handleWalletGrace = (data: any) => {
      // Validate payload structure
      if (typeof data?.balance !== 'number' || typeof data?.message !== 'string') {
        console.warn("[BILLING] Invalid wallet-grace payload:", data);
        return;
      }
      console.log("⚠️ Wallet in grace period:", data);
      setLowBalanceWarning({ balance: data.balance, message: data.message });
      toast.warning(data.message, { duration: 8000 });
    };

    socket.on("billing-update", handleUpdate);
    socket.on("payment-update", handleUpdate);
    socket.on("low-balance-warning", handleLowBalance);
    socket.on("auto-recharge-trigger", handleAutoRechargeTrigger);
    socket.on("wallet-suspended", handleWalletSuspended);
    socket.on("wallet-restored", handleWalletRestored);
    socket.on("wallet-grace", handleWalletGrace);

    return () => {
      socket.off("connect", joinAndListen);
      socket.off("billing-update", handleUpdate);
      socket.off("payment-update", handleUpdate);
      socket.off("low-balance-warning", handleLowBalance);
      socket.off("auto-recharge-trigger", handleAutoRechargeTrigger);
      socket.off("wallet-suspended", handleWalletSuspended);
      socket.off("wallet-restored", handleWalletRestored);
      socket.off("wallet-grace", handleWalletGrace);
    };
  }, [user?.tenant_id, queryClient]);

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleExport = async () => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ['billing-ledger', { limit: 1000, startDate: startDate?.toISOString(), endDate: endDate?.toISOString() }],
        queryFn: () => billingApis.getBillingLedger({ limit: 1000, startDate: startDate?.toISOString(), endDate: endDate?.toISOString() })
      });

      const data = response?.data?.records || [];
      if (data.length === 0) {
        toast.info("No data to export");
        return;
      }

      const headers = ["Date", "Category", "Recipient", "Template", "Campaign", "Region", "Charge (INR)", "Status"];
      const csvRows = data.map((row: any) => [
        new Date(row.date).toLocaleString(),
        row.category,
        row.recipient,
        row.template,
        row.campaign,
        row.country,
        row.total,
        row.status
      ]);

      const csvContent = [headers, ...csvRows].map(r => r.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `billing_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Billing report exported successfully");
    } catch (err) {
      toast.error("Failed to export billing report");
    }
  };

  const showPlaceholder = !isSuperAdmin && whatsappApiDetails?.status !== 'active';

  if (showPlaceholder) {
    return <WhatsAppConnectionPlaceholder />;
  }

  return (
    <div className="h-full overflow-y-auto p-8 space-y-10 animate-in fade-in duration-700 no-scrollbar pb-32 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Wallet Suspension Banner - Cannot be dismissed */}
      {walletSuspension && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative z-30 flex items-center gap-4 px-6 py-5 rounded-2xl border-2",
            isDarkMode
              ? "bg-red-900/30 border-red-500/50 text-red-300"
              : "bg-red-100 border-red-400 text-red-800"
          )}
        >
          <div className={cn(
            "p-3 rounded-xl",
            isDarkMode ? "bg-red-500/20" : "bg-red-200"
          )}>
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">Account Suspended</p>
            <p className="text-sm opacity-80 mt-1">{walletSuspension.message}</p>
            <p className="text-xs opacity-60 mt-2">
              Current balance: ₹{walletSuspension.balance?.toFixed(2) || '0.00'} |
              AI responses and outgoing messages are blocked until you recharge.
            </p>
          </div>
          <button
            onClick={() => setIsRechargeModalOpen(true)}
            className={cn(
              "px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg",
              "bg-red-500 text-white hover:bg-red-600 hover:scale-105"
            )}
          >
            Recharge Now
          </button>
        </motion.div>
      )}

      {/* Low Balance Warning Banner */}
      {lowBalanceWarning && !walletSuspension && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative z-20 flex items-center gap-3 px-5 py-4 rounded-2xl border",
            lowBalanceWarning.balance <= 0
              ? (isDarkMode ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700")
              : (isDarkMode ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-700")
          )}
        >
          <AlertTriangle size={18} className="shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{lowBalanceWarning.message}</p>
            <p className="text-xs opacity-70 mt-0.5">Current balance: ₹{lowBalanceWarning.balance.toFixed(2)}</p>
          </div>
          <button
            onClick={() => setIsRechargeModalOpen(true)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-bold transition-colors",
              lowBalanceWarning.balance <= 0
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-amber-500 text-white hover:bg-amber-600"
            )}
          >
            Recharge Now
          </button>
          {/* Only allow dismissing non-critical warnings (balance > 0) */}
          {lowBalanceWarning.balance > 0 && (
            <button
              onClick={() => setLowBalanceWarning(null)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </motion.div>
      )}

      {viewMode === 'tenant' ? (
        <Tabs defaultValue="usage" className="space-y-8 relative z-10">
          <TabsList isDarkMode={isDarkMode}>
            <TabsTrigger value="usage"><div className="flex items-center gap-2"><CreditCard size={12} />Meta Usage</div></TabsTrigger>
            <TabsTrigger value="ai"><div className="flex items-center gap-2"><Cpu size={12} />AI API Tokens</div></TabsTrigger>
            <TabsTrigger value="wallet"><div className="flex items-center gap-2"><Wallet size={12} />Wallet & Payments</div></TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent key="usage" value="usage" className="space-y-12 outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-12"
              >
                <BillingHeader
                  isDarkMode={isDarkMode}
                  startDate={startDate}
                  endDate={endDate}
                  onDateChange={handleDateChange}
                  onExport={handleExport}
                  onRecharge={() => setIsRechargeModalOpen(true)}
                  isSuperAdmin={isSuperAdmin}
                  viewMode={viewMode}
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

                <BillingInsights
                  isDarkMode={isDarkMode}
                  startDate={startDate}
                  endDate={endDate}
                />
              </motion.div>
            </TabsContent>

            <TabsContent key="wallet" value="wallet" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <BillingWallet
                  isDarkMode={isDarkMode}
                  onRecharge={() => setIsRechargeModalOpen(true)}
                  startDate={startDate}
                  endDate={endDate}
                />
              </motion.div>
            </TabsContent>

            <TabsContent key="ai" value="ai" className="outline-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <AiApiTokensUsage isDarkMode={isDarkMode} startDate={startDate} endDate={endDate} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      ) : (
        <div className={cn("flex flex-col items-center justify-center py-20 gap-4", isDarkMode ? "text-white/40" : "text-slate-400")}>
          <p className="text-sm">Use the dedicated <a href="/pricing" className="text-emerald-500 underline font-semibold">Pricing & Rates</a> page to manage pricing rules.</p>
        </div>
      )}

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
