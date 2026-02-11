import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiLogsApiData } from "@/services/aiLogs";

const AiLogsApis = new aiLogsApiData();

export interface AiLog {
    id: number;
    tenant_id: string;
    type: "missing_knowledge" | "out_of_scope" | "urgent" | "sentiment";
    payload: string;
    user_message: string;
    ai_response: string;
    status: "pending" | "act_on" | "resolved" | "ignored";
    resolution?: string;
    created_at: string;
    updated_at: string;
}

export interface AiLogsResponse {
    message: string;
    data: AiLog[];
}

export interface UpdateAiLogStatusPayload {
    status?: "pending" | "act_on" | "resolved" | "ignored";
    type?: "missing_knowledge" | "out_of_scope" | "urgent" | "sentiment";
    resolution?: string;
}

export interface AiLogsQueryParams {
    type?: "missing_knowledge" | "out_of_scope" | "urgent" | "sentiment";
    status?: "pending" | "act_on" | "resolved" | "ignored";
}

// Fetch all AI logs
export const useGetAiLogsQuery = (params?: AiLogsQueryParams) => {
    return useQuery<AiLogsResponse>({
        queryKey: ["ai-logs", params],
        queryFn: () => AiLogsApis.getAllAiLogs(params),
        staleTime: 2 * 60 * 1000,
    });
};

// Fetch AI log by ID
export const useGetAiLogByIdQuery = (id: string) => {
    return useQuery({
        queryKey: ["ai-logs", id],
        queryFn: () => AiLogsApis.getAiLogById(id),
        enabled: !!id,
        staleTime: 3 * 60 * 1000,
    });
};

// Create AI log
export const useCreateAiLogMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => {
            return AiLogsApis.createAiLog(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ai-logs"] });
            toast.success("Log created successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create log");
        },
    });
};

// Update AI log status
export const useUpdateAiLogStatusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAiLogStatusPayload }) => {
            return AiLogsApis.updateAiLogStatus(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ai-logs"] });
            toast.success("Status updated successfully");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update status");
        },
    });
};

