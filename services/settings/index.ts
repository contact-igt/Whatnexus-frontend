import {_axios} from "@/helper/axios";

export interface ActivateSettingData {
    setting_value: string;
}

export class settingApiData {
    getAllSettings = async()=>{
        return await _axios("get", "/app-settings")
    };
    // updateSettingById = async(id: string, data: any)=>{
    //     return await _axios("put", `/appsetting/${id}`, data)
    // }
    activateSettingById = async(id: string, data: ActivateSettingData)=>{
        return await _axios("put", `/app-setting/toggle/${id}`, data)
    }
}