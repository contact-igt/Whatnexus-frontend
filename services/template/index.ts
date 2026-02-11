import { _axios } from "@/helper/axios"

export class templateApiData {
    createTemplate = async (data: any) => {
        return await _axios("post", "/whatsapp/whatsapp-template", data)
    }
    updateTemplate = async (templateId: string, data: any) => {
        return await _axios("put", `/whatsapp/whatsapp-template/${templateId}`, data)
    }
    getAllTemplate = async () => {
        return await _axios("get", "/whatsapp/whatsapp-templates")
    }
    submitTemplate = async (template_id: any) => {
        return await _axios("post", `/whatsapp/whatsapp-template/${template_id}/submit`)
    }
    resubmitTemplate = async (template_id: any) => {
        return await _axios("post", `/whatsapp/whatsapp-template/${template_id}/resubmit`)
    }
    syncTemplateById = async (template_id: any) => {
        return await _axios("get", `/whatsapp/whatsapp-template/${template_id}/sync`)
    }
    syncAllTemplate = async () => {
        return await _axios("post", `/whatsapp/whatsapp-templates/sync`)
    }
    softDeleteTemplate = async (template_id: any) => {
        return await _axios("delete", `/whatsapp/whatsapp-template/${template_id}/soft`)
    }
    permanentDeleteTemplate = async (template_id: any) => {
        return await _axios("delete", `/whatsapp/whatsapp-template/${template_id}/permanent`)
    }
    restoreTemplate = async (template_id: any) => {
        return await _axios("post", `/whatsapp/whatsapp-template/${template_id}/restore`)
    }
    getTemplateById = async (template_id: any) => {
        return await _axios("get", `/whatsapp/whatsapp-template/${template_id}`)
    }
    generateAiTemplate = async (data: any) => {
        return await _axios("post", "/whatsapp/whatsapp-template/generate-ai", data)
    }
    getDeletedTemplates = async () => {
        return await _axios("get", "/whatsapp/whatsapp-templates/deleted/list")
    }
}