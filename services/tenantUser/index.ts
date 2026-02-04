import { _axios } from "@/helper/axios"

export class tenantUserApiData{
    getAllTenantUser = async()=>{
        return await _axios("get", "/tenant-users")
    }
    createTenantUser = async(data: any)=>{
        return await _axios("post", "/tenant-user", data)
    }
}