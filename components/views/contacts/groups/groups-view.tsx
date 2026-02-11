"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useDebounce } from "@/hooks/useDebounce";
import { ContactGroup, CreateGroupDto, UpdateGroupDto } from "@/types/contactGroup";
import {
    useGetAllGroupsQuery,
    useCreateGroupMutation,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
    useGetDeletedGroupsQuery,
    useRestoreGroupMutation,
    usePermanentDeleteGroupMutation
} from "@/hooks/useContactGroupQuery";
import { GroupsHeader } from "./groupsHeader";
import { GroupsList } from "./groupsList";
import { CreateGroupModal } from "./createGroupModal";
import { EditGroupModal } from "./editGroupModal";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const GroupsView = () => {
    const { isDarkMode } = useTheme();

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'all' | 'trash'>('all');

    // Selected Group State
    const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
    const [actionType, setActionType] = useState<'delete' | 'permanent_delete' | 'restore'>('delete');

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // React Query Hooks
    const { data: groupsData, isLoading: isLoadingGroups } = useGetAllGroupsQuery(
        debouncedSearchQuery ? { search: debouncedSearchQuery } : undefined
    );
    const { data: deletedGroupsData, isLoading: isLoadingDeleted } = useGetDeletedGroupsQuery(
        debouncedSearchQuery ? { search: debouncedSearchQuery } : undefined
    );

    const { mutate: createGroup, isPending: isCreating } = useCreateGroupMutation();
    const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroupMutation();
    const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroupMutation();
    const { mutate: restoreGroup, isPending: isRestoring } = useRestoreGroupMutation();
    const { mutate: permanentDeleteGroup, isPending: isPermanentlyDeleting } = usePermanentDeleteGroupMutation();

    // Get groups from API response - backend returns { message, data: { groups: [], totalItems, totalPages, currentPage } }
    const groups: ContactGroup[] = activeTab === 'all'
        ? groupsData?.data?.groups || []
        : deletedGroupsData?.data?.groups || [];

    const isLoading = activeTab === 'all' ? isLoadingGroups : isLoadingDeleted;

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

    const handleConfirmAction = () => {
        if (!selectedGroup) return;

        if (actionType === 'delete') {
            deleteGroup(selectedGroup.group_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedGroup(null);
                }
            });
        } else if (actionType === 'restore') {
            restoreGroup(selectedGroup.group_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setSelectedGroup(null);
                }
            });
        } else if (actionType === 'permanent_delete') {
            permanentDeleteGroup(selectedGroup.group_id, {
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
        setActionType('delete');
        setIsDeleteModalOpen(true);
    };

    const openRestoreModal = (group: ContactGroup) => {
        setSelectedGroup(group);
        setActionType('restore');
        setIsDeleteModalOpen(true);
    };

    const openPermanentDeleteModal = (group: ContactGroup) => {
        setSelectedGroup(group);
        setActionType('permanent_delete');
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="p-6 overflow-y-auto h-full font-sans space-y-4">
            {/* Header */}
            <GroupsHeader
                isDarkMode={isDarkMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCreateGroup={() => setIsCreateModalOpen(true)}
            />

            {/* Tabs */}
            <div className="flex items-center space-x-1 border-b border-white/5">
                <button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-all",
                        activeTab === 'all'
                            ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                >
                    All Groups
                </button>
                <button
                    onClick={() => setActiveTab('trash')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-all flex items-center space-x-2",
                        activeTab === 'trash'
                            ? (isDarkMode ? 'border-emerald-500 text-emerald-500' : 'border-emerald-500 text-emerald-600')
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                    )}
                >
                    <Trash2 size={14} />
                    <span>Trash</span>
                </button>
            </div>

            {/* Groups List */}
            <GroupsList
                isDarkMode={isDarkMode}
                groups={filteredGroups}
                isLoading={isLoading}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onRestore={openRestoreModal}
                onPermanentDelete={openPermanentDeleteModal}
                isTrash={activeTab === 'trash'}
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
                onConfirm={handleConfirmAction}
                title={
                    actionType === 'delete' ? "Remove Group" :
                        actionType === 'restore' ? "Restore Group" :
                            "Permanently Delete Group"
                }
                message={
                    actionType === 'delete'
                        ? `Are you sure you want to remove "${selectedGroup?.group_name}"? It will be moved to the trash.`
                        : actionType === 'restore'
                            ? `Are you sure you want to restore "${selectedGroup?.group_name}"?`
                            : `Are you sure you want to permanently delete "${selectedGroup?.group_name}"? This action cannot be undone.`
                }
                isDarkMode={isDarkMode}
                confirmText={
                    actionType === 'delete' ? "Remove Group" :
                        actionType === 'restore' ? "Restore Group" :
                            "Delete Forever"
                }
                cancelText="Cancel"
                isLoading={isDeleting || isRestoring || isPermanentlyDeleting}
                variant={actionType === 'restore' ? 'info' : 'danger'}
            />
        </div>
    );
};
