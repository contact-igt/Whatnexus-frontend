import {
    AppointmentApiData,
    CompleteWithOutcomeDto,
    CreateAppointmentDto,
    CreateAppointmentOutcomeDto,
    CustomReminderDto,
    NoShowWithActionDto,
    ReminderRule,
    ReminderRulePayload,
    UpdateAppointmentStatusDto,
    UpdateAppointmentDto,
} from "@/services/appointment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const appointmentApis = new AppointmentApiData();

type AppointmentQueryParams = {
    search?: string;
    status?: string;
    date?: string;
    doctor_id?: string;
    lead_id?: string;
};

type AppointmentQueryOptions = {
    enabled?: boolean;
};

export interface Appointment {
    appointment_id: string;
    patient_name: string;
    country_code?: string | null;
    contact_number: string;
    contact_id?: string | null;
    lead_id?: string | null;
    age?: number | null;
    appointment_date: string;
    appointment_time: string;
    status: string;
    notes?: string | null;
    doctor_id?: string | null;
    doctor?: { doctor_id: string; name: string; title?: string | null } | null;
    token_number?: number | null;
    type?: string | null;
    email?: string | null;
    created_at?: string | null;
    createdAt?: string | null;
    patientName?: string | null;
    contact?: string | null;
    time?: string | null;
}

type AppointmentListResponse = {
    success?: boolean;
    data?: Appointment[];
    message?: string;
};

type MutationResponse = {
    success?: boolean;
    message?: string;
    data?: unknown;
};

type ReminderRulesResponse = {
    success: boolean;
    data: ReminderRule[];
};

type UpdateAppointmentRemindersPayload = {
    reminder_mode: "default" | "custom" | "none";
    custom_reminders?: CustomReminderDto[];
};

type UpdateAppointmentRemindersVariables = {
    appointmentId: string;
    data: UpdateAppointmentRemindersPayload;
};

type ErrorWithMessage = {
    message?: string;
    response?: {
        data?: {
            message?: string;
        };
    };
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (typeof error === "object" && error !== null) {
        const candidate = error as ErrorWithMessage;
        return candidate.response?.data?.message || candidate.message || fallbackMessage;
    }
    return fallbackMessage;
};

export const useGetAllAppointmentsQuery = (
    params?: AppointmentQueryParams,
    options?: AppointmentQueryOptions,
) => {
    const tenantId = useSelector((state: RootState) => state.auth.user?.tenant_id);
    const userType = useSelector((state: RootState) => state.auth.user?.user_type);
    const token = useSelector((state: RootState) => state.auth.token);

    return useQuery({
        queryKey: ["appointments", tenantId, params],
        queryFn: () => appointmentApis.getAllAppointments(params) as Promise<AppointmentListResponse>,
        staleTime: 30 * 1000,
        enabled:
            !!token &&
            userType === "tenant" &&
            !!tenantId &&
            (options?.enabled ?? true),
    });
};

export const useGetContactAppointmentsQuery = (contactId: string) => {
    const tenantId = useSelector((state: RootState) => state.auth.user?.tenant_id);
    return useQuery({
        queryKey: ["appointments", tenantId, "contact", contactId],
        queryFn: () => appointmentApis.getContactAppointments(contactId) as Promise<AppointmentListResponse>,
        enabled: !!contactId,
    });
};

export const useCreateAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAppointmentDto) => appointmentApis.createAppointment(data) as Promise<MutationResponse>,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "Appointment created successfully!");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to create appointment."));
        },
    });
};

export const useUpdateAppointmentStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: UpdateAppointmentStatusDto }) =>
            appointmentApis.updateAppointmentStatus(appointmentId, data) as Promise<MutationResponse>,
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
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to update status."));
        },
    });
};

export const useCheckAvailabilityQuery = (doctor_id: string, date: string, time: string) => {
    const tenantId = useSelector((state: RootState) => state.auth.user?.tenant_id);
    return useQuery({
        queryKey: ["appointment-availability", tenantId, doctor_id, date, time],
        queryFn: () => appointmentApis.checkAvailability(doctor_id, date, time) as Promise<MutationResponse>,
        enabled: !!doctor_id && !!date && !!time,
    });
};

export const useGetAvailableSlotsQuery = (doctor_id: string, date: string) => {
    const tenantId = useSelector((state: RootState) => state.auth.user?.tenant_id);
    return useQuery({
        queryKey: ["appointment-slots", tenantId, doctor_id, date],
        queryFn: () => appointmentApis.getAvailableSlots(doctor_id, date) as Promise<MutationResponse>,
        enabled: !!doctor_id && !!date,
    });
};

export const useUpdateAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: { appointmentId: string; data: UpdateAppointmentDto }) =>
            appointmentApis.updateAppointment(appointmentId, data) as Promise<MutationResponse>,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "Appointment updated successfully.");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to update appointment."));
        },
    });
};

export const useDeleteAppointmentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (appointmentId: string) => appointmentApis.deleteAppointment(appointmentId) as Promise<MutationResponse>,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "Appointment cancelled. Patient notified by email.");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to delete appointment."));
        },
    });
};

export const useCreateAppointmentOutcomeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateAppointmentOutcomeDto) => appointmentApis.createAppointmentOutcome(data) as Promise<MutationResponse>,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "Visit outcome saved successfully.");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to save visit outcome."));
        },
    });
};

export const useCompleteWithOutcomeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CompleteWithOutcomeDto) => appointmentApis.completeWithOutcome(data) as Promise<MutationResponse>,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "Appointment completed successfully.");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to complete appointment."));
        },
    });
};

export const useGetReminderRulesQuery = () => {
    const tenantId = useSelector((state: RootState) => state.auth.user?.tenant_id);
    return useQuery({
        queryKey: ["appointment-reminder-rules", tenantId],
        queryFn: () => appointmentApis.getReminderRules() as Promise<ReminderRulesResponse>,
        staleTime: 60 * 1000,
    });
};

export const useUpsertReminderRulesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (rules: ReminderRulePayload[]) => appointmentApis.upsertReminderRules(rules) as Promise<MutationResponse>,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointment-reminder-rules"] });
            toast.success("Reminder rules saved successfully.");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to save reminder rules."));
        },
    });
};

export const useUpdateAppointmentRemindersMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ appointmentId, data }: UpdateAppointmentRemindersVariables) =>
            appointmentApis.updateAppointmentReminders(appointmentId, data) as Promise<MutationResponse>,
        onSuccess: (data, variables) => {
            const appointmentId = variables?.appointmentId;
            if (appointmentId) {
                queryClient.invalidateQueries({ queryKey: ["appointment-reminders", appointmentId] });
            }
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast.success(data?.message || "Reminders updated successfully.");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to update reminders."));
        },
    });
};

export const useNoShowWithActionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: NoShowWithActionDto) => appointmentApis.noShowWithAction(data) as Promise<MutationResponse>,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["lead-intelligence"] });
            toast.success(data?.message || "No-show handled successfully.");
        },
        onError: (error: unknown) => {
            toast.error(getErrorMessage(error, "Failed to handle no-show."));
        },
    });
};
