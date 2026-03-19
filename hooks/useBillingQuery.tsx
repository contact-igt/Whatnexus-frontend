import { billingApiData, BillingLedgerParams } from "@/services/billing";
import { useQuery } from "@tanstack/react-query";

const billingApis = new billingApiData();

export const useGetBillingKpiQuery = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['billing-kpi', startDate, endDate],
        queryFn: () => billingApis.getBillingKpi(startDate, endDate)
    });
};

export const useGetBillingLedgerQuery = (params?: BillingLedgerParams & { startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ['billing-ledger', params],
        queryFn: () => billingApis.getBillingLedger(params),
        placeholderData: (previousData) => previousData // Keeps old data on screen while paginating
    });
};

export const useGetBillingSpendChartQuery = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['billing-spend-chart', startDate, endDate],
        queryFn: () => billingApis.getBillingSpendChart(startDate, endDate)
    });
};
