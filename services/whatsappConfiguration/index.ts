import { _axios } from "@/helper/axios";


export interface WhatsappConfigData {
    wabaId: string;
    phoneNumberId: string;
    whatsappNumber: string;
    accessToken: string;
}

export class whatsappConfigApiData {
    getWhatsAppConfig = async () => {
        return await _axios("get", "/whatsapp-accounts");
    }
    saveWhatsappConfig = async(data: whatsappConfigApiData)=>{
        return await _axios("post", "/whatsapp-account", data);
    }
    testWhatsAppConfig = async () => {
        return await _axios("get", "/whatsapp-account/test-connect");
    }
    updateStatusWhatsappConfig = async (id: string, status: any) => {
        return await _axios("put", `/whatsapp-account/status?status=${status}`)
    }
}