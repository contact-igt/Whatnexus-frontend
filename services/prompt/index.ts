import { _axios } from "@/helper/axios";

export interface CreatePromptData {
    name: string;
    prompt: string;
}

export class promptApiData {
    createPrompt = async (data: CreatePromptData) => {
        return await _axios("post", "/whatsapp/prompt", data);
    };
    getAllPrompts = async () => {
        return await _axios("get", "/whatsapp/prompts");
    };
    getPromptById = async (id: string) => {
        return await _axios("get", `/whatsapp/prompt/${id}`);
    };
    updatePromptById = async (id: string, data: any) => {
        return await _axios("put", `/whatsapp/prompt/${id}`, data)
    }
    deletePromptById = async (id: string) => {
        return await _axios("delete", `/whatsapp/prompt/${id}/soft`)
    }
    activatePromptById = async (id: string, data: any) => {
        return await _axios("put", `/whatsapp/prompt-active/${id}`, data)
    }
    getDeletedPrompts = async () => {
        return await _axios("get", "/whatsapp/prompts/deleted/list");
    }
    deletePromptPermanentById = async (id: string) => {
        return await _axios("delete", `/whatsapp/prompt/${id}/permanent`);
    }
    restorePromptById = async (id: string) => {
        return await _axios("post", `/whatsapp/prompt/${id}/restore`);
    }
}