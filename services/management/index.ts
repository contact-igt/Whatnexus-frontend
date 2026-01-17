import { _axios } from "@/helper/axios"

export class managementApiData{
    getAllManagement = async()=>{
        return await _axios("get", "/managements")
    }
    createManagement = async(data: any)=>{
        return await _axios("post", "/management/register", data)
    }
}