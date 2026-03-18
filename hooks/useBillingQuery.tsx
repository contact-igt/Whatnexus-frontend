import { billingApiData, BillingLedgerParams } from "@/services/billing";
import { useQuery } from "@tanstack/react-query";

const billingApis = new billingApiData();

export const useGetBillingKpiQuery = () => {
    return useQuery({
        queryKey: ['billing-kpi'],
        queryFn: () => billingApis.getBillingKpi()
    });
};

export const useGetBillingLedgerQuery = (params?: BillingLedgerParams) => {
    return useQuery({
        queryKey: ['billing-ledger', params],
        queryFn: () => billingApis.getBillingLedger(params),
        placeholderData: (previousData) => previousData // Keeps old data on screen while paginating
    });
};

export const useGetBillingSpendChartQuery = () => {
    return useQuery({
        queryKey: ['billing-spend-chart'],
        queryFn: () => billingApis.getBillingSpendChart()
    });
};
