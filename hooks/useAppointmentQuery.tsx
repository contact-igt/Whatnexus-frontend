import { AppointmentApiData, CompleteWithOutcomeDto, CreateAppointmentDto, CreateAppointmentOutcomeDto, NoShowWithActionDto, UpdateAppointmentStatusDto, UpdateAppointmentDto, ReminderRulePayload } from "@/services/appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useSelector } from "react-redux";

const appointmentApis = new AppointmentApiData();

export const useGetAllAppointmentsQuery = (params?: { search?: string; status?: string; date?: string; doctor_id?: string; lead_id?: string }) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["appointments", tenantId, params],
        queryFn: () => appointmentApis.getAllAppointments(params),
        staleTime: 30 * 1000,
    });
};

export const useGetContactAppointmentsQuery = (contactId: string) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["appointments", tenantId, "contact", contactId],
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
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
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
        onSuccess: (data, variables) => {
            const nextStatus = variables?.data?.status;
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            if (nextStatus === "Confirmed") {
                toast.success("Appointment confirmed. Email sent to patient.");
            } else if (nextStatus === "Cancelled") {
                toast.success("Appointment cancelled. Patient notified by email.");
            } else {
                toast.success(data?.message || "Appointment status updated.");
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update status.");
        },
    });
};

export const useCheckAvailabilityQuery = (doctor_id: string, date: string, time: string) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["appointment-availability", tenantId, doctor_id, date, time],
        queryFn: () => appointmentApis.checkAvailability(doctor_id, date, time),
        enabled: !!doctor_id && !!date && !!time,
    });
};

export const useGetAvailableSlotsQuery = (doctor_id: string, date: string) => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["appointment-slots", tenantId, doctor_id, date],
        queryFn: () => appointmentApis.getAvailableSlots(doctor_id, date),
        enabled: !!doctor_id && !!date,
    });
};

export const useUpdateAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: UpdateAppointmentDto }) =>
            appointmentApis.updateAppointment(appointmentId, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
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
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "Appointment cancelled. Patient notified by email.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete appointment.");
        },
    });
};

export const useCreateAppointmentOutcomeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAppointmentOutcomeDto) => appointmentApis.createAppointmentOutcome(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "Visit outcome saved successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to save visit outcome.");
        },
    });
};

export const useCompleteWithOutcomeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CompleteWithOutcomeDto) => appointmentApis.completeWithOutcome(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "Appointment completed successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to complete appointment.");
        },
    });
};

export const useGetReminderRulesQuery = () => {
    const tenantId = useSelector((state: any) => state.auth?.user?.tenant_id);
    return useQuery({
        queryKey: ["appointment-reminder-rules", tenantId],
        queryFn: () => appointmentApis.getReminderRules(),
        staleTime: 60 * 1000,
    });
};

export const useUpsertReminderRulesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (rules: ReminderRulePayload[]) => appointmentApis.upsertReminderRules(rules),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointment-reminder-rules"] });
            toast.success("Reminder rules saved successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to save reminder rules.");
        },
    });
};

export const useUpdateAppointmentRemindersMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: { reminder_mode: "default" | "custom" | "none"; custom_reminders?: any[] } }) =>
            appointmentApis.updateAppointmentReminders(appointmentId, data),
        onSuccess: (data, variables) => {
            const appointmentId = (variables as any)?.appointmentId;
            if (appointmentId) {
                queryClient.invalidateQueries({ queryKey: ["appointment-reminders", appointmentId] });
            }
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success(data?.message || "Reminders updated successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update reminders.");
        },
    });
};

export const useNoShowWithActionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: NoShowWithActionDto) => appointmentApis.noShowWithAction(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "No-show handled successfully.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to handle no-show.");
        },
    });
};
