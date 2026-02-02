import { _axios } from "@/helper/axios"

export class templateApiData{
    createTemplate = async(data: any)=>{
        return await _axios("post", "/whatsapp-template", data)
    }
    getAllTemplate = async()=>{
        return await _axios("get", "/whatsapp-templates")
    }
    submitTemplate = async(template_id: any)=>{
        return await _axios("post", `/whatsapp-template/${template_id}/submit`)
    }
    syncTemplateById = async(template_id: any)=>{
        return await _axios("post", `/whatsapp-template/${template_id}/sync`)
    }
    syncAllTemplate = async()=>{
        return await _axios("post", `/whatsapp-templates/sync`)
    }
    softDeleteTemplate = async(template_id: any)=>{
        return await _axios("delete", `/whatsapp-template/${template_id}/soft`)
    }
    permanentDeleteTemplate = async(template_id: any)=>{
        return await _axios("delete", `/whatsapp-template/${template_id}/permanent`)
    }
    restoreTemplate = async(template_id: any)=>{
        return await _axios("post", `/whatsapp-template/${template_id}/restore`)
    }
    getTemplateById = async(template_id: any)=>{
        return await _axios("get", `/whatsapp-template/${template_id}`)
    }
}