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
            slotDuration?: number | null;
            useDefaultDuration?: boolean;
            slots: { start: string; end: string }[];
        };
    } | { day_of_week: string; start_time: string; end_time: string; slot_duration?: number | null; slotDuration?: number | null; enabled?: boolean; use_default_duration?: boolean; useDefaultDuration?: boolean }[];
    availabilityDays?: Array<{
        day_of_week: string;
        enabled: boolean;
        slot_duration?: number | null;
        slotDuration?: number | null;
        use_default_duration?: boolean;
        useDefaultDuration?: boolean;
    }>;
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
        enabled?: boolean;
        slotDuration?: number | null;
        useDefaultDuration?: boolean;
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
        enabled?: boolean;
        slotDuration?: number | null;
        useDefaultDuration?: boolean;
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

    getAllDoctors = async (params?: { search?: string }) => {
        return await _axios(
            "get",
            "/whatsapp/doctors",
            undefined,
            "application/json",
            params,
        );
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

    getDeletedDoctors = async (params?: { search?: string; page?: number; limit?: number }) => {
        return await _axios(
            "get",
            "/whatsapp/doctors/deleted/list",
            undefined,
            "application/json",
            params,
        );
    };

    restoreDoctor = async (doctorId: string) => {
        return await _axios("post", `/whatsapp/doctor/${doctorId}/restore`);
    };

    permanentDeleteDoctor = async (doctorId: string) => {
        return await _axios("delete", `/whatsapp/doctor/${doctorId}/permanent`);
    };

    // Get branches mapped to a doctor
    getDoctorBranches = async (doctorId: string) => {
        return await _axios("get", `/whatsapp/doctor/${doctorId}/branches`);
    };

    // Replace doctor branch mappings (atomic)
    updateDoctorBranches = async (doctorId: string, data: { branches: Array<{ branch_id: string; is_primary?: boolean }> }) => {
        return await _axios("put", `/whatsapp/doctor/${doctorId}/branches`, data);
    };
}
