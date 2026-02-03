export interface ContactGroup {
    group_id: string;
    group_name: string;
    description?: string;
    tenant_id?: string;
    created_at?: string;
    members?: GroupMemberItem[];
}

export interface GroupMemberItem {
    id: number;
    contact: GroupMemberContact;
}

export interface GroupMemberContact {
    contact_id: string;
    name: string;
    phone: string;
    email?: string;
    profile_pic?: string;
}

// For display purposes - flattened member structure
export interface GroupMember {
    id: string; // contact_id
    name: string;
    phone: string;
    email?: string;
    profile_pic?: string;
}

export interface CreateGroupDto {
    group_name: string; // Required - must be unique
    description?: string;
}

export interface UpdateGroupDto {
    group_name?: string; // Must be unique if provided
    description?: string;
}

export interface AddContactsToGroupDto {
    contact_ids: string[]; // Array of contact_ids
}

// API Response Types
export interface CreateGroupResponse {
    message: string;
    group: ContactGroup;
}

export interface GroupsListResponse {
    message: string;
    data: {
        totalItems: number;
        groups: ContactGroup[];
        totalPages: number;
        currentPage: number;
    };
}

export interface GroupDetailResponse {
    message: string;
    data: ContactGroup;
}

export interface AvailableContactsResponse {
    message: string;
    data: GroupMemberContact[];
}

export interface UpdateGroupResponse {
    message: string;
    data: ContactGroup;
}

export interface AddContactsResponse {
    message: string;
}

export interface RemoveContactResponse {
    message: string;
}

export interface DeleteGroupResponse {
    message: string;
}
