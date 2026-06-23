import { _axios } from "@/helper/axios";

export interface CustomReminderDto {
    label?: string;
    scheduled_date: string;
    /** HH:mm 24-hour format, e.g. "14:30" */
    scheduled_time: string;
    template_id: string;
    template_name?: string;
    header_media_url?: string | null;
    header_file_name?: string | null;
}

/** Shape returned by GET — all optional for backward compat with legacy rows */
export interface ReminderRule {
    id?: number;
    tenant_id?: string;
    rule_name?: string;
    rule_type?: "fixed_day_time" | "relative_before" | null;
    days_before?: number | null;
    send_time?: string | null;
    hours_before?: number | null;
    minutes_before?: number | null;
    offset_minutes?: number | null;
    template_id: string;
    header_media_url?: string | null;
    header_file_name?: string | null;
    sort_order?: number;
    is_active?: boolean;
}

/** Shape sent to PUT — rule_name and template_id are required */
export interface ReminderRulePayload {
    rule_name: string;
    rule_type: "fixed_day_time" | "relative_before" | null;
    days_before: number | null;
    send_time: string | null;
    hours_before: number | null;
    minutes_before: number | null;
    offset_minutes: number | null;
    template_id: string;
    header_media_url?: string | null;
    header_file_name?: string | null;
    sort_order: number;
    is_active: boolean;
}

export interface CreateAppointmentDto {
    patient_name: string;
    country_code?: string;
    contact_number: string;
    appointment_date: string;
    appointment_time: string;
    contact_id?: string;
    lead_id?: string;
    doctor_id?: string;
    status?: string;
    notes?: string;
    age?: number;
    email?: string;
    type?: string;
    reminder_mode?: "default" | "custom" | "none";
    custom_reminders?: CustomReminderDto[];
}

export interface UpdateAppointmentStatusDto {
    status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | "Noshow";
}

export interface UpdateAppointmentDto {
    patient_name?: string;
    country_code?: string;
    contact_number?: string;
    appointment_date?: string;
    appointment_time?: string;
    doctor_id?: string;
    status?: string;
    notes?: string;
    age?: number;
    type?: string;
    email?: string;
}

export interface CreateAppointmentOutcomeDto {
    appointment_id: string;
    notes: string;
    follow_up_required: boolean;
    follow_up_date?: string | null;
    follow_up_type?: "Call" | "Visit" | "WhatsApp" | null;
}

export interface CompleteWithOutcomeDto {
    appointment_id: string;
    notes: string;
    follow_up_required: boolean;
    follow_up_date?: string | null;
    follow_up_time?: string | null;
    follow_up_type?: "Call" | "WhatsApp" | null;
    follow_up_reason?: "Revisit" | "Enquiry" | null;
    template_id?: string | null;
    header_media_url?: string | null;
    header_file_name?: string | null;
}

export interface NoShowWithActionDto {
    appointment_id: string;
    mode: "manual" | "default";
    follow_up_date?: string | null;
    follow_up_time?: string | null;
    follow_up_type?: "Call" | "WhatsApp" | null;
    template_id: string | null;
    header_media_url?: string | null;
    header_file_name?: string | null;
}

export interface FollowUpHubFilters {
    search?: string;
    type?: "Call" | "Visit" | "WhatsApp";
    status?: "pending" | "sent" | "failed";
    send_type?: "follow_up" | "noshow" | "appointment_reminder";
    date_from?: string;
    date_to?: string;
}

export interface ScheduledMessageInfo {
    id: number;
    status: "pending" | "sent" | "failed";
    scheduled_at: string;
    sent_at: string | null;
    error_log: string | null;
    template_name: string | null;
    template_id?: string | null;
    template_type?: string | null;
    template_header_type?: string | null;
    header_type?: "text" | "image" | "video" | "document" | null;
    header_media_url?: string | null;
    header_file_name?: string | null;
    media_url?: string | null;
    rendered_message?: string | null;
    rendered_preview?: string | null;
    message_preview?: string | null;
    meta_message_id?: string | null;
    retry_count?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
}

