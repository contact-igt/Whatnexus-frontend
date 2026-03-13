import { useMutation, useQuery } from "@tanstack/react-query";
import { PlaygroundApiData, PlaygroundChatPayload } from "@/services/playground";
import { toast } from "sonner";

const PlaygroundApis = new PlaygroundApiData();

export const usePlaygroundChatMutation = () => {
    return useMutation({
        mutationFn: (data: PlaygroundChatPayload) => PlaygroundApis.sendMessage(data),
        onError: (error: Error) => {
            toast.error(error?.message || "Failed to get AI response");
        },
    });
};

export const usePlaygroundKnowledgeSources = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["playground-knowledge-sources"],
        queryFn: () => PlaygroundApis.getKnowledgeSources(),
        staleTime: 5 * 60 * 1000,
    });

    return { data, isLoading, isError };
};
