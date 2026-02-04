"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useDebounce } from "@/hooks/useDebounce";
import { ContactGroup, CreateGroupDto, UpdateGroupDto } from "@/types/contactGroup";
import {
    useGetAllGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation
} from "@/hooks/useContactGroupQuery";
import { GroupsHeader } from "./groupsHeader";
import { GroupsList } from "./groupsList";
import { CreateGroupModal } from "./createGroupModal";
import { EditGroupModal } from "./editGroupModal";
import { ConfirmationModal } from "@/components/ui/confirmationModal";

export const GroupsView = () => {
    const { isDarkMode } = useTheme();

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected Group State
    const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // React Query Hooks
    const { data: groupsData, isLoading } = useGetAllGroupsQuery(
        debouncedSearchQuery ? { search: debouncedSearchQuery } : undefined
    );
    const { mutate: createGroup, isPending: isCreating } = useCreateGroupMutation();
    const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroupMutation();
    const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroupMutation();

    // Get groups from API response - backend returns { message, data: { groups: [], totalItems, totalPages, currentPage } }
    const groups: ContactGroup[] = groupsData?.data?.groups || [];

    // Use groups directly (server-side search)
    const filteredGroups = groups;



    // Handlers
    const handleCreateGroup = (data: CreateGroupDto) => {
        createGroup(data, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
            }
        });
    };

    const handleEditGroup = (groupId: string, data: UpdateGroupDto) => {
        updateGroup({ groupId, data }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedGroup(null);
            }
        });
    };

    const handleDeleteGroup = () => {
        if (selectedGroup) {
            deleteGroup(selectedGroup.group_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedGroup(null);
                }
            });
        }
    };

    const openEditModal = (group: ContactGroup) => {
        setSelectedGroup(group);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (group: ContactGroup) => {
        setSelectedGroup(group);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="p-6 overflow-y-auto h-full font-sans">
            {/* Header */}
            <GroupsHeader
                isDarkMode={isDarkMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCreateGroup={() => setIsCreateModalOpen(true)}
            />

            {/* Groups List */}
            <GroupsList
                isDarkMode={isDarkMode}
                groups={filteredGroups}
                isLoading={isLoading}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
            />

            {/* Create Group Modal */}
            <CreateGroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateGroup}
                isDarkMode={isDarkMode}
                isLoading={isCreating}
            />

            {/* Edit Group Modal */}
            <EditGroupModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedGroup(null);
                }}
                onSubmit={handleEditGroup}
                group={selectedGroup}
                isDarkMode={isDarkMode}
                isLoading={isUpdating}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedGroup(null);
                }}
                onConfirm={handleDeleteGroup}
                title="Delete Group"
                message={`Are you sure you want to delete "${selectedGroup?.group_name}"? This will not delete the contacts, only the group.`}
                isDarkMode={isDarkMode}
                confirmText="Delete Group"
                cancelText="Cancel"
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};
