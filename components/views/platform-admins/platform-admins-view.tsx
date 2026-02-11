
"use client";
import { useState, useEffect, useMemo } from 'react';
import { UserPlus, User, Mail, Phone, Lock } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import * as z from "zod";
import {
    useCreateManagementMutation,
    useManagementQuery,
    useUpdateManagementMutation,
    useSoftDeleteManagementMutation,
    usePermanentDeleteManagementMutation,
    useGetManagementByIdQuery,
    useGetManagementDeletedListQuery,
    useRestoreManagementMutation
} from '@/hooks/useManagementQuery';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/useTheme';
import { Select } from '../../ui/select';
import { Input } from '../../ui/input';
import { RoleBasedWrapper } from '@/components/ui/role-based-wrapper';
import { ActionMenu } from '@/components/ui/action-menu';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { Pagination } from '@/components/ui/pagination';

type TabType = 'active' | 'trash';

// Create Form Schema
const createFormSchema = z.object({
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    country_code: z.string().min(2, { message: "Country code must be at least 2 characters." }),
    mobile: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }),
    email: z.string().email({ message: "Invalid email address." }),
    role: z.enum(["platform_admin"], { message: "Role is required." }),
});

// Edit Form Schema
const editFormSchema = z.object({
    username: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
    country_code: z.string().min(2, { message: "Country code must be at least 2 characters." }).optional(),
    mobile: z.string().regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }).optional(),
});

type CreateFormData = z.infer<typeof createFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;

