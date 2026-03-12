"use client";

import { useState } from 'react';
import { Search, Plus, Briefcase, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { SpecializationDrawer, Specialization } from './specializationDrawer';
import { useGetAllSpecializationsQuery, useDeleteSpecializationMutation, useToggleSpecializationStatusMutation } from '@/hooks/useSpecializationsQuery';
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { ActionMenu } from '@/components/ui/actionMenu';

interface SpecializationManagementProps {
    isDarkMode: boolean;
}

export const SpecializationManagement = ({ isDarkMode }: SpecializationManagementProps) => {
    const { data: specializationsData, isLoading } = useGetAllSpecializationsQuery();
    const deleteMutation = useDeleteSpecializationMutation();
    const toggleStatusMutation = useToggleSpecializationStatusMutation();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('create');

    // Confirmation State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const specializations = specializationsData?.data || [];

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
        setDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (deleteId) {
            try {
                await deleteMutation.mutateAsync(deleteId);
                // Toast handled in mutation
            } catch (error) {
                console.error("Failed to delete specialization", error);
            } finally {
                setDeleteId(null);
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
                        placeholder="Search specializations..."
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

            {/* List View */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                    </div>
                ) : filteredSpecializations.length === 0 ? (
                    <div className={cn(
                        "text-center py-12 rounded-2xl border border-dashed",
                        isDarkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                    )}>
                        <div className={cn("mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3", isDarkMode ? "bg-white/10" : "bg-white shadow-sm")}>
                            <Briefcase className={isDarkMode ? "text-white/40" : "text-slate-400"} size={24} />
                        </div>
                        <h3 className={cn("text-sm font-medium mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                            No specializations found
                        </h3>
                        <p className={cn("text-xs", isDarkMode ? "text-white/50" : "text-slate-500")}>
                            {searchQuery ? "Try adjusting your search terms" : "Get started by adding a new specialization"}
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
                                                {spec.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <p className={cn("text-sm line-clamp-2", isDarkMode ? "text-white/60" : "text-slate-600")}>
                                            {spec.description || "No description provided."}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <label className="relative inline-flex items-center cursor-pointer">
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
                                        </label>

                                        <ActionMenu
                                            isDarkMode={isDarkMode}
                                            isEdit={true}
                                            onEdit={() => handleEdit(spec)}
                                            isDelete={true}
                                            onDelete={() => handleDeleteClick(spec.specialization_id)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                title="Delete Specialization"
                message="Are you sure you want to delete this specialization? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isDarkMode={isDarkMode}
            />
        </div>
    );
};