export interface FollowUpHubRow {
    outcome_id: number;
    appointment_id: string;
    contact_id?: string | null;
    patient_name: string;
    phone: string;
    appointment_date: string;
    appointment_status: string;
    doctor_name: string | null;
    follow_up_date: string;
    follow_up_time: string;
    follow_up_type: "Call" | "Visit" | "WhatsApp";
    follow_up_reason: "Revisit" | "Enquiry" | null;
    notes: string;
    send_type: "follow_up" | "noshow" | "appointment_reminder" | null;
    template_id?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    scheduled_message: ScheduledMessageInfo | null;
}

// ── Appointment Reminders ──────────────────────────────────────────────────────

export interface AppointmentReminderFilters {
    patient_search?: string;
    status?: "pending" | "sent" | "failed";
    date_from?: string;
    date_to?: string;
    doctor_id?: string;
    appointment_id?: string;
    page?: number;
    limit?: number;
}

export interface AppointmentReminderItem {
    id: number;
    scheduled_message_id: number;
    appointment_id: string;
    contact_id: string | null;
    template_id: string | null;
    to_phone: string;
    send_type: string;
    scheduled_at: string;
    status: "pending" | "sent" | "failed";
    sent_at: string | null;
    meta_message_id: string | null;
    error_log: string | null;
    retry_count: number;
    rendered_message?: string | null;
    rendered_preview?: string | null;
    message_preview?: string | null;
    header_media_url?: string | null;
    header_file_name?: string | null;
    created_at: string | null;
    updated_at?: string | null;
    appointment: {
        appointment_id: string;
        appointment_date: string;
        appointment_time: string | null;
        status: string;
        doctor_id: string | null;
        branch_name: string | null;
        patient_name: string | null;
    } | null;
    contact: {
        contact_id: string;
        name: string | null;
        phone: string | null;
        country_code: string | null;
    } | null;
    doctor: {
        doctor_id: string | null;
        name: string | null;
        title: string | null;
    } | null;
    template: {
        template_id: string;
        template_name: string | null;
        template_type: string | null;
    } | null;
}

export interface AppointmentReminderListResponse {
    items: AppointmentReminderItem[];
    total: number;
    page: number;
    limit: number;
}

