import { useState, useEffect, useCallback } from "react";
import { campaignService } from "@/services/campaign/campaign.service";
import type {
    CampaignDetails,
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
    lastUpdatedAt: string | null;
    refetch: (options?: { manual?: boolean }) => Promise<void>;
    filters: {
        recipientStatus: RecipientStatus | undefined;
        setRecipientStatus: (status: RecipientStatus | undefined) => void;
    };
}

/**
 * Custom hook for managing campaign details with real-time updates
 * @param campaignId Campaign ID to fetch details for
 * @param autoRefresh Enable auto-refresh for active campaigns (default: true)
 * @param refreshInterval Refresh interval in milliseconds (default: 5000)
 */
export const useCampaignDetails = (
    campaignId: string,
    autoRefresh: boolean = true,
    refreshInterval: number = 5000
): UseCampaignDetailsReturn => {
    const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<CampaignStatsResponse["data"] | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
    const [recipientStatusFilter, setRecipientStatusFilter] = useState<
        RecipientStatus | undefined
    >(undefined);

    const fetchCampaignDetails = useCallback(async (options?: { manual?: boolean }) => {
        try {
            if (options?.manual) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const params = recipientStatusFilter
                ? { recipient_status: recipientStatusFilter }
                : undefined;

            const response = await campaignService.getCampaignDetails(
                campaignId,
                params
            );

            setCampaign(response.data);
            setRecipients(response.data.recipients || []);
            setLastUpdatedAt(new Date().toISOString());

            // Fetch stats separately so a stats failure doesn't break the whole page
            try {
                const statsResponse = await campaignService.getCampaignStats(campaignId);
                setStats(statsResponse.data);
            } catch (statsErr) {
                console.warn("Failed to fetch campaign stats:", statsErr);
                // Keep existing stats if available, or set null — page still works
            }
        } catch (err) {
            console.error("Error fetching campaign details:", err);
            setError("Failed to load campaign details. Please try again.");
        } finally {
            if (options?.manual) {
                setIsRefreshing(false);
            } else {
                setLoading(false);
            }
        }
    }, [campaignId, recipientStatusFilter]);

    // Initial fetch
    useEffect(() => {
        Promise.resolve().then(() => fetchCampaignDetails());
    }, [fetchCampaignDetails]);

    // Auto-refresh for active campaigns
    useEffect(() => {
        if (!autoRefresh || !campaign) return;

        const isActive = isCampaignActive(campaign.status);
        if (!isActive) return;

        const intervalId = setInterval(() => {
            fetchCampaignDetails();
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [autoRefresh, campaign, refreshInterval, fetchCampaignDetails]);

    // Smart auto-refresh for scheduled campaigns: fire exactly when scheduled_at arrives
    useEffect(() => {
        if (!autoRefresh || !campaign) return;
        if (campaign.status !== "scheduled" || !campaign.scheduled_at) return;

        const scheduledMs = new Date(campaign.scheduled_at).getTime();
        const delayMs = scheduledMs - Date.now();

        let timeoutId: ReturnType<typeof setTimeout>;
        let intervalId: ReturnType<typeof setInterval>;

        const startPolling = () => {
            // Immediately fetch once, then poll every refreshInterval until no longer scheduled
            fetchCampaignDetails();
            intervalId = setInterval(() => {
                fetchCampaignDetails();
            }, refreshInterval);
        };

        if (delayMs <= 0) {
            // Scheduled time already passed (e.g. page opened after due time) — poll now
            startPolling();
        } else {
            // Set a one-shot timer to fire exactly when the scheduled time arrives
            timeoutId = setTimeout(startPolling, delayMs);
        }

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoRefresh, campaign?.status, campaign?.scheduled_at]);

    const setRecipientStatus = useCallback(
        (status: RecipientStatus | undefined) => {
            setRecipientStatusFilter(status);
        },
        []
    );

    return {
        campaign,
        recipients,
        loading,
        isRefreshing,
        error,
        stats,
        lastUpdatedAt,
        refetch: fetchCampaignDetails,
        filters: {
            recipientStatus: recipientStatusFilter,
            setRecipientStatus,
        },
    };
};
