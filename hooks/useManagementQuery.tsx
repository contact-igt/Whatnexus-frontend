import { managementApiData } from "@/services/management"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";


const managementApis = new managementApiData();

export const useManagementQuery = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["management"],
        queryFn: () => managementApis.getAllManagement(),
        staleTime: 2 * 60 * 1000,
    })

    if (isError) {
        toast.error("Failed to load management")
    }

    return { data, isLoading, isError }
}


export const useCreateManagementMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => managementApis.createManagement(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["management"],
            });
            toast.success("Management user created successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to create management user")
        }
    })
}

export const useUpdateManagementMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ managementId, data }: { managementId: string, data: any }) => managementApis.updateManagement(managementId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["management"],
            });
            toast.success("Management user updated successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update management user")
        }
    })
}



export const useGetManagementByIdQuery = (managementId: string) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["management", managementId],
        queryFn: () => managementApis.getManagementById(managementId),
        staleTime: 2 * 60 * 1000,
        enabled: !!managementId,
    })

    if (isError) {
        toast.error("Failed to load management user")
    }

    return { data, isLoading, isError }
}

export const useGetManagementProfileQuery = () => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["management-profile"],
        queryFn: () => managementApis.getManagementProfile(),
        staleTime: 2 * 60 * 1000,
    })

    if (isError) {
        toast.error("Failed to load profile")
    }

    return { data, isLoading, isError, refetch }
}
export const useGetManagementDeletedListQuery = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["management-deleted-list"],
        queryFn: () => managementApis.getManagementDeletedList(),
        staleTime: 2 * 60 * 1000,
    })

    if (isError) {
        toast.error("Failed to load deleted list")
    }

    return { data, isLoading, isError }
}
export const useSoftDeleteManagementMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (managementId: string) => managementApis.softDeleteManagement(managementId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["management"],
            });
            queryClient.invalidateQueries({
                queryKey: ["management-deleted-list"],
            });
            toast.success("Management user deleted successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to delete management user")
        }
    })
}

export const usePermanentDeleteManagementMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (managementId: string) => managementApis.permanentDeleteManagement(managementId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["management"],
            });
            queryClient.invalidateQueries({
                queryKey: ["management-deleted-list"],
            });
            toast.success("Management user permanently deleted")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to delete management user")
        }
    })
}

export const useRestoreManagementMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (managementId: string) => managementApis.restoreManagement(managementId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["management"],
            });
            queryClient.invalidateQueries({
                queryKey: ["management-deleted-list"],
            });
            toast.success("Management user restored successfully")
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error?.message || "Failed to restore management user")
        }
    })
}
