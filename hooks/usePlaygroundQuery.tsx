import { PlaygroundApiData, PlaygroundChatPayload } from "@/services/playground";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

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
    return useQuery({
        queryKey: ["playground_knowledge_sources"],
        queryFn: () => playgroundApi.getKnowledgeSources(),
        staleTime: 5 * 60 * 1000,
    });
};
