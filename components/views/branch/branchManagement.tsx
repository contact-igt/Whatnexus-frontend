"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Eye, Edit2, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { BranchDrawer } from "./branchDrawer";
import { Select } from "@/components/ui/select";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { Pagination } from "@/components/ui/pagination";
import {
    useGetAllBranchesQuery,
    useGetDeletedBranchesQuery,
    useDeleteBranchMutation,
    useRestoreBranchMutation,
    usePermanentDeleteBranchMutation,
} from "@/hooks/useBranchQuery";
import { Branch } from "@/services/branch";
import { Phone, Mail, Building2, MapPin } from "lucide-react";

interface BranchManagementProps {
    isDarkMode: boolean;
}

export const BranchManagement = ({ isDarkMode }: BranchManagementProps) => {
    const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');

    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        type: 'soft-delete' | 'restore' | 'permanent-delete' | null;
        branchId: string | null;
        title: string;
        message: string;
        variant: 'danger' | 'success' | 'info' | 'warning';
        confirmText: string;
    }>({ isOpen: false, type: null, branchId: null, title: '', message: '', variant: 'danger', confirmText: 'Confirm' });

    const is_active_param =
        filterActive === 'all' ? undefined : filterActive === 'active' ? true : false;

    const {
        data: activeBranchesData,
        isLoading: isLoadingActive,
    } = useGetAllBranchesQuery({ search: searchQuery, is_active: is_active_param });

    const { data: deletedBranchesData, isLoading: isLoadingDeleted } = useGetDeletedBranchesQuery();

    const deleteBranchMutation = useDeleteBranchMutation();
    const restoreBranchMutation = useRestoreBranchMutation();
    const permanentDeleteBranchMutation = usePermanentDeleteBranchMutation();

    const normalizeBranches = (payload: any): Branch[] => {
        if (!payload) return [];
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.items)) return payload.items;
        if (Array.isArray(payload?.branches)) return payload.branches;
        return [];
    };

    const activeBranches = normalizeBranches(activeBranchesData?.data);
    let deletedBranches = normalizeBranches(deletedBranchesData?.data);

    // client-side search for deleted branches (hook doesn't accept params)
    if (searchQuery && deletedBranches.length) {
        const q = searchQuery.trim().toLowerCase();
        deletedBranches = deletedBranches.filter((b: Branch) => {
            return (
                (b.name || '').toLowerCase().includes(q) ||
                (b.code || '').toLowerCase().includes(q) ||
                (b.city || '').toLowerCase().includes(q)
            );
        });
    }

    const branches = activeTab === 'active' ? activeBranches : deletedBranches;
    const isLoading = activeTab === 'active' ? isLoadingActive : isLoadingDeleted;

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;
    const totalPages = Math.ceil(branches.length / itemsPerPage);
    const currentBranches = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return branches.slice(start, start + itemsPerPage);
    }, [branches, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, filterActive]);

    const handleCreateBranch = () => {
        setSelectedBranch(null);
        setDrawerMode('create');
        setIsDrawerOpen(true);
    };

    const handleViewBranch = (branch: Branch) => {
        setSelectedBranch(branch);
        setDrawerMode('view');
        setIsDrawerOpen(true);
    };

    const handleEditBranch = (branch: Branch) => {
        setSelectedBranch(branch);
        setDrawerMode('edit');
        setIsDrawerOpen(true);
    };

    const handleDeleteBranch = (branch: Branch) => {
        setConfirmationState({
            isOpen: true,
            type: 'soft-delete',
            branchId: branch.branch_id,
            title: 'Move to Trash',
            message: `Are you sure you want to move ${branch.name} to trash?`,
            variant: 'danger',
            confirmText: 'Move to Trash',
        });
    };

    const handleRestoreBranch = (branch: Branch) => {
        setConfirmationState({
            isOpen: true,
            type: 'restore',
            branchId: branch.branch_id,
            title: 'Restore Branch',
            message: `Are you sure you want to restore ${branch.name}?`,
            variant: 'success',
            confirmText: 'Restore',
        });
    };

    const handlePermanentDeleteBranch = (branch: Branch) => {
        setConfirmationState({
            isOpen: true,
            type: 'permanent-delete',
            branchId: branch.branch_id,
            title: 'Permanently Delete',
            message:
                'Permanent delete is only allowed for branches that are already in trash and not linked to future records. This action cannot be undone.',
            variant: 'danger',
            confirmText: 'Delete Permanently',
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmationState.branchId || !confirmationState.type) return;
        try {
            if (confirmationState.type === 'soft-delete') {
                await deleteBranchMutation.mutateAsync(confirmationState.branchId);
            } else if (confirmationState.type === 'restore') {
                await restoreBranchMutation.mutateAsync(confirmationState.branchId);
            } else if (confirmationState.type === 'permanent-delete') {
                await permanentDeleteBranchMutation.mutateAsync(confirmationState.branchId);
            }
            setConfirmationState((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
            console.error('Branch action failed', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab('active')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'active'
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    Active Branches
                </button>
                <button
                    onClick={() => setActiveTab('trash')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'trash'
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                            : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    Trash ({deletedBranches.length})
                </button>
            </div>

            {/* Search, Filter and Create */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-1 flex-wrap">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", isDarkMode ? "text-white/30" : "text-slate-400")} size={18} />
                        <input
                            type="text"
                            placeholder="Search branches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                            )}
                        />
                    </div>

                    <div className="min-w-[180px]">
                        <Select
                            isDarkMode={isDarkMode}
                            value={filterActive}
                            onChange={(value) => setFilterActive(value as any)}
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                            placeholder="Filter"
                        />
                    </div>
                </div>

                {activeTab === 'active' && (
                    <button
                        onClick={handleCreateBranch}
                        className={cn(
                            "px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2 whitespace-nowrap",
                            isDarkMode
                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                        )}
                    >
                        <Plus size={18} />
                        <span>Add Branch</span>
                    </button>
                )}
            </div>

            {/* Branches Grid */}
            {isLoading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn("h-40 rounded-xl", isDarkMode ? "bg-white/5" : "bg-slate-100")} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.length === 0 ? (
                        <div className={cn(
                            "col-span-full text-center py-12 rounded-xl border-2 border-dashed",
                            isDarkMode ? "border-white/10 text-white/40" : "border-slate-200 text-slate-400"
                        )}>
                            <Building2 className="mx-auto mb-3" size={48} />
                            <p className="text-lg font-medium">No branches found</p>
                            <p className="text-sm mt-1">{activeTab === 'active' ? 'Add your first branch to get started' : 'No branches in trash'}</p>
                        </div>
                    ) : (
                        currentBranches.map((branch: Branch) => (
                            <div
                                key={branch.branch_id}
                                className={cn(
                                    "p-6 rounded-xl border transition-all hover:scale-[1.02]",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                                        : 'bg-white border-slate-200 hover:shadow-lg'
                                )}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
                                                isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                                            )}>
                                                {branch.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <h3 className={cn("font-semibold text-lg", isDarkMode ? "text-white" : "text-slate-900")}>
                                                    {branch.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", branch.is_active ? (isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700') : (isDarkMode ? 'bg-slate-500/10 text-white/60' : 'bg-slate-100 text-slate-500'))}>
                                                        {branch.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {branch.is_main && (
                                                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700')}>
                                                            Main
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-400">{branch.code}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <MapPin className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {branch.city || ''}{branch.state ? `, ${branch.state}` : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Phone className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {branch.phone || 'Not provided'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Mail className={cn(isDarkMode ? "text-white/40" : "text-slate-400")} size={14} />
                                            <span className={cn("text-sm", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                                {branch.email || 'Not provided'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-2 pt-2 border-t" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                                        {activeTab === 'active' ? (
                                            <>
                                                <button
                                                    onClick={() => handleViewBranch(branch)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all",
                                                        isDarkMode
                                                            ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                                    )}
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditBranch(branch)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all",
                                                        isDarkMode
                                                            ? 'hover:bg-white/10 text-white/60 hover:text-white'
                                                            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                                                    )}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBranch(branch)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all",
                                                        isDarkMode
                                                            ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                                                            : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                                    )}
                                                    title="Trash"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleRestoreBranch(branch)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all",
                                                        isDarkMode
                                                            ? 'hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300'
                                                            : 'hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700'
                                                    )}
                                                    title="Restore"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePermanentDeleteBranch(branch)}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all",
                                                        isDarkMode
                                                            ? 'hover:bg-red-500/10 text-red-400 hover:text-red-300'
                                                            : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                                                    )}
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {branches.length > 0 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={Math.max(1, totalPages)}
                        onPageChange={setCurrentPage}
                        totalItems={branches.length}
                        itemsPerPage={itemsPerPage}
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}

            <BranchDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                branch={selectedBranch}
                mode={drawerMode}
                isDarkMode={isDarkMode}
            />

            <ConfirmationModal
                isOpen={confirmationState.isOpen}
                onClose={() => setConfirmationState((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmAction}
                title={confirmationState.title}
                message={confirmationState.message}
                variant={confirmationState.variant}
                confirmText={confirmationState.confirmText}
                isDarkMode={isDarkMode}
                isLoading={deleteBranchMutation.isPending || restoreBranchMutation.isPending || permanentDeleteBranchMutation.isPending}
            />
        </div>
    );
};
