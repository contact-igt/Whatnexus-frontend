"use client";

import { useState, useEffect, useCallback } from "react";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { User, Mail, Phone, Calendar } from "lucide-react";
import { CreateContactDto } from "@/types/contact";

interface AddContactDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateContactDto) => void;
    isDarkMode: boolean;
    isLoading?: boolean;
}

export const AddContactDrawer = ({
    isOpen,
    onClose,
    onSubmit,
    isDarkMode,
    isLoading = false
}: AddContactDrawerProps) => {
    const [formData, setFormData] = useState<CreateContactDto>({
        phone: "", // Required field
        name: "",
        email: "",
        age: null,
        profile_pic: "",
    });
    const [countryCode, setCountryCode] = useState("+91");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Name validation - Required
        if (!formData.name || !formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        // Phone is required
        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Phone number must be 10 digits";
        }

        // Email validation (optional)
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        // Age validation (optional)
        if (formData.age != null) {
            const ageNum = Number(formData.age);
            if (isNaN(ageNum) || ageNum < 0 || ageNum > 150 || !Number.isInteger(ageNum)) {
                newErrors.age = "Age must be a whole number between 0 and 150";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit({
                ...formData,
                country_code: countryCode,
                phone: formData.phone
            });
        }
    };

    const handleReset = useCallback(() => {
        setFormData({
            phone: "",
            name: "",
            email: "",
            age: null,
            profile_pic: "",
        });
        setCountryCode("+91");
        setErrors({});
    }, []);

    useEffect(() => {
        if (!isOpen) {
            handleReset();
        }
    }, [isOpen, handleReset]);

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Contact"
            description="Fill in the details to add a new contact"
            isDarkMode={isDarkMode}
            className="font-sans"
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
                        {isLoading ? 'Creating...' : 'Create Contact'}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Phone - Required Field */}
                <div className="grid grid-cols-3 gap-4">
                    <Select
                        isDarkMode={isDarkMode}
                        label="Country Code"
                        value={countryCode}
                        onChange={(value) => setCountryCode(value)}
                        options={[
                            { value: '+91', label: 'India (+91)' },
                            { value: '+1', label: 'USA (+1)' },
                            { value: '+44', label: 'UK (+44)' },
                            { value: '+971', label: 'UAE (+971)' }
                        ]}
                        className="col-span-1"
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="Phone Number"
                        required
                        type="tel"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                        error={errors.phone}
                        icon={Phone}
                        maxLength={10}
                        wrapperClassName="col-span-2"
                    />
                </div>

                {/* Name - Required Field */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Name"
                    required
                    type="text"
                    placeholder="Enter contact name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    icon={User}
                />

                {/* Email */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    icon={Mail}
                />

                {/* Age */}
                <Input
                    isDarkMode={isDarkMode}
                    label="Age"
                    type="number"
                    placeholder="Enter age"
                    value={formData.age != null ? String(formData.age) : ""}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value, 10) : null })}
                    error={errors.age}
                    icon={Calendar}
                    maxLength={3}
                />
            </div>
        </Drawer>
    );
};
