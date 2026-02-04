import { templateApiData } from "@/services/template";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const templateApis = new templateApiData();

export const useCreateTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => {
            return templateApis.createTemplate(data)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success(data?.message || 'Template created successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template creation failed!')
        }
    })
}

export const useUpdateTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ templateId, data }: { templateId: any, data: any }) => {
            return templateApis.updateTemplate(templateId, data)
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            queryClient.invalidateQueries({ queryKey: ['template', variables.templateId] });
            toast.success(data?.message || 'Template updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template update failed!')
        }
    })
}


export const useGetAllTemplateQuery = () => {
    return useQuery({
        queryKey: ['templates'],
        queryFn: () => templateApis.getAllTemplate()
    })
}


export const useSubmitTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (template_id: any) => {
            return templateApis.submitTemplate(template_id)
        },
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['templates'] });
            await queryClient.invalidateQueries({ queryKey: ['template', variables] });
            toast.success(data?.message || 'Template submitted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template submission failed!')
        }
    })
}

export const useResubmitTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (template_id: any) => {
            return templateApis.resubmitTemplate(template_id)
        },
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['templates'] });
            await queryClient.invalidateQueries({ queryKey: ['template', variables] });
            toast.success(data?.message || 'Template resubmitted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template submission failed!')
        }
    })
}

export const useSyncTemplateByIdMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (template_id: any) => {
            return templateApis.syncTemplateById(template_id)
        },
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: ['templates'] });
            await queryClient.invalidateQueries({ queryKey: ['template', variables] });
            toast.success(data?.message || 'Template synced successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template sync failed!')
        }
    })
}

export const useSyncAllTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => {
            return templateApis.syncAllTemplate()
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success(data?.message || 'Template synced successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template sync failed!')
        }
    })
}

export const useSoftDeleteTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (template_id: any) => {
            return templateApis.softDeleteTemplate(template_id)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success(data?.message || 'Template deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template deletion failed!')
        }
    })
}

export const usePermanentDeleteTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (template_id: any) => {
            return templateApis.permanentDeleteTemplate(template_id)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success(data?.message || 'Template deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template deletion failed!')
        }
    })
}

export const useRestoreTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (template_id: any) => {
            return templateApis.restoreTemplate(template_id)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success(data?.message || 'Template restored successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template restoration failed!')
        }
    })
}

export const useGetTemplateByIdQuery = (template_id: any) => {
    return useQuery({
        queryKey: ['template', template_id],
        queryFn: () => templateApis.getTemplateById(template_id),
        enabled: !!template_id
    })
}

export const useGenerateAiTemplateMutation = () => {
    return useMutation({
        mutationFn: (data: any) => {
            return templateApis.generateAiTemplate(data)
        }
    })
}