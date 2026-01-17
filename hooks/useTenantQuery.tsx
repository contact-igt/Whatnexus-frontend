import { promptApiData } from "@/services/prompt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import { TenantApiData } from "@/services/tenant";

const TenantApis = new TenantApiData();

export const useCreateTenantMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => {
            return TenantApis.createTenant(data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            toast.success(response?.data?.message || response?.message);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to create tenant');
        },
    });
};

export const useUpdateTenantMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => {
            return TenantApis.updateTenant(id, data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            toast.success(response?.data?.message || response?.message || 'Tenant updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to update tenant');
        },
    });
};

export const useTenantStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => {
            return TenantApis.updateTenantStatus(id, data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            toast.success(response?.data?.message || response?.message || 'Tenant status updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to update tenant');
        },
    })
}


export const useTestWhatsAppConnectionMutation = () => {
    return useMutation({
        mutationFn: ({ tenantId, data }: { tenantId: string; data: any }) => {
            return TenantApis.testWhatsAppConnection(tenantId, data);
        },
        onSuccess: (response) => {
            toast.success(response?.data?.message || response?.message || 'Connection successful!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Connection failed');
        },
    });
};

export const useGetTenantsQuery = () => {

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['tenants'],
        queryFn: () => TenantApis.getAllTenants(),
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error instanceof Error ? error.message : 'Failed to load tenants');
        }
    }, [isError, error]);

    return { data, isLoading, isError };
};

export const useDeleteTenantMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => {
            return TenantApis.deleteTenant(id);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            toast.success(response?.data?.message || response?.message || 'Organization deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to delete organization');
        },
    });
};