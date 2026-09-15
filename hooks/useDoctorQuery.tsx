import { doctorApiData, CreateDoctorDto, UpdateDoctorDto } from "@/services/doctor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useSelector } from "react-redux";

const doctorApis = new doctorApiData();

export const useCreateDoctorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDoctorDto) => {
            return doctorApis.createDoctor(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            toast.success(data?.message || 'Doctor created successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Doctor creation failed!');
        }
    });
};

export const useGetAllDoctorsQuery = (params?: any) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ['doctors', tenantId, params],
        queryFn: () => doctorApis.getAllDoctors(params)
    });
};

export const useGetDoctorByIdQuery = (doctorId: string) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ['doctor', tenantId, doctorId],
        queryFn: () => doctorApis.getDoctorById(doctorId),
        enabled: !!doctorId
    });
};

// Recursively patch a doctor (matched by doctor_id/id) inside whatever shape the
// cached ['doctors'] response has: axios response, { data: { doctors|items } },
// a bare array, etc.
const patchDoctorInCache = (node: any, doctorId: string, patch: Record<string, any>): any => {
    if (Array.isArray(node)) {
        return node.map((d) =>
            d && (d.doctor_id === doctorId || d.id === doctorId) ? { ...d, ...patch } : d,
        );
    }
    if (node && typeof node === 'object') {
        const next: any = { ...node };
        for (const key of ['doctors', 'items', 'data']) {
            if (key in next) next[key] = patchDoctorInCache(next[key], doctorId, patch);
        }
        return next;
    }
    return node;
};

export const useUpdateDoctorMutation = () => {
    const queryClient = useQueryClient();
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useMutation({
        mutationFn: ({ doctorId, data }: { doctorId: string; data: UpdateDoctorDto }) => {
            return doctorApis.updateDoctor(doctorId, data);
        },
        // Optimistic update — the card reflects the new value immediately and
        // only rolls back if the request fails.
        onMutate: async ({ doctorId, data }) => {
            await queryClient.cancelQueries({ queryKey: ['doctors'] });
            const previous = queryClient.getQueriesData({ queryKey: ['doctors'] });
            queryClient.setQueriesData({ queryKey: ['doctors'] }, (old: any) =>
                old ? patchDoctorInCache(old, doctorId, data as Record<string, any>) : old,
            );
            return { previous };
        },
        onError: (error: any, _variables, context: any) => {
            context?.previous?.forEach(([key, value]: any) =>
                queryClient.setQueryData(key, value),
            );
            toast.error(error?.response?.data?.message || 'Doctor update failed!');
        },
        onSuccess: (data) => {
            toast.success(data?.message || 'Doctor updated successfully!');
        },
        // Reconcile with the server once, after the request settles.
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['doctor', tenantId, variables.doctorId] });
        },
    });
};

export const useDeleteDoctorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (doctorId: string) => {
            return doctorApis.deleteDoctor(doctorId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-doctors'] });
            toast.success(data?.message || 'Doctor deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Doctor deletion failed!');
        }
    });
};

export const useGetDeletedDoctorsQuery = (params?: any) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ['deleted-doctors', tenantId, params],
        queryFn: () => doctorApis.getDeletedDoctors(params)
    });
};

export const useRestoreDoctorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (doctorId: string) => {
            return doctorApis.restoreDoctor(doctorId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-doctors'] });
            toast.success(data?.message || 'Doctor restored successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Doctor restoration failed!');
        }
    });
};

export const usePermanentDeleteDoctorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (doctorId: string) => {
            return doctorApis.permanentDeleteDoctor(doctorId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-doctors'] });
            toast.success(data?.message || 'Doctor permanently deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Doctor permanent deletion failed!');
        }
    });
};

// --- Doctor <-> Branches hooks ---
export const useGetDoctorBranchesQuery = (
    doctorId: string,
    options?: { enabled?: boolean },
) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    const enabled = options?.enabled ?? true;
    return useQuery({
        queryKey: ['doctor-branches', tenantId, doctorId],
        queryFn: () => doctorApis.getDoctorBranches(doctorId),
        enabled: !!doctorId && enabled,
    });
};

export const useUpdateDoctorBranchesMutation = () => {
    const queryClient = useQueryClient();
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useMutation({
        mutationFn: ({ doctorId, data }: { doctorId: string; data: { branches: Array<{ branch_id: string; is_primary?: boolean }> } }) => {
            return doctorApis.updateDoctorBranches(doctorId, data);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['doctor', tenantId, variables.doctorId] });
            queryClient.invalidateQueries({ queryKey: ['doctor-branches', tenantId, variables.doctorId] });
            toast.success(data?.message || 'Doctor branches updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update doctor branches');
        }
    });
};
