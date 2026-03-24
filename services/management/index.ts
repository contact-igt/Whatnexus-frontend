import { _axios } from "@/helper/axios"

// TypeScript Interfaces
export interface CreateManagementUserRequest {
    username: string;
    email: string;
    country_code: string;
    mobile: string;
    role: "platform_admin";
}

export interface UpdateManagementUserRequest {
    username?: string;
    country_code?: string;
    mobile?: string;
}

export interface ManagementUser {
    management_id: string;
    username: string;
    email: string;
    country_code: string;
    mobile: string;
    role: "platform_admin" | "super_admin";
    profile?: string;
    status: "active" | "inactive";
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export class managementApiData {
    // GET /api/whatsapp/managements - List all management users
    getAllManagement = async (): Promise<ManagementUser[]> => {
        return await _axios("get", "/management/list")
    }

    // POST /api/whatsapp/management/register - Create management user (super_admin only)
    createManagement = async (data: CreateManagementUserRequest) => {
        return await _axios("post", "/management/register", data)
    }

    // GET /api/whatsapp/management/:id - Get management user by ID
    getManagementById = async (managementId: string): Promise<ManagementUser> => {
        return await _axios("get", `/management/${managementId}`)
    }

    // PUT /api/whatsapp/management/:id - Update management user
    updateManagement = async (managementId: string, data: UpdateManagementUserRequest) => {
        return await _axios("put", `/management/${managementId}`, data)
    }

    // GET /api/whatsapp/management/profile - Get logged-in management user profile
    getManagementProfile = async () => {
        return await _axios("get", `/management/profile`)
    }
    getManagementDeletedList = async () => {
        return await _axios("get", `/management/deleted/list`)
    }

    // POST /api/whatsapp/management/:id/restore - Restore soft-deleted management user (super_admin only)
    restoreManagement = async (managementId: string) => {
        return await _axios("put", `/management/${managementId}/restore`)
    }

    // PUT /api/whatsapp/management/:id/soft - Soft delete management user (super_admin only)
    softDeleteManagement = async (managementId: string) => {
        return await _axios("delete", `/management/${managementId}/soft`)
    }

    // DELETE /api/whatsapp/management/:id/permanent - Permanent delete management user (super_admin only)
    permanentDeleteManagement = async (managementId: string) => {
        return await _axios("delete", `/management/${managementId}/permanent`)
    }

    // --- Pricing Table CRUD ---
    getPricingRules = async (): Promise<any> => {
        return await _axios("get", "/management/pricing")
    }

    createPricingRule = async (data: { category: string, country: string, rate: number, markup_percent?: number }) => {
        return await _axios("post", "/management/pricing", data)
    }

    updatePricingRule = async (id: number, data: { rate?: number, markup_percent?: number }) => {
        return await _axios("put", `/management/pricing/${id}`, data)
    }

    deletePricingRule = async (id: number) => {
        return await _axios("delete", `/management/pricing/${id}`)
    }

    // --- AI Model Pricing CRUD ---
    getAiPricingRules = async (): Promise<any> => {
        return await _axios("get", "/management/ai-pricing")
    }

    createAiPricingRule = async (data: {
        model: string,
        input_rate: number,
        output_rate: number,
        markup_percent?: number,
        usd_to_inr_rate?: number,
        description?: string,
        recommended_for?: "input" | "output" | "both",
        category?: "premium" | "mid-tier" | "budget" | "reasoning",
    }) => {
        return await _axios("post", "/management/ai-pricing", data)
    }

    updateAiPricingRule = async (id: number, data: {
        input_rate?: number,
        output_rate?: number,
        markup_percent?: number,
        usd_to_inr_rate?: number,
        is_active?: boolean,
        description?: string,
        recommended_for?: "input" | "output" | "both",
        category?: "premium" | "mid-tier" | "budget" | "reasoning",
    }) => {
        return await _axios("put", `/management/ai-pricing/${id}`, data)
    }

    deleteAiPricingRule = async (id: number) => {
        return await _axios("delete", `/management/ai-pricing/${id}`)
    }
}