export const PlatformAdminsView = () => {
    // ... (existing hooks)
    const { isDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [userToRestore, setUserToRestore] = useState<any>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

    // Data and mutations
    const { data: managementData, isLoading } = useManagementQuery();
    const { data: deletedManagementData, isLoading: deletedLoading } = useGetManagementDeletedListQuery();
    const { data: userDetails, isLoading: userDetailsLoading } = useGetManagementByIdQuery(selectedUser?.management_id || "");
    const { mutate: createManagementMutate, isPending: createLoading } = useCreateManagementMutation();
    const { mutate: updateManagementMutate, isPending: updateLoading } = useUpdateManagementMutation();
    const { mutate: softDeleteMutate, isPending: softDeleteLoading } = useSoftDeleteManagementMutation();
    const { mutate: permanentDeleteMutate, isPending: permanentDeleteLoading } = usePermanentDeleteManagementMutation();
    const { mutate: restoreManagementMutate, isPending: restoreLoading } = useRestoreManagementMutation();

    // Create form
    const { control: createControl, register: createRegister, handleSubmit: createHandleSubmit, formState: { errors: createErrors }, reset: createReset } = useForm<CreateFormData>({
        defaultValues: {
            country_code: "+91",
            role: "platform_admin",
        },
        resolver: zodResolver(createFormSchema)
    });

    // Edit form
    const { control: editControl, register: editRegister, handleSubmit: editHandleSubmit, formState: { errors: editErrors }, reset: editReset, setValue } = useForm<EditFormData>({
        resolver: zodResolver(editFormSchema)
    });

    // Filter users by tab
    const activeUsers = (managementData as any)?.data?.users?.filter((user: any) => !user.is_deleted) || [];
    const deletedUsers = (deletedManagementData as any)?.data || [];
    const displayUsers = activeTab === 'active' ? activeUsers : deletedUsers;
    const isDataLoading = activeTab === 'active' ? isLoading : deletedLoading;

    const currentDisplayUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return displayUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [displayUsers, currentPage]);

    const totalPages = Math.ceil(displayUsers.length / itemsPerPage);

    // Reset page on tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Sync edit form with fetched user details
    useEffect(() => {
        if ((userDetails as any)?.data && isEditModalOpen) {
            setValue('username', (userDetails as any).data.username || '');
            setValue('country_code', (userDetails as any).data.country_code || '+91');
            setValue('mobile', (userDetails as any).data.mobile || '');
        }
    }, [userDetails, isEditModalOpen, setValue]);

    // Handlers
    const handleViewClick = (user: any) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (user: any) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handlePermanentDeleteClick = (user: any) => {
        setUserToDelete(user);
        setIsPermanentDeleteModalOpen(true);
    };

    const handleRestoreClick = (user: any) => {
        setUserToRestore(user);
        setIsRestoreModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (userToDelete?.management_id) {
            softDeleteMutate(userToDelete.management_id, {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                }
            });
        }
    };

    const handleConfirmPermanentDelete = () => {
        if (userToDelete?.management_id) {
            permanentDeleteMutate(userToDelete.management_id, {
                onSuccess: () => {
                    setIsPermanentDeleteModalOpen(false);
                    setUserToDelete(null);
                }
            });
        }
    };

    const handleConfirmRestore = () => {
        if (userToRestore?.management_id) {
            restoreManagementMutate(userToRestore.management_id, {
                onSuccess: () => {
                    setIsRestoreModalOpen(false);
                    setUserToRestore(null);
                }
            });
        }
    };

    const onCreateSubmit = (data: CreateFormData) => {
        createManagementMutate(data, {
            onSuccess: () => {
                createReset();
                setIsCreateModalOpen(false);
            }
        });
    };

    const onEditSubmit = (data: EditFormData) => {
        if (selectedUser?.management_id) {
            updateManagementMutate({
                managementId: selectedUser.management_id,
                data
            }, {
                onSuccess: () => {
                    editReset();
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                }
            });
        }
    };

    const handleCreateFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        await createHandleSubmit(onCreateSubmit)(e);
    };

    const handleEditFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        await editHandleSubmit(onEditSubmit)(e);
    };

    // Define DataTable columns
    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            field: 'username',
            headerName: 'Identity',
            width: 180,
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xs text-white border border-emerald-500/20 shadow-lg">
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
            width: 180,
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
            width: 150,
            renderCell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <div className={cn("w-2 h-2 rounded-full", row.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600')} />
                    <span className={cn("text-[10px] font-bold uppercase tracking-wide", isDarkMode ? 'text-white/50' : 'text-slate-500')}>{row?.status || 'active'}</span>
                </div>
            )
        },
        {
            field: 'role',
            headerName: 'Security Role',
            width: 140,
            renderCell: ({ row }) => (
                <span className={cn(
                    "text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wide",
                    row.role === 'super_admin' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                )}>
                    {row?.role || 'platform_admin'}
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
                <RoleBasedWrapper allowedRoles={['super_admin']}>
                    <div onClick={(e) => e.stopPropagation()}>
                        {activeTab === 'active' ? (
                            <ActionMenu
                                isDarkMode={isDarkMode}
                                isView={true}
                                onView={() => handleViewClick(row)}
                                isEdit={true}
                                onEdit={() => handleEditClick(row)}
                                isDelete={row.role !== 'super_admin'}
                                onDelete={() => handleDeleteClick(row)}
                            />
                        ) : (
                            <ActionMenu
                                isDarkMode={isDarkMode}
                                isRestore={true}
                                onRestore={() => handleRestoreClick(row)}
                                isPermanentDelete={true}
                                onPermanentDelete={() => handlePermanentDeleteClick(row)}
                            />
                        )}
                    </div>
                </RoleBasedWrapper>
            )
        }
    ], [isDarkMode, activeTab]);

    return (
        <div className="h-full overflow-y-auto p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 no-scrollbar pb-32">
            <div className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className={cn("text-4xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>System Administrators</h1>
                    <p className={cn("font-medium text-sm mt-1", isDarkMode ? 'text-white/40' : 'text-slate-500')}>Manage system administrators and their permissions.</p>
                </div>
                <RoleBasedWrapper allowedRoles={['super_admin']}>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center space-x-2"
                    >
                        <UserPlus size={16} />
                        <span>Add Admin</span>
                    </button>
                </RoleBasedWrapper>
            </div>

            {/* Tabs */}
            <div className={cn("flex space-x-1 border-b", isDarkMode ? 'border-white/5' : 'border-slate-200')}>
                {[
                    { id: 'active', label: 'Active Admins', count: activeUsers.length },
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

            <div>
                <GlassCard isDarkMode={isDarkMode} className="p-0">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-2xl">
                        <h3 className="font-bold uppercase tracking-tight text-sm">{activeTab === 'active' ? 'Active Admins' : 'Deleted Admins'}</h3>
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">{displayUsers?.length || 0} Admins</span>
                    </div>
                    <DataTable
                        columns={columns}
                        data={currentDisplayUsers || []}
                        isLoading={isDataLoading}
                        isDarkMode={isDarkMode}
                        emptyState={
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className={cn(
                                    "w-16 h-16 rounded-full flex items-center justify-center",
                                    isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                                )}>
                                    <User size={28} className={cn(isDarkMode ? 'text-white/20' : 'text-slate-300')} />
                                </div>
                                <div className="space-y-2 mt-4 text-center">
                                    <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                        No system admins found
                                    </p>
                                    <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                        Add system administrators to get started
                                    </p>
                                </div>
                            </div>
                        }
                    />
                </GlassCard>

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
            </div>

            {/* Create Admin Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add System Admin"
                description="Create a new system administrator account"
                isDarkMode={isDarkMode}
                className="max-w-2xl font-sans"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                isDarkMode
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            form="create-admin-form"
                            disabled={createLoading}
                            className={cn(
                                "px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20",
                                createLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
                            )}
                        >
                            {createLoading ? 'Creating...' : 'Create Admin'}
                        </button>
                    </div>
                }
            >
                <form id="create-admin-form" autoComplete="off" onSubmit={handleCreateFormSubmit} className="space-y-5">
                    <Input
                        isDarkMode={isDarkMode}
                        label="Username"
                        {...createRegister('username')}
                        icon={User}
                        placeholder="Enter username"
                        disabled={createLoading}
                        error={createErrors.username?.message}
                        required
                    />

                    <Input
                        isDarkMode={isDarkMode}
                        label="Email"
                        {...createRegister('email')}
                        icon={Mail}
                        placeholder="admin@whatsnexus.com"
                        disabled={createLoading}
                        error={createErrors.email?.message}
                        required
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <Controller
                            name="country_code"
                            control={createControl}
                            render={({ field }) => (
                                <Select
                                    isDarkMode={isDarkMode}
                                    label="Country Code"
                                    value={field.value || '+91'}
                                    onChange={field.onChange}
                                    options={[
                                        { value: '+91', label: 'India (+91)' },
                                        { value: '+1', label: 'USA (+1)' },
                                        { value: '+44', label: 'UK (+44)' },
                                        { value: '+971', label: 'UAE (+971)' }
                                    ]}
                                    disabled={createLoading}
                                    className="col-span-1"
                                    error={createErrors.country_code?.message}
                                    required
                                />
                            )}
                        />

                        <Input
                            isDarkMode={isDarkMode}
                            label="Mobile Number"
                            {...createRegister('mobile')}
                            icon={Phone}
                            placeholder="Enter mobile number"
                            disabled={createLoading}
                            error={createErrors.mobile?.message}
                            wrapperClassName="col-span-2"
                            required
                        />
                    </div>
                </form>
            </Modal>

            {/* View Admin Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false);
                    setSelectedUser(null);
                }}
                title="Admin Details"
                description="View system administrator information"
                isDarkMode={isDarkMode}
                className="max-w-2xl font-sans"
            >
                {userDetailsLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={cn("h-16 rounded-xl", isDarkMode ? 'bg-white/5' : 'bg-slate-100')} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Avatar and Basic Info */}
                        <div className="flex items-center space-x-4 pb-6 border-b border-white/10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center font-bold text-2xl text-white shadow-xl shadow-emerald-500/20">
                                {((userDetails as any)?.data?.username || selectedUser?.username)?.charAt(0).toUpperCase() || <User size={24} />}
                            </div>
                            <div className="flex-1">
                                <h3 className={cn("text-xl font-bold", isDarkMode ? 'text-white' : 'text-slate-900')}>
                                    {(userDetails as any)?.data?.username || selectedUser?.username || 'N/A'}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={cn(
                                        "text-[9px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wide",
                                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    )}>
                                        {(userDetails as any)?.data?.role || selectedUser?.role || 'platform_admin'}
                                    </span>
                                    <div className="flex items-center space-x-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className={cn("text-[10px] font-medium", isDarkMode ? 'text-white/50' : 'text-slate-500')}>
                                            {(userDetails as any)?.data?.status || selectedUser?.status || 'active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className={cn(
                                "p-4 rounded-xl border transition-all hover:shadow-lg",
                                isDarkMode
                                    ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-emerald-500/30'
                                    : 'bg-gradient-to-br from-slate-50 to-white border-slate-200 hover:border-emerald-500/30'
                            )}>
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                    )}>
                                        <Mail size={18} className="text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn("text-[10px] font-bold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                            Email Address
                                        </p>
                                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                            {(userDetails as any)?.data?.email || selectedUser?.email || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={cn(
                                "p-4 rounded-xl border transition-all hover:shadow-lg",
                                isDarkMode
                                    ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 hover:border-emerald-500/30'
                                    : 'bg-gradient-to-br from-slate-50 to-white border-slate-200 hover:border-emerald-500/30'
                            )}>
                                <div className="flex items-center space-x-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                                    )}>
                                        <Phone size={18} className="text-emerald-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn("text-[10px] font-bold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                            Mobile Number
                                        </p>
                                        <p className={cn("text-sm font-semibold", isDarkMode ? 'text-white' : 'text-slate-800')}>
                                            {(userDetails as any)?.data?.country_code || selectedUser?.country_code} {(userDetails as any)?.data?.mobile || selectedUser?.mobile || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className={cn(
                            "grid grid-cols-2 gap-3 p-4 rounded-xl border",
                            isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50/50 border-slate-100'
                        )}>
                            <div>
                                <p className={cn("text-[10px] font-bold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                    Account ID
                                </p>
                                <p className={cn("text-xs font-mono", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    {(userDetails as any)?.data?.management_id || selectedUser?.management_id || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className={cn("text-[10px] font-bold uppercase tracking-wide mb-1", isDarkMode ? 'text-white/30' : 'text-slate-400')}>
                                    Created At
                                </p>
                                <p className={cn("text-xs", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                                    {(userDetails as any)?.data?.createdAt ? new Date((userDetails as any).data.createdAt).toLocaleDateString() : selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Admin Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                    editReset();
                }}
                title="Edit Admin"
                description="Update system administrator information"
                isDarkMode={isDarkMode}
                className="max-w-2xl font-sans"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setSelectedUser(null);
                                editReset();
                            }}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                isDarkMode
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            form="edit-admin-form"
                            disabled={updateLoading || userDetailsLoading}
                            className={cn(
                                "px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20",
                                (updateLoading || userDetailsLoading) ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
                            )}
                        >
                            {updateLoading ? 'Updating...' : 'Update Admin'}
                        </button>
                    </div>
                }
            >
                {userDetailsLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className={cn("h-16 rounded-xl", isDarkMode ? 'bg-white/5' : 'bg-slate-100')} />
                        ))}
                    </div>
                ) : (
                    <form id="edit-admin-form" autoComplete="off" onSubmit={handleEditFormSubmit} className="space-y-5">
                        <Input
                            isDarkMode={isDarkMode}
                            label="Username"
                            {...editRegister('username')}
                            icon={User}
                            placeholder="Enter username"
                            disabled={updateLoading}
                            error={editErrors.username?.message}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <Controller
                                name="country_code"
                                control={editControl}
                                render={({ field }) => (
                                    <Select
                                        isDarkMode={isDarkMode}
                                        label="Country Code"
                                        value={field.value || '+91'}
                                        onChange={field.onChange}
                                        options={[
                                            { value: '+91', label: 'India (+91)' },
                                            { value: '+1', label: 'USA (+1)' },
                                            { value: '+44', label: 'UK (+44)' },
                                            { value: '+971', label: 'UAE (+971)' }
                                        ]}
                                        disabled={updateLoading}
                                        className="col-span-1"
                                        error={editErrors.country_code?.message}
                                    />
                                )}
                            />

                            <Input
                                isDarkMode={isDarkMode}
                                label="Mobile Number"
                                {...editRegister('mobile')}
                                icon={Phone}
                                placeholder="Enter mobile number"
                                disabled={updateLoading}
                                error={editErrors.mobile?.message}
                                wrapperClassName="col-span-2"
                            />
                        </div>
                    </form>
                )}
            </Modal>

            {/* Soft Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Admin"
                message="Are you sure you want to delete this admin? They will be moved to trash."
                confirmText="Delete"
                variant="danger"
                isDarkMode={isDarkMode}
                isLoading={softDeleteLoading}
            />

            {/* Permanent Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isPermanentDeleteModalOpen}
                onClose={() => setIsPermanentDeleteModalOpen(false)}
                onConfirm={handleConfirmPermanentDelete}
                title="Permanently Delete Admin"
                message="Are you sure you want to permanently delete this admin? This action cannot be undone."
                confirmText="Delete Forever"
                variant="danger"
                isDarkMode={isDarkMode}
                isLoading={permanentDeleteLoading}
            />

            {/* Restore Confirmation Modal */}
            <ConfirmationModal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                onConfirm={handleConfirmRestore}
                title="Restore Admin"
                message="Are you sure you want to restore this admin? They will be moved back to active admins."
                confirmText="Restore"
                variant="success"
                isDarkMode={isDarkMode}
                isLoading={restoreLoading}
            />
        </div>
    );
};
