"use client";

import { billingApiData } from "@/services/billing";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { BillingHeader } from "./billingHeader";
import { BillingDashboard } from "./billingDashboard";
import { RechargeModal } from "./rechargeModal";
import { BillingWallet } from "./billingWallet";
import { BillingInvoices } from "./billingInvoices";
import { BillingUsageLimits } from "./billingUsageLimits";
import { BillingUsageAnalytics } from "./billingUsageAnalytics";
import { BillingPaymentHistory } from "./billingPaymentHistory";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/redux/selectors/auth/authSelector";
import { useGetBillingModeQuery, useGetWalletBalanceQuery } from "@/hooks/useBillingQuery";
import { socket } from "@/utils/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { WhatsAppConnectionPlaceholder } from "../whatsappConfiguration/whatsappConnectionPlaceholder";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Wallet, FileText, BarChart3,
  CreditCard, Gauge, AlertTriangle, X, Shield
} from "lucide-react";

const billingApis = new billingApiData();

export const BillingView = () => {
  const { whatsappApiDetails, user } = useAuth();
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [lowBalanceWarning, setLowBalanceWarning] = useState<{ balance: number; message: string } | null>(null);
  const [overdueInvoice, setOverdueInvoice] = useState<{ invoice_number: string; amount: number; days_overdue?: number } | null>(null);
  const [creditLimitWarning, setCreditLimitWarning] = useState<{ usage: number; limit: number; percent: number } | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'platform_admin';
  const { data: billingModeRes } = useGetBillingModeQuery();
  const billingMode = billingModeRes?.data?.billing_mode || 'prepaid';
  const isPostpaid = billingMode === 'postpaid';
  const { data: walletBalanceRes } = useGetWalletBalanceQuery();

  // On page load: show banner immediately if wallet is already zero or low
  useEffect(() => {
    if (isPostpaid) {
      setLowBalanceWarning(null);
      return;
    }
    const balance = walletBalanceRes?.data?.balance;
    if (typeof balance !== 'number') return;
    if (balance <= 0) {
      setLowBalanceWarning({ balance: 0, message: "Wallet balance is ₹0 — all prepaid operations are blocked. Recharge now to restore services." });
    } else if (balance < 10) {
      setLowBalanceWarning({ balance, message: `Low wallet balance (₹${balance.toFixed(2)}) — recharge soon to avoid service interruption.` });
    } else {
      setLowBalanceWarning(null);
    }
  }, [walletBalanceRes?.data?.balance, isPostpaid]);

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

    // Debounced billing update — prevents 900 API calls/min during high msg throughput
    let updateTimer: ReturnType<typeof setTimeout> | null = null;
    const handleUpdate = () => {
      if (updateTimer) return; // Already scheduled
      updateTimer = setTimeout(() => {
        updateTimer = null;
        queryClient.refetchQueries({ queryKey: ['billing-kpi'] });
        queryClient.refetchQueries({ queryKey: ['billing-ledger'] });
        queryClient.refetchQueries({ queryKey: ['billing-spend-chart'] });
        queryClient.refetchQueries({ queryKey: ['gst-breakdown'] });
        queryClient.refetchQueries({ queryKey: ['wallet-balance'] });
        queryClient.refetchQueries({ queryKey: ['wallet-transactions'] });
        queryClient.refetchQueries({ queryKey: ['ai-token-usage'] });
        queryClient.refetchQueries({ queryKey: ['billing-template-stats'] });
        queryClient.refetchQueries({ queryKey: ['billing-campaign-stats'] });
        queryClient.refetchQueries({ queryKey: ['billing-mode'] });
      }, 3000);
    };

    const handleLowBalance = (data: any) => {
      if (typeof data?.balance !== 'number' || typeof data?.message !== 'string') {
        console.warn("[BILLING] Invalid low-balance payload:", data);
        return;
      }
      setLowBalanceWarning(data);
      toast.warning(data.message, { duration: 8000 });
    };

    const handleZeroBalance = (data: any) => {
      console.log("🛑 Wallet zero:", data);
      setLowBalanceWarning({ balance: 0, message: "Wallet balance is ₹0 — all prepaid operations are blocked. Recharge now to restore services." });
      toast.error("Wallet balance is ₹0 — services blocked", { duration: 10000 });
    };

    const handleAutoRechargeTrigger = (data: any) => {
      if (typeof data?.amount !== 'number') {
        console.warn("[BILLING] Invalid auto-recharge payload:", data);
        return;
      }
      toast.info(`Auto-recharge: Initiating ₹${data.amount.toFixed(0)} recharge...`, { duration: 5000 });
      setIsRechargeModalOpen(true);
    };

    const handleWalletRestored = (data: any) => {
      if (!data || typeof data !== 'object') return;
      console.log("✅ Wallet restored:", data);
      setLowBalanceWarning(null);
      toast.success("Wallet recharged — services restored!", { duration: 5000 });
      queryClient.refetchQueries({ queryKey: ['wallet-balance'] });
      queryClient.refetchQueries({ queryKey: ['wallet-status'] });
      queryClient.refetchQueries({ queryKey: ['billing-kpi'] });
      queryClient.refetchQueries({ queryKey: ['gst-breakdown'] });
    };

    const handleInvoiceGenerated = (data: any) => {
      console.log("📄 Invoice generated:", data);
      toast.info(`Invoice ${data?.invoice_number || ''} generated — ₹${parseFloat(data?.amount || 0).toFixed(2)}`, { duration: 8000 });
      queryClient.refetchQueries({ queryKey: ['invoices'] });
      queryClient.refetchQueries({ queryKey: ['billing-mode'] });
    };

    const handleInvoiceOverdue = (data: any) => {
      console.log("⚠️ Invoice overdue:", data);
      setOverdueInvoice(data);
      toast.error(`Invoice ${data?.invoice_number || ''} is overdue — services may be blocked`, { duration: 10000 });
      queryClient.refetchQueries({ queryKey: ['invoices'] });
    };

    const handleInvoicePaid = (data: any) => {
      console.log("✅ Invoice paid:", data);
      setOverdueInvoice(null);
      toast.success(`Invoice ${data?.invoice_number || ''} paid successfully!`, { duration: 5000 });
      queryClient.refetchQueries({ queryKey: ['invoices'] });
      queryClient.refetchQueries({ queryKey: ['billing-mode'] });
    };

    const handleCreditLimitWarning = (data: any) => {
      console.log("⚠️ Credit limit warning:", data);
      setCreditLimitWarning(data);
      toast.warning(`Credit usage at ${data?.percent || 80}% — approaching limit`, { duration: 8000 });
    };

    const handleCreditLimitReached = (data: any) => {
      console.log("🛑 Credit limit reached:", data);
      setCreditLimitWarning({ usage: data?.usage || 0, limit: data?.limit || 0, percent: 100 });
      toast.error("Credit limit reached — new messages & AI calls blocked", { duration: 10000 });
    };

    const handleUsageLimitWarning = (data: any) => {
      toast.warning(`Usage at ${data?.usage_type || 'unknown'}: approaching daily/monthly limit`, { duration: 6000 });
    };

    const handleUsageLimitReached = (data: any) => {
      toast.error(`Usage limit reached: ${data?.reason || 'daily/monthly cap hit'}`, { duration: 10000 });
    };

    const handleAccessRestored = () => {
      setOverdueInvoice(null);
      setCreditLimitWarning(null);
      toast.success("Account access restored!", { duration: 5000 });
      queryClient.refetchQueries({ queryKey: ['invoices'] });
      queryClient.refetchQueries({ queryKey: ['billing-mode'] });
    };

    const handleBillingModeChanged = (data: any) => {
      console.log("🔄 Billing mode changed:", data);
      toast.info(`Billing mode changed to ${data?.new_mode || 'unknown'}`, { duration: 8000 });
      queryClient.refetchQueries({ queryKey: ['billing-mode'] });
      queryClient.refetchQueries({ queryKey: ['invoices'] });
      queryClient.refetchQueries({ queryKey: ['wallet-balance'] });
      queryClient.refetchQueries({ queryKey: ['wallet-status'] });
      queryClient.refetchQueries({ queryKey: ['billing-kpi'] });
      queryClient.refetchQueries({ queryKey: ['gst-breakdown'] });
    };

    const handleGstRateChanged = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['gst-breakdown'] });
      queryClient.refetchQueries({ queryKey: ['gst-breakdown'] });
      if (data?.action === 'activated' && typeof data?.new_rate === 'number') {
        toast.info(`GST rate updated to ${data.new_rate}%`, { duration: 4000 });
        return;
      }

      if (data?.action === 'deactivated') {
        toast.info('GST rate deactivated. Default rate is now applied.', { duration: 4000 });
        return;
      }

      if (data?.action === 'deleted') {
        toast.info('GST settings updated', { duration: 4000 });
        return;
      }

      toast.info('GST rate updated', { duration: 4000 });
    };

    const handleInsufficientBalance = (data: any) => {
      setLowBalanceWarning({ balance: data?.balance || 0, message: `Insufficient balance — ₹${(data?.required || 0).toFixed(2)} needed, ₹${(data?.balance || 0).toFixed(2)} available. Recharge now.` });
      toast.error(`Insufficient balance for billing. Please recharge.`, { duration: 8000 });
      queryClient.refetchQueries({ queryKey: ['wallet-balance'] });
      queryClient.refetchQueries({ queryKey: ['billing-kpi'] });
    };

    socket.on("billing-update", handleUpdate);
    socket.on("payment-update", handleUpdate);
    socket.on("low-balance-warning", handleLowBalance);
    socket.on("zero-balance", handleZeroBalance);
    socket.on("auto-recharge-trigger", handleAutoRechargeTrigger);
    socket.on("wallet-restored", handleWalletRestored);
    socket.on("insufficient-balance", handleInsufficientBalance);
    socket.on("invoice-generated", handleInvoiceGenerated);
    socket.on("invoice-overdue", handleInvoiceOverdue);
    socket.on("invoice-paid", handleInvoicePaid);
    socket.on("credit-limit-warning", handleCreditLimitWarning);
    socket.on("credit-limit-reached", handleCreditLimitReached);
    socket.on("usage-limit-warning", handleUsageLimitWarning);
    socket.on("usage-limit-reached", handleUsageLimitReached);
    socket.on("access-restored", handleAccessRestored);
    socket.on("billing-mode-changed", handleBillingModeChanged);
    socket.on("gst-rate-changed", handleGstRateChanged);

    return () => {
      if (updateTimer) clearTimeout(updateTimer);
      socket.off("connect", joinAndListen);
      socket.off("billing-update", handleUpdate);
      socket.off("payment-update", handleUpdate);
      socket.off("low-balance-warning", handleLowBalance);
      socket.off("zero-balance", handleZeroBalance);
      socket.off("auto-recharge-trigger", handleAutoRechargeTrigger);
      socket.off("wallet-restored", handleWalletRestored);
      socket.off("insufficient-balance", handleInsufficientBalance);
      socket.off("invoice-generated", handleInvoiceGenerated);
      socket.off("invoice-overdue", handleInvoiceOverdue);
      socket.off("invoice-paid", handleInvoicePaid);
      socket.off("credit-limit-warning", handleCreditLimitWarning);
      socket.off("credit-limit-reached", handleCreditLimitReached);
      socket.off("usage-limit-warning", handleUsageLimitWarning);
      socket.off("usage-limit-reached", handleUsageLimitReached);
      socket.off("access-restored", handleAccessRestored);
      socket.off("billing-mode-changed", handleBillingModeChanged);
      socket.off("gst-rate-changed", handleGstRateChanged);
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
      URL.revokeObjectURL(url);

      toast.success("Billing report exported successfully");
    } catch (err) {
      toast.error("Failed to export billing report");
    }
  };

  const showPlaceholder = !isSuperAdmin && whatsappApiDetails?.status !== 'active';

  if (showPlaceholder) {
    return <WhatsAppConnectionPlaceholder />;
  }

  // Handle navigation from Dashboard quick links
  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="h-full overflow-y-auto p-8 space-y-10 animate-in fade-in duration-700 no-scrollbar pb-32 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Overdue Invoice Banner (Postpaid) */}
      {overdueInvoice && (
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
            <p className="text-lg font-bold">Overdue Invoice</p>
            <p className="text-sm opacity-80 mt-1">
              Invoice {overdueInvoice.invoice_number} is overdue — ₹{parseFloat(String(overdueInvoice.amount || 0)).toFixed(2)}
            </p>
            <p className="text-xs opacity-60 mt-1">
              New messages and AI calls are blocked until this invoice is paid.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className={cn(
              "px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg",
              "bg-red-500 text-white hover:bg-red-600 hover:scale-105"
            )}
          >
            Pay Invoice
          </button>
        </motion.div>
      )}

      {/* Credit Limit Warning Banner (Postpaid) */}
      {creditLimitWarning && creditLimitWarning.percent >= 100 && !overdueInvoice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "relative z-20 flex items-center gap-3 px-5 py-4 rounded-2xl border",
            isDarkMode ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-red-50 border-red-200 text-red-700"
          )}
        >
          <AlertTriangle size={18} className="shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">Credit limit reached — new operations blocked</p>
            <p className="text-xs opacity-70 mt-0.5">
              Usage: ₹{creditLimitWarning.usage?.toFixed(2)} / ₹{creditLimitWarning.limit?.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setCreditLimitWarning(null)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* Low Balance Warning Banner (Prepaid) */}
      {lowBalanceWarning && !overdueInvoice && (
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

      {/* Header with date picker, export, recharge, and admin link */}
      <BillingHeader
        isDarkMode={isDarkMode}
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onExport={handleExport}
        onRecharge={() => setIsRechargeModalOpen(true)}
        isSuperAdmin={isSuperAdmin}
        viewMode="tenant"
      />

      {/* Super Admin Link */}
      {isSuperAdmin && (
        <a
          href="/admin-billing"
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
            isDarkMode
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
          )}
        >
          <Shield size={14} />
          Admin Billing Panel
        </a>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-8 relative z-10">
        <TabsList isDarkMode={isDarkMode}>
          <TabsTrigger value="dashboard"><div className="flex items-center gap-2"><LayoutDashboard size={12} />Dashboard</div></TabsTrigger>
          <TabsTrigger value="usage"><div className="flex items-center gap-2"><BarChart3 size={12} />Usage Analytics</div></TabsTrigger>
          <TabsTrigger value="wallet"><div className="flex items-center gap-2"><Wallet size={12} />Wallet</div></TabsTrigger>
          <TabsTrigger value="invoices"><div className="flex items-center gap-2"><FileText size={12} />Invoices</div></TabsTrigger>
          <TabsTrigger value="payments"><div className="flex items-center gap-2"><CreditCard size={12} />Payment History</div></TabsTrigger>
          <TabsTrigger value="limits"><div className="flex items-center gap-2"><Gauge size={12} />Usage Limits</div></TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Dashboard */}
          <TabsContent key="dashboard" value="dashboard" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <BillingDashboard
                isDarkMode={isDarkMode}
                startDate={startDate}
                endDate={endDate}
                onNavigate={handleNavigate}
              />
            </motion.div>
          </TabsContent>

          {/* Usage Analytics */}
          <TabsContent key="usage" value="usage" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <BillingUsageAnalytics
                isDarkMode={isDarkMode}
                startDate={startDate}
                endDate={endDate}
              />
            </motion.div>
          </TabsContent>

          {/* Invoices (always visible — tenants may have old postpaid invoices) */}
          <TabsContent key="invoices" value="invoices" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <BillingInvoices isDarkMode={isDarkMode} />
            </motion.div>
          </TabsContent>

          {/* Wallet */}
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
                billingMode={billingMode as 'prepaid' | 'postpaid'}
              />
            </motion.div>
          </TabsContent>

          {/* Payment History */}
          <TabsContent key="payments" value="payments" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <BillingPaymentHistory isDarkMode={isDarkMode} />
            </motion.div>
          </TabsContent>

          {/* Usage Limits */}
          <TabsContent key="limits" value="limits" className="outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-12"
            >
              <BillingUsageLimits isDarkMode={isDarkMode} />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      <RechargeModal
        isOpen={isRechargeModalOpen}
        onClose={() => setIsRechargeModalOpen(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
