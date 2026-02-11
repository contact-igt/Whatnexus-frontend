import { knowledgeApiData } from "@/services/knowledge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

const KnowledgeApis = new knowledgeApiData();

export interface UploadKnowledgeData {
    title: string,
    file_name: string,
    type: string,
    text: string,
    source_url: string,
    file: any,
}

export const useUploadKnowledgeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UploadKnowledgeData) => {
            const formData = new FormData();
            formData.append("title", data?.title);
            formData.append("file_name", data?.file_name);
            formData.append("type", data?.type);
            formData.append("text", data?.text || "");
            formData.append("source_url", data?.source_url || "");
            if (data?.file) {
                formData.append("file", data?.file);
            }
            return KnowledgeApis.uploadKnowledge(formData as any);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledges'] });
            toast.success('Knowledge updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update knowledge');
        },
    });
};


export const useGetKnowledgesQuery = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['knowledges'],
        queryFn: () => KnowledgeApis.getAllKnowledges(),
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error instanceof Error ? error.message : 'Failed to load knowledge');
        }
    }, [isError, error]);

    return { data, isLoading, isError };
};


export const useKnowledgeByIdQuery = (id: string, type: string) => {
    const query = useQuery({
        queryKey: ['knowledge', id],
        queryFn: () => KnowledgeApis.getKnowledgeById(id),
        enabled: false,
        staleTime: 3 * 60 * 1000,
    });
    return query;
}


export const useUpdateKnowledgeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => {
            const formData = new FormData();
            formData.append("title", data?.title);
            formData.append("text", data?.text ?? null);
            return KnowledgeApis.updateKnowledgeById(id, formData as any);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledges'] });
            toast.success('Knowledge updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update knowledge');
        },
    });
};


export const useActivateKnowledgeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => {
            return KnowledgeApis.activateKnowledgeById(id, data)
        },
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({ queryKey: ["knowledges"] });
            const message =
                response?.data?.message ||
                response?.message ||
                "Knowledge status updated successfully";
            toast.success(message);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update knowledge status');
        },
    })
}

export const useDeleteKnowledgeById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => KnowledgeApis.deleteKnowledgeById(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["knowledges"] });
            queryClient.invalidateQueries({ queryKey: ["deleted-knowledges"] });
            toast.success("Knowledge deleted successfully");
        },

        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete knowledge");
        },
    });
};

export const useDeletedKnowledgeList = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['deleted-knowledges'],
        queryFn: () => KnowledgeApis.getDeletedKnowledges(),
        staleTime: 2 * 60 * 1000,
    });

    return { data, isLoading, isError };
}

export const useDeleteKnowledgePermanentById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => KnowledgeApis.deleteKnowledgePermanentById(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-knowledges'] });
            toast.success("Knowledge deleted successfully");
        },

        onError: (error: any) => {
            toast.error(error?.message || "Failed to delete knowledge");
        },
    });
};


export const useRestoreKnowledgeById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => KnowledgeApis.restoreKnowledgeById(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["knowledges"] });
            queryClient.invalidateQueries({ queryKey: ["deleted-knowledges"] });
            toast.success("Knowledge restored successfully");
        },
        onError: (error: any) => {
            toast.error(error.response.data.message || "Failed to restore knowledge")
        }
    })
}