export class AppointmentApiData {
    getAllAppointments = async (params?: { search?: string; status?: string; date?: string; doctor_id?: string; lead_id?: string }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.status) query.set("status", params.status);
        if (params?.date) query.set("date", params.date);
        if (params?.doctor_id) query.set("doctor_id", params.doctor_id);
        if (params?.lead_id) query.set("lead_id", params.lead_id);
        const qs = query.toString();
        return await _axios("get", `/whatsapp/appointment${qs ? `?${qs}` : ""}`);
    };

    createAppointment = async (data: CreateAppointmentDto) => {
        return await _axios("post", "/whatsapp/appointment", data);
    };

    updateAppointmentStatus = async (appointmentId: string, data: UpdateAppointmentStatusDto) => {
        return await _axios("patch", `/whatsapp/appointment/status/${appointmentId}`, data);
    };

    checkAvailability = async (doctor_id: string, date: string, time: string) => {
        return await _axios("get", `/whatsapp/appointment/availability?doctor_id=${doctor_id}&date=${date}&time=${encodeURIComponent(time)}`);
    };

    getAvailableSlots = async (doctor_id: string, date: string) => {
        return await _axios("get", `/whatsapp/appointment/slots?doctor_id=${doctor_id}&date=${date}`);
    };

    getContactAppointments = async (contactId: string) => {
        return await _axios("get", `/whatsapp/appointment/contact/${contactId}`);
    };

    updateAppointment = async (appointmentId: string, data: UpdateAppointmentDto) => {
        return await _axios("put", `/whatsapp/appointment/${appointmentId}`, data);
    };

    deleteAppointment = async (appointmentId: string) => {
        return await _axios("delete", `/whatsapp/appointment/${appointmentId}`);
    };

    createAppointmentOutcome = async (data: CreateAppointmentOutcomeDto) => {
        return await _axios("post", "/whatsapp/appointment-outcome", data);
    };

    completeWithOutcome = async (data: CompleteWithOutcomeDto) => {
        return await _axios("post", "/whatsapp/appointment/complete-with-outcome", data);
    };

    noShowWithAction = async (data: NoShowWithActionDto) => {
        return await _axios("post", "/whatsapp/appointment/noshow-with-action", data);
    };

    getFollowUpHub = async (filters?: FollowUpHubFilters) => {
        const query = new URLSearchParams();
        if (filters?.search) query.set("search", filters.search);
        if (filters?.type) query.set("type", filters.type);
        if (filters?.status) query.set("status", filters.status);
        if (filters?.send_type) query.set("send_type", filters.send_type);
        if (filters?.date_from) query.set("date_from", filters.date_from);
        if (filters?.date_to) query.set("date_to", filters.date_to);
        const qs = query.toString();
        return await _axios("get", `/whatsapp/followup-hub${qs ? `?${qs}` : ""}`);
    };

    getAppointmentReminders = async (appointmentId: string) => {
        return await _axios("get", `/whatsapp/appointment/${appointmentId}/reminders`);
    };

    updateAppointmentReminders = async (appointmentId: string, data: { reminder_mode: "default" | "custom" | "none"; custom_reminders?: CustomReminderDto[] }) => {
        return await _axios("put", `/whatsapp/appointment/${appointmentId}/reminders`, data);
    };

    getFollowUpHubDetail = async (id: string | number) => {
        return await _axios("get", `/whatsapp/followup-hub/${id}`);
    };

    getPendingFollowUpCount = async () => {
        return await _axios("get", "/whatsapp/followup-hub/pending-count");
    };

    retryFollowUp = async (id: number) => {
        return await _axios("patch", `/whatsapp/followup-hub/${id}/retry`);
    };

    rescheduleFollowUp = async (id: number, scheduled_at: string) => {
        return await _axios("patch", `/whatsapp/followup-hub/${id}/reschedule`, { scheduled_at });
    };

    sendNowFollowUp = async (id: number) => {
        return await _axios("post", `/whatsapp/followup-hub/${id}/send-now`);
    };

    getReminderRules = async (): Promise<{ success: boolean; data: ReminderRule[] }> => {
        return await _axios("get", "/whatsapp/appointment-reminder-rules");
    };

    upsertReminderRules = async (rules: ReminderRulePayload[]) => {
        return await _axios("put", "/whatsapp/appointment-reminder-rules", { rules });
    };

    getReminders = async (filters?: AppointmentReminderFilters): Promise<AppointmentReminderListResponse> => {
        const query = new URLSearchParams();
        if (filters?.patient_search) query.set("patient_search", filters.patient_search);
        if (filters?.status) query.set("status", filters.status);
        if (filters?.date_from) query.set("date_from", filters.date_from);
        if (filters?.date_to) query.set("date_to", filters.date_to);
        if (filters?.doctor_id) query.set("doctor_id", filters.doctor_id);
        if (filters?.appointment_id) query.set("appointment_id", filters.appointment_id);
        if (filters?.page != null) query.set("page", String(filters.page));
        if (filters?.limit != null) query.set("limit", String(filters.limit));
        const qs = query.toString();
        return await _axios("get", `/whatsapp/reminders${qs ? `?${qs}` : ""}`);
    };

    getReminderDetail = async (id: number): Promise<{ success: boolean; data: AppointmentReminderItem }> => {
        return await _axios("get", `/whatsapp/reminders/${id}`);
    };
}
