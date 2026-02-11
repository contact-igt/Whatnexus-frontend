import { _axios } from "@/helper/axios";

// export interface CreatePromptData {
//     name: string;
//     prompt: string;
// }

export class TenantApiData {
    createTenant = async (data: any) => {
        return await _axios("post", "/tenant", data);
    };

    getAllTenants = async () => {
        return await _axios("get", "/tenant/list");
    };
    getTenantById = async (tenantId: string) => {
        return await _axios("get", `/tenant/${tenantId}`);
    }
    updateTenant = async (tenantId: string, data: any) => {
        return await _axios("put", `/tenant/${tenantId}`, data);
    };
    updateTenantStatus = async (tenantId: string, data: any) => {
        return await _axios("put", `tenant/${tenantId}/status?status=${data?.status}`)
    }
    softDeleteTenant = async (tenantId: string) => {
        return await _axios("delete", `/tenant/${tenantId}/soft`)
    }
    permanentDeleteTenant = async (tenantId: string) => {
        return await _axios("delete", `/tenant/${tenantId}/permanent`)
    }
    // WhatsApp Configuration APIs
    getWhatsAppConfig = async (tenantId: string) => {
        return await _axios("get", `/tenant/${tenantId}/whatsapp-config`);
    };

    saveWhatsAppConfig = async (tenantId: string, data: any) => {
        return await _axios("post", `/tenant/${tenantId}/whatsapp-config`, data);
    };

    testWhatsAppConnection = async (tenantId: string, data: any) => {
        return await _axios("post", `/tenant/${tenantId}/whatsapp-test`, data);
    };
}