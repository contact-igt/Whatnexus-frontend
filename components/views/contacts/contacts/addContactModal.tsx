
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Upload, User, Mail, Phone, Tag, X } from "lucide-react";
import { CreateContactDto } from "@/types/contact";

interface AddContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateContactDto) => void;
    isDarkMode: boolean;
    isLoading?: boolean;
}

export const AddContactModal = ({
    isOpen,
    onClose,
    onSubmit,
    isDarkMode,
    isLoading = false
}: AddContactModalProps) => {
    const [formData, setFormData] = useState<CreateContactDto>({
        phone: "", // Required field
        name: "",
        email: "",
        profile_pic: "",
        tags: []
    });
    const [tagInput, setTagInput] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Name validation - Required
        if (!formData.name || !formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        // Phone is required (per API spec)
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
            newErrors.phone = "Invalid phone number format";
        }

        // Email validation (optional)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
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
            phone: "",
            name: "",
            email: "",
            profile_pic: "",
            tags: []
        });
        setTagInput("");
        setErrors({});
    };

    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...(formData.tags || []), tagInput.trim()]
            });
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData({
            ...formData,
            tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
        });
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add New Contact"
            description="Fill in the details to add a new contact"
            isDarkMode={isDarkMode}
            className="max-w-xl"
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
                        {isLoading ? 'Creating...' : 'Create Contact'}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Profile Picture */}
                {/* <div>
                    <label className={cn(
                        "text-xs font-semibold mb-2 block ml-1",
                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                    )}>
                        Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                        {formData.profile_pic ? (
                            <img
                                src={formData.profile_pic}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center",
                                isDarkMode ? 'bg-white/5' : 'bg-slate-100'
                            )}>
                                <User className={isDarkMode ? 'text-white/30' : 'text-slate-400'} size={24} />
                            </div>
                        )}
                        <Input
                            isDarkMode={isDarkMode}
                            type="url"
                            placeholder="Enter image URL"
                            value={formData.profile_pic || ""}
                            onChange={(e) => setFormData({ ...formData, profile_pic: e.target.value })}
                            icon={Upload}
                        />
                    </div>
                </div> */}

                {/* Phone - Required Field */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Phone Number"
                    required
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    icon={Phone}
                />

                {/* Name - Optional Field */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Name"
                    type="text"
                    required
                    placeholder="Enter contact name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    icon={User}
                />

                {/* Email */}
                {/* <Input
                    isDarkMode={isDarkMode}
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    icon={Mail}
                /> */}

                {/* Tags */}
                {/* <div>
                    <label className={cn(
                        "text-xs font-semibold mb-2 block ml-1",
                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                    )}>
                        Tags
                    </label>
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Tag className={cn(
                                "absolute left-3 top-1/2 -translate-y-1/2",
                                isDarkMode ? "text-white/30" : "text-slate-400"
                            )} size={16} />
                            <input
                                type="text"
                                placeholder="Add a tag"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                className={cn(
                                    "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all focus:outline-none",
                                    isDarkMode
                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-500/30'
                                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/30'
                                )}
                            />
                        </div>
                        <button
                            onClick={handleAddTag}
                            type="button"
                            className={cn(
                                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            )}
                        >
                            Add
                        </button>
                    </div>
                    {formData.tags && formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {formData.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className={cn(
                                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                                        isDarkMode
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    )}
                                >
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        type="button"
                                        className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div> */}
            </div>
        </Modal>
    );
};
