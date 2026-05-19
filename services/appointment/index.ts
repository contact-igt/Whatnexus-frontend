import { _axios } from "@/helper/axios";

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
}

export interface NoShowWithActionDto {
    appointment_id: string;
    mode: "manual" | "default";
    follow_up_date?: string | null;
    follow_up_time?: string | null;
    follow_up_type?: "Call" | "WhatsApp" | null;
    template_id: string | null;
}

export interface FollowUpHubFilters {
    search?:    string;
    type?:      "Call" | "WhatsApp";
    status?:    "pending" | "sent" | "failed";
    send_type?: "follow_up" | "noshow";
    date_from?: string;
    date_to?:   string;
}

export interface ScheduledMessageInfo {
    id:            number;
    status:        "pending" | "sent" | "failed";
    scheduled_at:  string;
    sent_at:       string | null;
    error_log:     string | null;
    template_name: string | null;
}

export interface FollowUpHubRow {
    outcome_id:         number;
    appointment_id:     string;
    patient_name:       string;
    phone:              string;
    appointment_date:   string;
    appointment_status: string;
    doctor_name:        string | null;
    follow_up_date:     string;
    follow_up_time:     string;
    follow_up_type:     "Call" | "WhatsApp";
    follow_up_reason:   "Revisit" | "Enquiry" | null;
    notes:              string;
    send_type:          "follow_up" | "noshow" | null;
    scheduled_message:  ScheduledMessageInfo | null;
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
        if (filters?.search)    query.set("search",    filters.search);
        if (filters?.type)      query.set("type",      filters.type);
        if (filters?.status)    query.set("status",    filters.status);
        if (filters?.send_type) query.set("send_type", filters.send_type);
        if (filters?.date_from) query.set("date_from", filters.date_from);
        if (filters?.date_to)   query.set("date_to",   filters.date_to);
        const qs = query.toString();
        return await _axios("get", `/whatsapp/followup-hub${qs ? `?${qs}` : ""}`);
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
}
