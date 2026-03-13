import { AppointmentApiData, CreateAppointmentDto, UpdateAppointmentStatusDto, UpdateAppointmentDto } from "@/services/appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const appointmentApis = new AppointmentApiData();

export const useGetAllAppointmentsQuery = (params?: { search?: string; status?: string; date?: string }) => {
    return useQuery({
        queryKey: ["appointments", params],
        queryFn: () => appointmentApis.getAllAppointments(params),
    });
};

export const useGetContactAppointmentsQuery = (contactId: string) => {
    return useQuery({
        queryKey: ["appointments", "contact", contactId],
        queryFn: () => appointmentApis.getContactAppointments(contactId),
        enabled: !!contactId,
    });
};

export const useCreateAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAppointmentDto) => appointmentApis.createAppointment(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success(data?.message || "Appointment created successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create appointment.");
        },
    });
};

export const useUpdateAppointmentStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: UpdateAppointmentStatusDto }) =>
            appointmentApis.updateAppointmentStatus(appointmentId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success(data?.message || "Status updated successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update status.");
        },
    });
};

export const useCheckAvailabilityQuery = (doctor_id: string, date: string, time: string) => {
    return useQuery({
        queryKey: ["appointment-availability", doctor_id, date, time],
        queryFn: () => appointmentApis.checkAvailability(doctor_id, date, time),
        enabled: !!doctor_id && !!date && !!time,
    });
};

export const useUpdateAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: UpdateAppointmentDto }) =>
            appointmentApis.updateAppointment(appointmentId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success(data?.message || "Appointment updated successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update appointment.");
        },
    });
};

export const useDeleteAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (appointmentId: string) => appointmentApis.deleteAppointment(appointmentId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success(data?.message || "Appointment deleted successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete appointment.");
        },
    });
};
