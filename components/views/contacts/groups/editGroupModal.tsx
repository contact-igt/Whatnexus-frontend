"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Users, FileText } from "lucide-react";
import { ContactGroup, UpdateGroupDto } from "@/types/contactGroup";

interface EditGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (groupId: string, data: UpdateGroupDto) => void;
    group: ContactGroup | null;
    isDarkMode: boolean;
    isLoading?: boolean;
}

export const EditGroupModal = ({
    isOpen,
    onClose,
    onSubmit,
    group,
    isDarkMode,
    isLoading = false
}: EditGroupModalProps) => {
    const [formData, setFormData] = useState<UpdateGroupDto>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (group) {
            setFormData({
                group_name: group.group_name,
                description: group.description || ""
            });
        }
    }, [group]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.group_name && !formData.group_name.trim()) {
            newErrors.group_name = "Group name cannot be empty";
        } else if (formData.group_name && formData.group_name.length > 100) {
            newErrors.group_name = "Group name must be less than 100 characters";
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = "Description must be less than 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (group && validateForm()) {
            onSubmit(group.group_id, formData);
            onClose();
        }
    };

    if (!group) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Group"
            description={`Update details for ${group.group_name}`}
            isDarkMode={isDarkMode}
            className="max-w-xl font-sans"
            footer={
                <div className="flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
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
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Group Name */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Group Name"
                    type="text"
                    placeholder="Enter group name"
                    value={formData.group_name || ""}
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
