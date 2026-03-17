import { AppointmentApiData, CreateAppointmentDto, UpdateAppointmentDto } from "@/services/appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const appointmentApis = new AppointmentApiData();

export const useCreateAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAppointmentDto) => {
            return appointmentApis.createAppointment(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success(data?.message || 'Appointment created successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Appointment creation failed!');
        }
    });
};

export const useGetAllAppointmentsQuery = (params?: any) => {
    return useQuery({
        queryKey: ['appointments', params],
        queryFn: () => appointmentApis.getAllAppointments(params)
    });
};

export const useUpdateAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: UpdateAppointmentDto }) => {
            return appointmentApis.updateAppointment(appointmentId, data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success(data?.message || 'Appointment updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Appointment update failed!');
        }
    });
};

export const useUpdateAppointmentStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: any }) => {
            return appointmentApis.updateAppointmentStatus(appointmentId, data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success(data?.message || 'Status updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Status update failed!');
        }
    });
};

export const useDeleteAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (appointmentId: string) => {
            return appointmentApis.deleteAppointment(appointmentId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            toast.success(data?.message || 'Appointment deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Appointment deletion failed!');
        }
    });
};

export const useCheckAvailabilityQuery = (doctorId: string, date: string, time: string) => {
    return useQuery({
        queryKey: ['availability', doctorId, date, time],
        queryFn: () => appointmentApis.checkAvailability(doctorId, date, time),
        enabled: !!doctorId && !!date && !!time
    });
};

export const useGetContactAppointmentsQuery = (contactId: string) => {
    return useQuery({
        queryKey: ['contact-appointments', contactId],
        queryFn: () => appointmentApis.getContactAppointments(contactId),
        enabled: !!contactId
    });
};
