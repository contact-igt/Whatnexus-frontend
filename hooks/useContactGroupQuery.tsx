"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactGroupApis } from "@/services/contactGroup";
import { toast } from "sonner";
import { CreateGroupDto, UpdateGroupDto, AddContactsToGroupDto } from "@/types/contactGroup";

// Create Group
export const useCreateGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateGroupDto) => {
            return contactGroupApis.createGroup(data);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
            toast.success(data?.message || 'Group created successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to create group');
        }
    });
};

// Get All Groups
export const useGetAllGroupsQuery = (params?: any) => {
    return useQuery({
        queryKey: ['contact-groups', params],
        queryFn: () => contactGroupApis.getAllGroups(params),
    });
};

// Get Group By ID
export const useGetGroupByIdQuery = (groupId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['contact-group', groupId],
        queryFn: () => contactGroupApis.getGroupById(groupId),
        enabled: enabled && !!groupId,
    });
};

// Get Available Contacts (NOT in group)
export const useGetAvailableContactsQuery = (groupId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['available-contacts', groupId],
        queryFn: () => contactGroupApis.getAvailableContacts(groupId),
        enabled: enabled && !!groupId,
    });
};

// Update Group
export const useUpdateGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, data }: { groupId: string; data: UpdateGroupDto }) => {
            return contactGroupApis.updateGroup(groupId, data);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
            queryClient.invalidateQueries({ queryKey: ['contact-group', variables.groupId] });
            toast.success(data?.message || 'Group updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to update group');
        }
    });
};

// Add Contacts to Group
export const useAddContactsToGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, data }: { groupId: string; data: AddContactsToGroupDto }) => {
            return contactGroupApis.addContactsToGroup(groupId, data);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
            queryClient.invalidateQueries({ queryKey: ['contact-group', variables.groupId] });
            queryClient.invalidateQueries({ queryKey: ['available-contacts', variables.groupId] });
            const count = variables.data.contact_ids.length;
            toast.success(data?.message || `${count} contact${count > 1 ? 's' : ''} added to group`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to add contacts to group');
        }
    });
};

// Remove Contact from Group
export const useRemoveContactFromGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ groupId, contactId }: { groupId: string; contactId: string }) => {
            return contactGroupApis.removeContactFromGroup(groupId, contactId);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
            queryClient.invalidateQueries({ queryKey: ['contact-group', variables.groupId] });
            queryClient.invalidateQueries({ queryKey: ['available-contacts', variables.groupId] });
            toast.success(data?.message || 'Contact removed from group');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to remove contact from group');
        }
    });
};

// Delete Group
export const useDeleteGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groupId: string) => {
            return contactGroupApis.deleteGroup(groupId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-groups'] });
            toast.success(data?.message || 'Group deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to delete group');
        }
    });
};

// Get Deleted Groups
export const useGetDeletedGroupsQuery = (params?: any) => {
    return useQuery({
        queryKey: ['deleted-groups', params],
        queryFn: () => contactGroupApis.getDeletedGroups(params),
    });
};

// Restore Group
export const useRestoreGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groupId: string) => {
            return contactGroupApis.restoreGroup(groupId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['contact-groups'] });
            queryClient.invalidateQueries({ queryKey: ['deleted-groups'] });
            toast.success(data?.message || 'Group restored successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to restore group');
        }
    });
};

// Permanent Delete Group
export const usePermanentDeleteGroupMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (groupId: string) => {
            return contactGroupApis.permanentDeleteGroup(groupId);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-groups'] });
            toast.success(data?.message || 'Group permanently deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Failed to permanently delete group');
        }
    });
};
