import { _axios } from "@/helper/axios";

export interface Doctor {
    doctor_id: string;
    title?: string;
    name: string;
    specializations?: string[] | { specialization_id: string; name: string }[];
    specialization?: string[] | { specialization_id: string; name: string }[];
    mobile: string;
    country_code?: string;
    email: string;
    status?: 'available' | 'busy' | 'off_duty';
    availability?: {
        [key: string]: {
            enabled: boolean;
            slots: { start: string; end: string }[];
        };
    } | { day_of_week: string; start_time: string; end_time: string }[];
    consultation_duration?: number;
    appointment_count?: number;
    bio?: string;
    profile_pic?: string;
    experience_years?: number;
    qualification?: string;
}

export interface CreateDoctorDto {
    title?: string;
    name: string;
    country_code?: string;
    mobile: string;
    email: string;
    status?: string;
    consultation_duration?: number;
    bio?: string;
    profile_pic?: string;
    experience_years?: number;
    qualification?: string;
    specializations?: string[];
    availability?: Array<{
        day: string;
        slots: Array<{
            start_time: string;
            end_time: string;
        }>;
    }>;
}

export interface UpdateDoctorDto {
    title?: string;
    name?: string;
    country_code?: string;
    mobile?: string;
    email?: string;
    status?: string;
    consultation_duration?: number;
    bio?: string;
    profile_pic?: string;
    experience_years?: number;
    qualification?: string;
    specializations?: string[];
    availability?: Array<{
        day: string;
        slots: Array<{
            start_time: string;
            end_time: string;
        }>;
    }>;
}

export class doctorApiData {
    createDoctor = async (data: CreateDoctorDto) => {
        return await _axios("post", "/whatsapp/doctor", data);
    };

    getAllDoctors = async () => {
        return await _axios("get", "/whatsapp/doctors");
    };

    getDoctorById = async (doctorId: string) => {
        return await _axios("get", `/whatsapp/doctor/${doctorId}`);
    };

    updateDoctor = async (doctorId: string, data: UpdateDoctorDto) => {
        return await _axios("put", `/whatsapp/doctor/${doctorId}`, data);
    };

    deleteDoctor = async (doctorId: string) => {
        return await _axios("delete", `/whatsapp/doctor/${doctorId}/soft`);
    };

    getDeletedDoctors = async () => {
        return await _axios("get", "/whatsapp/doctors/deleted/list");
    };

    restoreDoctor = async (doctorId: string) => {
        return await _axios("post", `/whatsapp/doctor/${doctorId}/restore`);
    };

    permanentDeleteDoctor = async (doctorId: string) => {
        return await _axios("delete", `/whatsapp/doctor/${doctorId}/permanent`);
    };
}
