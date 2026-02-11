import { useState, useEffect, useCallback } from "react";
import { campaignService } from "@/services/campaign/campaign.service";
import type {
    Campaign,
    CampaignListParams,
    CampaignStatus,
} from "@/services/campaign/campaign.types";

interface UseCampaignsReturn {
    campaigns: Campaign[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCampaigns: number;
        setPage: (page: number) => void;
        setLimit: (limit: number) => void;
    };
    filters: {
        status: CampaignStatus | undefined;
        setStatus: (status: CampaignStatus | undefined) => void;
    };
    deletedCampaigns: Campaign[];
    fetchDeletedCampaigns: () => Promise<void>;
}

/**
 * Custom hook for managing campaign list with pagination and filtering
 * @param autoRefresh Enable auto-refresh for active campaigns (default: true)
 * @param refreshInterval Refresh interval in milliseconds (default: 5000)
 */
export const useCampaigns = (
    autoRefresh: boolean = true,
    refreshInterval: number = 5000
): UseCampaignsReturn => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalCampaigns, setTotalCampaigns] = useState<number>(0);
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | undefined>(
        undefined
    );
    const [deletedCampaigns, setDeletedCampaigns] = useState<Campaign[]>([]);

    const fetchCampaigns = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: CampaignListParams = {
                page: currentPage,
                limit,
                ...(statusFilter && { status: statusFilter }),
            };

            const response = await campaignService.getCampaignList(params);

            setCampaigns(response.data.campaigns);
            setTotalPages(response.data.totalPages);
            setTotalCampaigns(response.data.totalItems);
        } catch (err) {
            console.error("Error fetching campaigns:", err);
            setError("Failed to load campaigns. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, limit, statusFilter]);

    const fetchDeletedCampaigns = useCallback(async () => {
        try {
            setLoading(true);
            const response = await campaignService.getDeletedCampaignList();
            setDeletedCampaigns(response.data.campaigns);
        } catch (err) {
            console.error("Error fetching deleted campaigns:", err);
            // Optional: set specific error for deleted campaigns
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    // Auto-refresh for active campaigns
    useEffect(() => {
        if (!autoRefresh) return;

        const hasActiveCampaigns = campaigns.some(
            (campaign) => campaign.status === "active"
        );

        if (!hasActiveCampaigns) return;

        const intervalId = setInterval(() => {
            fetchCampaigns();
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [autoRefresh, campaigns, refreshInterval, fetchCampaigns]);

    const setPage = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const setLimitCallback = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(1); // Reset to first page when limit changes
    }, []);

    const setStatus = useCallback((status: CampaignStatus | undefined) => {
        setStatusFilter(status);
        setCurrentPage(1); // Reset to first page when filter changes
    }, []);

    return {
        campaigns,
        loading,
        error,
        refetch: fetchCampaigns,
        pagination: {
            currentPage,
            totalPages,
            totalCampaigns,
            setPage,
            setLimit: setLimitCallback,
        },
        filters: {
            status: statusFilter,
            setStatus,
        },
        deletedCampaigns,
        fetchDeletedCampaigns,
    };
};
