import { billingApiData, BillingLedgerParams } from "@/services/billing";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

export const useGetWalletBalanceQuery = () => {
    return useQuery({
        queryKey: ['wallet-balance'],
        queryFn: () => billingApis.getWalletBalance()
    });
};

export const useGetWalletTransactionsQuery = (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
    return useQuery({
        queryKey: ['wallet-transactions', params],
        queryFn: () => billingApis.getWalletTransactions(params)
    });
};

export const useCreatePaymentOrderMutation = () => {
    return useMutation({
        mutationFn: (amount: number) => billingApis.createPaymentOrder(amount)
    });
};

export const useVerifyPaymentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (paymentData: any) => billingApis.verifyPayment(paymentData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
            queryClient.invalidateQueries({ queryKey: ['billing-kpi'] });
        }
    });
};

export const useGetPricingTableQuery = () => {
    return useQuery({
        queryKey: ['pricing-table'],
        queryFn: () => billingApis.getPricingTable()
    });
};

export const useUpdatePricingMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, updateData }: { id: number; updateData: any }) => billingApis.updatePricing(id, updateData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pricing-table'] });
        }
    });
};

export const useGetBillingTemplateStatsQuery = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['billing-template-stats', startDate, endDate],
        queryFn: () => billingApis.getBillingTemplateStats(startDate, endDate)
    });
};

export const useGetBillingCampaignStatsQuery = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['billing-campaign-stats', startDate, endDate],
        queryFn: () => billingApis.getBillingCampaignStats(startDate, endDate)
    });
};

export const useGetAiTokenUsageQuery = (startDate?: string, endDate?: string) => {
    return useQuery({
        queryKey: ['ai-token-usage', startDate, endDate],
        queryFn: () => billingApis.getAiTokenUsage(startDate, endDate)
    });
};

export const useGetAutoRechargeSettingsQuery = () => {
    return useQuery({
        queryKey: ['auto-recharge-settings'],
        queryFn: () => billingApis.getAutoRechargeSettings()
    });
};

export const useUpdateAutoRechargeSettingsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (settings: { enabled?: boolean; threshold?: number; amount?: number }) =>
            billingApis.updateAutoRechargeSettings(settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auto-recharge-settings'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
        }
    });
};

export const useGetAvailableAiModelsQuery = () => {
    return useQuery({
        queryKey: ['available-ai-models'],
        queryFn: () => billingApis.getAvailableAiModels(),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
};
