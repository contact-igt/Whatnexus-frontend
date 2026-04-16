import { useAuth } from "@/redux/selectors/auth/authSelector";
import { whatsappConfigApiData } from "@/services/whatsappConfiguration";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useDispatch } from "react-redux";
import { setWhatsAppApiDetails } from "@/redux/slices/auth/authSlice";
import { useEffect } from "react";

const whatsappConfigApis = new whatsappConfigApiData();

export const useGetTierLimitQuery = () => {
    const { token, user } = useAuth();
    return useQuery({
        queryKey: ['whatsapp-tier-limit'],
        enabled: !!token && (user?.role !== 'super_admin' && user?.role !== 'platform_admin'),
        queryFn: () => whatsappConfigApis.getTierLimit(),
        staleTime: 5 * 60 * 1000,
        retry: false,
        select: (res) => res?.data?.data,
    });
};

export const useGetWhatsappConfigQuery = () => {
    const dispatch = useDispatch();
    const { token, user } = useAuth();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['whatsapp-config'],
        enabled: !!token && (user?.role !== 'super_admin' && user?.role !== 'platform_admin'),
        queryFn: () => whatsappConfigApis.getWhatsAppConfig(),
        staleTime: 2 * 60 * 1000,
        retry: false,
    })
    useEffect(() => {
        if (data?.data) {
            dispatch(setWhatsAppApiDetails(data.data));
        }
    }, [data, dispatch]);

    // Clear stale WhatsApp status from Redux when the API errors (e.g. 404 account not found)
    useEffect(() => {
        if (isError) {
            dispatch(setWhatsAppApiDetails(null));
        }
    }, [isError, dispatch]);

    return { data, isLoading, isError, refetch }
}

export const useSaveWhatsAppConfigMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ data }: { data: any }) => {
            console.log("datahook", data)
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
        mutationFn: (data: any) => {
            return whatsappConfigApis.testWhatsAppConfig(data);
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

export const useSendTestWhatsAppConfigQuery = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => {
            console.log("data", data)
            return whatsappConfigApis.sendTestWhatsAppConfig(data);
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

export const useUpdateAccessTokenMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { access_token: string }) => {
            return whatsappConfigApis.updateAccessToken(data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['whatsapp-config'] });
            toast.success(response?.data?.message || response?.message || 'Access token updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to update access token');
        },
    });
};

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