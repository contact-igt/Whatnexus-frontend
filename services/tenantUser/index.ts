import { _axios } from "@/helper/axios"

export interface CreateTenantUserRequest {
    username: string;
    email: string;
    country_code: string;
    mobile: string;
    role: "doctor" | "staff" | "agent";
}

export interface UpdateTenantUserRequest {
    username?: string;
    country_code?: string;
    mobile?: string;
    role?: "doctor" | "staff" | "agent";
}

export interface TenantUserLoginRequest {
    email: string;
    password: string;
}

export class tenantUserApiData {
    // POST /api/whatsapp/tenant-user/login - Tenant user login
    loginTenantUser = async (data: TenantUserLoginRequest) => {
        return await _axios("post", "/tenant/user/login", data)
    }

    // GET /api/whatsapp/tenant-users - List all tenant users
    getAllTenantUser = async () => {
        return await _axios("get", "/tenant/user/list")
    }

    // POST /api/whatsapp/tenant-user - Create/Invite tenant user
    createTenantUser = async (data: CreateTenantUserRequest) => {
        return await _axios("post", "/tenant/user/create", data)
    }

    // GET /api/whatsapp/tenant-user/:id - Get user profile by ID
    getTenantUserById = async (tenantUserId: string) => {
        return await _axios("get", `/tenant/user/${tenantUserId}`)
    }

    // PUT /api/whatsapp/tenant-user/:id - Update tenant user
    updateTenantUser = async (tenantUserId: string, data: UpdateTenantUserRequest) => {
        return await _axios("put", `/tenant/user/${tenantUserId}`, data)
    }
    
    // getWebhookStatus = async (tenantId: string) => {
    //     return await _axios("get", `/tenant/webhook-status/${tenantId}`)
    // }
    // GET /api/whatsapp/tenant/profile - Get logged-in tenant user profile
    getTenantProfile = async () => {
        return await _axios("get", `/tenant/user/profile`)
    }

    // DELETE /api/whatsapp/tenant-user/:id - Soft delete tenant user
    softDeleteTenantUser = async (tenantUserId: string) => {
        return await _axios("delete", `/tenant/user/${tenantUserId}/soft`)
    }

    // DELETE /api/whatsapp/tenant-user/:id/permanent - Permanent delete
    permanentDeleteTenantUser = async (tenantUserId: string) => {
        return await _axios("delete", `/tenant/user/${tenantUserId}/permanent`)
    }
}