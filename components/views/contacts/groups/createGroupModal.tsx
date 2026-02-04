"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Users, FileText } from "lucide-react";
import { CreateGroupDto } from "@/types/contactGroup";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateGroupDto) => void;
    isDarkMode: boolean;
    isLoading?: boolean;
}

export const CreateGroupModal = ({
    isOpen,
    onClose,
    onSubmit,
    isDarkMode,
    isLoading = false
}: CreateGroupModalProps) => {
    const [formData, setFormData] = useState<CreateGroupDto>({
        group_name: "",
        description: ""
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.group_name.trim()) {
            newErrors.group_name = "Group name is required";
        } else if (formData.group_name.length > 100) {
            newErrors.group_name = "Group name must be less than 100 characters";
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Description must be less than 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
            handleReset();
        }
    };

    const handleReset = () => {
        setFormData({
            group_name: "",
            description: ""
        });
        setErrors({});
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create New Group"
            description="Create an empty group to organize your contacts"
            isDarkMode={isDarkMode}
            className="max-w-xl font-sans"
            footer={
                <div className="flex items-center justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                            isDarkMode
                                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all",
                            isLoading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {isLoading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Group Name */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Group Name"
                    required
                    type="text"
                    placeholder="Enter group name"
                    value={formData.group_name}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                    error={errors.group_name}
                    icon={Users}
                />

                {/* Description */}
                <div>
                    <label className={cn(
                        "text-xs font-semibold mb-2 block ml-1",
                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                    )}>
                        Description <span className="text-xs font-normal opacity-60">(Optional)</span>
                    </label>
                    <div className="relative">
                        <FileText className={cn(
                            "absolute left-3 top-3",
                            isDarkMode ? "text-white/30" : "text-slate-400"
                        )} size={16} />
                        <textarea
                            placeholder="Enter group description"
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none resize-none",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30',
                                errors.description && 'border-red-500'
                            )}
                        />
                    </div>
                    {errors.description && (
                        <p className="text-xs text-red-500 mt-1 ml-1">{errors.description}</p>
                    )}
                    <p className={cn(
                        "text-xs mt-1 ml-1",
                        isDarkMode ? 'text-white/40' : 'text-slate-400'
                    )}>
                        {formData.description?.length || 0}/500 characters
                    </p>
                </div>
            </div>
        </Modal>
    );
};
