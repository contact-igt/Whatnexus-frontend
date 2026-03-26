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
}
