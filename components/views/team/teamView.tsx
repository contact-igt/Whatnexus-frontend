
"use client";
import { useState, useEffect, useMemo } from 'react';
import { UserPlus, Shield, MoreHorizontal, User, Mail, Phone, Globe, ChevronDown, Badge, Edit2, Trash2, Eye, UserCircle } from 'lucide-react';
import { GlassCard } from "@/components/ui/glassCard";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useCreateManagementMutation, useManagementQuery } from '@/hooks/useManagementQuery';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/useTheme';
import { RoleBasedWrapper } from '@/components/ui/roleBasedWrapper';
import { Select } from '../../ui/select';
import { Input } from '../../ui/input';
import { useCreateTenantUserMutation, useTenantUserQuery, useSoftDeleteTenantUserMutation, useUpdateTenantUserMutation, usePermanentDeleteTenantUserMutation, useGetTenantUserByIdQuery, useDeletedTenantUserQuery, useRestoreTenantUserMutation } from '@/hooks/useTenantUserQuery';
import { ActionMenu } from '@/components/ui/actionMenu';
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { useDispatch } from 'react-redux';
import { updateUserData } from '@/redux/slices/auth/authSlice';
import { DataTable, ColumnDef } from '@/components/ui/dataTable';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { Pagination } from '@/components/ui/pagination';
import { TeamUserDrawer } from './teamUserDrawer';
import { Search, RotateCcw } from 'lucide-react';

type TabType = 'active' | 'trash';

// Invite Form Schema
const inviteFormSchema = z.object({
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    country_code: z.string().min(2, { message: "Country code must be at least 2 characters." }),
    mobile: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }),
    role: z.enum(["staff", "agent", "doctor"], { message: "Role is required." }),
});

// Edit Form Schema
const editFormSchema = z.object({
    username: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
    country_code: z.string().min(2, { message: "Country code must be at least 2 characters." }).optional(),
    mobile: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }).optional(),
    role: z.enum(["staff", "agent", "doctor"], { message: "Role is required." }).optional(),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;

