"use client";

import { useState, useMemo, useEffect } from 'react';
import { RefreshCcw, Trash2, Building2, Calendar, Search, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/searchInput";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useGetDeletedTenantsQuery, useRestoreTenantMutation, usePermanentDeleteTenantMutation } from '@/hooks/useTenantQuery';
import { useTheme } from '@/hooks/useTheme';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';

export const DeletedTenantsView = () => {
    const { isDarkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: deletedData, isLoading } = useGetDeletedTenantsQuery();
    const { mutate: restoreMutate, isPending: isRestoring } = useRestoreTenantMutation();
    const { mutate: permanentDeleteMutate, isPending: isDeleting } = usePermanentDeleteTenantMutation();

    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<any | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const filteredData = useMemo(() => {
        if (!deletedData?.data) return [];
        return deletedData.data.filter((tenant: any) =>
            tenant.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.tenant_id?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [deletedData, searchQuery]);

    // Reset to page 1 on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const currentTenants = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const formatDate = (date: string | Date) => {
        if (!date) return '-';
        const d = new Date(date);
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        }).format(d);
    };

    const handleRestoreClick = (org: any) => {
        setSelectedOrg(org);
        setIsRestoreModalOpen(true);
    };

    const handleDeleteClick = (org: any) => {
        setSelectedOrg(org);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmRestore = () => {
        if (selectedOrg) {
            restoreMutate(selectedOrg.tenant_id, {
                onSuccess: () => setIsRestoreModalOpen(false)
            });
        }
    };

    const handleConfirmPermanentDelete = () => {
        if (selectedOrg) {
            permanentDeleteMutate(selectedOrg.tenant_id, {
                onSuccess: () => setIsDeleteModalOpen(false)
            });
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
                <h1 className={cn("text-3xl font-bold tracking-tight text-red-500")}>
                    Trash / Deleted Organizations
                </h1>
                <p className={cn("text-sm", isDarkMode ? 'text-white/60' : 'text-slate-600')}>
                    View and manage soft-deleted tenants. You can restore them or permanently delete them.
                </p>
            </div>

            <div className="flex items-center justify-between gap-4">
                <SearchInput
                    isDarkMode={isDarkMode}
                    placeholder="Search deleted tenants..."
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
                            <TableHead align="center" isDarkMode={isDarkMode}>Owner</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Deleted At</TableHead>
                            <TableHead align="center" isDarkMode={isDarkMode}>Actions</TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {currentTenants.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-20 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <Trash2 size={48} className="mb-4" />
                                        <p>No deleted organizations found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            currentTenants.map((tenant: any) => (
                                <TableRow key={tenant.tenant_id} isDarkMode={isDarkMode}>
                                    <TableCell align="left">
                                        <div className="flex items-center space-x-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                                isDarkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-600"
                                            )}>
                                                <Building2 size={20} />
                                            </div>
                                            <div>
                                                <p className={cn("font-semibold text-sm", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {tenant.company_name}
                                                </p>
                                                <p className="text-xs opacity-50">{tenant.tenant_id}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell align="center">
                                        <p className="text-sm">{tenant.owner_name}</p>
                                        <p className="text-xs opacity-50">{tenant.owner_email}</p>
                                    </TableCell>
                                    <TableCell align="center">
                                        <div className="flex items-center justify-center space-x-2 text-xs opacity-60">
                                            <Calendar size={14} />
                                            <span>{formatDate(tenant.deleted_at)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell align="center">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => handleRestoreClick(tenant)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors hover:bg-emerald-500/10 hover:text-emerald-500",
                                                    isDarkMode ? "text-white/60" : "text-slate-500"
                                                )}
                                                title="Restore"
                                            >
                                                <RefreshCcw size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(tenant)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors hover:bg-red-500/10 hover:text-red-500",
                                                    isDarkMode ? "text-white/60" : "text-slate-500"
                                                )}
                                                title="Permanent Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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

            {/* Restore Modal */}
            <Modal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                title="Restore Organization"
                description="Are you sure you want to restore this organization?"
                isDarkMode={isDarkMode}
                footer={
                    <div className="flex justify-end space-x-3 pt-4">
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
                <p className="text-sm opacity-70">This will bring {selectedOrg?.company_name} back to the active list.</p>
            </Modal>

            {/* Permanent Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Permanent Delete"
                description="WARNING: This action cannot be undone."
                isDarkMode={isDarkMode}
                footer={
                    <div className="flex justify-end space-x-3 pt-4">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                        <button
                            onClick={handleConfirmPermanentDelete}
                            disabled={isDeleting}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            {isDeleting ? 'Deleting Permanently...' : 'Delete Permanently'}
                        </button>
                    </div>
                }
            >
                <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                    <p className="text-sm text-red-500">
                        You are about to permanently delete <strong>{selectedOrg?.company_name}</strong>. This will remove all data and cannot be recovered.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
