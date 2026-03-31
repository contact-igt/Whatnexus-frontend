export interface Contact {
    contact_id: string;
    tenant_id?: string;
    country_code?: string;
    phone: string; // ⚠️ Phone is immutable after creation
    name: string;
    email?: string;
    age?: number | null;
    profile_pic?: string;
    wa_id?: string;
    is_blocked: boolean;
    is_deleted?: boolean;
    last_message_at?: string;
    created_at: string;
    updated_at?: string;
}

export interface CreateContactDto {
    country_code?: string;
    phone: string; // Required field - format: 10 digits
    name: string; // Required field
    email?: string;
    age?: number | null;
    profile_pic?: string;
}


export interface UpdateContactDto {
    // ⚠️ Phone cannot be edited after creation
    name?: string;
    email?: string;
    age?: number | null;
    profile_pic?: string;
    is_blocked?: boolean;
}

export interface ImportContactsDto {
    contacts: CreateContactDto[];
}

export interface ContactsResponse {
    message: string;
    data: Contact[];
}

export interface ContactResponse {
    message: string;
    data: Contact;
}

export interface DeleteContactResponse {
    message: string;
}
