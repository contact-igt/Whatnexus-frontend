import { PlaygroundApiData, PlaygroundChatPayload } from "@/services/playground";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useSelector } from "react-redux";

const playgroundApi = new PlaygroundApiData();

export const usePlaygroundChatMutation = () => {
    return useMutation({
        mutationFn: (data: PlaygroundChatPayload) => playgroundApi.sendMessage(data),
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to send message");
        },
    });
};

export const usePlaygroundKnowledgeSources = () => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["playground_knowledge_sources", tenantId],
        queryFn: () => playgroundApi.getKnowledgeSources(),
        staleTime: 5 * 60 * 1000,
    });
};
