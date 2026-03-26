import { promptApiData } from "@/services/prompt";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import { TenantApiData } from "@/services/tenant";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setAuthData } from "@/redux/slices/auth/authSlice";

const TenantApis = new TenantApiData();

export const useCreateTenantMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => {
            return TenantApis.createTenant(data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['onboarded-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
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
        mutationFn: ({ tenantId, data }: { tenantId: string; data: any }) => {
            return TenantApis.updateTenant(tenantId, data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['onboarded-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
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
        mutationFn: ({ tenantId, data }: { tenantId: string, data: any }) => {
            return TenantApis.updateTenantStatus(tenantId, data);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['onboarded-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
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
        mutationFn: (tenantId: string) => {
            return TenantApis.softDeleteTenant(tenantId);
        },
        onSuccess: (response: any, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['onboarded-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
            toast.success(response?.data?.message || response?.message || 'Organization deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to delete organization');
        },
    });
};


export const useResendInvitationMutation = () => {
    return useMutation({
        mutationFn: (tenantUserId: string) => {
            return TenantApis.resendInvitation(tenantUserId);
        },
        onSuccess: (response: any) => {
            toast.success(response?.data?.message || response?.message || 'Invitation resent successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to resend invitation');
        },
    });
};

export const usePermanentDeleteTenantMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tenantId: string) => {
            return TenantApis.permanentDeleteTenant(tenantId);
        },
        onSuccess: (response: any, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['onboarded-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-invitations'] });
            toast.success(response?.data?.message || response?.message || 'Organization deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to delete organization');
        },
    });
};

export const useGetOnboardedTenantsQuery = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['onboarded-tenants'],
        queryFn: () => TenantApis.getOnboardedTenants(),
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error instanceof Error ? error.message : 'Failed to load onboarded tenants');
        }
    }, [isError, error]);

    return { data, isLoading, isError };
};

export const useGetTenantInvitationsQuery = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['tenant-invitations'],
        queryFn: () => TenantApis.getTenantInvitations(),
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error instanceof Error ? error.message : 'Failed to load tenant invitations');
        }
    }, [isError, error]);

    return { data, isLoading, isError };
};

export const useGetDeletedTenantsQuery = () => {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['deleted-tenants'],
        queryFn: () => TenantApis.getDeletedTenants(),
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error instanceof Error ? error.message : 'Failed to load deleted tenants');
        }
    }, [isError, error]);

    return { data, isLoading, isError };
};

export const useRestoreTenantMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tenantId: string) => {
            return TenantApis.restoreTenant(tenantId);
        },
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['onboarded-tenants'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-tenants'] });
            toast.success(response?.data?.message || response?.message || 'Organization restored successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to restore organization');
        },
    });
};

