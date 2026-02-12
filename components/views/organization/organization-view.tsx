
"use client";

import { useState, useEffect } from 'react';
import { Plus, Eye, Edit2, Ban, Building2, Users, Calendar, CheckCircle, XCircle, Clock, MessageCircle, Hospital, Trash } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

import { OrganizationModal } from "./organization-modal";
import { Modal } from "@/components/ui/modal";
import { useActivatePromptMutation, useCreatePromptMutation, useGetPromptConfigurationQuery } from '@/hooks/usePromptQuery';
import { useCreateTenantMutation, useDeleteTenantMutation, useGetTenantsQuery, useTenantStatusMutation } from '@/hooks/useTenantQuery';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';
import { ActionMenu } from '@/components/ui/action-menu';
import { Pagination } from '@/components/ui/pagination';
import { useMemo } from 'react';

export interface Organization {
    id: string;
    tenant_id: string;
    company_name: string;
    owner_name: string;
    owner_email: string;
    owner_mobile: string;
    address: string;
    subscriptionStatus: 'active' | 'expired' | 'trial';
    subscriptionPlan: 'basic' | 'pro' | 'enterprise';
    userCount: number;
    maxUsers: number;
    registeredDate: Date;
    expiryDate: Date;
    adminName: string;
    adminEmail: string;
    isActive: boolean;
    type: 'hospital' | 'clinic';
    owner_country_code: string;
    password?: string; // Optional in interface as it might not be returned always, but needed for creation
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
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const { data: tenantsData, isLoading: isTenantLoading, isError } = useGetTenantsQuery();
    const { mutate: updateTenantStatusMutate, isPending: isTenantStatusPending } = useTenantStatusMutation();
    const { mutate: deleteMutate, isPending: isDeletePending } = useDeleteTenantMutation();
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const currentOrganizations = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return tenantsData?.data?.slice(startIndex, startIndex + itemsPerPage) || [];
    }, [tenantsData, currentPage]);

    const totalPages = Math.ceil((tenantsData?.data?.length || 0) / itemsPerPage);

    console.log("tenantsData", tenantsData)

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

    const handleToggleStatus = (id: string) => {
        const updated = organizations.map(org =>
            org.id === id ? { ...org, isActive: !org.isActive } : org
        );
        setOrganizations(updated);
        localStorage.setItem('organizations', JSON.stringify(updated));
        toast.success('Organization status updated');
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
            deleteMutate(orgToDelete.tenant_id);
            setIsDeleteModalOpen(false);
            setOrgToDelete(null);
        }
    }
    const handleSaveOrganization = (orgData: Partial<Organization>) => {
        if (modalMode === 'create') {
            const newOrg: Organization = {
                ...orgData as Organization,
                id: Date.now().toString(),
                userCount: 0,
                registeredDate: new Date(),
                expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            };
            // Remove password from object before saving if needed, but for now keeping it simple as per request or just logging it
            console.log("Creating Org with password:", orgData.password);

            const updated = [newOrg, ...organizations];
            setOrganizations(updated);
            localStorage.setItem('organizations', JSON.stringify(updated));
            toast.success('Organization registered successfully');
        } else {
            const updated = organizations.map(org =>
                org.id === selectedOrg?.id ? { ...org, ...orgData } : org
            );
            setOrganizations(updated);
            localStorage.setItem('organizations', JSON.stringify(updated));
            toast.success('Organization updated successfully');
        }
        setIsModalOpen(false);
    };

    if (isTenantLoading) {
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

    const handleToggleActive = (tenantId: string, status: string) => {
        const data = {
            status: status == "active" ? "inactive" : "active"
        }
        updateTenantStatusMutate({ tenantId, data });
    }
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
                        <Select
                            isDarkMode={isDarkMode}
                            value={filterStatus}
                            onChange={(value) => setFilterStatus(value)}
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'active', label: 'Active' },
                                { value: 'trial', label: 'Trial' },
                                { value: 'expired', label: 'Expired' }
                            ]}
                            className="max-w-[180px]"
                        />
                    </div>
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
                </div>
            </div>

            <div className={cn(
                "rounded-xl overflow-hidden border transition-all duration-200",
                isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            )}>
                <Table isDarkMode={isDarkMode}>
                    {tenantsData?.data?.length === 0 ? (
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
                                            No Organizations Found
                                        </h3>
                                        <p className={cn("text-sm mb-8 text-center max-w-sm", isDarkMode ? "text-white/60" : "text-slate-500")}>
                                            Get started by adding your first organization. You can manage hospitals, clinics, and their subscriptions here.
                                        </p>
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
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <>
                            <TableHeader isDarkMode={isDarkMode}>
                                <tr>
                                    <TableHead align="left" isDarkMode={isDarkMode} width='300px'>Organization</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Admin</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Type</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Status</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Created At</TableHead>
                                    <TableHead align="center" isDarkMode={isDarkMode}>Actions</TableHead>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {currentOrganizations.map((org: any, index: any) => (
                                    <TableRow
                                        key={org.id}
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
                                                            {org.owner_email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell align="center">
                                            <p className={cn("text-sm", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                                {org.adminName}
                                            </p>
                                            <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                                                {org.owner_name}
                                            </p>
                                        </TableCell>
                                        <TableCell align="center">
                                            <p className={cn("text-sm", isDarkMode ? "text-white/80" : "text-slate-700")}>
                                                {org.type}
                                            </p>
                                        </TableCell>

                                        <TableCell align="center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={org.status == "active" ? true : false}
                                                    onChange={() => handleToggleActive(org.tenant_id, org.status)}
                                                />
                                                <div className={cn(
                                                    "w-11 h-6 rounded-full peer transition-all",
                                                    "peer-checked:bg-emerald-600",
                                                    isDarkMode ? 'bg-white/10' : 'bg-slate-300'
                                                )}>
                                                    <div className={cn(
                                                        "absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-all",
                                                        org.status == "active" ? "translate-x-5" : "translate-x-0"
                                                    )} />
                                                </div>
                                            </label>
                                        </TableCell>

                                        <TableCell align="center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <Calendar className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                                <span className={cn("text-sm", isDarkMode ? "text-white/70" : "text-slate-600")}>
                                                    {formatDate(org.created_at)}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell align="center">
                                            <ActionMenu
                                                isDarkMode={isDarkMode}
                                                isView={true}
                                                isEdit={true}
                                                isDelete={true}
                                                // isWhatsAppConfig={true}
                                                // onWhatsAppConfig={() => handleNavigateToWhatsApp(org)}
                                                onView={() => handleOpenModal('view', org)}
                                                onEdit={() => handleOpenModal('edit', org)}
                                                onDelete={() => handleDeleteClick(org)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </>
                    )}
                </Table>
            </div>

            {tenantsData?.data?.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={tenantsData?.data?.length}
                    itemsPerPage={itemsPerPage}
                    isDarkMode={isDarkMode}
                />
            )}

            <OrganizationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrganization}
                organization={selectedOrg}
                mode={modalMode}
                isDarkMode={isDarkMode}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Organization"
                description="Are you sure you want to delete this organization?"
                isDarkMode={isDarkMode}
                className='max-w-md font-sans'
                footer={
                    <div className="flex justify-end space-x-3 pt-4 font-sans">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className="px-6 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                            disabled={isDeletePending}
                        >
                            {isDeletePending ? 'Deleting...' : 'Delete Organization'}
                        </button>
                    </div>
                }
            >
                <div className="font-sans">
                    <p className={cn("text-sm", isDarkMode ? 'text-white/70' : 'text-slate-600')}>
                        This action cannot be undone. This will permanently delete
                        <span className="font-bold mx-1 text-red-500">{orgToDelete?.company_name}</span>
                        and all associated data.
                    </p>
                </div>
            </Modal>
        </div>
    );
};