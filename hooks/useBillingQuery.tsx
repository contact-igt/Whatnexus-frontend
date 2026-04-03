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
            queryClient.invalidateQueries({ queryKey: ['wallet-status'] });
            queryClient.invalidateQueries({ queryKey: ['billing-kpi'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['payment-history'] });
        }
    });
};

export const useGetPaymentHistoryQuery = (params?: { page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['payment-history', params],
        queryFn: () => billingApis.getPaymentHistory(params)
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

export const useGetWalletStatusQuery = () => {
    return useQuery({
        queryKey: ['wallet-status'],
        queryFn: () => billingApis.getWalletStatus(),
        refetchInterval: 60000, // Refetch every minute to stay updated
    });
};

export const useGetBillingModeQuery = () => {
    return useQuery({
        queryKey: ['billing-mode'],
        queryFn: () => billingApis.getBillingMode(),
        staleTime: 5 * 60 * 1000,
    });
};

export const useGetInvoicesQuery = (params?: { status?: string; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['invoices', params],
        queryFn: () => billingApis.getInvoices(params),
        placeholderData: (previousData: unknown) => previousData,
    });
};

export const useGetInvoiceDetailQuery = (id: number) => {
    return useQuery({
        queryKey: ['invoice-detail', id],
        queryFn: () => billingApis.getInvoiceDetail(id),
        enabled: !!id,
    });
};

export const usePayInvoiceMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, paymentData }: { id: number; paymentData: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string } }) =>
            billingApis.payInvoice(id, paymentData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['billing-mode'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-balance'] });
            queryClient.invalidateQueries({ queryKey: ['wallet-status'] });
        },
    });
};

// ──────────────── Super Admin Hooks ────────────────

export const useAdminForceUnlockMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { tenant_id: string; reason: string }) =>
            billingApis.adminForceUnlock(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
        },
    });
};

export const useAdminManualCreditMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { tenant_id: string; amount: number; reason: string }) =>
            billingApis.adminManualCredit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
        },
    });
};

export const useAdminInvoiceCloseMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { invoice_id: number; reason: string }) =>
            billingApis.adminInvoiceClose(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
        },
    });
};

export const useAdminChangeBillingModeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { tenant_id: string; new_mode: 'prepaid' | 'postpaid'; reason: string }) =>
            billingApis.adminChangeBillingMode(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing-mode'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
            queryClient.invalidateQueries({ queryKey: ['admin-tenant-overview'] });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
};

export const useAdminUpdateUsageLimitsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { tenant_id: string; max_daily_messages?: number; max_monthly_messages?: number; max_daily_ai_calls?: number; max_monthly_ai_calls?: number; reason?: string }) =>
            billingApis.adminUpdateUsageLimits(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing-mode'] });
            queryClient.invalidateQueries({ queryKey: ['admin-audit-log'] });
            queryClient.invalidateQueries({ queryKey: ['admin-tenant-overview'] });
        },
    });
};

export const useAdminGetAuditLogQuery = (params?: { tenant_id?: string; page?: number; limit?: number }) => {
    return useQuery({
        queryKey: ['admin-audit-log', params],
        queryFn: () => billingApis.adminGetAuditLog(params),
        placeholderData: (previousData: unknown) => previousData,
    });
};

export const useAdminGetHealthSummaryQuery = () => {
    return useQuery({
        queryKey: ['admin-health-summary'],
        queryFn: () => billingApis.adminGetHealthSummary(),
        refetchInterval: 60000,
    });
};

export const useAdminGetTenantsQuery = (search?: string, enabled = true) => {
    return useQuery({
        queryKey: ['admin-tenants', search],
        queryFn: () => billingApis.adminGetTenants({ search }),
        enabled,
    });
};

export const useAdminGetTenantOverviewQuery = (tenant_id?: string) => {
    return useQuery({
        queryKey: ['admin-tenant-overview', tenant_id],
        queryFn: () => billingApis.adminGetTenantOverview(tenant_id!),
        enabled: !!tenant_id,
    });
};

export const useAdminResolveHealthEventMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => billingApis.adminResolveHealthEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-health-summary'] });
            queryClient.invalidateQueries({ queryKey: ['admin-unresolved-events'] });
        },
    });
};

export const useAdminGetUnresolvedEventsQuery = () => {
    return useQuery({
        queryKey: ['admin-unresolved-events'],
        queryFn: () => billingApis.adminGetUnresolvedEvents(),
        refetchInterval: 60000,
    });
};
