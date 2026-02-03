export interface ContactGroup {
    id: string;
    name: string;
    description?: string;
    total_contacts: number;
    createdAt: string;
    updatedAt: string;
}

export interface GroupMember {
    id: string;
    name: string;
    phone: string;
    email?: string;
    profile_pic?: string;
    tags?: string[];
}

export interface CreateGroupDto {
    name: string;
    description?: string;
}

export interface UpdateGroupDto {
    name?: string;
    description?: string;
}

export interface AddContactsToGroupDto {
    contact_ids: string[];
}

export interface GroupDetailsResponse {
    data: {
        group: ContactGroup;
        members: GroupMember[];
    };
    message?: string;
}

export interface GroupListResponse {
    data: ContactGroup[];
    total: number;
    page?: number;
    limit?: number;
    message?: string;
}

export interface AvailableContactsResponse {
    data: GroupMember[];
    total: number;
    message?: string;
}

export interface GroupResponse {
    data: ContactGroup;
    message?: string;
}
