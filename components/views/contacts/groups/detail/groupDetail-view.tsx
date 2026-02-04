"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { ContactGroup, GroupMember, UpdateGroupDto, GroupMemberContact } from "@/types/contactGroup";
import {
    useGetGroupByIdQuery,
    useGetAvailableContactsQuery,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
    useAddContactsToGroupMutation,
    useRemoveContactFromGroupMutation
} from "@/hooks/useContactGroupQuery";
import { GroupDetailHeader } from "./groupDetailHeader";
import { GroupMembersList } from "./groupMembersList";
import { AddMembersModal } from "./addMembersModal";
import { EditGroupModal } from "../editGroupModal";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

export const GroupDetailView = () => {
    const { isDarkMode } = useTheme();
    const params = useParams();
    const router = useRouter();
    const groupId = params?.id as string;

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
    const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);

    // Selected Member State
    const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);

    // React Query Hooks
    const { data: groupData, isLoading: isLoadingGroup } = useGetGroupByIdQuery(groupId);
    const { data: availableContactsData, isLoading: isLoadingAvailableContacts } = useGetAvailableContactsQuery(
        groupId,
        isAddMembersModalOpen
    );
    const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroupMutation();
    const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroupMutation();
    const { mutate: addContactsToGroup, isPending: isAddingContacts } = useAddContactsToGroupMutation();
    const { mutate: removeContactFromGroup, isPending: isRemovingContact } = useRemoveContactFromGroupMutation();

    // Extract data from API response
    // Extract data from API response
    const group: ContactGroup | null = groupData?.data || null;
    const membersData = group?.members || [];

    // Flatten members structure for display
    const members: GroupMember[] = membersData.map(item => ({
        id: item.contact.contact_id,
        name: item.contact.name,
        phone: item.contact.phone,
        email: item.contact.email,
        profile_pic: item.contact.profile_pic
    }));

    // Available contacts mapping if needed, but the API returns GroupMemberContact[] directly for available contacts
    const availableContacts: GroupMember[] = (availableContactsData?.data || []).map((contact: GroupMemberContact) => ({
        id: contact.contact_id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        profile_pic: contact.profile_pic
    }));

    // Handlers
    const handleEditGroup = (groupId: string, data: UpdateGroupDto) => {
        updateGroup({ groupId, data }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
            }
        });
    };

    const handleDeleteGroup = () => {
        if (group) {
            deleteGroup(group.group_id, {
                onSuccess: () => {
                    router.push('/contacts/groups');
                }
            });
        }
    };

    const handleAddMembers = (contactIds: string[]) => {
        addContactsToGroup(
            { groupId, data: { contact_ids: contactIds } },
            {
                onSuccess: () => {
                    setIsAddMembersModalOpen(false);
                }
            }
        );
    };

    const handleRemoveMember = () => {
        if (selectedMember) {
            removeContactFromGroup(
                { groupId, contactId: selectedMember.id },
                {
                    onSuccess: () => {
                        setIsRemoveMemberModalOpen(false);
                        setSelectedMember(null);
                    }
                }
            );
        }
    };

    const openRemoveMemberModal = (member: GroupMember) => {
        setSelectedMember(member);
        setIsRemoveMemberModalOpen(true);
    };

    if (isLoadingGroup) {
        return (
            <div className="p-6">
                <div className="space-y-4">
                    <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (!group) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className={isDarkMode ? 'text-white/50' : 'text-slate-500'}>
                        Group not found
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 overflow-y-auto h-full font-sans">
            {/* Header */}
            <GroupDetailHeader
                isDarkMode={isDarkMode}
                group={group}
                memberCount={members.length}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={() => setIsDeleteModalOpen(true)}
                onAddMembers={() => setIsAddMembersModalOpen(true)}
            />

            {/* Members List */}
            <GroupMembersList
                isDarkMode={isDarkMode}
                members={members}
                isLoading={false}
                onRemoveMember={openRemoveMemberModal}
            />

            {/* Edit Group Modal */}
            <EditGroupModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditGroup}
                group={group}
                isDarkMode={isDarkMode}
                isLoading={isUpdating}
            />

            {/* Delete Group Confirmation */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteGroup}
                title="Delete Group"
                message={`Are you sure you want to delete "${group.group_name}"? This will not delete the contacts, only the group.`}
                isDarkMode={isDarkMode}
                confirmText="Delete Group"
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            />

            {/* Add Members Modal */}
            <AddMembersModal
                isOpen={isAddMembersModalOpen}
                onClose={() => setIsAddMembersModalOpen(false)}
                onSubmit={handleAddMembers}
                availableContacts={availableContacts}
                isLoadingContacts={isLoadingAvailableContacts}
                isDarkMode={isDarkMode}
                isLoading={isAddingContacts}
            />

            {/* Remove Member Confirmation */}
            <ConfirmationModal
                isOpen={isRemoveMemberModalOpen}
                onClose={() => {
                    setIsRemoveMemberModalOpen(false);
                    setSelectedMember(null);
                }}
                onConfirm={handleRemoveMember}
                title="Remove Member"
                message={`Are you sure you want to remove "${selectedMember?.name}" from this group?`}
                isDarkMode={isDarkMode}
                confirmText="Remove Member"
                cancelText="Cancel"
                isLoading={isRemovingContact}
                variant="danger"
            />
        </div>
    );
};
