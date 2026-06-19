import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "@/services/campaign/campaign.service";
import type {
    CampaignDetails,
    CampaignDetailsResponse,
    CampaignStatsResponse,
    Recipient,
    RecipientStatus,
} from "@/services/campaign/campaign.types";
import { isCampaignActive } from "@/utils/campaign.utils";

interface UseCampaignDetailsReturn {
    campaign: CampaignDetails | null;
    recipients: Recipient[];
    loading: boolean;
    isRefreshing: boolean;
    error: string | null;
    stats: CampaignStatsResponse["data"] | null;
    statsError: string | null;
    lastUpdatedAt: string | null;
    refetch: (options?: { manual?: boolean }) => Promise<void>;
    setCampaign: (campaign: CampaignDetails | null) => void;
    filters: {
        recipientStatus: RecipientStatus | undefined;
        setRecipientStatus: (status: RecipientStatus | undefined) => void;
    };
}

export const useCampaignDetails = (
    campaignId: string,
    autoRefresh: boolean = true,
    refreshInterval: number = 5000
): UseCampaignDetailsReturn => {
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

    const [recipientStatusFilter, setRecipientStatusFilterState] = useState<
        RecipientStatus | undefined
    >(() => {
        if (typeof window === "undefined") return undefined;
        const storageKey = `campaign_recipient_filter_${campaignId}`;
        const stored = localStorage.getItem(storageKey);
        return stored ? (stored as RecipientStatus) : undefined;
    });

    const detailsQueryKey = [
        "campaignDetails",
        campaignId,
        recipientStatusFilter,
    ] as const;
    const statsQueryKey = ["campaignStats", campaignId] as const;

    const detailsQuery = useQuery({
        queryKey: detailsQueryKey,
        enabled: Boolean(campaignId),
        queryFn: () => {
            const params = recipientStatusFilter
                ? { recipient_status: recipientStatusFilter }
                : undefined;
            return campaignService.getCampaignDetails(campaignId, params);
        },
        refetchInterval: (query) => {
            if (!autoRefresh) return false;
            const campaign = (query.state.data as CampaignDetailsResponse | undefined)?.data;
            return campaign && isCampaignActive(campaign.status) ? refreshInterval : false;
        },
    });

    const statsQuery = useQuery({
        queryKey: statsQueryKey,
        enabled: Boolean(campaignId),
        queryFn: () => campaignService.getCampaignStats(campaignId),
        refetchInterval: () => {
            if (!autoRefresh) return false;
            const campaign = detailsQuery.data?.data;
            return campaign && isCampaignActive(campaign.status) ? refreshInterval : false;
        },
    });

    useEffect(() => {
        if (detailsQuery.dataUpdatedAt) {
            setLastUpdatedAt(new Date(detailsQuery.dataUpdatedAt).toISOString());
        }
    }, [detailsQuery.dataUpdatedAt]);

    const setRecipientStatusFilter = useCallback((status: RecipientStatus | undefined) => {
        setRecipientStatusFilterState(status);
        if (typeof window !== "undefined") {
            const storageKey = `campaign_recipient_filter_${campaignId}`;
            if (status) {
                localStorage.setItem(storageKey, status);
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [campaignId]);

    const refetch = useCallback(async (options?: { manual?: boolean }) => {
        if (options?.manual) setIsRefreshing(true);
        try {
            await Promise.all([detailsQuery.refetch(), statsQuery.refetch()]);
        } finally {
            if (options?.manual) setIsRefreshing(false);
        }
    }, [detailsQuery, statsQuery]);

    useEffect(() => {
        if (!autoRefresh || !detailsQuery.data?.data) return;

        const campaign = detailsQuery.data.data;
        if (campaign.status !== "scheduled" || !campaign.scheduled_at) return;

        const scheduledMs = new Date(campaign.scheduled_at).getTime();
        const delayMs = scheduledMs - Date.now();
        let timeoutId: ReturnType<typeof setTimeout>;
        let intervalId: ReturnType<typeof setInterval>;

        const startPolling = () => {
            void refetch();
            intervalId = setInterval(() => {
                void refetch();
            }, refreshInterval);
        };

        if (delayMs <= 0) {
            startPolling();
        } else {
            timeoutId = setTimeout(startPolling, delayMs);
        }

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [
        autoRefresh,
        detailsQuery.data?.data?.status,
        detailsQuery.data?.data?.scheduled_at,
        refetch,
        refreshInterval,
    ]);

    const setCampaign = useCallback((campaign: CampaignDetails | null) => {
        queryClient.setQueryData<CampaignDetailsResponse | undefined>(
            detailsQueryKey,
            (current) => {
                if (!campaign) return current;
                return {
                    message: current?.message || "Campaign details",
                    data: {
                        ...campaign,
                        recipients: campaign.recipients || current?.data?.recipients || [],
                    },
                };
            }
        );
    }, [detailsQueryKey, queryClient]);

    const setRecipientStatus = useCallback(
        (status: RecipientStatus | undefined) => {
            setRecipientStatusFilter(status);
        },
        [setRecipientStatusFilter]
    );

    const campaign = detailsQuery.data?.data || null;

    return {
        campaign,
        recipients: campaign?.recipients || [],
        loading: detailsQuery.isLoading,
        statsError: statsQuery.isError ? "Stats unavailable. Please refresh to retry." : null,
        isRefreshing,
        error: detailsQuery.isError ? "Failed to load campaign details. Please try again." : null,
        stats: statsQuery.data?.data || null,
        lastUpdatedAt,
        refetch,
        setCampaign,
        filters: {
            recipientStatus: recipientStatusFilter,
            setRecipientStatus,
        },
    };
};
