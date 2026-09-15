"use client";

import { useState } from 'react';
import { Search, Plus, Briefcase, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SpecializationDrawer, Specialization } from './specializationDrawer';
import { useGetAllSpecializationsQuery, useDeleteSpecializationMutation, useToggleSpecializationStatusMutation, useGetDeletedSpecializationsQuery, useRestoreSpecializationMutation, usePermanentDeleteSpecializationMutation } from '@/hooks/useSpecializationsQuery';
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { useAuth } from '@/redux/selectors/auth/authSelector';
import { ActionMenu } from '@/components/ui/actionMenu';

interface SpecializationManagementProps {
    isDarkMode: boolean;
}

export const SpecializationManagement = ({ isDarkMode }: SpecializationManagementProps) => {
    const [isTrash, setIsTrash] = useState(false);
    const [trashPage, setTrashPage] = useState(1);
    const { user } = useAuth();
    const canManageTrash = user?.user_type === 'tenant' && user?.role === 'tenant_admin';
    const { data: deletedData, isLoading: isLoadingTrash, isError: isTrashError } = useGetDeletedSpecializationsQuery(trashPage);
    const restoreMutation = useRestoreSpecializationMutation();
    const permanentDeleteMutation = usePermanentDeleteSpecializationMutation();
    const [action, setAction] = useState<'delete' | 'restore' | 'permanent'>('delete');
    const { data: specializationsData, isLoading } = useGetAllSpecializationsQuery();
    const deleteMutation = useDeleteSpecializationMutation();
    const toggleStatusMutation = useToggleSpecializationStatusMutation();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create');

    // Confirmation State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const specializations = isTrash ? deletedData?.data?.items || [] : specializationsData?.data || [];
    const isPending = deleteMutation.isPending || restoreMutation.isPending || permanentDeleteMutation.isPending;

    const filteredSpecializations = specializations.filter((spec: Specialization) =>
        (spec.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (spec.description && spec.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCreate = () => {
        setSelectedSpecialization(null);
        setDrawerMode('create');
        setIsDrawerOpen(true);
    };

    const handleEdit = (spec: Specialization) => {
        setSelectedSpecialization(spec);
        setDrawerMode('edit');
        setIsDrawerOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setAction('delete');
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            try {
                await (action === 'restore' ? restoreMutation : action === 'permanent' ? permanentDeleteMutation : deleteMutation).mutateAsync(deleteId);
                setDeleteId(null);
                // Toast handled in mutation
            } catch (error) {
                console.error("Failed to delete specialization", error);
            }
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleStatusMutation.mutateAsync(id);
            // Toast handled in mutation
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
                        isDarkMode ? "text-white/40" : "text-slate-400"
                    )} size={18} />
                    <input
                        type="text"
                        placeholder={isTrash ? "Search this trash page..." : "Search specializations..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                            isDarkMode
                                ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:bg-white/10"
                                : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                        )}
                    />
                </div>
                <button
                    onClick={handleCreate}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg active:scale-95",
                        isDarkMode
                            ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                    )}
                >
                    <Plus size={18} />
                    <span>Add Specialization</span>
                </button>
            </div>

            <div className="flex gap-4 border-b border-slate-500/20" aria-label="Specialization views">
                {[false, true].map(trash => (
                    <button key={String(trash)} onClick={() => { setIsTrash(trash); setSearchQuery(''); }}
                        aria-pressed={isTrash === trash}
                        className={cn("flex items-center gap-2 px-3 py-2 border-b-2 text-sm font-medium", isTrash === trash ? "border-emerald-500 text-emerald-500" : "border-transparent text-slate-500")}>
                        {trash && <Trash2 size={16} />}
                        {trash ? 'Trash' : 'All Specializations'}
                    </button>
                ))}
            </div>
            {/* List View */}
            <div className="grid gap-4">
                {(isTrash ? isLoadingTrash : isLoading) ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                ) : isTrash && isTrashError ? (<p role="alert" className="text-red-500">Unable to load trash. Please try again.</p>) : filteredSpecializations.length === 0 ? (
                    <div className={cn(
                        "text-center py-12 rounded-2xl border border-dashed",
                        isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                    )}>
                        <div className={cn("mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3", isDarkMode ? "bg-white/10" : "bg-white shadow-sm")}>
                            <Briefcase className={isDarkMode ? "text-white/40" : "text-slate-400"} size={24} />
                        </div>
                        <h3 className={cn("text-sm font-medium mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                            {isTrash ? 'No deleted specializations found' : 'No specializations found'}
                        </h3>
                        <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                            {searchQuery ? "Try adjusting your search terms" : isTrash ? "Deleted specializations will appear here" : "Get started by adding a new specialization"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredSpecializations.map((spec: Specialization) => (
                            <div
                                key={spec.specialization_id}
                                className={cn(
                                    "group p-4 rounded-xl border transition-all duration-300 hover:shadow-md",
                                    isDarkMode
                                        ? "bg-[#1c1c21] border-white/5 hover:border-white/10 hover:bg-white/5"
                                        : "bg-white border-slate-200 hover:border-emerald-200/50 hover:shadow-emerald-500/5"
                                )}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={cn("font-semibold truncate", isDarkMode ? "text-white" : "text-slate-900")}>
                                                {spec.name}
                                            </h3>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1",
                                                spec.is_active
                                                    ? (isDarkMode ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border-emerald-200")
                                                    : (isDarkMode ? "bg-slate-500/10 text-slate-400 border-slate-500/20" : "bg-slate-100 text-slate-600 border-slate-200")
                                            )}>
                                                {isTrash ? "Deleted" : spec.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className={cn("text-sm line-clamp-2", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                            {spec.description || "No description provided."}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {!isTrash && <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={spec.is_active}
                                                onChange={() => handleToggleStatus(spec.specialization_id)}
                                            />
                                            <div className={cn(
                                                "w-11 h-6 rounded-full peer transition-all",
                                                "peer-checked:bg-emerald-600",
                                                isDarkMode ? 'bg-[#29292e]' : 'bg-slate-300'
                                            )}>
                                                <div className={cn(
                                                    "absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-all",
                                                    spec.is_active ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </div>
                                        </label>}

                                        <ActionMenu
                                            isDarkMode={isDarkMode}
                                            isEdit={!isTrash}
                                            onEdit={() => handleEdit(spec)}
                                            isDelete={!isTrash && canManageTrash}
                                            onDelete={() => handleDeleteClick(spec.specialization_id)}
                                            isRestore={isTrash && canManageTrash}
                                            isPermanentDelete={isTrash && canManageTrash}
                                            onRestore={() => { setAction('restore'); setDeleteId(spec.specialization_id); }}
                                            onPermanentDelete={() => { setAction('permanent'); setDeleteId(spec.specialization_id); }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isTrash && (deletedData?.data?.total || 0) > 20 && (
                <div className="flex justify-end items-center gap-4 text-sm">
                    <button disabled={trashPage === 1} onClick={() => setTrashPage(p => p - 1)} className="text-emerald-500 disabled:opacity-40">Previous</button>
                    <span className="text-slate-500">Page {trashPage}</span>
                    <button disabled={trashPage * 20 >= deletedData.data.total} onClick={() => setTrashPage(p => p + 1)} className="text-emerald-500 disabled:opacity-40">Next</button>
                </div>
            )}
            {/* Drawer */}
            <SpecializationDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                specialization={selectedSpecialization}
                mode={drawerMode}
                isDarkMode={isDarkMode}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                isLoading={isPending}
                title={action === 'restore' ? 'Restore Specialization' : action === 'permanent' ? 'Permanently Delete Specialization' : 'Delete Specialization'}
                message={action === 'restore' ? 'Restore this specialization?' : action === 'permanent' ? 'Permanently delete this specialization? This action cannot be undone.' : 'Are you sure you want to move this specialization to trash? You can restore it later.'}
                confirmText={action === 'restore' ? 'Restore' : action === 'permanent' ? 'Delete Forever' : 'Delete'}
                cancelText="Cancel"
                variant={action === 'restore' ? 'info' : 'danger'}
                isDarkMode={isDarkMode}
            />
        </div>
    );
};
