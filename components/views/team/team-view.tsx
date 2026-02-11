
"use client";
import { useState, useEffect, useMemo } from 'react';
import { UserPlus, Shield, MoreHorizontal, User, Mail, Phone, Globe, ChevronDown, Badge, Edit2, Trash2, Eye } from 'lucide-react';
import { GlassCard } from "@/components/ui/glass-card";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useCreateManagementMutation, useManagementQuery } from '@/hooks/useManagementQuery';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/useTheme';
import { RoleBasedWrapper } from '@/components/ui/role-based-wrapper';
import { Select } from '../../ui/select';
import { Input } from '../../ui/input';
import { useCreateTenantUserMutation, useTenantUserQuery, useSoftDeleteTenantUserMutation, useUpdateTenantUserMutation, usePermanentDeleteTenantUserMutation, useGetTenantUserByIdQuery } from '@/hooks/useTenantUserQuery';
import { ActionMenu } from '@/components/ui/action-menu';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { useAuth } from '@/redux/selectors/auth/authSelector';

type TabType = 'active' | 'trash';

const inviteFormSchema = z.object({
    username: z.string().min(2, { message: "Username must be at least 2 characters." }),
    email: z.string().email({ message: "Invalid email address." }),
    country_code: z.string().min(1, { message: "Country code is required." }),
    mobile: z.string().min(7, { message: "Mobile number must be at least 7 digits." }),
    role: z.enum(['doctor', 'staff', 'agent'], { message: "Invalid role selected." }),
});

const editFormSchema = z.object({
    username: z.string().min(2, { message: "Username must be at least 2 characters." }),
    country_code: z.string().min(1, { message: "Country code is required." }),
    mobile: z.string().min(7, { message: "Mobile number must be at least 7 digits." }),
    role: z.enum(['doctor', 'staff', 'agent']).optional(),
});

type InviteFormData = z.infer<typeof inviteFormSchema>;
type EditFormData = z.infer<typeof editFormSchema>;

