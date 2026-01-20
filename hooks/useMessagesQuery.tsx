import { AxiosError } from "axios";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessagesApiData } from "@/services/messages";
import { Variable } from "lucide-react";

const MessagesApis = new MessagesApiData();

export const useGetAllChatsQuery = () => {

    const { data, isLoading, isError } = useQuery({
        queryKey: ['chats'],
        queryFn: () => MessagesApis.getAllChats(),
        staleTime: 2 * 60 * 1000,
    });

    if (isError) {
        toast.error('Failed to load messages');
    }

    return { data, isLoading, isError };
};

export const useMessagesByPhoneQuery = (phone_number: string) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['messages', phone_number],
        queryFn: () => MessagesApis.getMessagesByPhone(phone_number),
        enabled: !!phone_number,
        staleTime: 0,
    });

    return { data, isLoading, isError };
};

export const useAddMessageMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => {
            return MessagesApis.addMessage(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["messages", variables.phone],
            });
            // toast.success('Message sent successfully!');
        },
        onError: (error: Error) => {
            // toast.error(error.message || 'Failed to send message');
        },
    });
};

export const useUpdateSeenMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (phone_number: any) => {
            return MessagesApis.updateSeen(phone_number);
        },
        onSuccess: (_, phone) => {
            queryClient.invalidateQueries({
                queryKey: ["messages", phone],
            });
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
        },
    })
}


export const useChatSuggestMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => {
            return MessagesApis.chatSuggest(data);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["messages", variables.phone],
            });
        },
    });
}