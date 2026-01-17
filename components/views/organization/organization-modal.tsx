
"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Organization } from "./organization-view";
import { Building2, Mail, Phone, MapPin, User, Users, Calendar, Lock, Globe, Stethoscope } from "lucide-react";
import { useCreateTenantMutation, useUpdateTenantMutation } from "@/hooks/useTenantQuery";

interface OrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (org: Partial<Organization>) => void;
    organization?: Organization | null;
    mode: 'create' | 'edit' | 'view';
    isDarkMode: boolean;
}

export const OrganizationModal = ({
    isOpen,
    onClose,
    onSave,
    organization,
    mode,
    isDarkMode
}: OrganizationModalProps) => {
    const [formData, setFormData] = useState<Partial<Organization>>({
        name: '',
        email: '',
        mobile: '',
        address: '',
        subscriptionStatus: 'trial',
        subscriptionPlan: 'basic',
        maxUsers: 10,
        adminName: '',
        adminEmail: '',
        isActive: true,
        type: 'hospital',
        country_code: '+91',
        password: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { mutate: createTenantMutate, isPending: isCreateTenantPending } = useCreateTenantMutation();
    const { mutate: updateTenantMutate, isPending: isUpdateTenantPending } = useUpdateTenantMutation();



    useEffect(() => {
        if (organization && (mode === 'edit' || mode === 'view')) {
            setFormData(organization);
        } else {
            setFormData({
                name: '',
                email: '',
                mobile: '',
                address: '',
                subscriptionStatus: 'trial',
                subscriptionPlan: 'basic',
                maxUsers: 10,
                adminName: '',
                adminEmail: '',
                isActive: true,
                type: 'hospital',
                country_code: '+91',
                password: ''
            });
        }
        setErrors({});
    }, [organization, mode, isOpen]);

    const handleChange = (field: keyof Organization, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = "Organization name is required";
        if (!formData.email?.trim()) newErrors.email = "Email is required";
        // if (!formData.adminName?.trim()) newErrors.adminName = "Admin name is required";
        // if (!formData.adminEmail?.trim()) newErrors.adminEmail = "Admin email is required";
        // if (mode === 'create' && !formData.password?.trim()) newErrors.password = "Password is required";
        if (!formData.country_code) newErrors.country_code = "Country code is required";

        if (!formData.mobile?.trim()) {
            newErrors.mobile = "mobile number is required";
        } else if (!/^\d+$/.test(formData.mobile)) {
            newErrors.mobile = "mobile number must contain only digits";
        } else if (formData.mobile.length < 10 || formData.mobile.length > 12) {
            newErrors.mobile = "mobile number must be between 10 and 12 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            if (mode === 'create') {
                createTenantMutate(formData);
            } else if (mode === 'edit' && organization?.id) {
                updateTenantMutate({ id: organization.id, data: formData });
            }
            onClose();
        }
    };

    const isView = mode === 'view';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? "Add Organization" : mode === 'edit' ? "Edit Organization" : "Organization Details"}
            description={mode === 'create' ? "Register a new hospital or clinic" : "View and manage organization details"}
            isDarkMode={isDarkMode}
            footer={
                !isView && (
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                        >
                            {mode === 'create' ? 'Register Organization' : 'Save Changes'}
                        </button>
                    </div>
                )
            }
        >
            <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {/* <div className="col-span-full">
                        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>
                            Organization Details
                        </h3>
                    </div> */}

                    <Input
                        autoComplete="new-password"
                        isDarkMode={isDarkMode}
                        label="Organization Name"
                        icon={Building2}
                        placeholder="e.g. City Eye Hospital"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        error={errors.name}
                        disabled={isView}
                        required
                    />

                    <Input
                        autoComplete="new-password"
                        isDarkMode={isDarkMode}
                        label="Email Address"
                        icon={Mail}
                        placeholder="contact@hospital.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        error={errors.email}
                        disabled={isView}
                        required
                    />
                    <Select
                        isDarkMode={isDarkMode}
                        label="Country Code"
                        value={formData.country_code || '+91'}
                        onChange={(value) => handleChange('country_code', value)}
                        options={[
                            { value: '+91', label: 'India (+91)' },
                            { value: '+1', label: 'USA (+1)' },
                            { value: '+44', label: 'UK (+44)' },
                            { value: '+971', label: 'UAE (+971)' }
                        ]}
                        disabled={isView}
                        error={errors.country_code}
                        required
                    />
                    <Input
                        isDarkMode={isDarkMode}
                        label="mobile Number"
                        icon={Phone}
                        placeholder="+91 98765 43210"
                        value={formData.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value)}
                        disabled={isView}
                        error={errors.mobile}
                        required
                    />

                    <Select
                        isDarkMode={isDarkMode}
                        label="Type"
                        value={formData.type || 'hospital'}
                        onChange={(value) => handleChange('type', value)}
                        options={[
                            { value: 'hospital', label: 'Hospital' },
                            { value: 'clinic', label: 'Clinic' }
                        ]}
                        disabled={isView}
                        required
                    />

                    {mode === 'create' && (
                        <Input
                            autoComplete="new-password"
                            isDarkMode={isDarkMode}
                            label="Password"
                            icon={Lock}
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            error={errors.password}
                            required
                        />
                    )}

                    {/* <Select
                        isDarkMode={isDarkMode}
                        label="Subscription Plan"
                        value={formData.subscriptionPlan}
                        onChange={(value) => handleChange('subscriptionPlan', value)}
                        options={[
                            { value: 'basic', label: 'Basic Plan' },
                            { value: 'pro', label: 'Pro Plan' },
                            { value: 'enterprise', label: 'Enterprise Plan' }
                        ]}
                        disabled={isView}
                        required
                    /> */}

                    {/* <div className="col-span-full">
                        <Textarea
                            isDarkMode={isDarkMode}
                            label="Address"
                            icon={MapPin}
                            placeholder="Full address of the organization"
                            value={formData.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            disabled={isView}
                            rows={3}
                        />
                    </div> */}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div className="col-span-full">
                        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white/40' : 'text-slate-400'} uppercase tracking-wider`}>
                            Administrator Details
                        </h3>
                    </div>

                    <Input
                        isDarkMode={isDarkMode}
                        label="Admin Name"
                        icon={User}
                        placeholder="Dr. Name"
                        value={formData.adminName}
                        onChange={(e) => handleChange('adminName', e.target.value)}
                        error={errors.adminName}
                        disabled={isView}
                        required
                    />

                    <Input
                        isDarkMode={isDarkMode}
                        label="Admin Email"
                        icon={Mail}
                        placeholder="admin@hospital.com"
                        value={formData.adminEmail}
                        onChange={(e) => handleChange('adminEmail', e.target.value)}
                        error={errors.adminEmail}
                        disabled={isView}
                        required
                    />

                    <Input
                        isDarkMode={isDarkMode}
                        label="Max Users Allowed"
                        icon={Users}
                        type="number"
                        placeholder="e.g. 10"
                        value={formData.maxUsers}
                        onChange={(e) => handleChange('maxUsers', parseInt(e.target.value))}
                        disabled={isView}
                        required
                    />

                    <Select
                        isDarkMode={isDarkMode}
                        label="Status"
                        value={formData.subscriptionStatus}
                        onChange={(value) => handleChange('subscriptionStatus', value)}
                        options={[
                            { value: 'active', label: 'Active' },
                            { value: 'trial', label: 'Trial' },
                            { value: 'expired', label: 'Expired' }
                        ]}
                        disabled={isView}
                        required
                    />
                </div> */}
            </div>
        </Modal>
    );
};
