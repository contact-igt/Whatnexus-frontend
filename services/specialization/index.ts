import { _axios } from "@/helper/axios"

export class specializationApiData {
    getAllSpecialization = async () => {
        return await _axios("get", "/whatsapp/specializations")
    }

    createSpecialization = async (data: any) => {
        return await _axios("post", "/whatsapp/specialization", data)
    }

    updateSpecialization = async (id: string, data: any) => {
        return await _axios("put", `/whatsapp/specialization/${id}`, data)
    }

    getSpecializationById = async (id: string) => {
        return await _axios("get", `/whatsapp/specialization/${id}`)
    }

    deleteSpecialization = async (id: string) => {
        return await _axios("delete", `/whatsapp/specialization/${id}`)
    }

    toggleSpecializationStatus = async (id: string) => {
        return await _axios("patch", `/whatsapp/specialization/${id}/status`)
    }

    getDeletedSpecializations = async () => {
        return await _axios("get", "/whatsapp/specializations/deleted")
    }

    restoreSpecialization = async (id: string) => {
        return await _axios("patch", `/whatsapp/specialization/${id}/restore`)
    }

    permanentDeleteSpecialization = async (id: string) => {
        return await _axios("delete", `/whatsapp/specialization/${id}/permanent`)
    }
}