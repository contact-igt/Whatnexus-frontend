"use client";

import { useState, useMemo, useEffect } from 'react';
import { Plus, Calendar, Building2, Hospital, RotateCcw, Trash2, AlertTriangle, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/searchInput";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { OrganizationModal } from "../organization/organizationModal";
import { Modal } from "@/components/ui/modal";
import { useDeleteTenantMutation, useGetOnboardedTenantsQuery, useTenantStatusMutation } from '@/hooks/useTenantQuery';
import { useTheme } from '@/hooks/useTheme';
import { ActionMenu } from '@/components/ui/actionMenu';
import { Pagination } from '@/components/ui/pagination';
import { useGetDeletedTenantsQuery, useRestoreTenantMutation, usePermanentDeleteTenantMutation } from '@/hooks/useTenantQuery';

type TabType = 'active' | 'trash';

export const OnboardedTenantsView = () => {
    const { isDarkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const { data: onboardedData, isLoading: isActiveLoading } = useGetOnboardedTenantsQuery();
    const { data: deletedData, isLoading: isDeletedLoading } = useGetDeletedTenantsQuery();
    const { mutate: updateTenantStatusMutate } = useTenantStatusMutation();
    const { mutate: deleteMutate, isPending: isDeletePending } = useDeleteTenantMutation();
    const { mutate: restoreMutate, isPending: isRestoring } = useRestoreTenantMutation();
    const { mutate: permanentDeleteMutate, isPending: isPermanentDeleting } = usePermanentDeleteTenantMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<any | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [orgToManage, setOrgToManage] = useState<any | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const activeTenants = useMemo(() => {
        if (!onboardedData?.data) return [];
        return onboardedData.data;
    }, [onboardedData]);

    const deletedTenants = useMemo(() => {
        if (!deletedData?.data) return [];
        // Only show tenants that have completed onboarding (not 'invited')
        const completedStatuses = ['active', 'trial', 'expired', 'suspended', 'inactive', 'maintenance', 'grace_period', 'pending_setup'];
        return deletedData.data.filter((tenant: any) => completedStatuses.includes(tenant.tenant_status));
    }, [deletedData]);

    const displayData = activeTab === 'active' ? activeTenants : deletedTenants;

    const filteredData = useMemo(() => {
        return displayData.filter((tenant: any) =>
            tenant.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.tenant_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.owner_mobile?.includes(searchQuery)
        );
    }, [displayData, searchQuery]);

    // Reset to page 1 when search query changes or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeTab]);

    const currentTenants = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const formatDate = (date: string | Date) => {
        if (!date) return '-';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(d);
    };

    const handleOpenModal = (mode: 'create' | 'edit' | 'view', org?: any) => {
        setModalMode(mode);
        setSelectedOrg(org || null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (org: any) => {
        setOrgToManage(org);
        setIsDeleteModalOpen(true);
    }

    const handleConfirmDelete = () => {
        if (orgToManage) {
            deleteMutate(orgToManage.tenant_id, {
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

    const handleToggleActive = (tenantId: string, status: string) => {
        updateTenantStatusMutate({
            tenantId,
            data: { status: status === "active" ? "inactive" : "active" }
        });
    }

    const isLoading = activeTab === 'active' ? isActiveLoading : isDeletedLoading;

    if (isLoading) {
        return (
            <div className="h-full p-8 space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded mb-4" />
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn("h-48 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 max-w-[1400px] mx-auto no-scrollbar pb-32">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {activeTab === 'active' ? 'Onboarded Tenants' : 'Trash / Deleted'}
                        </h1>
                        <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            {activeTab === 'active'
                                ? 'List of active organizations and their subscription status.'
                                : 'List of soft-deleted organizations. You can restore or permanently delete them.'}
                        </p>
                    </div>
                </div>

                <div className={cn("flex space-x-1 border-b", isDarkMode ? 'border-white/5' : 'border-slate-200')}>
                    {[
                        { id: 'active', label: 'Active', count: activeTenants.length },
                        { id: 'trash', label: 'Trash', count: deletedTenants.length }
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
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput
                    isDarkMode={isDarkMode}
                    placeholder="Search tenants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='max-w-md flex-1'
                />
            </div>

            <div className={cn(
                "rounded-xl overflow-hidden border transition-all duration-200",
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            )}>
                <Table isDarkMode={isDarkMode}>
                    <TableHeader isDarkMode={isDarkMode}>
                        <tr>
                            <TableHead align="left" isDarkMode={isDarkMode} width='260px'>Organization</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Type</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Owner</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Contact</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Plan</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Status</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Sub. End</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>{activeTab === 'active' ? 'Created At' : 'Deleted At'}</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Actions</TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {currentTenants.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="py-10 text-center text-slate-500">
                                    {activeTab === 'active' ? 'No onboarded tenants found.' : 'No deleted tenants found.'}
                                </td>
                            </tr>
                        ) : (
                            currentTenants.map((tenant: any, index: number) => (
                                <TableRow
                                    key={tenant.tenant_id}
                                    isDarkMode={isDarkMode}
                                    isLast={index === currentTenants.length - 1}
                                >
                                    <TableCell align="left">
                                        <div className="flex items-center space-x-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                                isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"
                                            )}>
                                                <Building2 className={cn(isDarkMode ? "text-emerald-400" : "text-emerald-700")} size={20} />
                                            </div>
                                            <div>
                                                <p className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {tenant.company_name}
                                                </p>
                                                <p className={cn("text-xs opacity-60", isDarkMode ? "text-white" : "text-slate-500")}>
                                                    {tenant.tenant_id}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {/* Type */}
                                    <TableCell align="center">
                                        <span className={cn(
                                            "px-2 py-1 rounded-md text-xs font-medium capitalize",
                                            isDarkMode ? "bg-white/5 text-white/60" : "bg-slate-100 text-slate-600"
                                        )}>
                                            {tenant.type || 'organization'}
                                        </span>
                                    </TableCell>
                                    {/* Owner Name + Email */}
                                    <TableCell align="center">
                                        <p className={cn("text-sm font-medium", isDarkMode ? "text-white/80" : "text-slate-700")}>{tenant.owner_name}</p>
                                        <p className={cn("text-[10px] leading-tight", isDarkMode ? "text-white/40" : "text-slate-400")}>{tenant.owner_email}</p>
                                    </TableCell>
                                    {/* Contact */}
                                    <TableCell align="center">
                                        <p className={cn("text-xs font-mono", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                            {tenant.owner_country_code ? `+${tenant.owner_country_code} ` : ''}{tenant.owner_mobile || '-'}
                                        </p>
                                    </TableCell>
                                    {/* Plan */}
                                    <TableCell align="center">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-md text-xs font-semibold capitalize",
                                            tenant.subscription_plan === 'enterprise' ? 'bg-amber-500/10 text-amber-600' :
                                                tenant.subscription_plan === 'pro' ? 'bg-purple-500/10 text-purple-600' :
                                                    isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'
                                        )}>
                                            {tenant.subscription_plan || 'basic'}
                                        </span>
                                    </TableCell>
                                    {/* Status */}
                                    <TableCell align="center">
                                        {activeTab === 'active' ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(tenant.tenant_id, tenant.status)}
                                                    className={cn(
                                                        "flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95",
                                                        tenant.status === 'active' ? "text-emerald-500" : "text-slate-400"
                                                    )}
                                                    title={tenant.status === 'active' ? "Deactivate" : "Activate"}
                                                >
                                                    {tenant.status === 'active' ? (
                                                        <ToggleRight size={24} className="fill-emerald-500/20" />
                                                    ) : (
                                                        <ToggleLeft size={24} />
                                                    )}
                                                </button>
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                                                    tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        tenant.status === 'trial' ? 'bg-blue-500/10 text-blue-500' :
                                                            tenant.status === 'invited' ? 'bg-purple-500/10 text-purple-500' :
                                                                tenant.status === 'expired' ? 'bg-red-500/10 text-red-500' :
                                                                    tenant.status === 'suspended' ? 'bg-orange-500/10 text-orange-500' :
                                                                        isDarkMode ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'
                                                )}>
                                                    {tenant.status || '-'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[10px] font-bold uppercase text-red-500/60">Deleted</span>
                                                <span className={cn(
                                                    "text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded",
                                                    isDarkMode ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-400"
                                                )}>Onboarded</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    {/* Subscription End */}
                                    <TableCell align="center">
                                        <div className="flex items-center justify-center space-x-1.5">
                                            {tenant.subscription_end_date
                                                ? <><Calendar size={12} className="opacity-40" /><span className={cn("text-xs", isDarkMode ? "text-white/60" : "text-slate-600")}>{formatDate(tenant.subscription_end_date)}</span></>
                                                : <span className="text-xs opacity-40">-</span>}
                                        </div>
                                    </TableCell>
                                    {/* Created / Deleted At */}

                                    <TableCell align="center">
                                        <span className="text-xs opacity-60">
                                            {activeTab === 'active' ? formatDate(tenant.created_at) : formatDate(tenant.deleted_at)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        {activeTab === 'active' ? (
                                            <ActionMenu
                                                isDarkMode={isDarkMode}
                                                isView={true}
                                                isEdit={true}
                                                isDelete={true}
                                                onView={() => handleOpenModal('view', tenant)}
                                                onEdit={() => handleOpenModal('edit', tenant)}
                                                onDelete={() => handleDeleteClick(tenant)}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleRestoreClick(tenant)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors hover:bg-emerald-500/10 hover:text-emerald-500",
                                                        isDarkMode ? "text-white/60" : "text-slate-500"
                                                    )}
                                                    title="Restore"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDeleteClick(tenant)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500",
                                                        isDarkMode ? "text-white/60" : "text-slate-500"
                                                    )}
                                                    title="Permanent Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {filteredData.length > itemsPerPage && (
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

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Organization"
                description="Are you sure you want to delete this organization?"
                isDarkMode={isDarkMode}
                footer={
                    <div className="flex justify-end space-x-3 pt-4 font-sans">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={isDeletePending}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            {isDeletePending ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                }
            >
                <p className="text-sm opacity-70">This will soft delete {orgToManage?.company_name} and move it to trash.</p>
            </Modal>

            {/* Restore Modal */}
            <Modal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                title="Restore Organization"
                description="Are you sure you want to restore this organization?"
                isDarkMode={isDarkMode}
                footer={
                    <div className="flex justify-end space-x-3 pt-4 font-sans">
                        <button onClick={() => setIsRestoreModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button
                            onClick={handleConfirmRestore}
                            disabled={isRestoring}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg"
                        >
                            {isRestoring ? 'Restoring...' : 'Restore'}
                        </button>
                    </div>
                }
            >
                <p className="text-sm opacity-70">This will bring {orgToManage?.company_name} back to the active list.</p>
            </Modal>

            {/* Permanent Delete Modal */}
            <Modal
                isOpen={isPermanentDeleteModalOpen}
                onClose={() => setIsPermanentDeleteModalOpen(false)}
                title="Permanent Delete"
                description="WARNING: This action cannot be undone."
                isDarkMode={isDarkMode}
                footer={
                    <div className="flex justify-end space-x-3 pt-4 font-sans">
                        <button onClick={() => setIsPermanentDeleteModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button
                            onClick={handleConfirmPermanentDelete}
                            disabled={isPermanentDeleting}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            {isPermanentDeleting ? 'Deleting Permanently...' : 'Delete Permanently'}
                        </button>
                    </div>
                }
            >
                <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                    <p className="text-sm text-red-500">
                        You are about to permanently delete <strong>{orgToManage?.company_name}</strong>. This action cannot be recovered.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
