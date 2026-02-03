import { _axios } from "@/helper/axios";
import type {
    CreateCampaignRequest,
    CreateCampaignResponse,
    CampaignListParams,
    CampaignListResponse,
    CampaignDetailsParams,
    CampaignDetailsResponse,
    ExecuteCampaignResponse,
} from "./campaign.types";

/**
 * Campaign API Service
 * Handles all WhatsApp campaign-related API operations
 */
export class CampaignService {
    /**
     * Create a new WhatsApp campaign
     * @param data Campaign creation data
     * @returns Campaign creation response with campaign_id
     */
    createCampaign = async (
        data: CreateCampaignRequest
    ): Promise<CreateCampaignResponse> => {
        try {
            const response = await _axios("post", "/whatsapp-campaign", data);
            return response;
        } catch (error) {
            console.error("Error creating campaign:", error);
            throw error;
        }
    };

    /**
     * Get list of campaigns with pagination and filtering
     * @param params Query parameters (page, limit, status)
     * @returns Paginated list of campaigns
     */
    getCampaignList = async (
        params?: CampaignListParams
    ): Promise<CampaignListResponse> => {
        try {
            const response = await _axios(
                "get",
                "/whatsapp-campaign/list",
                undefined,
                "application/json",
                params
            );
            return response;
        } catch (error) {
            console.error("Error fetching campaign list:", error);
            throw error;
        }
    };

    /**
     * Get detailed information for a specific campaign
     * @param campaignId Campaign ID
     * @param params Optional query parameters (recipient_status filter)
     * @returns Campaign details with recipient list
     */
    getCampaignDetails = async (
        campaignId: string,
        params?: CampaignDetailsParams
    ): Promise<CampaignDetailsResponse> => {
        try {
            const response = await _axios(
                "get",
                `/whatsapp-campaign/${campaignId}`,
                undefined,
                "application/json",
                params
            );
            return response;
        } catch (error) {
            console.error("Error fetching campaign details:", error);
            throw error;
        }
    };

    /**
     * Manually trigger execution of a draft/scheduled campaign
     * @param campaignId Campaign ID to execute
     * @returns Execution confirmation
     */
    executeCampaign = async (
        campaignId: string
    ): Promise<ExecuteCampaignResponse> => {
        try {
            const response = await _axios(
                "post",
                `/whatsapp-campaign/${campaignId}/execute`
            );
            return response;
        } catch (error) {
            console.error("Error executing campaign:", error);
            throw error;
        }
    };
    /**
     * Delete a campaign
     * @param campaignId Campaign ID to delete
     * @returns Deletion confirmation
     */
    deleteCampaign = async (
        campaignId: string
    ): Promise<{ message: string }> => {
        try {
            const response = await _axios(
                "delete",
                `/whatsapp-campaign/${campaignId}/soft`
            );
            return response;
        } catch (error) {
            console.error("Error deleting campaign:", error);
            throw error;
        }
    };
}

// Export singleton instance
export const campaignService = new CampaignService();
