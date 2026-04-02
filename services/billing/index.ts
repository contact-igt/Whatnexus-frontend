import { _axios } from "@/helper/axios";

export interface BillingLedgerParams {
  page?: number;
  limit?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export class billingApiData {
  /**
   * Fetch high-level billing KPIs
   */
  getBillingKpi = async (startDate?: string, endDate?: string) => {
    return await _axios("get", "/whatsapp/billing/kpi", null, undefined, { startDate, endDate });
  };

  /**
   * Fetch paginated billing ledger entries
   */
  getBillingLedger = async (params?: BillingLedgerParams) => {
    return await _axios("get", "/whatsapp/billing/ledger", null, undefined, params);
  };

  /**
   * Fetch time-series spend data for charts
   */
  getBillingSpendChart = async (startDate?: string, endDate?: string) => {
    return await _axios("get", "/whatsapp/billing/spend-chart", null, undefined, { startDate, endDate });
  };

  /**
   * Fetch current wallet balance
   */
  getWalletBalance = async () => {
    return await _axios("get", "/whatsapp/billing/wallet");
  };

  /**
   * Fetch wallet transactions
   */
  getWalletTransactions = async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
    return await _axios("get", "/whatsapp/billing/wallet/transactions", null, undefined, params);
  };

  /**
   * Create Razorpay payment order
   */
  createPaymentOrder = async (amount: number) => {
    return await _axios("post", "/whatsapp/payment/order", { amount });
  };

  /**
   * Verify Razorpay payment
   */
  verifyPayment = async (paymentData: any) => {
    return await _axios("post", "/whatsapp/payment/verify", paymentData);
  };

  /**
   * Fetch payment history (recharge transactions only)
   */
  getPaymentHistory = async (params?: { page?: number; limit?: number }) => {
    return await _axios("get", "/whatsapp/payment/history", null, undefined, params);
  };

  /**
   * Fetch all pricing table entries (SuperAdmin)
   */
  getPricingTable = async () => {
    return await _axios("get", "/whatsapp/billing/pricing");
  };

  /**
   * Update a pricing table entry (SuperAdmin)
   */
  updatePricing = async (id: number, updateData: any) => {
    return await _axios("put", `/whatsapp/billing/pricing/${id}`, updateData);
  };

  /**
   * Fetch top templates by spend
   */
  getBillingTemplateStats = async (startDate?: string, endDate?: string) => {
    return await _axios("get", "/whatsapp/billing/template-stats", null, undefined, { startDate, endDate });
  };

  /**
   * Fetch top campaigns by spend
   */
  getBillingCampaignStats = async (startDate?: string, endDate?: string) => {
    return await _axios("get", "/whatsapp/billing/campaign-stats", null, undefined, { startDate, endDate });
  };

  /**
   * Fetch AI API token usage statistics
   */
  getAiTokenUsage = async (startDate?: string, endDate?: string) => {
    return await _axios("get", "/whatsapp/billing/ai-usage", null, undefined, { startDate, endDate });
  };

  /**
   * Fetch auto-recharge settings
   */
  getAutoRechargeSettings = async () => {
    return await _axios("get", "/whatsapp/billing/auto-recharge");
  };

  /**
   * Update auto-recharge settings
   */
  updateAutoRechargeSettings = async (settings: { enabled?: boolean; threshold?: number; amount?: number }) => {
    return await _axios("put", "/whatsapp/billing/auto-recharge", settings);
  };

  /**
   * Fetch available AI models for selection
   */
  getAvailableAiModels = async () => {
    return await _axios("get", "/whatsapp/billing/ai-models");
  };

  /**
   * Fetch wallet status (healthy/low/zero)
   */
  getWalletStatus = async () => {
    return await _axios("get", "/whatsapp/billing/wallet/status");
  };

  /**
   * Fetch billing mode + cycle + credit info
   */
  getBillingMode = async () => {
    return await _axios("get", "/whatsapp/billing/mode");
  };

  /**
   * Fetch invoices (with optional status filter)
   */
  getInvoices = async (params?: { status?: string; page?: number; limit?: number }) => {
    return await _axios("get", "/whatsapp/billing/invoices", null, undefined, params);
  };

  /**
   * Fetch single invoice detail
   */
  getInvoiceDetail = async (id: number) => {
    return await _axios("get", `/whatsapp/billing/invoices/${id}`);
  };

  /**
   * Pay a specific invoice via Razorpay
   */
  payInvoice = async (id: number, paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    return await _axios("post", `/whatsapp/billing/invoices/${id}/pay`, paymentData);
  };

  // ──────────────── Super Admin APIs ────────────────

  /**
   * Force-unlock a tenant's billing access (admin)
   */
  adminForceUnlock = async (data: { tenant_id: string; reason: string }) => {
    return await _axios("post", "/whatsapp/billing/admin/force-unlock", data);
  };

  /**
   * Manually credit a tenant's wallet (admin)
   */
  adminManualCredit = async (data: { tenant_id: string; amount: number; reason: string }) => {
    return await _axios("post", "/whatsapp/billing/admin/manual-credit", data);
  };

  /**
   * Close/cancel an invoice (admin)
   */
  adminInvoiceClose = async (data: { invoice_id: number; reason: string }) => {
    return await _axios("post", "/whatsapp/billing/admin/invoice-close", data);
  };

  /**
   * Change a tenant's billing mode (admin)
   */
  adminChangeBillingMode = async (data: { tenant_id: string; new_mode: 'prepaid' | 'postpaid'; reason: string }) => {
    return await _axios("post", "/whatsapp/billing/admin/change-mode", data);
  };

  /**
   * Fetch admin audit log (admin)
   */
  adminGetAuditLog = async (params?: { tenant_id?: string; page?: number; limit?: number }) => {
    return await _axios("get", "/whatsapp/billing/admin/audit-log", null, undefined, params);
  };

  /**
   * Fetch system billing health summary (admin)
   */
  adminGetHealthSummary = async () => {
    return await _axios("get", "/whatsapp/billing/admin/health");
  };

  /**
   * Fetch tenant list for admin dropdown (admin)
   */
  adminGetTenants = async (params?: { search?: string }) => {
    return await _axios("get", "/whatsapp/billing/admin/tenants", null, undefined, params);
  };

  /**
   * Fetch tenant billing overview (admin)
   */
  adminGetTenantOverview = async (tenant_id: string) => {
    return await _axios("get", "/whatsapp/billing/admin/tenant-overview", null, undefined, { tenant_id });
  };

  /**
   * Resolve a health event (admin)
   */
  adminResolveHealthEvent = async (id: number) => {
    return await _axios("post", `/whatsapp/billing/admin/health/${id}/resolve`);
  };

  /**
   * Fetch unresolved health events (admin)
   */
  adminGetUnresolvedEvents = async () => {
    return await _axios("get", "/whatsapp/billing/admin/health/unresolved");
  };
}