export const TeamManagementView = () => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userToDelete, setUserToDelete] = useState<any>(null);

    // Invite form
    const { control: inviteControl, register: inviteRegister, handleSubmit: inviteHandleSubmit, formState: { errors: inviteErrors }, reset: inviteReset } = useForm<InviteFormData>({
        defaultValues: {
            "role": "staff",
            "country_code": "+91",
            "mobile": "",
        },
        resolver: zodResolver(inviteFormSchema)
    });

    // Edit form
    const { control: editControl, register: editRegister, handleSubmit: editHandleSubmit, formState: { errors: editErrors }, reset: editReset, setValue } = useForm<EditFormData>({
        resolver: zodResolver(editFormSchema)
    });

    // Data and mutations
    const { data: tenantUserData, isLoading } = useTenantUserQuery();
    const { mutate: createTenantUserMutate, isPending: createLoading } = useCreateTenantUserMutation();
    const { mutate: updateTenantUserMutate, isPending: updateLoading } = useUpdateTenantUserMutation();
    const { mutate: deleteTenantUserMutate, isPending: deleteLoading } = useSoftDeleteTenantUserMutation();
    const { mutate: permanentDeleteMutate, isPending: permanentDeleteLoading } = usePermanentDeleteTenantUserMutation();
    const { data: userDetails, isLoading: isDetailsLoading } = useGetTenantUserByIdQuery(selectedUser?.tenant_user_id || "");

    // Modal states
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);



    const filteredUsers = tenantUserData?.data?.users?.filter((user: any) => user.role !== "super_admin" && user.role !== "tenant_admin") || [];

    // Separate active and deleted users
    const activeUsers = filteredUsers.filter((user: any) => user.status !== 'deleted' && user.is_deleted !== true);
    const deletedUsers = filteredUsers.filter((user: any) => user.status === 'deleted' || user.is_deleted === true);

    const displayUsers = activeTab === 'active' ? activeUsers : deletedUsers;

    // Form handlers
    const onInviteSubmit = (data: InviteFormData) => {
        createTenantUserMutate(data, {
            onSuccess: () => {
                inviteReset();
                setIsInviteModalOpen(false);
            }
        });
    };

    const onEditSubmit = (data: EditFormData) => {
        if (selectedUser?.tenant_user_id) {
            updateTenantUserMutate(
                { tenantUserId: selectedUser.tenant_user_id, data },
                {
                    onSuccess: () => {
                        setIsEditModalOpen(false);
                        setSelectedUser(null);
                        editReset();
                    }
                }
            );
        }
    };

    const handleEditClick = (user: any) => {
        setSelectedUser(user);
        editReset({
            username: user.username,
            country_code: user.country_code || '+91',
            mobile: user.mobile,
            role: user.role
        });
        setIsEditModalOpen(true);
    };

    // Sync form with fetched details using useEffect
    useEffect(() => {
        if (userDetails?.data && isEditModalOpen && selectedUser?.tenant_user_id === userDetails.data.tenant_user_id) {
            editReset({
                username: userDetails.data.username,
                country_code: userDetails.data.country_code || '+91',
                mobile: userDetails.data.mobile,
                role: userDetails.data.role
            });
        }
    }, [userDetails, isEditModalOpen, selectedUser?.tenant_user_id]);

    const handleViewClick = (user: any) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
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

    const handleInviteFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        await inviteHandleSubmit(onInviteSubmit)(e);
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
                            isDelete={user?.role === 'tenant_admin'}
                            onDelete={() => handleDeleteClick(row)}
                        />
                    ) : (
                        <RoleBasedWrapper allowedRoles={['tenant_admin']}>
                            <ActionMenu
                                isDarkMode={isDarkMode}
                                isPermanentDelete={true}
                                onPermanentDelete={() => handlePermanentDeleteClick(row)}
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
                <RoleBasedWrapper allowedRoles={['tenant_admin']}>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 flex items-center space-x-2"
                    >
                        <UserPlus size={16} />
                        <span>Invite Node</span>
                    </button>
                </RoleBasedWrapper>
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

            <div>
                <GlassCard isDarkMode={isDarkMode} className="p-0">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 rounded-t-2xl">
                        <h3 className="font-bold uppercase tracking-tight text-sm">{activeTab === 'active' ? 'Active Nodes' : 'Deleted Nodes'}</h3>
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wide">{displayUsers?.length || 0} Team Members</span>
                    </div>
                    <DataTable
                        columns={columns}
                        data={displayUsers || []}
                        isLoading={isLoading}
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
                                        No team members found
                                    </p>
                                    <p className={cn("text-xs", isDarkMode ? 'text-white/40' : 'text-slate-400')}>
                                        Invite team members to get started
                                    </p>
                                </div>
                            </div>
                        }
                    />
                </GlassCard>
                {/* <div className="space-y-6">
                    <RoleBasedWrapper allowedRoles={['admin', 'super_admin']}>
                        <GlassCard isDarkMode={isDarkMode} className="p-6 space-y-6">
                            <div className="flex items-center space-x-2.5 text-emerald-500">
                                <Shield size={20} className="animate-pulse" />
                                <h3 className="font-bold text-base uppercase tracking-tight">Permission Matrix</h3>
                            </div>
                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-wide">Define global overrides for human agents vs neural Receptionist.</p>

                            <div className="space-y-3 pt-3 border-t border-white/5">
                                {[
                                    { label: "Override AI Conversation", active: true },
                                    { label: "Mass Broadcast Access", active: true },
                                    { label: "Modify Knowledge Base", active: false },
                                    { label: "Delete Customer Data", active: false },
                                    { label: "Configure API Logic", active: false },
                                ].map((perm, i) => (
                                    <div key={i} className={cn("p-3 rounded-xl border flex items-center justify-between transition-all group/item", isDarkMode ? 'bg-white/5 border-white/5 hover:border-white/10' : 'bg-slate-50 border-slate-100 hover:border-emerald-500/10')}>
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wide", isDarkMode ? 'text-white/80' : 'text-slate-700')}>{perm.label}</span>
                                        <button className={cn("w-9 h-5 rounded-full relative transition-all duration-300", perm.active ? 'bg-emerald-600' : 'bg-slate-700')}>
                                            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300", perm.active ? 'right-0.5' : 'left-0.5 shadow-sm')} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-3 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-wide hover:bg-white/5 transition-all">Reset All Permissions</button>
                        </GlassCard>
                    </RoleBasedWrapper>
                </div> */}
            </div>

            <Modal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                title="Invite New Node"
                description="Add a new team member to your agent matrix"
                isDarkMode={isDarkMode}
                className="max-w-2xl font-sans"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsInviteModalOpen(false)}
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
                            form="invite-form"
                            disabled={createLoading}
                            className={cn(
                                "px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20",
                                createLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
                            )}
                        >
                            {createLoading ? 'Sending...' : 'Send Invite'}
                        </button>
                    </div>
                }
            >
                <form id="invite-form" autoComplete="off" onSubmit={handleInviteFormSubmit} className="space-y-5">
                    <Input
                        isDarkMode={isDarkMode}
                        label="Username"
                        {...inviteRegister('username')}
                        icon={User}
                        placeholder="Enter username"
                        disabled={createLoading}
                        error={inviteErrors.username?.message}
                        required
                    />

                    <Input
                        isDarkMode={isDarkMode}
                        label="Email"
                        {...inviteRegister('email')}
                        icon={Mail}
                        placeholder="Enter email address"
                        disabled={createLoading}
                        error={inviteErrors.email?.message}
                        required
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <Controller
                            name="country_code"
                            control={inviteControl}
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
                                    error={inviteErrors.country_code?.message}
                                    required
                                />
                            )}
                        />

                        <Input
                            isDarkMode={isDarkMode}
                            label="Mobile Number"
                            {...inviteRegister('mobile')}
                            icon={Phone}
                            placeholder="Enter mobile number"
                            disabled={createLoading}
                            error={inviteErrors.mobile?.message}
                            wrapperClassName="col-span-2"
                            required
                        />
                    </div>

                    <Controller
                        name="role"
                        control={inviteControl}
                        render={({ field }) => (
                            <Select
                                label="Role"
                                value={field.value}
                                onChange={field.onChange}
                                isDarkMode={isDarkMode}
                                options={[
                                    { value: 'staff', label: 'Staff' },
                                    { value: 'agent', label: 'Agent' },
                                    { value: 'doctor', label: 'Doctor' },
                                ]}
                                disabled={createLoading}
                                error={inviteErrors.role?.message}
                                required
                            />
                        )} />
                </form>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="User Details"
                description={`Viewing details for ${selectedUser?.username}`}
                isDarkMode={isDarkMode}
                className="max-w-2xl font-sans"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsViewModalOpen(false)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
                                isDarkMode
                                    ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            )}
                        >
                            Close
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Username</label>
                        <p className={cn("text-sm", isDarkMode ? 'text-white' : 'text-slate-900')}>{userDetails?.data?.username || selectedUser?.username}</p>
                    </div>
                    <div>
                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Email</label>
                        <p className={cn("text-sm", isDarkMode ? 'text-white' : 'text-slate-900')}>{userDetails?.data?.email || selectedUser?.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Country Code</label>
                            <p className={cn("text-sm", isDarkMode ? 'text-white' : 'text-slate-900')}>{userDetails?.data?.country_code || selectedUser?.country_code}</p>
                        </div>
                        <div>
                            <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Mobile</label>
                            <p className={cn("text-sm", isDarkMode ? 'text-white' : 'text-slate-900')}>{userDetails?.data?.mobile || selectedUser?.mobile}</p>
                        </div>
                    </div>
                    <div>
                        <label className={cn("text-xs font-semibold mb-1 block", isDarkMode ? 'text-white/60' : 'text-slate-600')}>Role</label>
                        <p className={cn("text-sm", isDarkMode ? 'text-white' : 'text-slate-900')}>{userDetails?.data?.role || selectedUser?.role}</p>
                    </div>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit User"
                description={`Editing user: ${selectedUser?.username}`}
                isDarkMode={isDarkMode}
                className="max-w-2xl font-sans"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={updateLoading}
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
                            form="edit-form"
                            disabled={updateLoading}
                            className={cn(
                                "px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20",
                                updateLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
                            )}
                        >
                            {updateLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                <form id="edit-form" autoComplete="off" onSubmit={handleEditFormSubmit} className="space-y-5">
                    <Input
                        isDarkMode={isDarkMode}
                        label="Username"
                        {...editRegister('username')}
                        icon={User}
                        placeholder="Enter username"
                        disabled={updateLoading}
                        error={editErrors.username?.message}
                        required
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
                                    required
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
                            required
                        />
                    </div>

                    <Controller
                        name="role"
                        control={editControl}
                        render={({ field }) => (
                            <Select
                                label="Role"
                                value={field.value}
                                onChange={field.onChange}
                                isDarkMode={isDarkMode}
                                options={[
                                    { value: 'staff', label: 'Staff' },
                                    { value: 'agent', label: 'Agent' },
                                    { value: 'doctor', label: 'Doctor' },
                                ]}
                                disabled={updateLoading}
                                error={editErrors.role?.message}
                            />
                        )} />
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Remove Team Member"
                description={`Are you sure you want to remove ${userToDelete?.username} from the team? This user will be moved to the trash.`}
                isDarkMode={isDarkMode}
                className="max-w-md font-sans"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleteLoading}
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
                            onClick={handleConfirmDelete}
                            disabled={deleteLoading}
                            className={cn(
                                "px-6 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm transition-all shadow-lg shadow-red-500/20",
                                deleteLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
                            )}
                        >
                            {deleteLoading ? 'Removing...' : 'Remove'}
                        </button>
                    </div>
                }
            />

            {/* Permanent Delete Confirmation Modal */}
            <Modal
                isOpen={isPermanentDeleteModalOpen}
                onClose={() => setIsPermanentDeleteModalOpen(false)}
                title="Permanently Delete User"
                description={`Are you sure you want to permanently delete ${userToDelete?.username}? This action cannot be undone.`}
                isDarkMode={isDarkMode}
                className="max-w-md font-sans"
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsPermanentDeleteModalOpen(false)}
                            disabled={permanentDeleteLoading}
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
                            onClick={handleConfirmPermanentDelete}
                            disabled={permanentDeleteLoading}
                            className={cn(
                                "px-6 py-2.5 rounded-xl bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-600/20",
                                permanentDeleteLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-800"
                            )}
                        >
                            {permanentDeleteLoading ? 'Deleting...' : 'Delete Permanently'}
                        </button>
                    </div>
                }
            />
        </div >
    );
};