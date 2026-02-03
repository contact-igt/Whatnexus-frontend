export interface Contact {
    id: string;
    name: string;
    phone: string; // ⚠️ Phone is immutable after creation
    email?: string;
    profile_pic?: string;
    tags?: string[];
    is_blocked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactDto {
    phone: string; // Required field
    name?: string;
    email?: string;
    profile_pic?: string;
    tags?: string[];
}

export interface UpdateContactDto {
    // ⚠️ Phone cannot be edited after creation
    name?: string;
    email?: string;
    profile_pic?: string;
    is_blocked?: boolean;
    tags?: string[];
}

export interface ImportContactsDto {
    contacts: CreateContactDto[];
}

export interface ContactsResponse {
    data: Contact[];
    total: number;
    page?: number;
    limit?: number;
}

export interface ContactResponse {
    data: Contact;
    message?: string;
}
