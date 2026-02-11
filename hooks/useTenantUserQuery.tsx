import { setAuthData } from "@/redux/slices/auth/authSlice";
import { tenantUserApiData } from "@/services/tenantUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";


const tenantUserApis = new tenantUserApiData();

export const useTenantUserQuery = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["tenant-user"],
        queryFn: () => tenantUserApis.getAllTenantUser(),
        staleTime: 2 * 60 * 1000,
    })

    if (isError) {
        toast.error("Failed to load management")
    }

    return { data, isLoading, isError }
}


// ================= Tenant User ==================

export const useTenantUserLoginMutation = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => {
            return tenantUserApis.loginTenantUser(data);
        },
        onSuccess: (response: any, variables: any) => {
            dispatch(setAuthData({
                token: variables.rememberMe === true ? response?.tokens?.refreshToken : response?.tokens?.accessToken,
                refreshToken: response?.tokens?.refreshToken,
                user: response?.user
            }))
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            toast.success(response?.data?.message || response?.message || 'Tenant user login successful');
            router.replace("/dashboard");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to login tenant user');
        },
    })
}

// export const useGetWebhookStatusQuery = (tenantId: string) => {
//     const { data, isLoading, isError, refetch } = useQuery({
//         queryKey: ['webhook-status', tenantId],
//         queryFn: () => tenantUserApis.getWebhookStatus(tenantId),
//         enabled: !!tenantId,
//         staleTime: 5 * 60 * 1000, // 5 minutes
//     });

//     if (isError) {
//         toast.error('Failed to check webhook status');
//     }

//     return { data, isLoading, isError, refetch };
// };

export const useCreateTenantUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => tenantUserApis.createTenantUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["tenant-user"],
            });
            toast.success("Tenant user created successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to create tenant user")
        }
    })
}

export const useUpdateTenantUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ tenantUserId, data }: { tenantUserId: string, data: any }) => tenantUserApis.updateTenantUser(tenantUserId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["tenant-user"],
            });
            toast.success("Tenant user updated successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update tenant user")
        }
    })
}

export const useSoftDeleteTenantUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tenantUserId: string) => tenantUserApis.softDeleteTenantUser(tenantUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["tenant-user"],
            });
            toast.success("Tenant user deleted successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to delete tenant user")
        }
    })
}

export const usePermanentDeleteTenantUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (tenantUserId: string) => tenantUserApis.permanentDeleteTenantUser(tenantUserId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["tenant-user"],
            });
            toast.success("Tenant user deleted successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to delete tenant user")
        }
    })
}

export const useGetTenantUserByIdQuery = (tenantUserId: string) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["tenant-user", tenantUserId],
        queryFn: () => tenantUserApis.getTenantUserById(tenantUserId),
        staleTime: 2 * 60 * 1000,
        enabled: !!tenantUserId,
    })

    if (isError) {
        toast.error("Failed to load management")
    }

    return { data, isLoading, isError }
}

export const useGetTenantProfileQuery = () => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["tenant-profile"],
        queryFn: () => tenantUserApis.getTenantProfile(),
        staleTime: 2 * 60 * 1000,
    })

    if (isError) {
        toast.error("Failed to load profile")
    }

    return { data, isLoading, isError, refetch }
}