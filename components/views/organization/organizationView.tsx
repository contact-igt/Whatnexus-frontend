"use client";

import { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Ban, Building2, Users, Calendar, CheckCircle, XCircle, Clock, MessageCircle, Hospital, Trash, RotateCcw, RefreshCcw } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/searchInput";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

import { OrganizationModal } from "./organizationModal";
import { Modal } from "@/components/ui/modal";
import { useDeleteTenantMutation, useGetTenantsQuery, useTenantStatusMutation } from '@/hooks/useTenantQuery';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { ActionMenu } from '@/components/ui/actionMenu';
import { Pagination } from '@/components/ui/pagination';
import { useMemo } from 'react';
import { useGetDeletedTenantsQuery, useRestoreTenantMutation, usePermanentDeleteTenantMutation } from '@/hooks/useTenantQuery';

type TabType = 'active' | 'trash';

export interface Organization {
    id: string;
    tenant_id: string;
    company_name: string;
    owner_name: string;
    owner_email: string;
    owner_mobile: string;
    address: string;
    city?: string;
    country?: string;
    state?: string;
    pincode?: string;
    subscriptionStatus: 'active' | 'expired' | 'trial' | 'invited' | 'inactive' | 'suspended' | 'pending_setup' | 'grace_period' | 'maintenance';
    status: 'active' | 'expired' | 'trial' | 'invited' | 'inactive' | 'suspended' | 'pending_setup' | 'grace_period' | 'maintenance';
    subscriptionPlan: 'basic' | 'pro' | 'enterprise';
    subscription_plan: 'basic' | 'pro' | 'enterprise';
    userCount: number;
    maxUsers: number;
    max_users: number;
    registeredDate: Date;
    expiryDate: Date;
    adminName: string;
    adminEmail: string;
    isActive: boolean;
    type: 'hospital' | 'clinic';
    owner_country_code: string;
    profile?: any;
    password?: string;
    subscription_start_date?: string | Date;
    subscription_end_date?: string | Date;
    created_at?: string | Date;
    deleted_at?: string | Date;
    whatsappConfig?: {
        wabaId: string;
        phoneNumberId: string;
        accessToken: string;
        metaAppId: string;
        metaAppSecret?: string;
        isConnected: boolean;
        lastConnected?: Date;
        verificationStatus?: 'verified' | 'pending' | 'unverified';
    };
}

