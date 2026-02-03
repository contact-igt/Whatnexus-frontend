
"use client";

import { useState, useEffect } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Upload, User, Mail, Phone, Tag, X, Shield, ShieldOff } from "lucide-react";
import { Contact, UpdateContactDto } from "@/types/contact";

interface EditContactDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (contactId: string, data: UpdateContactDto) => void;
    contact: Contact | null;
    isDarkMode: boolean;
    isLoading?: boolean;
}

export const EditContactDrawer = ({
    isOpen,
    onClose,
    onSubmit,
    contact,
    isDarkMode,
    isLoading = false
}: EditContactDrawerProps) => {
    const [formData, setFormData] = useState<UpdateContactDto>({});
    const [tagInput, setTagInput] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (contact) {
            setFormData({
                name: contact.name,
                email: contact.email || "",
                profile_pic: contact.profile_pic || "",
                // tags: contact.tags || [],
                is_blocked: contact.is_blocked
            });
        }
    }, [contact]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Name validation - Required
        if (!formData.name || !formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        // Email validation (optional)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (contact && validateForm()) {
            onSubmit(contact?.contact_id, formData);
            onClose();
        }
    };

    // const handleAddTag = () => {
    //     if (tagInput.trim() && !formData?.tags?.includes(tagInput.trim())) {
    //         setFormData({
    //             ...formData,
    //             tags: [...(formData?.tags || []), tagInput.trim()]
    //         });
    //         setTagInput("");
    //     }
    // };

    // const handleRemoveTag = (tagToRemove: string) => {
    //     setFormData({
    //         ...formData,
    //         tags: formData.tags?.filter((tag: any) => tag !== tagToRemove) || []
    //     });
    // };

    const toggleBlockStatus = () => {
        setFormData({
            ...formData,
            is_blocked: !formData.is_blocked
        });
    };

    if (!contact) return null;

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Contact"
            description={`Update details for ${contact.name}`}
            isDarkMode={isDarkMode}
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
                {/* Block/Unblock Toggle */}
                {/* <div className={cn(
                    "p-4 rounded-xl border flex items-center justify-between",
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                )}>
                    <div className="flex items-center space-x-3">
                        {formData.is_blocked ? (
                            <Shield className="text-red-500" size={20} />
                        ) : (
                            <ShieldOff className="text-emerald-500" size={20} />
                        )}
                        <div>
                            <p className={cn(
                                "text-sm font-medium",
                                isDarkMode ? 'text-white' : 'text-slate-900'
                            )}>
                                {formData.is_blocked ? 'Contact Blocked' : 'Contact Active'}
                            </p>
                            <p className={cn(
                                "text-xs",
                                isDarkMode ? 'text-white/50' : 'text-slate-500'
                            )}>
                                {formData.is_blocked ? 'This contact is currently blocked' : 'This contact can send messages'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleBlockStatus}
                        type="button"
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                            formData.is_blocked
                                ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100')
                                : (isDarkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-50 text-red-700 hover:bg-red-100')
                        )}
                    >
                        {formData.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                </div> */}

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

                {/* Name */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Name"
                    type="text"
                    placeholder="Enter contact name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    icon={User}
                />

                {/* Phone - READ ONLY (Cannot be edited per API spec) */}
                <div>
                    <label className={cn(
                        "text-xs font-semibold mb-2 block ml-1",
                        isDarkMode ? 'text-white/70' : 'text-slate-700'
                    )}>
                        Phone Number
                        <span className={cn(
                            "ml-2 text-xs font-normal",
                            isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                        )}>🔒 Cannot be edited</span>
                    </label>
                    <div className="relative">
                        <Phone className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2",
                            isDarkMode ? "text-white/30" : "text-slate-400"
                        )} size={16} />
                        <input
                            type="tel"
                            value={contact.phone}
                            disabled
                            readOnly
                            className={cn(
                                "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition-all cursor-not-allowed",
                                isDarkMode
                                    ? 'bg-white/5 border-white/10 text-white/50'
                                    : 'bg-slate-100 border-slate-200 text-slate-500'
                            )}
                        />
                    </div>
                </div>

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
        </Drawer>
    );
};
