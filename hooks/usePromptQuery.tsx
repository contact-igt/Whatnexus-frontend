import { promptApiData } from "@/services/prompt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

const PromptApis = new promptApiData();

export const useCreatePromptMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => {
            return PromptApis.createPrompt(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prompt-configurations'] });
            toast.success('Prompt updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to update prompt');
        },
    });
};

export const useActivatePromptMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => {
            return PromptApis.activatePromptById(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prompt-configurations'] });
            toast.success('Prompt status updated successfully!');
        },
        onError: (error: any) => {
            console.log(error)
            toast.error(error?.response?.data?.message || 'Failed to update prompt status');
        },
    });
};

export const useDeletePromptMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            return PromptApis.deletePromptById(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prompt-configurations'] });
            toast.success('Prompt deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to delete prompt');
        },
    });
};


export const useGetPromptConfigurationQuery = () => {

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['prompt-configurations'],
        queryFn: () => PromptApis.getAllPrompts(),
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error instanceof Error ? error.message : 'Failed to load prompt configurations');
        }
    }, [isError, error]);

    return { data, isLoading, isError };
}

export const usePromptByIdQuery = (id: string, type: string) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['prompt-configurations', id],
        queryFn: () => PromptApis.getPromptById(id),
        enabled: !!id && type == "prompt",
        staleTime: 3 * 60 * 1000,
    });
    return { data, isLoading, isError };
}


export const useUpdatePromptMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => {
            const formData = new FormData();
            formData.append("name", data?.name);
            formData.append("prompt", data?.prompt ?? null);
            return PromptApis.updatePromptById(id, formData as any);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prompt-configurations'] });
            toast.success('Prompt updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update knowledge');
        },
    });
};
