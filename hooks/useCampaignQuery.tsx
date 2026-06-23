import { campaignService } from "@/services/campaign/campaign.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";

export const useSoftDeleteCampaignMutation = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (campaignId: string) => {
            return campaignService.softDeleteCampaign(campaignId)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success(data?.message || 'Campaign deleted successfully!');
            // F-2 FIX: Call optional callback to trigger refetch/redirect on detail page
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Campaign deletion failed!')
        }
    })
}

export const usePermanentDeleteCampaignMutation = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (campaignId: string) => {
            return campaignService.permanentDeleteCampaign(campaignId)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['deletedCampaigns'] });
            toast.success(data?.message || 'Campaign permanently deleted!');
            // F-2 FIX: Call optional callback to trigger refetch/redirect on detail page
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Permanent deletion failed!')
        }
    })
}

export const useRestoreCampaignMutation = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (campaignId: string) => {
            return campaignService.restoreCampaign(campaignId)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['deletedCampaigns'] });
            toast.success(data?.message || 'Campaign restored successfully!');
            // F-2 FIX: Call optional callback to trigger refetch on detail page
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Campaign restoration failed!')
        }
    })
}
