import { doctorApiData, CreateDoctorDto, UpdateDoctorDto } from "@/services/doctor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
    return useQuery({
        queryKey: ['doctors', params],
        queryFn: () => doctorApis.getAllDoctors()
    });
};

export const useGetDoctorByIdQuery = (doctorId: string) => {
    return useQuery({
        queryKey: ['doctor', doctorId],
        queryFn: () => doctorApis.getDoctorById(doctorId),
        enabled: !!doctorId
    });
};

export const useUpdateDoctorMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ doctorId, data }: { doctorId: string; data: UpdateDoctorDto }) => {
            return doctorApis.updateDoctor(doctorId, data);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['doctors'] });
            queryClient.invalidateQueries({ queryKey: ['doctor', variables.doctorId] });
            toast.success(data?.message || 'Doctor updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Doctor update failed!');
        }
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
    return useQuery({
        queryKey: ['deleted-doctors', params],
        queryFn: () => doctorApis.getDeletedDoctors()
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
