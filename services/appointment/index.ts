import { _axios } from "@/helper/axios";

export interface CreateAppointmentDto {
    patient_name: string;
    country_code?: string;
    contact_number: string;
    appointment_date: string;
    appointment_time: string;
    contact_id?: string;
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

export class AppointmentApiData {
    getAllAppointments = async (params?: { search?: string; status?: string; date?: string; doctor_id?: string }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set("search", params.search);
        if (params?.status) query.set("status", params.status);
        if (params?.date) query.set("date", params.date);
        if (params?.doctor_id) query.set("doctor_id", params.doctor_id);
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
}
