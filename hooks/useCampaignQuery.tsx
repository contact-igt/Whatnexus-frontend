import { campaignService } from "@/services/campaign/campaign.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSoftDeleteCampaignMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (campaignId: string) => {
            return campaignService.softDeleteCampaign(campaignId)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            toast.success(data?.message || 'Campaign deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Campaign deletion failed!')
        }
    })
}

export const usePermanentDeleteCampaignMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (campaignId: string) => {
            return campaignService.permanentDeleteCampaign(campaignId)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['deletedCampaigns'] });
            toast.success(data?.message || 'Campaign permanently deleted!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Permanent deletion failed!')
        }
    })
}

export const useRestoreCampaignMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (campaignId: string) => {
            return campaignService.restoreCampaign(campaignId)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            queryClient.invalidateQueries({ queryKey: ['deletedCampaigns'] });
            toast.success(data?.message || 'Campaign restored successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Campaign restoration failed!')
        }
    })
}