export const TeamManagementView = () => {
    const { user } = useAuth();
    const dispatch = useDispatch();
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userToDelete, setUserToDelete] = useState<any>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // Drawer/Modal states
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);

    // Data and mutations
    const { data: tenantUserData, isLoading: activeLoading } = useTenantUserQuery();
    const { data: deletedTenantUserData, isLoading: deletedLoading } = useDeletedTenantUserQuery();
    const { data: userDetails, isLoading: userDetailsLoading } = useGetTenantUserByIdQuery(selectedUser?.tenant_user_id || "");
    const { mutate: createTenantUserMutate, isPending: createLoading } = useCreateTenantUserMutation();
    const { mutate: deleteTenantUserMutate, isPending: deleteLoading } = useSoftDeleteTenantUserMutation();
    const { mutate: updateTenantUserMutate, isPending: updateLoading } = useUpdateTenantUserMutation();
    const { mutate: permanentDeleteMutate, isPending: permanentDeleteLoading } = usePermanentDeleteTenantUserMutation();
    const { mutate: restoreTenantUserMutate, isPending: restoreLoading } = useRestoreTenantUserMutation();

    const isLoading = activeTab === 'active' ? activeLoading : deletedLoading;


    const activeUsers = useMemo(() => {
        return (tenantUserData?.data?.users || []).filter((u: any) => {
            if (u.role === "super_admin") return false;
            const searchLower = searchQuery.toLowerCase();
            return [u.username, u.email, u.mobile, u.role, u.status].some(field =>
                field?.toString().toLowerCase().includes(searchLower)
            );
        });
    }, [tenantUserData, searchQuery]);

    const deletedUsers = useMemo(() => {
        return (deletedTenantUserData?.data || []).filter((u: any) => {
            const searchLower = searchQuery.toLowerCase();
            return [u.username, u.email, u.mobile, u.role, u.status].some(field =>
                field?.toString().toLowerCase().includes(searchLower)
            );
        });
    }, [deletedTenantUserData, searchQuery]);

    const displayUsers = activeTab === 'active' ? activeUsers : deletedUsers;

    const currentDisplayUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return displayUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [displayUsers, currentPage]);

    const totalPages = Math.ceil(displayUsers.length / itemsPerPage);

    // Reset page on tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Form handlers
    const onDrawerSubmit = async (data: any) => {
        if (drawerMode === 'create') {
            createTenantUserMutate(data, {
                onSuccess: () => {
                    setIsDrawerOpen(false);
                }
            });
        } else if (drawerMode === 'edit' && selectedUser?.tenant_user_id) {
            updateTenantUserMutate(
                { tenantUserId: selectedUser.tenant_user_id, data },
                {
                    onSuccess: () => {
                        // If the edited user is the logged-in user, update Redux auth state
                        if (selectedUser.tenant_user_id === user?.tenant_user_id) {
                            dispatch(updateUserData({ ...user, ...data }));
                        }
                        setIsDrawerOpen(false);
                        setSelectedUser(null);
                    }
                }
            );
        }
    };


    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setDrawerMode('edit');
        setIsDrawerOpen(true);
    };

    const handleViewClick = (user: any) => {
        setSelectedUser(user);
        setDrawerMode('view');
        setIsDrawerOpen(true);
    };

    const handleCreateClick = () => {
        setSelectedUser(null);
        setDrawerMode('create');
        setIsDrawerOpen(true);
    };

    const handleRestoreClick = (user: any) => {
        if (user.tenant_user_id) {
            restoreTenantUserMutate(user.tenant_user_id);
        }
    };

    const handleDeleteClick = (user: any) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handlePermanentDeleteClick = (user: any) => {
        setUserToDelete(user);
        setIsPermanentDeleteModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (userToDelete?.tenant_user_id) {
            deleteTenantUserMutate(userToDelete.tenant_user_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                }
            });
        }
    };

    const handleConfirmPermanentDelete = () => {
        if (userToDelete?.tenant_user_id) {
            permanentDeleteMutate(userToDelete.tenant_user_id, {
                onSuccess: () => {
                    setIsPermanentDeleteModalOpen(false);
                    setUserToDelete(null);
                }
            });
        }
    };

    // Define DataTable columns
    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            field: 'username',
            headerName: 'Identity',
            width: 200,
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-white/10 shadow-lg">
                        {row?.username ? row.username.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                    <div className="flex flex-col">
                        <span className={cn("text-sm font-semibold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-800')}>{row?.username || 'N/A'}</span>
                    </div>
                </div>
            )
        },
        {
            field: 'email',
            headerName: 'Contact',
            width: 200,
            renderCell: ({ row }) => (
                <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                        <Mail size={12} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                        <span className={cn("text-xs", isDarkMode ? 'text-white/70' : 'text-slate-600')}>{row?.email || 'N/A'}</span>
                    </div>
                    {row?.mobile && (
                        <div className="flex items-center space-x-2">
                            <Phone size={12} className={cn(isDarkMode ? 'text-white/40' : 'text-slate-400')} />
                            <span className={cn("text-xs", isDarkMode ? 'text-white/70' : 'text-slate-600')}>{row?.country_code} {row?.mobile}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 180,
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <div className={cn("w-2 h-2 rounded-full", row.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600')} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wide", isDarkMode ? 'text-white/50' : 'text-slate-500')}>{row?.status || 'inactive'}</span>
                </div>
            )
        },
        {
            field: 'role',
            headerName: 'Security Role',
            width: 180,
            renderCell: ({ row }) => (
                <span className={cn(
                    "text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wide",
                    row.role === 'tenant_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        row.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            row.role === 'doctor' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                )}>
                    {row?.role || 'staff'}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 80,
            align: 'right',
            headerAlign: 'right',
            renderCell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    {activeTab === 'active' ? (
                        <ActionMenu
                            isDarkMode={isDarkMode}
                            isView={true}
                            onView={() => handleViewClick(row)}
                            isEdit={user?.role === 'tenant_admin'}
                            onEdit={() => handleEditClick(row)}
                            isDelete={user?.role === 'tenant_admin' && row.role !== 'tenant_admin'}
                            onDelete={() => handleDeleteClick(row)}
                        />
                    ) : (
                        <RoleBasedWrapper allowedRoles={['tenant_admin']}>
                            <ActionMenu
                                isDarkMode={isDarkMode}
                                isPermanentDelete={true}
                                onPermanentDelete={() => handlePermanentDeleteClick(row)}
                                isRestore={true}
                                onRestore={() => handleRestoreClick(row)}
                            />
                        </RoleBasedWrapper>
                    )}
                </div>
            )
        }
    ], [isDarkMode, activeTab]);

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 no-scrollbar pb-32">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>Agent Matrix</h1>
                    <p className={cn("font-medium text-sm mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Manage shared inbox permissions and neural layer overrides.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative w-64">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? "text-white/30" : "text-slate-400")} size={16} />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 py-2 rounded-xl text-xs border transition-all focus:outline-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        />
                    </div>
                    <RoleBasedWrapper allowedRoles={['tenant_admin']}>
                        <button
                            onClick={handleCreateClick}
                            className="h-10 px-6 rounded-xl bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center space-x-2"
                        >
                            <UserPlus size={16} />
                            <span>Invite Node</span>
                        </button>
                    </RoleBasedWrapper>
                </div>
            </div>

            {/* Tabs */}
            <div className={cn("flex space-x-1 border-b", isDarkMode ? 'border-white/5' : 'border-slate-200')}>
                {[
                    { id: 'active', label: 'Active Users', count: activeUsers.length },
                    { id: 'trash', label: 'Trash', count: deletedUsers.length }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b-2 transition-all",
                            activeTab === tab.id
                                ? 'border-emerald-500 text-emerald-500'
                                : isDarkMode
                                    ? 'border-transparent text-white/50 hover:text-white/70'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        {tab.label}
                        <span className={cn("ml-2", activeTab === tab.id ? 'text-emerald-500' : isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                            ({tab.count})
                        </span>
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={currentDisplayUsers}
                isLoading={isLoading}
                isDarkMode={isDarkMode}
                emptyState={
                    <div className="flex flex-col items-center justify-center space-y-2 py-10">
                        <UserCircle size={48} className="opacity-20 mb-2" />
                        <p className="text-sm font-semibold opacity-40 uppercase tracking-widest text-center">No nodes discovered in this sector</p>
                    </div>
                }
                onRowClick={handleViewClick}
            />

            {displayUsers.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={displayUsers.length}
                    itemsPerPage={itemsPerPage}
                    isDarkMode={isDarkMode}
                />
            )}

            <TeamUserDrawer
                isOpen={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedUser(null);
                }}
                user={userDetails?.data || selectedUser}
                mode={drawerMode}
                isDarkMode={isDarkMode}
                isSaving={createLoading || updateLoading || userDetailsLoading}
                onSubmit={onDrawerSubmit}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Remove Team Member"
                message={`Are you sure you want to remove ${userToDelete?.username} from the team? This user will be moved to the trash.`}
                confirmText="Remove"
                variant="danger"
                isDarkMode={isDarkMode}
                isLoading={deleteLoading}
            />

            {/* Permanent Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isPermanentDeleteModalOpen}
                onClose={() => setIsPermanentDeleteModalOpen(false)}
                onConfirm={handleConfirmPermanentDelete}
                title="Permanently Delete User"
                message={`Are you sure you want to permanently delete ${userToDelete?.username}? This action cannot be undone.`}
                confirmText="Delete Permanently"
                variant="danger"
                isDarkMode={isDarkMode}
                isLoading={permanentDeleteLoading}
            />
        </div>
    );
};