import { _axios } from "@/helper/axios";

export interface CreatePromptData {
    name: string;
    prompt: string;
}

export class promptApiData {
    createPrompt = async (data: CreatePromptData) => {
        return await _axios("post", "/prompt", data);
    };
    getAllPrompts = async () => {
        return await _axios("get", "/prompts");
    };
    getPromptById = async (id: string) => {
        return await _axios("get", `/prompt/${id}`);
    };
    updatePromptById = async (id: string, data: any) => {
        return await _axios("put", `/prompt/${id}`, data)
    }
    deletePromptById = async (id: string) => {
        return await _axios("delete", `/prompt/${id}`)
    }
    activatePromptById = async (id: string, data: any) => {
        return await _axios("put", `/prompt-active/${id}`, data)
    }
}
