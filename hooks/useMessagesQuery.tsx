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



export const useGetAllLiveChatsQuery = () => {

    const { data, isLoading, isError } = useQuery({
        queryKey: ['livechats'],
        queryFn: () => MessagesApis.getAllLiveChats(),
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

export const useSendTemplateMessageMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { phone: string; contact_id: string; template_id: string; components?: any[] }) => {
            return MessagesApis.sendTemplateMessage(data);
        },
        onSuccess: (data: any, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["messages", variables.phone],
            });
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
            queryClient.invalidateQueries({
                queryKey: ["livechats"],
            });
            toast.success(data?.message || 'Template message sent successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to send template message');
        },
    });
};