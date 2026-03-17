import { _axios } from "@/helper/axios";

export interface BillingLedgerParams {
  page?: number;
  limit?: number;
  category?: string;
}

export class billingApiData {
  /**
   * Fetch high-level billing KPIs
   */
  getBillingKpi = async () => {
    return await _axios("get", "/whatsapp/billing/kpi");
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
  getBillingSpendChart = async () => {
    return await _axios("get", "/whatsapp/billing/spend-chart");
  };
}