export const OrganizationView = () => {
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const { data: tenantsData, isLoading: isTenantLoading, isError } = useGetTenantsQuery();
    const { data: deletedData, isLoading: isDeletedLoading } = useGetDeletedTenantsQuery();
    const { mutate: updateTenantStatusMutate, isPending: isTenantStatusPending } = useTenantStatusMutation();
    const { mutate: deleteMutate, isPending: isDeletePending } = useDeleteTenantMutation();
    const { mutate: restoreMutate, isPending: isRestoring } = useRestoreTenantMutation();
    const { mutate: permanentDeleteMutate, isPending: isPermanentDeleting } = usePermanentDeleteTenantMutation();
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
    const [orgToManage, setOrgToManage] = useState<any | null>(null);
    const [orgToDelete, setOrgToDelete] = useState<any | null>(null);
    const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const activeOrgs = useMemo(() => {
        if (!tenantsData?.data) return [];
        return tenantsData.data;
    }, [tenantsData]);

    const deletedOrgs = useMemo(() => {
        if (!deletedData?.data) return [];
        return deletedData.data;
    }, [deletedData]);

    const displayData = activeTab === 'active' ? activeOrgs : deletedOrgs;

    const filteredData = useMemo(() => {
        return displayData.filter((org: any) =>
            org.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.tenant_id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [displayData, searchQuery]);

    const currentOrganizations = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Reset pagination when switching tabs or searching
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    const getPlanBadgeColor = (plan: string) => {
        switch (plan) {
            case 'basic': return 'bg-slate-500/10 text-slate-600';
            case 'pro': return 'bg-purple-500/10 text-purple-600';
            case 'enterprise': return 'bg-amber-500/10 text-amber-600';
            default: return 'bg-slate-500/10 text-slate-600';
        }
    };

    const formatDate = (date: string | Date) => {
        if (!date) return '-';
        const d = new Date(date);
        // Check if date is valid
        if (isNaN(d.getTime())) return 'Invalid Date';

        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(d);
    };

    const handleActivateClick = (org: any) => {
        setOrgToManage(org);
        setIsActivateModalOpen(true);
    };

    const handleDeactivateClick = (org: any) => {
        setOrgToManage(org);
        setIsDeactivateModalOpen(true);
    };

    const confirmActivate = () => {
        if (orgToManage) {
            updateTenantStatusMutate({ tenantId: orgToManage.tenant_id, data: { status: 'active' } }, {
                onSuccess: () => {
                    toast.success('Organization activated successfully');
                    setIsActivateModalOpen(false);
                }
            });
        }
    };

    const confirmDeactivate = () => {
        if (orgToManage) {
            updateTenantStatusMutate({ tenantId: orgToManage.tenant_id, data: { status: 'inactive' } }, {
                onSuccess: () => {
                    toast.success('Organization deactivated successfully');
                    setIsDeactivateModalOpen(false);
                }
            });
        }
    };

    const handleOpenModal = (mode: 'create' | 'edit' | 'view', org?: Organization) => {
        setModalMode(mode);
        setSelectedOrg(org || null);
        setIsModalOpen(true);
    };

    const handleNavigateToWhatsApp = (org: Organization) => {
        console.log("Navigate to WhatsApp", org.tenant_id)
        router.push(`/whatsapp-settings?tenantId=${org.tenant_id}`);
    }
    const handleDeleteClick = (org: Organization) => {
        setOrgToDelete(org);
        setIsDeleteModalOpen(true);
    }

    const handleConfirmDelete = () => {
        if (orgToDelete) {
            deleteMutate(orgToDelete.tenant_id, {
                onSuccess: () => setIsDeleteModalOpen(false)
            });
        }
    }

    const handleRestoreClick = (org: any) => {
        setOrgToManage(org);
        setIsRestoreModalOpen(true);
    }

    const handleConfirmRestore = () => {
        if (orgToManage) {
            restoreMutate(orgToManage.tenant_id, {
                onSuccess: () => setIsRestoreModalOpen(false)
            });
        }
    }

    const handlePermanentDeleteClick = (org: any) => {
        setOrgToManage(org);
        setIsPermanentDeleteModalOpen(true);
    }

    const handleConfirmPermanentDelete = () => {
        if (orgToManage) {
            permanentDeleteMutate(orgToManage.tenant_id, {
                onSuccess: () => setIsPermanentDeleteModalOpen(false)
            });
        }
    }
    const isLoading = activeTab === 'active' ? isTenantLoading : isDeletedLoading;

    if (isLoading) {
        return (
            <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn("h-48 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            <div className="space-y-2">
                <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Organizations
                </h1>
                <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    Manage hospital registrations, subscriptions, and user access.
                </p>
            </div>

            <div className={cn("flex space-x-1 border-b", isDarkMode ? 'border-white/5' : 'border-slate-200')}>
                {[
                    { id: 'active', label: 'Active', count: activeOrgs.length },
                    { id: 'trash', label: 'Trash', count: deletedOrgs.length }
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
                        <span className={cn("ml-2 opacity-50")}>({tab.count})</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        <SearchInput
                            isDarkMode={isDarkMode}
                            placeholder="Search organizations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='flex-1'
                        />
                    </div>
                    {activeTab === 'active' && (
                        <button
                            onClick={() => handleOpenModal('create')}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                                isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20"
                            )}
                        >
                            <Plus size={18} />
                            <span>Add Organization</span>
                        </button>
                    )}
                </div>
            </div>

            <div className={cn(
                "rounded-xl overflow-hidden border transition-all duration-200",
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            )}>
                <Table isDarkMode={isDarkMode}>
                    {filteredData.length === 0 ? (
                        <tbody>
                            <tr>
                                <td colSpan={7}>
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className={cn(
                                            "w-20 h-20 rounded-full flex items-center justify-center mb-6",
                                            isDarkMode ? 'bg-white/5' : 'bg-slate-50'
                                        )}>
                                            <Building2 className={cn("opacity-50", isDarkMode ? "text-white" : "text-slate-400")} size={40} />
                                        </div>
                                        <h3 className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                                            {activeTab === 'active' ? 'No Organizations Found' : 'No Deleted Organizations Found'}
                                        </h3>
                                        <p className={cn("text-sm mb-8 text-center max-w-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                            {activeTab === 'active'
                                                ? 'Get started by adding your first organization.'
                                                : 'Soft-deleted organizations will appear here. You can restore them or delete them forever.'}
                                        </p>
                                        {activeTab === 'active' && (
                                            <button
                                                onClick={() => handleOpenModal('create')}
                                                className={cn(
                                                    "flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:scale-105 active:scale-95",
                                                    isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20"
                                                )}
                                            >
                                                <Plus size={18} />
                                                <span>Create First Organization</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <>
                            <TableHeader isDarkMode={isDarkMode}>
                                <tr>
                                    <TableHead align="left" isDarkMode={isDarkMode} width='280px'>Organization</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Owner</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Type</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Plan</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Status</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Max Users</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Created At</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Actions</TableHead>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {currentOrganizations.map((org: any, index: any) => (
                                    <TableRow
                                        key={org.tenant_id}
                                        isDarkMode={isDarkMode}
                                        isLast={index === currentOrganizations.length - 1}
                                    >
                                        <TableCell align="left">
                                            <div className="flex justify-start items-center">
                                                <div className='flex justify-start items-center space-x-3'>
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                        isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                                                    )}>
                                                        {org.type == "hospital" ? <Hospital className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-700")} size={20} /> : <Building2 className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-700")} size={20} />}
                                                    </div>
                                                    <div className='text-start'>
                                                        <p className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                            {org.company_name}
                                                        </p>
                                                        <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                            {org.type || 'clinic'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell align="center">
                                            <div>
                                                <p className={cn("text-sm font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                                    {org.owner_name}
                                                </p>
                                                <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-slate-400")}>
                                                    {org.owner_email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-xs font-medium capitalize",
                                                isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-600"
                                            )}>
                                                {org.type || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-xs font-semibold capitalize",
                                                org.subscription_plan === 'enterprise' ? 'bg-amber-500/10 text-amber-600' :
                                                    org.subscription_plan === 'pro' ? 'bg-purple-500/10 text-purple-600' :
                                                        isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'
                                            )}>
                                                {org.subscription_plan || 'basic'}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                org.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    org.status === 'trial' ? 'bg-blue-500/10 text-blue-500' :
                                                        org.status === 'invited' ? 'bg-purple-500/10 text-purple-500' :
                                                            org.status === 'expired' ? 'bg-red-500/10 text-red-500' :
                                                                org.status === 'suspended' ? 'bg-orange-500/10 text-orange-500' :
                                                                    isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'
                                            )}>
                                                {org.status || '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className={cn("text-sm font-medium", isDarkMode ? "text-white/70" : "text-slate-700")}>
                                                {org.max_users ?? '-'}
                                            </span>
                                        </TableCell>

                                        <TableCell align="center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Calendar className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                                <span className={cn("text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                                    {activeTab === 'active' ? formatDate(org.created_at) : formatDate(org.deleted_at)}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell align="center">
                                            {activeTab === 'active' ? (
                                                <ActionMenu
                                                    isDarkMode={isDarkMode}
                                                    isView={true}
                                                    isEdit={true}
                                                    isDelete={true}
                                                    isActivate={org.status !== 'active'}
                                                    onActivate={() => handleActivateClick(org)}
                                                    isDeactivate={org.status === 'active'}
                                                    onDeactivate={() => handleDeactivateClick(org)}
                                                    onView={() => handleOpenModal('view', org)}
                                                    onEdit={() => handleOpenModal('edit', org)}
                                                    onDelete={() => handleDeleteClick(org)}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleRestoreClick(org)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors hover:bg-emerald-500/10 hover:text-emerald-500",
                                                            isDarkMode ? "text-white/60" : "text-slate-500"
                                                        )}
                                                        title="Restore"
                                                    >
                                                        <RotateCcw size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDeleteClick(org)}
                                                        className={cn(
                                                            "p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500",
                                                            isDarkMode ? "text-white/60" : "text-slate-500"
                                                        )}
                                                        title="Permanent Delete"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </>
                    )}
                </Table>
            </div>

            {filteredData.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    isDarkMode={isDarkMode}
                />
            )}

            <OrganizationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                organization={selectedOrg}
                mode={modalMode}
                isDarkMode={isDarkMode}
            />

            {/* Restore Confirmation Modal */}
            <Modal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                isDarkMode={isDarkMode}
                className={cn(
                    "max-w-md p-6 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode ? "bg-[#0A0A0B] border-white/10" : "bg-white border-slate-200"
                )}
            >
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <RotateCcw className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                Restore Organization
                            </h3>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Are you sure you want to restore {orgToManage?.company_name}?
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsRestoreModalOpen(false)}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl font-medium transition-all",
                                isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmRestore}
                            disabled={isRestoring}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                            {isRestoring ? 'Restoring...' : 'Restore'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Activate Confirmation Modal */}
            <Modal
                isOpen={isActivateModalOpen}
                onClose={() => setIsActivateModalOpen(false)}
                isDarkMode={isDarkMode}
                className={cn(
                    "max-w-md p-6 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode ? "bg-[#0A0A0B] border-white/10" : "bg-white border-slate-200"
                )}
            >
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                Activate Organization
                            </h3>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Are you sure you want to activate {orgToManage?.company_name}? This will allow all associated users to log in.
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsActivateModalOpen(false)}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl font-medium transition-all",
                                isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmActivate}
                            disabled={isTenantStatusPending}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                            {isTenantStatusPending ? 'Activating...' : 'Activate'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Deactivate Confirmation Modal */}
            <Modal
                isOpen={isDeactivateModalOpen}
                onClose={() => setIsDeactivateModalOpen(false)}
                isDarkMode={isDarkMode}
                className={cn(
                    "max-w-md p-6 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode ? "bg-[#0A0A0B] border-white/10" : "bg-white border-slate-200"
                )}
            >
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl">
                            <Ban className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                Deactivate Organization
                            </h3>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Are you sure you want to deactivate {orgToManage?.company_name}? This will block all associated users from logging in.
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsDeactivateModalOpen(false)}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl font-medium transition-all",
                                isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDeactivate}
                            disabled={isTenantStatusPending}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-600 text-white font-medium hover:bg-orange-700 transition-all disabled:opacity-50"
                        >
                            {isTenantStatusPending ? 'Deactivating...' : 'Deactivate'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Permanent Delete Modal */}
            <Modal
                isOpen={isPermanentDeleteModalOpen}
                onClose={() => setIsPermanentDeleteModalOpen(false)}
                isDarkMode={isDarkMode}
                className={cn(
                    "max-w-md p-6 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode ? "bg-[#0A0A0B] border-white/10" : "bg-white border-slate-200"
                )}
            >
                <div className="space-y-6 font-sans">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Trash className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                Permanent Delete
                            </h3>
                            <p className={cn("text-sm opacity-70", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                WARNING: This action cannot be undone. All data for {orgToManage?.company_name} will be lost forever.
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsPermanentDeleteModalOpen(false)}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl font-medium transition-all",
                                isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmPermanentDelete}
                            disabled={isPermanentDeleting}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            {isPermanentDeleting ? 'Deleting...' : 'Delete Forever'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Soft Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                isDarkMode={isDarkMode}
                className={cn(
                    "max-w-md p-6 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200",
                    isDarkMode ? "bg-[#0A0A0B] border-white/10" : "bg-white border-slate-200"
                )}
            >
                <div className="space-y-6 font-sans">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <Trash className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", isDarkMode ? "text-white" : "text-slate-900")}>
                                Delete Organization
                            </h3>
                            <p className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                Are you sure you want to delete {orgToDelete?.company_name}?
                            </p>
                        </div>
                    </div>
                    <div className="font-sans">
                        <p className={cn("text-sm opacity-70", isDarkMode ? 'text-white/70' : 'text-slate-600')}>
                            This will move the organization to the Trash. You can restore it later.
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl font-medium transition-all",
                                isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isDeletePending}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                        >
                            {isDeletePending ? 'Deleting...' : 'Move to Trash'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};