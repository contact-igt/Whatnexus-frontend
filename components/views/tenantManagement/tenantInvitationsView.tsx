"use client";

import { useState, useMemo, useEffect } from 'react';
import { Plus, Mail, Clock, CheckCircle, XCircle, RefreshCw, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/searchInput";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { OrganizationModal } from "../organization/organizationModal";
import { useGetDeletedTenantsQuery, useGetTenantInvitationsQuery, usePermanentDeleteTenantMutation, useResendInvitationMutation, useRestoreTenantMutation } from '@/hooks/useTenantQuery';
import { useTheme } from '@/hooks/useTheme';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/modal';

type TabType = 'pending' | 'trash';

export const TenantInvitationsView = () => {
    const { isDarkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const { data: invitationsData, isLoading: isInvitationsLoading } = useGetTenantInvitationsQuery();
    const { data: deletedData, isLoading: isDeletedLoading } = useGetDeletedTenantsQuery();
    const { mutate: resendInviteMutate, isPending: isResending, variables: resendingUserId } = useResendInvitationMutation();
    const { mutate: restoreMutate, isPending: isRestoring } = useRestoreTenantMutation();
    const { mutate: permanentDeleteMutate, isPending: isPermanentDeleting } = usePermanentDeleteTenantMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
    const [orgToManage, setOrgToManage] = useState<any | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const pendingInvites = useMemo(() => {
        if (!invitationsData?.data) return [];
        return invitationsData.data;
    }, [invitationsData]);

    const deletedInvites = useMemo(() => {
        if (!deletedData?.data) return [];
        // Only show tenants that were in 'invited' status (incomplete onboarding)
        return deletedData.data.filter((tenant: any) => tenant.tenant_status === 'invited');
    }, [deletedData]);

    const displayData = activeTab === 'pending' ? pendingInvites : deletedInvites;

    const filteredData = useMemo(() => {
        return displayData.filter((invite: any) =>
            invite.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invite.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [displayData, searchQuery]);

    // Reset page on tab/search change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery]);

    const currentInvites = useMemo(() => {
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(d);
    };

    const handleRestoreClick = (org: any) => {
        setOrgToManage(org);
        setIsRestoreModalOpen(true);
    };

    const handleConfirmRestore = () => {
        if (orgToManage) {
            restoreMutate(orgToManage.tenant_id, {
                onSuccess: () => setIsRestoreModalOpen(false)
            });
        }
    };

    const handlePermanentDeleteClick = (org: any) => {
        setOrgToManage(org);
        setIsPermanentDeleteModalOpen(true);
    };

    const handleConfirmPermanentDelete = () => {
        if (orgToManage) {
            permanentDeleteMutate(orgToManage.tenant_id, {
                onSuccess: () => setIsPermanentDeleteModalOpen(false)
            });
        }
    };

    const isLoading = activeTab === 'pending' ? isInvitationsLoading : isDeletedLoading;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'pending': return <Clock size={14} className="text-amber-500" />;
            case 'expired': return <XCircle size={14} className="text-red-500" />;
            default: return <Clock size={14} className="text-slate-400" />;
        }
    };

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
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={cn("text-3xl font-bold tracking-tight", isDarkMode ? 'text-white' : 'text-slate-900')}>
                            {activeTab === 'pending' ? 'Tenant Invitations' : 'Deleted Invitations'}
                        </h1>
                        <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                            {activeTab === 'pending'
                                ? 'Track and manage pending invitations for new organizations.'
                                : 'List of soft-deleted invitations. You can restore or delete them forever.'}
                        </p>
                    </div>
                    {activeTab === 'pending' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className={cn(
                                "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:brightness-110",
                                isDarkMode ? "bg-emerald-600 shadow-emerald-900/20" : "bg-emerald-600 shadow-emerald-600/20"
                            )}
                        >
                            <Plus size={18} />
                            <span>Send Invitation</span>
                        </button>
                    )}
                </div>

                <div className={cn("flex space-x-1 border-b", isDarkMode ? 'border-white/5' : 'border-slate-200')}>
                    {[
                        { id: 'pending', label: 'Pending', count: pendingInvites.length },
                        { id: 'trash', label: 'Trash', count: deletedInvites.length }
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
                    placeholder="Search invitations..."
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
                            <TableHead align="left" isDarkMode={isDarkMode} width='300px'>Organization</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Owner Email</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>{activeTab === 'pending' ? 'Status' : 'Deleted Status'}</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>{activeTab === 'pending' ? 'Invited At' : 'Deleted At'}</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Actions</TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {currentInvites.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-slate-500">
                                    {activeTab === 'pending' ? 'No invitations found.' : 'No deleted invitations found.'}
                                </td>
                            </tr>
                        ) : (
                            currentInvites.map((invite: any, index: number) => (
                                <TableRow
                                    key={invite.tenant_id + invite.owner_email}
                                    isDarkMode={isDarkMode}
                                    isLast={index === currentInvites.length - 1}
                                >
                                    <TableCell align="left">
                                        <div className="flex items-center space-x-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                                isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                                            )}>
                                                <Mail className={cn(isDarkMode ? "text-purple-400" : "text-purple-700")} size={18} />
                                            </div>
                                            <span className="font-semibold">{invite.company_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell align="center">{invite.owner_email}</TableCell>
                                    <TableCell align="center">
                                        {activeTab === 'pending' ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                {getStatusIcon(invite.invitation_status)}
                                                <span className={cn(
                                                    "text-xs font-semibold capitalize",
                                                    invite.invitation_status === 'completed' ? 'text-emerald-500' :
                                                        invite.invitation_status === 'pending' ? 'text-amber-500' : 'text-slate-500'
                                                )}>
                                                    {invite.invitation_status}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] font-bold uppercase text-red-500/50">Deleted Invitation</span>
                                                <span className={cn(
                                                    "text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100",
                                                    isDarkMode ? "bg-white/5 text-white/40" : "text-slate-400"
                                                )}>
                                                    Pending Onboarding
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <span className="text-sm">
                                            {activeTab === 'pending' ? formatDate(invite.invited_at) : formatDate(invite.deleted_at)}
                                        </span>
                                    </TableCell>
                                    <TableCell align="center">
                                        {activeTab === 'pending' ? (
                                            <button
                                                onClick={() => resendInviteMutate(invite.tenant_user_id)}
                                                disabled={isResending || invite.invitation_status === 'completed'}
                                                title="Resend Invitation"
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors",
                                                    isDarkMode ? "hover:bg-white/10 text-white/60" : "hover:bg-slate-100 text-slate-500",
                                                    invite.invitation_status === 'completed' && "opacity-20 cursor-not-allowed"
                                                )}
                                            >
                                                <RefreshCw size={16} className={cn(isResending && resendingUserId === invite.tenant_user_id && "animate-spin")} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleRestoreClick(invite)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-colors hover:bg-emerald-500/10 hover:text-emerald-500",
                                                        isDarkMode ? "text-white/60" : "text-slate-500"
                                                    )}
                                                    title="Restore"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDeleteClick(invite)}
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
                mode="create"
                isDarkMode={isDarkMode}
            />

            {/* Restore Modal */}
            <Modal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                title="Restore Invitation"
                description="Are you sure you want to restore this invitation?"
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
                <p className="text-sm opacity-70">This will bring the invitation for {orgToManage?.company_name} back to the pending list.</p>
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
                        You are about to permanently delete the invitation for <strong>{orgToManage?.company_name}</strong>. This action cannot be recovered.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
