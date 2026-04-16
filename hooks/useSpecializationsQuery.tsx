import { specializationApiData } from "@/services/specialization"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/lib/toast"

const specializationsApis = new specializationApiData()

export const useGetAllSpecializationsQuery = () => {
    return useQuery({
        queryKey: ['specializations'],
        queryFn: () => specializationsApis.getAllSpecialization()
    })
}

export const useCreateSpecializationMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: any) => specializationsApis.createSpecialization(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specializations'] })
            toast.success("Specialization created successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create specialization")
        }
    })
}

export const useUpdateSpecializationMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => specializationsApis.updateSpecialization(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specializations'] })
            toast.success("Specialization updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update specialization")
        }
    })
}

export const useDeleteSpecializationMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => specializationsApis.deleteSpecialization(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specializations'] })
            toast.success("Specialization deleted successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete specialization")
        }
    })
}

export const useToggleSpecializationStatusMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => specializationsApis.toggleSpecializationStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specializations'] })
            toast.success("Status updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update status")
        }
    })
}

export const useGetDeletedSpecializationsQuery = () => {
    return useQuery({
        queryKey: ['deleted-specializations'],
        queryFn: () => specializationsApis.getDeletedSpecializations()
    })
}

export const useRestoreSpecializationMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => specializationsApis.restoreSpecialization(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['specializations'] })
            queryClient.invalidateQueries({ queryKey: ['deleted-specializations'] })
            toast.success("Specialization restored successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to restore specialization")
        }
    })
}

export const usePermanentDeleteSpecializationMutation = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => specializationsApis.permanentDeleteSpecialization(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-specializations'] })
            toast.success("Specialization permanently deleted")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to permanently delete specialization")
        }
    })
}