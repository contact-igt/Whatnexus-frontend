import { useState, useEffect, useCallback } from "react";
import { campaignService } from "@/services/campaign/campaign.service";
import type {
    CampaignDetails,
    Recipient,
    RecipientStatus,
} from "@/services/campaign/campaign.types";
import { isCampaignActive } from "@/utils/campaign.utils";

interface UseCampaignDetailsReturn {
    campaign: CampaignDetails | null;
    recipients: Recipient[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
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
    const [error, setError] = useState<string | null>(null);
    const [recipientStatusFilter, setRecipientStatusFilter] = useState<
        RecipientStatus | undefined
    >(undefined);

    const fetchCampaignDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = recipientStatusFilter
                ? { recipient_status: recipientStatusFilter }
                : undefined;

            const response = await campaignService.getCampaignDetails(
                campaignId,
                params
            );

            setCampaign(response.data);
            setRecipients(response.data.recipients);
        } catch (err) {
            console.error("Error fetching campaign details:", err);
            setError("Failed to load campaign details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [campaignId, recipientStatusFilter]);

    // Initial fetch
    useEffect(() => {
        fetchCampaignDetails();
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
        error,
        refetch: fetchCampaignDetails,
        filters: {
            recipientStatus: recipientStatusFilter,
            setRecipientStatus,
        },
    };
};
