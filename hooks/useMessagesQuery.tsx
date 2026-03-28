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

export const useGetAllHistoryChatsQuery = () => {

    const { data, isLoading, isError } = useQuery({
        queryKey: ['historychats'],
        queryFn: () => MessagesApis.getAllHistoryChats(),
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
        staleTime: 30 * 1000,
        refetchOnWindowFocus: false,
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
            queryClient.invalidateQueries({
                queryKey: ["livechats"],
            });
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
            // toast.success('Message sent successfully!');
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            const message = error.response?.data?.message || error.message || 'Failed to send message';
            toast.error(message);
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
            queryClient.invalidateQueries({
                queryKey: ["livechats"],
            });
            queryClient.invalidateQueries({
                queryKey: ["historychats"],
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
            // Invalidate messages for the specific phone to refresh chat view
            queryClient.invalidateQueries({
                queryKey: ["messages", variables.phone],
            });
            queryClient.invalidateQueries({
                queryKey: ["historychats"],
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

export const useClaimChatMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (contact_id: string) => {
            return MessagesApis.claimChat(contact_id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["livechats"],
            });
            queryClient.invalidateQueries({
                queryKey: ["historychats"],
            });
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
            toast.success('Chat claimed successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to claim chat');
            queryClient.invalidateQueries({ queryKey: ["livechats"] });
        },
    });
};

export const useAssignAgentMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { contact_id: string, agent_id: string }) => {
            return MessagesApis.assignAgent(data.contact_id, data.agent_id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["livechats"],
            });
            queryClient.invalidateQueries({
                queryKey: ["historychats"],
            });
            queryClient.invalidateQueries({
                queryKey: ["chats"],
            });
            toast.success('Agent assigned successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to assign agent');
            queryClient.invalidateQueries({ queryKey: ["livechats"] });
        },
    });
};

export const useGetAgentsQuery = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['agents'],
        queryFn: () => MessagesApis.getAgents(),
        staleTime: 5 * 60 * 1000,
    });

    return { data, isLoading, isError };
};

export const useToggleSilenceAIMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { contact_id: string, is_ai_silenced: boolean }) => {
            return MessagesApis.toggleSilenceAi(data.contact_id, data.is_ai_silenced);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["livechats"] });
            queryClient.invalidateQueries({ queryKey: ["chats"] });
            toast.success('AI Silence status updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to toggle AI Silence');
        },
    });
};