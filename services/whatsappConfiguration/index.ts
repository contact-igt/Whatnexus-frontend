import { _axios } from "@/helper/axios";


export interface WhatsappConfigData {
    wabaId: string;
    phoneNumberId: string;
    whatsappNumber: string;
    accessToken: string;
}

export class whatsappConfigApiData {
    getWhatsAppConfig = async () => {
        return await _axios("get", "/whatsapp-account");
    }
    saveWhatsappConfig = async(data: whatsappConfigApiData)=>{
        console.log("data", data)
        return await _axios("post", "/whatsapp-account/manual", data);
    }
    testWhatsAppConfig = async () => {
        return await _axios("post", "/whatsapp-account/test");
    }
    updateStatusWhatsappConfig = async (id: string, status: any) => {
        return await _axios("post", `/whatsapp-account/activate`)
    }
}