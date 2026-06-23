import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { campaignService } from "@/services/campaign/campaign.service";
import { socket } from "@/utils/socket";
import type {
    Campaign,
    CampaignListParams,
    CampaignListResponse,
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
        search: string;
        setSearch: (search: string) => void;
    };
    deletedCampaigns: Campaign[];
    fetchDeletedCampaigns: () => Promise<void>;
}

/**
 * Campaign list hook. React Query owns fetching/cache invalidation while this
 * hook preserves the older return shape consumed by the campaign views.
 */
export const useCampaigns = (
    autoRefresh: boolean = true,
    refreshInterval: number = 5000,
    onlyPollWhenSocketDisconnected: boolean = true
): UseCampaignsReturn => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [statusFilter, setStatusFilter] = useState<CampaignStatus | undefined>(
        undefined
    );
    const [searchFilter, setSearchFilter] = useState<string>("");

    const campaignQuery = useQuery({
        queryKey: ["campaigns", currentPage, limit, statusFilter, searchFilter],
        queryFn: () => {
            const params: CampaignListParams = {
                page: currentPage,
                limit,
                ...(statusFilter && { status: statusFilter }),
                ...(searchFilter ? { search: searchFilter } : {}),
            };

            return campaignService.getCampaignList(params);
        },
        refetchInterval: (query) => {
            if (!autoRefresh) return false;

            const campaignsFromApi =
                (query.state.data as CampaignListResponse | undefined)?.data?.campaigns || [];
            const hasActiveCampaigns = campaignsFromApi.some(
                (campaign) => campaign.status === "active"
            );
            if (!hasActiveCampaigns) return false;

            const shouldPoll = !onlyPollWhenSocketDisconnected || !socket.connected;
            return shouldPoll ? refreshInterval : false;
        },
    });

    const deletedCampaignsQuery = useQuery({
        queryKey: ["deletedCampaigns"],
        queryFn: async () => {
            const response = await campaignService.getDeletedCampaignList();
            const items =
                (response as any)?.data?.items ?? (response as any)?.data?.campaigns ?? [];

            return items.map((item: any) => ({
                ...item,
                createdAt: item?.createdAt || item?.created_at || null,
                updatedAt: item?.updatedAt || item?.updated_at || null,
            })) as Campaign[];
        },
        enabled: false,
    });

    const refetch = useCallback(async () => {
        await campaignQuery.refetch();
    }, [campaignQuery]);

    const fetchDeletedCampaigns = useCallback(async () => {
        await deletedCampaignsQuery.refetch();
    }, [deletedCampaignsQuery]);

    const setPage = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const setLimitCallback = useCallback((newLimit: number) => {
        setLimit(newLimit);
        setCurrentPage(1);
    }, []);

    const setStatus = useCallback((status: CampaignStatus | undefined) => {
        setStatusFilter(status);
        setCurrentPage(1);
    }, []);

    const setSearch = useCallback((search: string) => {
        setSearchFilter(search);
        setCurrentPage(1);
    }, []);

    return {
        campaigns: campaignQuery.data?.data?.campaigns || [],
        loading: campaignQuery.isLoading || deletedCampaignsQuery.isFetching,
        error: campaignQuery.isError ? "Failed to load campaigns. Please try again." : null,
        refetch,
        pagination: {
            currentPage,
            totalPages: campaignQuery.data?.data?.totalPages || 1,
            totalCampaigns: campaignQuery.data?.data?.totalItems || 0,
            setPage,
            setLimit: setLimitCallback,
        },
        filters: {
            status: statusFilter,
            setStatus,
            search: searchFilter,
            setSearch,
        },
        deletedCampaigns: deletedCampaignsQuery.data || [],
        fetchDeletedCampaigns,
    };
};
