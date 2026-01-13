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
        return await _axios("get", "/tenants");
    };

    updateTenant = async (id: string, data: any) => {
        return await _axios("put", `/tenant/${id}`, data);
    };
    updateTenantStatus = async(id: string, data: any)=>{
        return await _axios("put", `/tenant-status/${id}?status=${data?.status}`)
    }
    deleteTenant = async (id: string)=>{
        return await _axios("delete", `/tenant/${id}`)
    }
}