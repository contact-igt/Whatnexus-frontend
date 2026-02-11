import { _axios } from "@/helper/axios";

export interface UpdateAiLogStatusData {
    status?: "pending" | "act_on" | "resolved" | "ignored";
    type?: "missing_knowledge" | "out_of_scope" | "urgent" | "sentiment";
    resolution?: string;
}

export interface CreateAiLogData {
    type: "missing_knowledge" | "out_of_scope" | "urgent" | "sentiment";
    user_message: string;
    ai_response: string;
    payload: string;
    status: "pending" | "act_on" | "resolved" | "ignored";
}

export interface AiLogsQueryParams {
    type?: "missing_knowledge" | "out_of_scope" | "urgent" | "sentiment";
    status?: "pending" | "act_on" | "resolved" | "ignored";
}

export class aiLogsApiData {
    getAllAiLogs = async (params?: AiLogsQueryParams) => {
        const queryString = params
            ? `?${new URLSearchParams(params as any).toString()}`
            : '';
        return await _axios("get", `/whatsapp/ai/logs${queryString}`);
    };

    getAiLogById = async (id: string) => {
        return await _axios("get", `/whatsapp/ai/logs/${id}`);
    };

    createAiLog = async (data: CreateAiLogData) => {
        return await _axios("post", "/whatsapp/ai/logs", data);
    };

    updateAiLogStatus = async (id: string, data: UpdateAiLogStatusData) => {
        return await _axios("patch", `/whatsapp/ai/logs/${id}/status`, data);
    };

    deleteAiLog = async (id: string) => {
        return await _axios("delete", `/whatsapp/ai/logs/${id}/soft`);
    };
}

export const AiLogsApis = new aiLogsApiData();
