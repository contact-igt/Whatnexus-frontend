import { useAuth } from "@/redux/selectors/auth/authSelector";
import { whatsappConfigApiData } from "@/services/whatsappConfiguration";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const whatsappConfigApis = new whatsappConfigApiData();

export const useGetWhatsappConfigQuery = () => {
    const { token } = useAuth();
    const { data, isLoading, isError } = useQuery({
        queryKey: ['whatsapp-config'],
        enabled: !!token,
        queryFn: () => whatsappConfigApis.getWhatsAppConfig(),
        staleTime: 2 * 60 * 1000,
    })

    if (isError) {
        toast.error('Failed to load WhatsApp configuration')
    }

    return { data, isLoading, isError }
}

export const useSaveWhatsAppConfigMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data }: { data: any }) => {
            return whatsappConfigApis.saveWhatsappConfig(data);
        },
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp-config'] });
            toast.success(response?.data?.message || response?.message || 'WhatsApp configuration saved successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to save WhatsApp configuration');
        },
    });
};

export const useTestWhatsAppConfigQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => {
            return whatsappConfigApis.testWhatsAppConfig();
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp-config'] })
            toast.success(response?.data?.message || response?.message || "WhatsApp configuration test successful")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "WhatsApp configuration test failed")
        }
    })
}

export const useStatusWhatsAppConfigQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => {
            return whatsappConfigApis.updateStatusWhatsappConfig(id, data?.status ?? "");
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp-config'] })
            toast.success(response?.data?.message || response?.message || "WhatsApp configuration status updated successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "WhatsApp configuration status updated failed")
        }
    })
}