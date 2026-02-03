import { _axios } from "@/helper/axios"

export class templateApiData{
    createTemplate = async(data: any)=>{
        return await _axios("post", "/whatsapp-template", data)
    }
    updateTemplate = async(templateId: string, data: any)=>{
        return await _axios("put", `/whatsapp-template/${templateId}`, data)
    }
    getAllTemplate = async()=>{
        return await _axios("get", "/whatsapp-templates")
    }
    submitTemplate = async(template_id: any)=>{
        return await _axios("post", `/whatsapp-template/${template_id}/submit`)
    }
    resubmitTemplate = async(template_id: any)=>{
        return await _axios("post", `/whatsapp-template/${template_id}/resubmit`)
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