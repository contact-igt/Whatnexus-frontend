"use client";

import { useEffect } from 'react';
import { Briefcase, FileText, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateSpecializationMutation, useUpdateSpecializationMutation } from '@/hooks/useSpecializationsQuery';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const specializationSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
    description: z.string().trim().max(500, "Description must be less than 500 characters").optional().or(z.literal('')),
});

type SpecializationFormValues = z.infer<typeof specializationSchema>;

export interface Specialization {
    specialization_id: string;
    name: string;
    description: string;
    is_active: boolean;
}

interface SpecializationDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    specialization: Specialization | null;
    mode: 'view' | 'edit' | 'create';
    isDarkMode: boolean;
}

export const SpecializationDrawer = ({
    isOpen,
    onClose,
    specialization,
    mode,
    isDarkMode
}: SpecializationDrawerProps) => {

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SpecializationFormValues>({
        resolver: zodResolver(specializationSchema),
        defaultValues: {
            name: '',
            description: '',
        }
    });

    const createSpecializationMutation = useCreateSpecializationMutation();
    const updateSpecializationMutation = useUpdateSpecializationMutation();

    useEffect(() => {
        if (specialization && (mode === 'view' || mode === 'edit')) {
            setValue('name', specialization.name);
            setValue('description', specialization.description || '');
        } else {
            reset({
                name: '',
                description: '',
            });
        }
    }, [specialization, mode, isOpen, reset, setValue]);

    const onSubmit = async (data: SpecializationFormValues) => {
        try {
            if (mode === 'create') {
                await createSpecializationMutation.mutateAsync(data);
                toast.success('Specialization created successfully');
            } else if (mode === 'edit' && specialization) {
                await updateSpecializationMutation.mutateAsync({
                    id: specialization.specialization_id,
                    data: data
                });
                toast.success('Specialization updated successfully');
            }
            onClose();
        } catch (error) {
            console.error('Error saving specialization:', error);
            // Error handling is done in mutation
        }
    };

    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';
    const isSaving = createSpecializationMutation.isPending || updateSpecializationMutation.isPending;

    const dialogTitle = isCreate ? 'Add New Specialization' : isEdit ? 'Edit Specialization' : 'Specialization Details';
    const dialogDescription = isCreate
        ? 'Add a new specialization to the list.'
        : isEdit
            ? 'Update specialization information.'
            : 'View specialization information.';

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={dialogTitle}
            description={dialogDescription}
            isDarkMode={isDarkMode}
            className={cn(
                "max-w-xl font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
                isDarkMode ? 'bg-black' : 'bg-white'
            )}
            footer={
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                    <button
                        onClick={onClose}
                        type="button"
                        disabled={isSaving}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all border",
                            isDarkMode
                                ? `${isView ? 'bg-red-500 border-white/10 text-white hover:bg-red-600' : 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'}`
                                : `${isView ? 'border-none text-white bg-red-500 hover:bg-red-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                        )}
                    >
                        {isView ? 'Close' : 'Cancel'}
                    </button>
                    {!isView && (
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSaving}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg flex items-center space-x-2",
                                isDarkMode
                                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 disabled:opacity-50'
                                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 disabled:opacity-50'
                            )}
                        >
                            {isSaving && <Loader2 className="animate-spin" size={14} />}
                            <span>{isCreate ? 'Add Specialization' : 'Save Changes'}</span>
                        </button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Specialization Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        isDarkMode={isDarkMode}
                        icon={Briefcase}
                        disabled={isView}
                        {...register("name")}
                        placeholder="Cardiology"
                        error={errors.name?.message}
                        variant="secondary"
                    />
                </div>

                <div>
                    <label className={cn("text-xs font-semibold mb-2 block ml-1", isDarkMode ? 'text-white/70' : 'text-slate-700')}>
                        Description
                    </label>
                    <div className="relative">
                        <div className={cn("absolute left-3 top-2.5", isDarkMode ? "text-white/30" : "text-slate-400")}>
                            <FileText size={16} />
                        </div>
                        <textarea
                            disabled={isView}
                            {...register("description")}
                            placeholder="Enter description..."
                            rows={4}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none resize-none",
                                isView && "opacity-60 cursor-not-allowed",
                                errors.description && "border-red-500 focus:ring-red-500/30",
                                !errors.description && (isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 hover:bg-white/10 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50')
                            )}
                        />
                    </div>
                    {errors.description && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{errors.description.message}</p>
                    )}
                </div>
            </div>
        </Drawer>
    );
};
