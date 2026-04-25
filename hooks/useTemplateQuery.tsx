import { templateApiData } from "@/services/template";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";

const templateApis = new templateApiData();

export const useCreateTemplateMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => {
            return templateApis.createTemplate(data)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast.success(data?.message);
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
            const errData = error?.response?.data;
            const errorCode = errData?.error_code;
            const msg = errData?.message || 'Template update failed!';

            if (errorCode === 'EDIT_LIMIT_24H') {
                const hoursLeft = errData?.hours_remaining;
                const nextEditAt = errData?.next_edit_at;
                const timeStr = hoursLeft
                    ? `Try again in ${hoursLeft} hour(s).`
                    : nextEditAt
                        ? `Next edit available: ${new Date(nextEditAt).toLocaleString()}.`
                        : '';
                toast.error(`${msg}${timeStr ? ` ${timeStr}` : ''}`);
            } else if (errorCode === 'EDIT_LIMIT_30DAYS') {
                const daysLeft = errData?.days_remaining;
                const editsUsed = errData?.edits_used ?? 10;
                const suffix = daysLeft ? ` Resets in ${daysLeft} day(s).` : '';
                toast.error(`${editsUsed}/10 edits used this period. ${msg}${suffix} Use "Duplicate & Edit" as a workaround.`);
            } else {
                toast.error(msg);
            }
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
            queryClient.invalidateQueries({ queryKey: ['deletedTemplates'] });
            toast.success(data?.message || 'Template moved to trash.');
        },
        onError: (error: any) => {
            const errData = error?.response?.data;
            const code = errData?.error_code;
            const msg = errData?.message || 'Template deletion failed!';
            if (code === 'TEMPLATE_IN_USE') {
                toast.error(`Cannot delete: ${msg}`);
            } else if (code === 'NOT_FOUND') {
                toast.error('Template not found. It may have already been deleted.');
            } else {
                toast.error(msg);
            }
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
            queryClient.invalidateQueries({ queryKey: ['deletedTemplates'] });
            toast.success(data?.message || 'Template permanently deleted.');
        },
        onError: (error: any) => {
            const errData = error?.response?.data;
            const code = errData?.error_code;
            const msg = errData?.message || 'Template deletion failed!';
            if (code === 'NOT_FOUND') {
                toast.error('Template not found. It may have already been removed.');
            } else {
                toast.error(msg);
            }
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
            queryClient.invalidateQueries({ queryKey: ['deletedTemplates'] });
            toast.success(data?.message || 'Template restored. Syncing status with Meta…');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Template restoration failed!')
        }
    })
}

export const useGetTemplateByIdQuery = (template_id: any) => {
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: ['template', template_id],
        queryFn: () => templateApis.getTemplateById(template_id),
        enabled: !!template_id,
        initialData: () => {
            if (!template_id) return undefined;
            const listData = queryClient.getQueryData<any>(['templates']);
            const found = listData?.data?.templates?.find((t: any) => t.template_id === template_id);
            if (!found) return undefined;
            return { data: found };
        },
        initialDataUpdatedAt: () => queryClient.getQueryState(['templates'])?.dataUpdatedAt,
    })
}

export const useGenerateAiTemplateMutation = () => {
    return useMutation({
        mutationFn: (data: any) => {
            return templateApis.generateAiTemplate(data)
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to generate AI template');
        }
    })
}

export const useGetDeletedTemplatesQuery = () => {
    return useQuery({
        queryKey: ['deletedTemplates'],
        queryFn: () => templateApis.getDeletedTemplates(),
        staleTime: 0,
    })
}

/** Normalize any API response shape into a flat Template array */
export const normalizeDeletedTemplates = (payload: any): any[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.templates)) return payload.templates;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data) {
        if (Array.isArray(payload.data.templates)) return payload.data.templates;
        if (Array.isArray(payload.data.items)) return payload.data.items;
    }
    return [];
};

export const useUploadTemplateMediaMutation = () => {
    return useMutation({
        mutationFn: ({ file, type }: { file: File; type: 'image' | 'video' | 'document' }) => {
            return templateApis.uploadMedia(file, type);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Media upload failed!');
        }
    });
}